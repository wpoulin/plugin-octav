/**
 * Example HelloWorld action
 * This demonstrates the simplest possible action structure
 */

import {
  Action,
  ActionResult,
  HandlerCallback,
  IAgentRuntime,
  logger,
  Memory,
  State,
} from "@elizaos/core";
import { octavProvider } from "../providers";
import { OctavPortfolioBalance } from "../types";

/**
 * Action representing a hello world message.
 * @typedef {Object} Action
 * @property {string} name - The name of the action.
 * @property {string[]} similes - An array of related actions.
 * @property {string} description - A brief description of the action.
 * @property {Function} validate - Asynchronous function to validate the action.
 * @property {Function} handler - Asynchronous function to handle the action and generate a response.
 * @property {Object[]} examples - An array of example inputs and expected outputs for the action.
 */
export const getPortfolioBalancesAction: Action = {
  name: "GET_PORTFOLIO",
  description: "Fetch portfolio balances for a given address",

  similes: ["GET_PORTFOLIO", "FETCH_PORTFOLIO"].map((s) => `OCTAV_${s}`),

  validate: async (
    _runtime: IAgentRuntime,
    message: Memory,
    _state: State | undefined
  ): Promise<boolean> => {
    const content = message.content?.text?.toLowerCase() || "";

    const fetchPortfolioBalancesKeyword = [
      "fetch portfolio",
      "get portfolio",
      "list portfolio balances",
      "portfolio",
      "display portfolio balances",
    ];

    const isMatch = fetchPortfolioBalancesKeyword.some((keyword) =>
      content.includes(keyword)
    );

    logger.info(
      `[GET_PORTFOLIO] Validation result: ${isMatch} (keywords checked: ${fetchPortfolioBalancesKeyword.length})`
    );

    return isMatch;
  },

  handler: async (
    _runtime: IAgentRuntime,
    message: Memory,
    _state: State | undefined,
    _options: Record<string, unknown> = {},
    callback?: HandlerCallback,
    _responses?: Memory[]
  ): Promise<ActionResult> => {
    const addressMatch = message.content.text?.match(/0x[a-fA-F0-9]{40}/);
    const address = addressMatch?.[0] ?? "";
    logger.info(
      `[GET_PORTFOLIO] - Fetching portfolio balances for address: ${address}`
    );

    try {
      const response = await octavProvider.get(
        _runtime,
        message,
        _state || ({} as State)
      );

      if (!response.data) return { success: false, error: "No data" };

      const dataTyped = response.data as OctavPortfolioBalance;
      const formattedResponse = formatPortfolioBalancesResponse(dataTyped);

      const sucessfullActionMessage =
        "Sucessfully Fetched portfolio balances on Octav \n";

      if (callback) {
        await callback({
          text: `✅ ${sucessfullActionMessage} \n ${formattedResponse}`,
          content: {
            success: true,
            address,
            formattedResponse,
          },
        });
      }

      return {
        text: `✅ ${sucessfullActionMessage} \n ${formattedResponse}`,
        success: true,
        values: {
          operationSucessfull: true,
          address,
          formattedResponse,
        },
        data: {
          actions: "GET_PORTFOLIO",
          address,
          formattedResponse,
          timestamp: Date.now(),
        },
      };
    } catch (error) {
      logger.error(
        `[GET_PORTFOLIO] - Error fetching portfolio balances: ${
          (error instanceof Error ? error.message : String(error),
          JSON.stringify(error))
        }`
      );

      const errorMessage =
        error instanceof Error ? error.message : String(error);

      if (callback) {
        await callback({
          text: errorMessage,
          content: { success: false, error: errorMessage },
        });
      }

      return {
        success: false,
        text: `❌ ${errorMessage}`,
        data: { actionName: "GET_PORTFOLIO", error: errorMessage },
        error: error instanceof Error ? error : new Error(String(error)),
      };
    }
  },

  examples: [
    [
      {
        name: "{{name1}}",
        content: {
          text: "Can you fetch portfolio balances of 0xEF7F2e81EA14538858d962df34eB1bFDa83da395",
        },
      },
      {
        name: "{{name2}}",
        content: {
          text: "Let me fetch all portfolio balances for 0xEF7F2e81EA14538858d962df34eB1bFDa83da395 using Octav API",
          actions: ["GET_PORTFOLIO"],
        },
      },
    ],
  ],
};

export const formatPortfolioBalancesResponse = (
  portfolioBalances: OctavPortfolioBalance
): string => {
  const networthPerChain = Object.entries(portfolioBalances.chains)
    .map(([chainKey, chain]) => {
      return `${chain.name}: $${Number(chain.value).toFixed(2)}`;
    })
    .join("\n");

  const totalNetworthFormatted = Number(portfolioBalances.networth).toFixed(2);

  const networthPerProtocol = Object.entries(portfolioBalances.assetByProtocols)
    .map(([protocolKey, protocol]) => {
      const protocolValue = protocol.value;
      return { name: protocol.name, value: protocolValue };
    })
    .sort((a, b) => Number(b.value) - Number(a.value));

  const walletIndex = networthPerProtocol.findIndex((p) => p.name === "Wallet");
  if (walletIndex > -1) {
    const wallet = networthPerProtocol.splice(walletIndex, 1)[0];
    networthPerProtocol.unshift(wallet);
  }

  const networthProtocolStr = networthPerProtocol
    .map(
      (protocol) => `${protocol.name}: $${Number(protocol.value).toFixed(2)}`
    )
    .join("\n");

  return `=== 📈 Portfolio Balances (in USD) 📈 ===

Address: ${portfolioBalances.address}
Total Networth: $${totalNetworthFormatted}
    
Networth per Chain:
-----------------------------
${networthPerChain ? networthPerChain : "No data available for chains."}
    
Networth per Protocol:
-----------------------------
${networthProtocolStr ? networthProtocolStr : "No data available for protocols."}

=============================`;
};
