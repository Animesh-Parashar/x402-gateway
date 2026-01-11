import {
  X402GatewayConfig,
  ErrorCodes,
  X402Error,
  validateAdapter,
  infraError,
  internalError
} from "@x402/core";
import { respond402 } from "./respond-402";
import { handleX402Error } from "./handle-error";
import { withTimeout } from "./with-timeout";

export function x402(config: X402GatewayConfig) {
  validateAdapter(config.adapter);

  const header = config.header ?? "x-payment";
  const asset = config.asset ?? "ETH";
  const timeoutMs = config.timeoutMs ?? 2000;

  return async function x402Middleware(req: any, res: any, next: any) {
    const proof = req.headers[header];

    if (!proof) {
      return respond402(res, { ...config, asset });
    }

    try {
      const result = await withTimeout(
        config.adapter.verify({
          proof,
          price: config.price,
          recipient: config.recipient,
          asset
        }),
        timeoutMs
      );

      if (result.verified !== true) {
        throw new X402Error({
          origin: "facilitator",
          class: "verification",
          code: ErrorCodes.FACILITATOR_FAILED_VERIFICATION,
          message: result.reason,
          details: { reason: result.reason, raw: result.raw }
        });
      }

      req.x402 = result;
      return next();

    } catch (err: any) {
      if (err?.message === "TIMEOUT") {
        return handleX402Error(
          infraError(ErrorCodes.ADAPTER_TIMEOUT, "Facilitator timeout"),
          res
        );
      }

      if (err instanceof X402Error) {
        return handleX402Error(err, res);
      }

      return handleX402Error(
        internalError(ErrorCodes.GATEWAY_INTERNAL_EXCEPTION, err),
        res
      );
    }
  };
}
