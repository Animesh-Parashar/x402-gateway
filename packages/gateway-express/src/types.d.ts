declare module "express-serve-static-core" {
  interface Request {
    x402?: {
      verified: true;
      payer: string;
      recipient: string;
      amount: string;
      asset: string;
    }
  }
}
