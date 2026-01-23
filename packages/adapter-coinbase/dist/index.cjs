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
  default: () => CoinbaseAdapter
});
module.exports = __toCommonJS(index_exports);
var import_core = require("@x402/core");
var import_core2 = require("@x402/core");
var import_undici = require("undici");
function CoinbaseAdapter(options) {
  if (!options.apiKey) {
    throw new Error("CoinbaseAdapter requires apiKey");
  }
  const baseUrl = options.baseUrl ?? "https://api.coinbase.com";
  return {
    name: "coinbase",
    interfaceVersion: import_core.ADAPTER_INTERFACE_VERSION,
    async verify(input) {
      try {
        const r = await (0, import_undici.request)(`${baseUrl}/v2/verify`, {
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
          throw (0, import_core.infraError)(
            import_core2.ErrorCodes.ADAPTER_UNAVAILABLE,
            "Coinbase facilitator unavailable",
            { status: r.statusCode }
          );
        }
        let data;
        try {
          data = await r.body.json();
        } catch (err) {
          throw (0, import_core.internalError)(import_core2.ErrorCodes.ADAPTER_INTERNAL_EXCEPTION, err);
        }
        if (data.verified !== true) {
          return {
            verified: false,
            reason: data.reason ?? "verification_failed",
            raw: data
          };
        }
        if (data.to && data.to.toLowerCase() !== input.recipient.toLowerCase()) {
          return {
            verified: false,
            reason: "recipient_mismatch",
            raw: data
          };
        }
        return {
          verified: true,
          payer: data.from,
          recipient: data.to,
          amount: data.amount,
          asset: data.asset ?? "ETH"
        };
      } catch (err) {
        if (err.code === "UND_ERR_CONNECT_TIMEOUT" || err.code === "UND_ERR_HEADERS_TIMEOUT") {
          throw (0, import_core.infraError)(import_core2.ErrorCodes.ADAPTER_TIMEOUT, "Coinbase timeout");
        }
        if (err.name === "X402Error") {
          throw err;
        }
        throw (0, import_core.internalError)(import_core2.ErrorCodes.ADAPTER_INTERNAL_EXCEPTION, err);
      }
    }
  };
}
