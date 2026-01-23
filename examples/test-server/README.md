# x402 Gateway Test Server

A simple Express server demonstrating x402 payment gateway integration with the Thirdweb facilitator.

## Prerequisites

- Node.js >= 18.0.0
- A Thirdweb API key ([Get one here](https://thirdweb.com/dashboard))
- An Ethereum address to receive payments

## Installation

1. **Install dependencies** from GitHub:

```bash
npm install
```

This will install the x402 packages directly from the GitHub repository:
- `@x402/core`
- `@x402/gateway-express`
- `@x402/adapter-thirdweb`

2. **Configure environment variables**:

```bash
cp .env.example .env
```

Edit `.env` and add your credentials:
```env
THIRDWEB_API_KEY=your_actual_api_key
RECIPIENT_ADDRESS=0xYourEthereumAddress
```

## Running the Server

```bash
# Standard start
npm start

# Development mode (auto-reload)
npm run dev
```

The server will start on `http://localhost:3000`

## Testing

### 1. Test Health Check (No Payment)

```bash
curl http://localhost:3000/
```

**Expected Response:**
```json
{
  "message": "x402 Gateway Test Server",
  "status": "running",
  "endpoints": {
    "/": "Health check (free)",
    "/api/weather": "Weather data (requires 0.01 ETH payment)",
    "/api/greeting": "Greeting message (requires 0.005 ETH payment)"
  }
}
```

### 2. Test Protected Endpoint (Without Payment)

```bash
curl http://localhost:3000/api/weather
```

**Expected Response (402 Payment Required):**
```json
{
  "error": {
    "origin": "gateway",
    "class": "input",
    "code": "GATEWAY_INVALID_MISSING_PROOF",
    "message": "Missing payment proof",
    "details": {
      "reason": "missing_header"
    }
  },
  "x402": {
    "price": "0.01",
    "asset": "ETH",
    "recipient": "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
    "facilitator": "thirdweb"
  }
}
```

Headers will include:
```
HTTP/1.1 402 Payment Required
x402-price: 0.01
x402-asset: ETH
x402-recipient: 0x742d35Cc6634C0532925a3b844Bc454e4438f44e
x402-facilitator: thirdweb
```

### 3. Test with Payment Proof

To test with actual payment, you need a valid x402 payment proof. This typically comes from:

1. **A wallet client** that supports x402
2. **A payment widget** (e.g., Thirdweb's payment widget)
3. **Manual payment construction** following the x402 protocol

Example with payment header:
```bash
curl -H "x-payment: <base64_encoded_payment_proof>" \
     http://localhost:3000/api/weather
```

**Expected Response (200 OK):**
```json
{
  "message": "Weather data access granted!",
  "payment": {
    "verified": true,
    "payer": "0xPayerAddress",
    "recipient": "0xRecipientAddress",
    "amount": "0.01",
    "asset": "ETH"
  },
  "data": {
    "location": "San Francisco",
    "temperature": "18°C",
    "conditions": "Partly Cloudy",
    "humidity": "65%"
  }
}
```

## How It Works

1. **Client makes request** to a protected endpoint
2. **Gateway checks** for payment proof in `x-payment` header
3. **If missing** → Returns `402 Payment Required` with pricing details
4. **If present** → Sends proof to Thirdweb facilitator for verification
5. **If verified** → Request proceeds to your handler
6. **If invalid** → Returns `402` with error details

## Architecture

```
Client Request
    ↓
Gateway Middleware (@x402/gateway-express)
    ↓
Thirdweb Adapter (@x402/adapter-thirdweb)
    ↓
Thirdweb Facilitator API
    ↓
Verification Response
    ↓
Your API Handler
```

## Troubleshooting

### "Cannot find module '@x402/...'"

Make sure you ran `npm install` and the packages were built in the main repository.

### "Thirdweb authentication failed"

Check that your `THIRDWEB_API_KEY` in `.env` is correct.

### "Facilitator unavailable"

- Check your internet connection
- Verify the `THIRDWEB_FACILITATOR_URL` is correct
- The facilitator service might be down

## Learn More

- [x402 Protocol Documentation](https://docs.x402.org)
- [Thirdweb Documentation](https://portal.thirdweb.com)
- [Main Repository](https://github.com/Animesh-Parashar/x402-gateway)
