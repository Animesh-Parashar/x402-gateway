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
export {
  ADAPTER_INTERFACE_VERSION,
  ErrorCodes,
  X402Error,
  infraError,
  inputError,
  internalError,
  logX402Error,
  validateAdapter,
  verificationError
};
