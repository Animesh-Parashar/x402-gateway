// src/index.ts
import {
  ADAPTER_INTERFACE_VERSION,
  infraError,
  internalError
} from "@x402/core";
import { ErrorCodes } from "@x402/core";
import { request } from "undici";
function ThirdwebAdapter(options = {}) {
  const baseUrl = options.baseUrl ?? "https://x402.thirdweb.com";
  const timeoutMs = options.timeoutMs ?? 5e3;
  return {
    name: "thirdweb",
    interfaceVersion: ADAPTER_INTERFACE_VERSION,
    async verify(input) {
      try {
        const headers = {
          "Content-Type": "application/json"
        };
        if (options.apiKey) {
          headers["x-api-key"] = options.apiKey;
        }
        if (options.secretKey) {
          headers["x-secret-key"] = options.secretKey;
        }
        const r = await request(`${baseUrl}/verify`, {
          method: "POST",
          headers,
          body: JSON.stringify({
            // x402 protocol standard payload format
            paymentPayload: input.proof,
            paymentRequirements: {
              maxAmountRequired: input.price,
              asset: input.asset,
              payTo: input.recipient
            }
          }),
          headersTimeout: timeoutMs,
          bodyTimeout: timeoutMs
        });
        if (r.statusCode >= 500) {
          throw infraError(
            ErrorCodes.ADAPTER_UNAVAILABLE,
            "Thirdweb facilitator unavailable",
            { status: r.statusCode }
          );
        }
        if (r.statusCode === 401 || r.statusCode === 403) {
          throw infraError(
            ErrorCodes.ADAPTER_AUTH_FAILED,
            "Thirdweb authentication failed",
            { status: r.statusCode }
          );
        }
        if (r.statusCode === 429) {
          throw infraError(
            ErrorCodes.ADAPTER_RATE_LIMITED,
            "Thirdweb rate limit exceeded",
            { status: r.statusCode }
          );
        }
        let data;
        try {
          data = await r.body.json();
        } catch (err) {
          throw internalError(ErrorCodes.ADAPTER_INTERNAL_EXCEPTION, err);
        }
        if (data.isValid !== true && data.verified !== true) {
          return {
            verified: false,
            reason: data.invalidReason ?? data.reason ?? "verification_failed",
            raw: data
          };
        }
        const responseRecipient = data.payTo ?? data.to;
        if (responseRecipient && responseRecipient.toLowerCase() !== input.recipient.toLowerCase()) {
          return {
            verified: false,
            reason: "recipient_mismatch",
            raw: data
          };
        }
        return {
          verified: true,
          payer: data.payer ?? data.from,
          recipient: responseRecipient ?? input.recipient,
          amount: data.amount ?? input.price,
          asset: data.asset ?? input.asset
        };
      } catch (err) {
        if (err.code === "UND_ERR_CONNECT_TIMEOUT" || err.code === "UND_ERR_HEADERS_TIMEOUT" || err.code === "UND_ERR_BODY_TIMEOUT") {
          throw infraError(ErrorCodes.ADAPTER_TIMEOUT, "Thirdweb timeout");
        }
        if (err.code === "ECONNREFUSED" || err.code === "ENOTFOUND") {
          throw infraError(
            ErrorCodes.ADAPTER_UNAVAILABLE,
            "Thirdweb facilitator unreachable",
            { code: err.code }
          );
        }
        if (err.name === "X402Error") {
          throw err;
        }
        throw internalError(ErrorCodes.ADAPTER_INTERNAL_EXCEPTION, err);
      }
    }
  };
}
export {
  ThirdwebAdapter,
  ThirdwebAdapter as default
};
