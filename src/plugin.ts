import type { Plugin } from "@elizaos/core";
import { logger } from "@elizaos/core";
import { z } from "zod";
import { octavProvider } from "./providers";
import { getPortfolioBalancesAction } from "./actions";

/**
 * Configuration schema for the Octav plugin
 */
const configSchema = z.object({
  OCTAV_API_KEY: z
    .string()
    .optional()
    .transform((val) => {
      if (!val) {
        logger.info("No Octav API key provided");
      }
      return val;
    }),
});

/**
 * Octav plugin for ElizaOS
 */
export const octavPlugin: Plugin = {
  name: "plugin-octav",
  description:
    "Octav integration showcasing comprehensive DeFi portfolio and blockchain data ",

  config: {
    OCTAV_API_KEY: process.env.OCTAV_API_KEY,
  },

  async init(config: Record<string, string>) {
    logger.info("Initializing Octav plugin");

    try {
      const validatedConfig = await configSchema.parseAsync(config);

      for (const [key, value] of Object.entries(validatedConfig)) {
        if (value) process.env[key] = value;
      }

      logger.info("Octav plugin initialized");
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new Error(
          `Invalid Octav plugin configuration: ${error.errors.map((e) => e.message).join(", ")}`
        );
      }
      throw error;
    }
  },

  actions: [getPortfolioBalancesAction],
  providers: [octavProvider],
};

export default octavPlugin;
