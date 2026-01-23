import { X402GatewayConfig } from '@x402/core';

declare function x402(config: X402GatewayConfig): (req: any, res: any, next: any) => Promise<any>;

export { x402 };
