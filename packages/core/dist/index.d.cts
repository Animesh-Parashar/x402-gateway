declare const ADAPTER_INTERFACE_VERSION: "1.0.0";
type VerifyInput = {
    proof: unknown;
    price: string;
    asset: string;
    recipient: string;
};
type VerificationSuccess = {
    verified: true;
    payer: string;
    recipient: string;
    amount: string;
    asset: string;
};
type VerificationFailure = {
    verified: false;
    reason: string;
    raw?: any;
};
type VerificationResult = VerificationSuccess | VerificationFailure;
interface FacilitatorAdapter {
    name: string;
    interfaceVersion: typeof ADAPTER_INTERFACE_VERSION;
    verify(input: VerifyInput): Promise<VerificationResult>;
}
type X402GatewayConfig = {
    adapter: FacilitatorAdapter;
    price: string;
    recipient: string;
    asset?: string;
    header?: string;
    timeoutMs?: number;
};

type X402ErrorOrigin = "gateway" | "adapter" | "facilitator";
type X402ErrorClass = "input" | "verification" | "infra" | "internal";
declare const ErrorCodes: {
    readonly GATEWAY_INVALID_MISSING_PROOF: "GATEWAY_INVALID_MISSING_PROOF";
    readonly GATEWAY_INVALID_UNSUPPORTED_PROOF_TYPE: "GATEWAY_INVALID_UNSUPPORTED_PROOF_TYPE";
    readonly GATEWAY_INVALID_MALFORMED_PROOF: "GATEWAY_INVALID_MALFORMED_PROOF";
    readonly FACILITATOR_FAILED_VERIFICATION: "FACILITATOR_FAILED_VERIFICATION";
    readonly FACILITATOR_FAILED_EXPIRED_PROOF: "FACILITATOR_FAILED_EXPIRED_PROOF";
    readonly FACILITATOR_FAILED_INSUFFICIENT_AMOUNT: "FACILITATOR_FAILED_INSUFFICIENT_AMOUNT";
    readonly FACILITATOR_FAILED_RECIPIENT_MISMATCH: "FACILITATOR_FAILED_RECIPIENT_MISMATCH";
    readonly ADAPTER_TIMEOUT: "ADAPTER_TIMEOUT";
    readonly ADAPTER_UNAVAILABLE: "ADAPTER_UNAVAILABLE";
    readonly ADAPTER_RATE_LIMITED: "ADAPTER_RATE_LIMITED";
    readonly ADAPTER_AUTH_FAILED: "ADAPTER_AUTH_FAILED";
    readonly GATEWAY_INTERNAL_EXCEPTION: "GATEWAY_INTERNAL_EXCEPTION";
    readonly ADAPTER_INTERNAL_EXCEPTION: "ADAPTER_INTERNAL_EXCEPTION";
};
type ErrorCode = typeof ErrorCodes[keyof typeof ErrorCodes];
declare class X402Error extends Error {
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
    });
}

declare function inputError(code: string, reason: string, raw?: any): X402Error;
declare function verificationError(code: string, reason: string, raw?: any): X402Error;
declare function infraError(code: string, reason: string, raw?: any): X402Error;
declare function internalError(code: string, err: unknown): X402Error;

declare function logX402Error(err: X402Error, context?: Record<string, any>): void;

declare function validateAdapter(adapter: FacilitatorAdapter): void;

export { ADAPTER_INTERFACE_VERSION, type ErrorCode, ErrorCodes, type FacilitatorAdapter, type VerificationFailure, type VerificationResult, type VerificationSuccess, type VerifyInput, X402Error, type X402ErrorClass, type X402ErrorOrigin, type X402GatewayConfig, infraError, inputError, internalError, logX402Error, validateAdapter, verificationError };
