# x402-gateway

> HTTP-native payment enforcement for APIs.  
> Pay-per-request. Stateless. Middleware-first. ⚡

---

## What This Is

**x402-gateway** is a **drop-in HTTP middleware primitive** that allows any server to enforce payment **directly at the request boundary** using the `402 Payment Required` status code and x402-compatible cryptographic payments.

It is **not**:
- a marketplace  
- a SaaS  
- a hosted service  

It **is** a **reference implementation of a protocol-level primitive**:

> Turn any HTTP endpoint into a paid endpoint  
> without accounts, API keys, or subscriptions.

---

## The Problem This Solves

Most APIs today monetize by enforcing payment at the **account level**:

- API keys
- User accounts
- Monthly billing
- Usage tracked *after* execution

This model breaks down when:
- The consumer is autonomous software or agents
- Usage is bursty or unpredictable
- Payment must be enforced *before* execution
- Identity and onboarding are undesirable

**x402-gateway enforces payment at the HTTP request level instead.**

---

## Mental Model 🧠

Think of x402-gateway like other infrastructure middleware:

- OAuth middleware → enforces identity  
- JWT middleware → enforces authorization  
- **x402-gateway → enforces payment**

Attach it to a route.  
That route becomes **economically protected**.

---

## What x402 Enables

By treating payment as request metadata, x402 makes it possible to:

- Enforce payment *before* execution
- Price APIs per request
- Allow software to pay other software
- Eliminate API keys and onboarding flows
- Support autonomous agents and scripts natively
- Build pay-per-use APIs without billing dashboards

This cannot be achieved with traditional Web2 billing systems.

---

## How Companies Use This (Concrete)

A company with an existing backend can monetize **one route** by adding middleware:

```js
const { x402 } = require('@x402/express');

app.get(
  '/api/agent/weather',
  x402.paywall({
    priceWei: '100000000000000',
    recipient: '0xMerchantAddress'
  }),
  weatherAgentHandler
);
````

That endpoint now:

* ❌ Rejects unpaid requests
* 📢 Advertises price via HTTP
* ✅ Unlocks access immediately upon payment
* 🚫 Requires no user accounts or sessions

Nothing else in the system needs to change.

---

## How It Works (Protocol-Level)

1. A client sends an HTTP request
2. The server checks for a valid x402 payment
3. If missing or invalid:
   * Responds with `402 Payment Required`
   * Includes price and recipient as HTTP headers
4. The client signs a payment and retries the request
5. The server verifies the payment cryptographically
6. The request executes

Payment enforcement happens **inside HTTP**, not before or after it.

---

## Example Flow

### 1. Unpaid Request

```bash
curl http://localhost:3000/api/summary
```

**Response:**

```http
HTTP/1.1 402 Payment Required
x402-price: 100000000000000
x402-currency: ETH
x402-recipient: 0xYourAddress
```

This response is machine-readable and self-descriptive.

---

### 2. Paid Request

```bash
curl \
  -H "x402-payment: <signed-payment-proof>" \
  http://localhost:3000/api/summary
```

**Response:**

```json
{
  "result": "Processed successfully",
  "paidBy": "0xPayerAddress",
  "amountPaid": "100000000000000"
}
```

---

## Architecture 🏗️

* HTTP middleware (Express-compatible)
* Cryptographic signature verification
* Stateless request handling
* Fixed per-request pricing (configurable)

There is:

* No database
* No session state
* No background billing jobs

This is intentional.

---

## Why This Is Different from Stripe

Stripe enforces payment at the level of:

* Users
* Accounts
* Sessions
* Subscriptions

x402-gateway enforces payment at the level of:

* **Individual HTTP requests**

Stripe answers:

> “Has this user paid?”

x402 answers:

> **“Has this request paid?”**

These operate at different layers of the stack.

---

## What This Enables Long-Term 🚀

This primitive can be composed into:

* Pay-per-tool AI services
* Agent-to-agent service markets
* Autonomous software commerce
* Composable API economies
* Protocol-native SaaS monetization

x402-gateway does not build these systems —
**it enables them.**

---

## One-Line Pitch

> Replace API keys and subscriptions with cryptographic payment enforced directly by HTTP.

---

## Status

Hackathon reference implementation.  
Designed to be **embedded**, not hosted.  
Optimized for clarity, composability, and protocol correctness.  

---