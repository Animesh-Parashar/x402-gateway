export interface VerificationResult {
  ok: boolean
  code?: string
  reason?: string
  settlement?: {
    txHash?: string
    payer?: string
    amount?: string
    asset?: string
    chainId?: string
    blockNumber?: number
  }
}
