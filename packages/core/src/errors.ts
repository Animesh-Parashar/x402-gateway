export type X402ErrorOrigin =
  | "gateway"
  | "adapter"
  | "facilitator";

export type X402ErrorClass =
  | "input"
  | "verification"
  | "infra"
  | "internal";

export const ErrorCodes = {
  // Input errors (HTTP 402)
  GATEWAY_INVALID_MISSING_PROOF: "GATEWAY_INVALID_MISSING_PROOF",
  GATEWAY_INVALID_UNSUPPORTED_PROOF_TYPE: "GATEWAY_INVALID_UNSUPPORTED_PROOF_TYPE",
  GATEWAY_INVALID_MALFORMED_PROOF: "GATEWAY_INVALID_MALFORMED_PROOF",

  // Verification errors (HTTP 402)
  FACILITATOR_FAILED_VERIFICATION: "FACILITATOR_FAILED_VERIFICATION",
  FACILITATOR_FAILED_EXPIRED_PROOF: "FACILITATOR_FAILED_EXPIRED_PROOF",
  FACILITATOR_FAILED_INSUFFICIENT_AMOUNT: "FACILITATOR_FAILED_INSUFFICIENT_AMOUNT",
  FACILITATOR_FAILED_RECIPIENT_MISMATCH: "FACILITATOR_FAILED_RECIPIENT_MISMATCH",

  // Infra errors (HTTP 502)
  ADAPTER_TIMEOUT: "ADAPTER_TIMEOUT",
  ADAPTER_UNAVAILABLE: "ADAPTER_UNAVAILABLE",
  ADAPTER_RATE_LIMITED: "ADAPTER_RATE_LIMITED",
  ADAPTER_AUTH_FAILED: "ADAPTER_AUTH_FAILED",

  // Internal errors (HTTP 500)
  GATEWAY_INTERNAL_EXCEPTION: "GATEWAY_INTERNAL_EXCEPTION",
  ADAPTER_INTERNAL_EXCEPTION: "ADAPTER_INTERNAL_EXCEPTION",
} as const;

export type ErrorCode = typeof ErrorCodes[keyof typeof ErrorCodes];

export class X402Error extends Error {
  readonly origin: X402ErrorOrigin;
  readonly class: X402ErrorClass;
  readonly code: ErrorCode;
  readonly details?: any;

  constructor(args: {
    origin: X402ErrorOrigin;
    class: X402ErrorClass;
    code: ErrorCode;
    message: string;
    details?: any;
  }) {
    super(args.message);
    this.origin = args.origin;
    this.class = args.class;
    this.code = args.code;
    this.details = args.details;
  }
}
