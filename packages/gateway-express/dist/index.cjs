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
  x402: () => x402
});
module.exports = __toCommonJS(index_exports);

// src/middleware.ts
var import_core2 = require("@x402/core");

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
var import_core = require("@x402/core");
function handleX402Error(err, res) {
  if (err.class !== "input") {
    (0, import_core.logX402Error)(err);
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
  (0, import_core2.validateAdapter)(config.adapter);
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
        throw new import_core2.X402Error({
          origin: "facilitator",
          class: "verification",
          code: import_core2.ErrorCodes.FACILITATOR_FAILED_VERIFICATION,
          message: result.reason,
          details: { reason: result.reason, raw: result.raw }
        });
      }
      req.x402 = result;
      return next();
    } catch (err) {
      if (err?.message === "TIMEOUT") {
        return handleX402Error(
          (0, import_core2.infraError)(import_core2.ErrorCodes.ADAPTER_TIMEOUT, "Facilitator timeout"),
          res
        );
      }
      if (err instanceof import_core2.X402Error) {
        return handleX402Error(err, res);
      }
      return handleX402Error(
        (0, import_core2.internalError)(import_core2.ErrorCodes.GATEWAY_INTERNAL_EXCEPTION, err),
        res
      );
    }
  };
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  x402
});
