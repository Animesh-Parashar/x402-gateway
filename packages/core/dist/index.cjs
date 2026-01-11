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
  ADAPTER_INTERFACE_VERSION: () => ADAPTER_INTERFACE_VERSION,
  ErrorCodes: () => ErrorCodes,
  X402Error: () => X402Error,
  infraError: () => infraError,
  inputError: () => inputError,
  internalError: () => internalError,
  logX402Error: () => logX402Error,
  validateAdapter: () => validateAdapter,
  verificationError: () => verificationError
});
module.exports = __toCommonJS(index_exports);

// src/types.ts
var ADAPTER_INTERFACE_VERSION = "1.0.0";

// src/errors.ts
var ErrorCodes = {
  GATEWAY_INVALID_MISSING_PROOF: "GATEWAY_INVALID_MISSING_PROOF",
  GATEWAY_INVALID_UNSUPPORTED_PROOF_TYPE: "GATEWAY_INVALID_UNSUPPORTED_PROOF_TYPE",
  GATEWAY_INVALID_MALFORMED_PROOF: "GATEWAY_INVALID_MALFORMED_PROOF",
  FACILITATOR_FAILED_VERIFICATION: "FACILITATOR_FAILED_VERIFICATION",
  FACILITATOR_FAILED_EXPIRED_PROOF: "FACILITATOR_FAILED_EXPIRED_PROOF",
  FACILITATOR_FAILED_INSUFFICIENT_AMOUNT: "FACILITATOR_FAILED_INSUFFICIENT_AMOUNT",
  FACILITATOR_FAILED_RECIPIENT_MISMATCH: "FACILITATOR_FAILED_RECIPIENT_MISMATCH",
  ADAPTER_TIMEOUT: "ADAPTER_TIMEOUT",
  ADAPTER_UNAVAILABLE: "ADAPTER_UNAVAILABLE",
  ADAPTER_RATE_LIMITED: "ADAPTER_RATE_LIMITED",
  ADAPTER_AUTH_FAILED: "ADAPTER_AUTH_FAILED",
  GATEWAY_INTERNAL_EXCEPTION: "GATEWAY_INTERNAL_EXCEPTION",
  ADAPTER_INTERNAL_EXCEPTION: "ADAPTER_INTERNAL_EXCEPTION"
};
var X402Error = class extends Error {
  constructor(args) {
    super(args.message);
    this.origin = args.origin;
    this.class = args.class;
    this.code = args.code;
    this.details = args.details;
  }
};

// src/error-factory.ts
function inputError(code, reason, raw) {
  return new X402Error({
    origin: "gateway",
    class: "input",
    code,
    message: reason,
    details: { reason, raw }
  });
}
function verificationError(code, reason, raw) {
  return new X402Error({
    origin: "facilitator",
    class: "verification",
    code,
    message: reason,
    details: { reason, raw }
  });
}
function infraError(code, reason, raw) {
  return new X402Error({
    origin: "adapter",
    class: "infra",
    code,
    message: reason,
    details: { reason, raw }
  });
}
function internalError(code, err) {
  return new X402Error({
    origin: code === ErrorCodes.ADAPTER_INTERNAL_EXCEPTION ? "adapter" : "gateway",
    class: "internal",
    code,
    message: "Internal error",
    details: void 0
  });
}

// src/logging.ts
function logX402Error(err, context) {
  const payload = {
    level: "error",
    event: "x402_error",
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    origin: err.origin,
    class: err.class,
    code: err.code,
    details: err.class === "internal" ? void 0 : err.details,
    ...context
  };
  console.error(JSON.stringify(payload));
}

// src/validate-adapter.ts
function validateAdapter(adapter) {
  if (!adapter || typeof adapter !== "object") {
    throw inputError(
      ErrorCodes.GATEWAY_INVALID_UNSUPPORTED_PROOF_TYPE,
      "Invalid adapter instance"
    );
  }
  if (adapter.interfaceVersion !== ADAPTER_INTERFACE_VERSION) {
    throw inputError(
      ErrorCodes.GATEWAY_INVALID_UNSUPPORTED_PROOF_TYPE,
      `Adapter interface version mismatch. Expected ${ADAPTER_INTERFACE_VERSION}, got ${adapter.interfaceVersion}`
    );
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  ADAPTER_INTERFACE_VERSION,
  ErrorCodes,
  X402Error,
  infraError,
  inputError,
  internalError,
  logX402Error,
  validateAdapter,
  verificationError
});
