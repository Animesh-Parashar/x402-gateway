import { FacilitatorAdapter } from '@x402/core';

declare function CoinbaseAdapter(options: {
    apiKey: string;
    baseUrl?: string;
}): FacilitatorAdapter;

export { CoinbaseAdapter as default };
