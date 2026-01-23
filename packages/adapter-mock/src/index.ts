import {
  FacilitatorAdapter,
  ADAPTER_INTERFACE_VERSION,
  VerifyInput,
  VerificationResult,
  infraError,
  internalError
} from "@x402/core";
import { ErrorCodes } from "@x402/core";
import { request } from "undici";

/**
 * Response shape from the mock facilitator /verify endpoint.
 */
interface MockVerifyResponse {
  verified: boolean;
  reason?: string;
  from?: string;
  to?: string;
  amount?: string;
  asset?: string;
}

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
export function MockFacilitatorAdapter(baseUrl = "http://localhost:4000"): FacilitatorAdapter {
  return {
    name: "mock",
    interfaceVersion: ADAPTER_INTERFACE_VERSION,

    async verify(input: VerifyInput): Promise<VerificationResult> {
      try {
        const r = await request(`${baseUrl}/verify`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(input)
        });

        if (r.statusCode >= 500) {
          throw infraError(
            ErrorCodes.ADAPTER_UNAVAILABLE,
            "Mock facilitator error",
            { status: r.statusCode }
          );
        }

        const data = await r.body.json() as MockVerifyResponse;

        if (data.verified !== true) {
          return {
            verified: false,
            reason: data.reason ?? "verification_failed",
            raw: data
          };
        }

        return {
          verified: true,
          payer: data.from ?? "",
          recipient: data.to ?? "",
          amount: data.amount ?? "",
          asset: data.asset ?? ""
        };

      } catch (err: unknown) {
        // Already classified X402Error - rethrow as-is
        if (err && typeof err === "object" && "name" in err && err.name === "X402Error") {
          throw err;
        }

        throw internalError(ErrorCodes.ADAPTER_INTERNAL_EXCEPTION, err);
      }
    }
  };
}

// Default export for flexibility
export default MockFacilitatorAdapter;
