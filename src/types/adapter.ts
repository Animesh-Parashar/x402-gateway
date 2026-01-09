import { Intent } from './intent'
import { VerificationContext } from './context'
import { VerificationResult } from './result'

export interface FacilitatorAdapter {
  name: string
  verify(
    proof: string,
    intent: Intent,
    context: VerificationContext
  ): Promise<VerificationResult>
}
