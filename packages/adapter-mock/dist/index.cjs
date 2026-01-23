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
  MockFacilitatorAdapter: () => MockFacilitatorAdapter,
  default: () => index_default
});
module.exports = __toCommonJS(index_exports);
var import_core = require("@x402/core");
var import_core2 = require("@x402/core");
var import_undici = require("undici");
function MockFacilitatorAdapter(baseUrl = "http://localhost:4000") {
  return {
    name: "mock",
    interfaceVersion: import_core.ADAPTER_INTERFACE_VERSION,
    async verify(input) {
      try {
        const r = await (0, import_undici.request)(`${baseUrl}/verify`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(input)
        });
        if (r.statusCode >= 500) {
          throw (0, import_core.infraError)(
            import_core2.ErrorCodes.ADAPTER_UNAVAILABLE,
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
        throw (0, import_core.internalError)(import_core2.ErrorCodes.ADAPTER_INTERNAL_EXCEPTION, err);
      }
    }
  };
}
var index_default = MockFacilitatorAdapter;
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  MockFacilitatorAdapter
});
