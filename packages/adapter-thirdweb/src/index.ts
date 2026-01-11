import { ADAPTER_INTERFACE_VERSION, FacilitatorAdapter } from "@x402/core";

export default function ThirdwebAdapter(options: any): FacilitatorAdapter {
  return {
    name: "thirdweb",
    interfaceVersion: ADAPTER_INTERFACE_VERSION,
    async verify(input) {
      throw new Error("Not implemented");
    }
  };
}
