// src/middleware.ts
import {
  ErrorCodes,
  X402Error,
  validateAdapter,
  infraError,
  internalError
} from "@x402/core";

// src/respond-402.ts
function respond402(res, config) {
  const asset = config.asset ?? "ETH";
  res.status(402).set({
    "x402-price": config.price,
    "x402-asset": asset,
    "x402-recipient": config.recipient,
    "x402-facilitator": config.adapter.name
  }).json({
    error: {
      origin: "gateway",
      class: "input",
      code: "GATEWAY_INVALID_MISSING_PROOF",
      message: "Missing payment proof",
      details: {
        reason: "missing_header"
      }
    },
    x402: {
      price: config.price,
      asset,
      recipient: config.recipient,
      facilitator: config.adapter.name
    }
  });
}

// src/handle-error.ts
import { logX402Error } from "@x402/core";
function handleX402Error(err, res) {
  if (err.class !== "input") {
    logX402Error(err);
  }
  const status = err.class === "input" || err.class === "verification" ? 402 : err.class === "infra" ? 502 : 500;
  return res.status(status).json(serialize(err));
}
function serialize(err) {
  if (err.class === "internal") {
    return {
      error: {
        origin: err.origin,
        class: err.class,
        code: err.code,
        message: "Internal error"
      }
    };
  }
  return {
    error: {
      origin: err.origin,
      class: err.class,
      code: err.code,
      message: err.message,
      details: err.details
    }
  };
}

// src/with-timeout.ts
async function withTimeout(promise, ms) {
  let timeoutId;
  const timeoutPromise = new Promise((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new Error("TIMEOUT"));
    }, ms);
  });
  try {
    return await Promise.race([promise, timeoutPromise]);
  } finally {
    clearTimeout(timeoutId);
  }
}

// src/middleware.ts
function x402(config) {
  validateAdapter(config.adapter);
  const header = config.header ?? "x-payment";
  const asset = config.asset ?? "ETH";
  const timeoutMs = config.timeoutMs ?? 2e3;
  return async function x402Middleware(req, res, next) {
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
    } catch (err) {
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
export {
  x402
};
