export interface VerificationContext {
  requestId: string
  timestamp: number
  method: string
  path: string
  headers: Record<string, string>
  ip?: string
}
