import {
  FacilitatorAdapter,
  ADAPTER_INTERFACE_VERSION,
  VerificationResult,
  VerifyInput,
  infraError,
  internalError
} from "@x402/core";
import { ErrorCodes } from "@x402/core";
import { request } from "undici";

export default function CoinbaseAdapter(options: {
  apiKey: string;
  baseUrl?: string;
}): FacilitatorAdapter {
  if (!options.apiKey) {
    throw new Error("CoinbaseAdapter requires apiKey");
  }

  const baseUrl = options.baseUrl ?? "https://api.coinbase.com";

  return {
    name: "coinbase",
    interfaceVersion: ADAPTER_INTERFACE_VERSION,
    async verify(input: VerifyInput): Promise<VerificationResult> {
      try {
        const r = await request(`${baseUrl}/v2/verify`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${options.apiKey}`
          },
          body: JSON.stringify({
            proof: input.proof,
            price: input.price,
            recipient: input.recipient
          })
        });

        if (r.statusCode >= 500) {
          throw infraError(
            ErrorCodes.ADAPTER_UNAVAILABLE,
            "Coinbase facilitator unavailable",
            { status: r.statusCode }
          );
        }

        let data: any;
        try {
          data = await r.body.json();
        } catch (err) {
          throw internalError(ErrorCodes.ADAPTER_INTERNAL_EXCEPTION, err);
        }

        // Business failure
        if (data.verified !== true) {
          return {
            verified: false,
            reason: data.reason ?? "verification_failed",
            raw: data
          };
        }

        // Recipient mismatch check
        if (
          data.to &&
          data.to.toLowerCase() !== input.recipient.toLowerCase()
        ) {
          return {
            verified: false,
            reason: "recipient_mismatch",
            raw: data
          };
        }

        // Success normalization
        return {
          verified: true,
          payer: data.from,
          recipient: data.to,
          amount: data.amount,
          asset: data.asset ?? "ETH"
        };

      } catch (err: any) {
        // Undici network-level errors
        if (err.code === "UND_ERR_CONNECT_TIMEOUT" || err.code === "UND_ERR_HEADERS_TIMEOUT") {
          throw infraError(ErrorCodes.ADAPTER_TIMEOUT, "Coinbase timeout");
        }

        // Already classified infra/internal?
        if (err.name === "X402Error") {
          throw err;
        }

        // Everything else is internal
        throw internalError(ErrorCodes.ADAPTER_INTERNAL_EXCEPTION, err);
      }
    }
  };
}
