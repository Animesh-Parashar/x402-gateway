import { X402Error } from "@x402/core";
import { logX402Error } from "@x402/core";

export function handleX402Error(err: X402Error, res: any) {
  if (err.class !== "input") {
    logX402Error(err);
  }

  const status =
    err.class === "input" || err.class === "verification"
      ? 402
      : err.class === "infra"
        ? 502
        : 500;

  return res.status(status).json(serialize(err));
}

function serialize(err: X402Error) {
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
