import { X402Error, ErrorCodes, ErrorCode } from "./errors";

// Input errors → 402
export function inputError(code: ErrorCode, reason: string, raw?: any) {
  return new X402Error({
    origin: "gateway",
    class: "input",
    code,
    message: reason,
    details: { reason, raw }
  });
}

// Verification errors → 402
export function verificationError(code: ErrorCode, reason: string, raw?: any) {
  return new X402Error({
    origin: "facilitator",
    class: "verification",
    code,
    message: reason,
    details: { reason, raw }
  });
}

// Infra errors → 502
export function infraError(code: ErrorCode, reason: string, raw?: any) {
  return new X402Error({
    origin: "adapter",
    class: "infra",
    code,
    message: reason,
    details: { reason, raw }
  });
}

// Internal errors → 500 (masked later)
export function internalError(code: ErrorCode, err: unknown) {
  return new X402Error({
    origin: code === ErrorCodes.ADAPTER_INTERNAL_EXCEPTION ? "adapter" : "gateway",
    class: "internal",
    code,
    message: "Internal error",
    details: undefined 
  });
}