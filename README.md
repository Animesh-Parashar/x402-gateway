# x402-gateway

> HTTP-native pay-per-request APIs using x402.  
> No accounts. No API keys. No subscriptions.


**x402-gateway** is a minimal API gateway that enforces payment at the HTTP layer using the `402 Payment Required` status code and x402-compatible payments.

Clients unlock API access **per request** by attaching a valid cryptographic payment to the request itself.

This replaces:
- API keys
- User accounts
- Subscription billing
- Post-hoc usage tracking

with **stateless, machine-verifiable payment enforcement**.

---

## Why This Matters

Modern APIs assume:
- Identity-bound users
- Manual onboarding
- Monthly subscriptions
- Centralized billing systems

These assumptions break when:
- The consumer is autonomous software or agents
- Usage is bursty or unpredictable
- Global, permissionless access is required

**x402-gateway enables APIs to monetize directly at the protocol level.**

---

## What x402 Unlocks

x402 makes it possible to:

- Enforce payment *before* execution
- Price APIs per request
- Allow software to pay other software
- Eliminate onboarding and credential management
- Build pay-per-use SaaS that works for humans **and** agents

Traditional systems like Stripe or RapidAPI cannot do this.

---

## How It Works (High Level)

1. Client sends a request to a protected endpoint
2. Server checks for a valid x402 payment
3. If missing or invalid:
   - Responds with `402 Payment Required`
   - Includes price and payment metadata
4. Client retries with payment attached
5. Server verifies payment and executes the request

All within standard HTTP.

---

## Example Flow

### 1. Unpaid Request

```bash
curl http://localhost:3000/api/compute?input=hello
````

**Response:**

```http
HTTP/1.1 402 Payment Required
x402-price: 100000000000000
x402-currency: ETH
x402-recipient: 0xYourAddress
```

---

### 2. Paid Request

```bash
curl \
  -H "x402-payment: <payment-proof>" \
  http://localhost:3000/api/compute?input=hello
```

**Response:**

```json
{
  "result": "Processed: hello"
}
```

---

## Architecture

* Node.js API server
* x402 payment verification middleware
* Stateless request handling
* Fixed price per request (configurable)

There is **no database**, **no session state**, and **no background processing**.

---

## Why Stripe Cannot Do This

Stripe requires:

* User identity
* Accounts
* Pre-registered payment methods
* Off-chain enforcement

x402-gateway works with:

* Wallet-native payments
* Stateless verification
* Machine-to-machine usage
* On-chain economic enforcement

This is a fundamentally different model.

---

## What This Enables Long-Term

This gateway is a primitive that can evolve into:

* Pay-per-tool AI services
* Autonomous agent marketplaces
* Composable API economies
* Decentralized service meshes
* Software-to-software commerce

---

## One-Line Pitch

> We replace API keys and subscriptions with cryptographic payment at the HTTP layer.

---

## Status

Hackathon prototype.
Focused on clarity, determinism, and demo reliability.

___

