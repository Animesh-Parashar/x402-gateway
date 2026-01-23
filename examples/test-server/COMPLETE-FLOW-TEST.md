# Complete Payment Flow Testing

This guide shows you how to test the **complete x402 payment flow** from end to end.

## Quick Start (3 Terminals)

### Terminal 1: Start Mock Facilitator
```bash
npm run mock
```
This starts a local facilitator on `http://localhost:4000` that simulates payment verification.

### Terminal 2: Start Server (with mock adapter)
```bash
# Make sure USE_MOCK=true in your .env
npm start
```
This starts your x402 gateway server using the mock adapter.

### Terminal 3: Run Test Client
```bash
npm run client
```
This runs automated tests showing the complete payment flow!

---

## What the Test Client Does

The client script (`client.js`) simulates a complete x402 payment flow:

1. **First Request (No Payment)**
   - Makes request to protected endpoint
   - Receives `402 Payment Required`
   - Extracts payment requirements from headers

2. **Generate Payment Proof**
   - Creates a mock payment proof with correct amount, recipient, and asset
   - In production, this would involve wallet signatures

3. **Retry with Payment**
   - Sends request with `x-payment` header containing the proof
   - Gateway forwards to facilitator for verification
   - Facilitator verifies and returns success
   - Gateway grants access to protected resource

---

## Expected Output

### Mock Facilitator (Terminal 1)
```
🧪 Mock x402 Facilitator running on http://localhost:4000
Ready to verify payments!

🔍 Mock Facilitator: Verification Request Received
Payment Payload: { amount: '0.01', from: '0x...', ... }
Requirements: { maxAmountRequired: '0.01', ... }
✅ Mock Facilitator: Payment verified
```

### Server (Terminal 2)
```
🚀 x402 Test Server running on http://localhost:3000

📋 Configuration:
   - Adapter: Mock (local testing)
   - Recipient: 0x742d35Cc6634C0532925a3b844Bc454e4438f44e
   - Mock Facilitator: http://localhost:4000
```

### Test Client (Terminal 3)
```
🚀 x402 Payment Flow Test Client
=================================

TEST 1: Free endpoint (no payment required)
✅ Access granted without payment (free endpoint)

TEST 2: Weather endpoint (requires payment)
1️⃣ First attempt: No payment
✅ Received 402 Payment Required
📋 Payment requirements: { price: '0.01', asset: 'ETH', ... }

2️⃣ Creating payment proof...
✅ Payment proof created

3️⃣ Retrying with payment proof...
✅ Payment verified! Access granted.

📦 Response data:
{
  "message": "Weather data access granted!",
  "payment": {
    "verified": true,
    "payer": "0x1234...",
    "amount": "0.01"
  },
  "data": { ... }
}
```

---

## Switching to Real Thirdweb Facilitator

Once you're ready to test with the real Thirdweb facilitator:

1. **Update `.env`**:
   ```env
   USE_MOCK=false
   THIRDWEB_API_KEY=your_actual_api_key
   ```

2. **Restart server** (Terminal 2):
   ```bash
   npm start
   ```

3. **Use real payment proofs** - You'll need actual wallet-signed payment proofs instead of mock ones.

---

## Architecture Flow

```
Client (client.js)
    ↓
    1. GET /api/weather (no payment)
    ↓
Server (server.js)
    ↓
Gateway Middleware
    ↓
    ← 402 Payment Required
    ↓
Client receives pricing info
    ↓
    2. Generate payment proof
    ↓
    3. GET /api/weather (with x-payment header)
    ↓
Gateway Middleware
    ↓
Adapter (Mock or Thirdweb)
    ↓
Facilitator (Mock or Thirdweb API)
    ↓
Verification Response
    ↓
Gateway allows request
    ↓
API Handler executes
    ↓
    ← 200 OK + Data
```

---

## Files Created

| File | Purpose |
|------|---------|
| `mock-facilitator.js` | Simulates x402 facilitator for local testing |
| `client.js` | Automated test client showing complete flow |
| `server.js` | Updated to support mock/real adapter switching |

---

## Troubleshooting

**"Connection refused" on port 4000**
- Make sure mock facilitator is running (`npm run mock`)

**"Payment verification failed"**
- Check that `USE_MOCK=true` in `.env`
- Ensure mock facilitator is accessible

**"Cannot find module '@x402/adapter-mock'"**
- Run `npm install` to install dependencies
