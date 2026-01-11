import { X402GatewayConfig } from "x402-gateway/core";

export function respond402(res: any, config: X402GatewayConfig) {
  res
    .status(402)
    .set({
      "x402-price": config.price,
      "x402-asset": config.asset ?? "ETH",
      "x402-recipient": config.recipient,
      "x402-facilitator": config.adapter.name
    })
    .json({
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
        asset: config.asset ?? "ETH",
        recipient: config.recipient,
        facilitator: config.adapter.name
      }
    });
}
