// src/index.ts
import {
  ADAPTER_INTERFACE_VERSION,
  infraError,
  internalError
} from "@x402/core";
import { ErrorCodes } from "@x402/core";
import { request } from "undici";
function MockFacilitatorAdapter(baseUrl = "http://localhost:4000") {
  return {
    name: "mock",
    interfaceVersion: ADAPTER_INTERFACE_VERSION,
    async verify(input) {
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
        const data = await r.body.json();
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
      } catch (err) {
        if (err && typeof err === "object" && "name" in err && err.name === "X402Error") {
          throw err;
        }
        throw internalError(ErrorCodes.ADAPTER_INTERNAL_EXCEPTION, err);
      }
    }
  };
}
var index_default = MockFacilitatorAdapter;
export {
  MockFacilitatorAdapter,
  index_default as default
};
