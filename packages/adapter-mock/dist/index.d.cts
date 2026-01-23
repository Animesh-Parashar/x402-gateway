import { FacilitatorAdapter } from '@x402/core';

/**
 * Creates a mock facilitator adapter for testing and development.
 *
 * This adapter communicates with a local mock facilitator server
 * that simulates x402 payment verification.
 *
 * @example
 * ```ts
 * import { x402 } from "@x402/gateway-express";
 * import { MockFacilitatorAdapter } from "@x402/adapter-mock";
 *
 * // Start your mock server on port 4000
 * app.get("/api/data", x402({
 *   price: "0.01",
 *   recipient: "0xMerchant",
 *   adapter: MockFacilitatorAdapter("http://localhost:4000")
 * }), handler);
 * ```
 *
 * @param baseUrl - Base URL of the mock facilitator server (default: http://localhost:4000)
 * @returns A facilitator adapter instance
 */
declare function MockFacilitatorAdapter(baseUrl?: string): FacilitatorAdapter;

export { MockFacilitatorAdapter, MockFacilitatorAdapter as default };
