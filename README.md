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

The middleware does **not** process or settle payments itself.  
It relies on an external **x402-compliant facilitator** to verify that a payment has already been accepted.

This package is intended to be embedded into existing backends.

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
npm install @x402/express
````

---

## Usage

```js
const express = require('express');
const { x402 } = require('@x402/express');

const app = express();

app.get(
  '/api/agent/weather',
  x402.paywall({
    priceWei: '100000000000000',
    recipient: '0xMerchantAddress',
    facilitatorUrl: 'https://facilitator.example'
  }),
  (req, res) => {
    res.json({
      data: 'weather data',
      payment: req.payment
    });
  }
);

app.listen(3000);
```

A single middleware invocation:

* rejects unpaid requests
* advertises pricing via HTTP headers
* delegates payment verification to a facilitator
* executes the handler only after verification succeeds

---

## Request Flow

1. Client sends an HTTP request
2. Gateway checks for a payment proof in the request headers
3. If missing:

   * responds with `402 Payment Required`
   * includes price and recipient metadata as headers
4. If present:

   * forwards the payment proof to the configured facilitator
5. If the facilitator confirms verification:

   * the request proceeds
6. Otherwise:

   * the request is rejected with `402`

Payment enforcement happens **inside the HTTP request lifecycle**.

---

## Facilitator Contract

The gateway expects the configured facilitator to expose a verification endpoint:

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

The gateway treats the facilitator as the authority on:

* signature validation
* replay protection
* settlement status
* chain-specific logic

The gateway itself remains stateless.

---

## Example

### Unpaid Request

```bash
curl http://localhost:3000/api/agent/weather
```

Response:

```http
HTTP/1.1 402 Payment Required
x402-price: 100000000000000
x402-recipient: 0xMerchantAddress
```

---

### Paid Request

```bash
curl \
  -H "x-payment: <base64-encoded-payment-proof>" \
  http://localhost:3000/api/agent/weather
```

Response:

```json
{
  "data": "weather data",
  "payment": {
    "payer": "0xPayerAddress",
    "txHash": "0xTransactionHash"
  }
}
```

---

## Architecture

* Express-compatible HTTP middleware
* External payment verification via facilitator
* Stateless request handling
* Fixed per-request pricing (configurable)

The gateway does not maintain:

* user state
* payment balances
* settlement logic
* background jobs

---

## Comparison with Traditional Billing Systems

Traditional billing systems enforce payment at the level of:

* users
* accounts
* sessions
* subscriptions

x402-gateway enforces payment at the level of:

* individual HTTP requests

Traditional systems answer:

> “Has this user paid?”

x402-gateway answers:

> “Has this request been paid for?”

---

## Intended Use Cases

x402-gateway is designed to be composed into systems such as:

* pay-per-request APIs
* agent-to-agent services
* autonomous software tooling
* usage-based infrastructure services
* protocol-native backends

The package provides the enforcement primitive these systems depend on.

---

## Status

Early reference implementation.

The API surface is intentionally small and opinionated, with a focus on:

* composability
* correctness
* facilitator interoperability

---