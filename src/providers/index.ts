import {
  IAgentRuntime,
  logger,
  Memory,
  Provider,
  ProviderResult,
  State,
} from "@elizaos/core";
import { OctavPortfolioBalance } from "../types";

const OCTAV_API_URL = "https://backend-dev-api.octav.fi";

export const octavProvider: Provider = {
  name: "octav",

  get: async (
    _runtime: IAgentRuntime,
    message: Memory,
    _state: State | undefined
  ): Promise<ProviderResult> => {
    try {
      if (!process.env.OCTAV_API_KEY) throw new Error("Octav API not found");

      const content = message.content as { text: string };
      const addressMatch = content.text.match(/0x[a-fA-F0-9]{40}/);
      if (!addressMatch) {
        throw new Error("Valid ethereum address not found in message");
      }
      const address = addressMatch[0];

      // Multiple addresses could be provided
      const params = new URLSearchParams();
      params.append("addresses", address);

      const url = `${OCTAV_API_URL}/v1/portfolio?${params.toString()}`;

      const responseRaw = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${process.env.OCTAV_API_KEY}`,
        },
      });

      if (!responseRaw.ok)
        throw new Error(
          `Failed to fetch portfolio balances for ${address}: ${responseRaw.statusText}`
        );

      const responseJson = await responseRaw.json();
      const data = responseJson as OctavPortfolioBalance[];

      return {
        data: data[0],
      };
    } catch (error) {
      logger.error("Error in Octav provider", error?.toString());
      return {
        text:
          error instanceof Error
            ? error.message
            : "Failed to fetch portfolio balances from Octav",
      };
    }
  },
};
