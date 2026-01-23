"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var index_exports = {};
__export(index_exports, {
  ThirdwebAdapter: () => ThirdwebAdapter,
  default: () => ThirdwebAdapter
});
module.exports = __toCommonJS(index_exports);
var import_core = require("@x402/core");
var import_core2 = require("@x402/core");
var import_undici = require("undici");
function ThirdwebAdapter(options = {}) {
  const baseUrl = options.baseUrl ?? "https://x402.thirdweb.com";
  const timeoutMs = options.timeoutMs ?? 5e3;
  return {
    name: "thirdweb",
    interfaceVersion: import_core.ADAPTER_INTERFACE_VERSION,
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
        const r = await (0, import_undici.request)(`${baseUrl}/verify`, {
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
          throw (0, import_core.infraError)(
            import_core2.ErrorCodes.ADAPTER_UNAVAILABLE,
            "Thirdweb facilitator unavailable",
            { status: r.statusCode }
          );
        }
        if (r.statusCode === 401 || r.statusCode === 403) {
          throw (0, import_core.infraError)(
            import_core2.ErrorCodes.ADAPTER_AUTH_FAILED,
            "Thirdweb authentication failed",
            { status: r.statusCode }
          );
        }
        if (r.statusCode === 429) {
          throw (0, import_core.infraError)(
            import_core2.ErrorCodes.ADAPTER_RATE_LIMITED,
            "Thirdweb rate limit exceeded",
            { status: r.statusCode }
          );
        }
        let data;
        try {
          data = await r.body.json();
        } catch (err) {
          throw (0, import_core.internalError)(import_core2.ErrorCodes.ADAPTER_INTERNAL_EXCEPTION, err);
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
          throw (0, import_core.infraError)(import_core2.ErrorCodes.ADAPTER_TIMEOUT, "Thirdweb timeout");
        }
        if (err.code === "ECONNREFUSED" || err.code === "ENOTFOUND") {
          throw (0, import_core.infraError)(
            import_core2.ErrorCodes.ADAPTER_UNAVAILABLE,
            "Thirdweb facilitator unreachable",
            { code: err.code }
          );
        }
        if (err.name === "X402Error") {
          throw err;
        }
        throw (0, import_core.internalError)(import_core2.ErrorCodes.ADAPTER_INTERNAL_EXCEPTION, err);
      }
    }
  };
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  ThirdwebAdapter
});
