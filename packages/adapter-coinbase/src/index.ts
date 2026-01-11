import { ADAPTER_INTERFACE_VERSION, FacilitatorAdapter } from "@x402/core";

export default function CoinbaseAdapter(options: any): FacilitatorAdapter {
  return {
    name: "coinbase",
    interfaceVersion: ADAPTER_INTERFACE_VERSION,
    async verify(input) {
      throw new Error("Not implemented");
    }
  };
}
