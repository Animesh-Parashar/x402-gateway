import { X402Error, ErrorCodes } from "./errors";

export function inputError(code: string, reason: string, raw?: any) {
  return new X402Error({
    origin: "gateway",
    class: "input",
    code: code as any,
    message: reason,
    details: { reason, raw }
  });
}

export function verificationError(code: string, reason: string, raw?: any) {
  return new X402Error({
    origin: "facilitator",
    class: "verification",
    code: code as any,
    message: reason,
    details: { reason, raw }
  });
}

export function infraError(code: string, reason: string, raw?: any) {
  return new X402Error({
    origin: "adapter",
    class: "infra",
    code: code as any,
    message: reason,
    details: { reason, raw }
  });
}

export function internalError(code: string, err: unknown) {
  return new X402Error({
    origin: code === ErrorCodes.ADAPTER_INTERNAL_EXCEPTION ? "adapter" : "gateway",
    class: "internal",
    code: code as any,
    message: "Internal error",
    details: undefined
  });
}
