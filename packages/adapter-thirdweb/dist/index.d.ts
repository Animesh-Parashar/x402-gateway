import { FacilitatorAdapter } from '@x402/core';

/**
 * Configuration options for the Thirdweb x402 facilitator adapter.
 */
type ThirdwebAdapterOptions = {
    /**
     * API key for Thirdweb services.
     * Used for authentication with the facilitator API.
     */
    apiKey?: string;
    /**
     * Base URL of the Thirdweb facilitator API.
     * @default "https://x402.thirdweb.com"
     */
    baseUrl?: string;
    /**
     * Secret key for authentication (alternative to API key).
     * Some facilitators may require a secret key instead of or in addition to an API key.
     */
    secretKey?: string;
    /**
     * Timeout in milliseconds for facilitator API requests.
     * @default 5000
     */
    timeoutMs?: number;
};
/**
 * Creates a Thirdweb facilitator adapter for x402 payment verification.
 *
 * This adapter communicates with a Thirdweb-compatible x402 facilitator
 * to verify payment proofs submitted by clients.
 *
 * @example
 * ```ts
 * import { x402 } from "@x402/gateway-express";
 * import ThirdwebAdapter from "@x402/adapter-thirdweb";
 *
 * app.get("/api/data", x402({
 *   price: "0.01",
 *   recipient: "0xMerchant",
 *   adapter: ThirdwebAdapter({
 *     apiKey: process.env.THIRDWEB_API_KEY,
 *     baseUrl: "https://your-facilitator.com"
 *   })
 * }), handler);
 * ```
 *
 * @param options - Configuration options for the adapter
 * @returns A facilitator adapter instance
 */
declare function ThirdwebAdapter(options?: ThirdwebAdapterOptions): FacilitatorAdapter;

export { ThirdwebAdapter, type ThirdwebAdapterOptions, ThirdwebAdapter as default };
