export const ADAPTER_INTERFACE_VERSION = "1.0.0" as const;

export type VerifyInput = {
  proof: unknown;
  price: string;
  asset: string;
  recipient: string;
};

export type VerificationSuccess = {
  verified: true;
  payer: string;
  recipient: string;
  amount: string;
  asset: string;
};

export type VerificationFailure = {
  verified: false;
  reason: string;
  raw?: any;
};

export type VerificationResult = VerificationSuccess | VerificationFailure;

export interface FacilitatorAdapter {
  name: string;
  interfaceVersion: typeof ADAPTER_INTERFACE_VERSION;
  verify(input: VerifyInput): Promise<VerificationResult>;
}

export type X402GatewayConfig = {
  adapter: FacilitatorAdapter;
  price: string;
  recipient: string;
  asset?: string;      // optional, default "ETH"
  header?: string;     // optional, default "x-payment"
  timeoutMs?: number;  // optional, default 2000
};
