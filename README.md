# x402-gateway

HTTP-native payment enforcement middleware for APIs.

x402-gateway enforces pay-per-request access control by requiring cryptographic payment verification directly at the HTTP request boundary using the `402 Payment Required` status code and x402-compatible payment proofs.

---

## Overview

**x402-gateway** is a drop-in middleware primitive for HTTP servers.

It allows API providers to require payment per request without introducing:
- user accounts
- API keys
- subscriptions
- billing dashboards
- centralized payment logic

The gateway **does not process or settle payments**.  
Instead, it delegates payment verification to an external **x402-compliant facilitator** and enforces access based on that verification.

This package is designed to be embedded into existing backends.

---

## Design Philosophy

x402-gateway enforces **economic authorization**, not payment execution.

It occupies the same layer as other HTTP middleware:
- OAuth middleware enforces identity
- JWT middleware enforces authorization
- **x402-gateway enforces payment verification**

Once attached to a route, that route is only executed if a trusted facilitator confirms that payment has been verified.

---

## Installation

```bash
npm install github:Animesh-Parashar/x402-gateway
````

---

## Usage

```js
const express = require('express');
const { x402 } = require('@x402/express');

const app = express();

app.get(
  '/api/data',
  x402.paywall({
    priceWei: '100000000000000',
    recipient: '0xMerchantAddress',
    facilitatorUrl: 'https://facilitator.example'
  }),
  (req, res) => {
    res.json({
      data: 'protected resource',
      payment: req.payment
    });
  }
);

app.listen(3000);
```

A single middleware invocation:

* rejects unpaid requests
* advertises pricing via HTTP headers
* delegates verification to a facilitator
* releases the resource only after verification succeeds

---

## Request Flow

1. Client sends an HTTP request
2. Gateway checks for a payment proof in request headers
3. If missing:
   * responds with `402 Payment Required`
   * includes price, recipient, and facilitator metadata
4. If present:
   * forwards the proof to the configured facilitator
5. If the facilitator verifies the payment:
   * the request proceeds
6. Otherwise:
   * the request is rejected

Payment enforcement happens **inside the HTTP request lifecycle**.

---

## Facilitator Contract

The gateway expects the facilitator to expose a verification endpoint.

### `POST /verify`

**Request body**

```json
{
  "payment": "<opaque-x402-payment-proof>",
  "priceWei": "100000000000000",
  "recipient": "0xMerchantAddress"
}
```

**Response body**

```json
{
  "verified": true,
  "payer": "0xPayerAddress",
  "amount": "100000000000000",
  "recipient": "0xMerchantAddress",
  "txHash": "0xTransactionHash"
}
```

The facilitator is responsible for:

* signature validation
* replay protection
* settlement logic
* chain-specific behavior

The gateway treats the facilitator as the source of truth and remains stateless.

---

## Getting Started (Local Testing with a Mock Facilitator)

This section shows how to test x402-gateway **locally** using a simple mock facilitator running on `localhost`.

### 1. Create a Mock Facilitator

Create a file `mock-facilitator.js`:

```js
const express = require('express');
const app = express();

app.use(express.json());

app.post('/verify', (req, res) => {
  const { payment, priceWei, recipient } = req.body;

  // Very simple mock logic:
  // any non-empty payment is considered "verified"
  if (!payment) {
    return res.status(400).json({ verified: false });
  }

  res.json({
    verified: true,
    payer: '0xMockPayer',
    amount: priceWei,
    recipient,
    txHash: '0xMockTransaction'
  });
});

app.listen(4000, () => {
  console.log('Mock facilitator running on http://localhost:4000');
});
```

Run it:

```bash
node mock-facilitator.js
```

---

### 2. Create a Local API Using x402-gateway

```js
const express = require('express');
const { x402 } = require('@x402/express');

const app = express();

app.get(
  '/api/hello',
  x402.paywall({
    priceWei: '100000000000000',
    recipient: '0xMerchantAddress',
    facilitatorUrl: 'http://localhost:4000'
  }),
  (req, res) => {
    res.json({
      message: 'Hello, paid world!',
      payment: req.payment
    });
  }
);

app.listen(3000, () => {
  console.log('API running on http://localhost:3000');
});
```

---

### 3. Test the Flow

#### Unpaid request

```bash
curl http://localhost:3000/api/hello
```

Response:

```http
HTTP/1.1 402 Payment Required
x402-price: 100000000000000
x402-recipient: 0xMerchantAddress
x402-facilitator: http://localhost:4000
```

---

#### Paid request (mock proof)

```bash
curl \
  -H "x-payment: mock-proof-123" \
  http://localhost:3000/api/hello
```

Response:

```json
{
  "message": "Hello, paid world!",
  "payment": {
    "verified": true,
    "payer": "0xMockPayer",
    "txHash": "0xMockTransaction"
  }
}
```

You have now tested the full x402 flow locally.

---

## Payment Verification & Responsibilities

x402-gateway does not execute or settle payments.

* Verification, replay protection, and settlement are the responsibility of the facilitator.
* The gateway enforces access strictly based on the facilitator’s response.
* Optional local replay protection may be enabled as a rate-safety guard.

---

## Operational Guarantees

* **Fail-closed behavior**
  If the facilitator is unavailable or returns an invalid response, the request is rejected.

* **Timeout enforcement**
  Verification requests are subject to a configurable timeout.

* **Statelessness**
  The gateway does not maintain balances, sessions, or settlement state.

---

## Intended Use Cases

x402-gateway is designed to be composed into:

* pay-per-request APIs
* agent-to-agent services
* autonomous software tooling
* usage-based infrastructure
* protocol-native backends

It provides the enforcement primitive these systems depend on.

---

## Status

Early reference implementation.

The API surface is intentionally small and opinionated, with a focus on:

* correctness
* composability
* facilitator interoperability

---
