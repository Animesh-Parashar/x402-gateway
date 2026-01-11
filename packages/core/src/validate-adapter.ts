import { FacilitatorAdapter, ADAPTER_INTERFACE_VERSION } from "./types";
import { inputError } from "./error-factory";
import { ErrorCodes } from "./errors";

export function validateAdapter(adapter: FacilitatorAdapter) {
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
