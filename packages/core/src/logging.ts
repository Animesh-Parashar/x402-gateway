import { X402Error } from "./errors";

export function logX402Error(err: X402Error, context?: Record<string, any>) {

  const payload = {
    level: "error",
    event: "x402_error",
    timestamp: new Date().toISOString(),
    origin: err.origin,
    class: err.class,
    code: err.code,
    details: err.class === "internal" ? undefined : err.details,
    ...context
  };

  console.error(JSON.stringify(payload));
}
