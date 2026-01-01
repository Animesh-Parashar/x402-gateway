# x402-gateway

HTTP-native payment enforcement middleware for APIs.

x402-gateway enables pay-per-request access control by enforcing cryptographic payment directly at the HTTP request boundary using the `402 Payment Required` status code and x402-compatible payment proofs.

---

## Overview

**x402-gateway** is a drop-in middleware primitive for HTTP servers.

It allows API providers to require payment *per request* without introducing:
- user accounts
- API keys
- subscriptions
- billing dashboards
- centralized payment services

The middleware enforces payment inline with request execution, making it suitable for both human-driven clients and autonomous software.

This package is not a hosted service or platform.  
It is intended to be embedded into existing backends.

---

## Motivation

Most API monetization systems enforce payment at the **account level**:

- API keys tied to users
- usage tracked after execution
- monthly or quota-based billing
- centralized identity and onboarding

This model breaks down when:
- the client is autonomous software or agents
- usage is bursty or unpredictable
- payment must be enforced before execution
- identity and long-lived credentials are undesirable

x402-gateway enforces payment at the **HTTP request level** instead.

---

## Conceptual Model

x402-gateway follows the same design philosophy as other infrastructure middleware:

- OAuth middleware enforces identity
- JWT middleware enforces authorization
- **x402-gateway enforces payment**

When attached to a route, that route becomes economically protected.  
No other parts of the system need to change.

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
    recipient: '0xMerchantAddress'
  }),
  (req, res) => {
    res.json({
      data: 'weather data',
      paidBy: req.payment.payer
    });
  }
);

app.listen(3000);
```

This single middleware invocation:

* rejects unpaid requests
* advertises price via HTTP headers
* verifies payment cryptographically
* executes the handler only after payment is proven

No user state or session management is required.

---

## Request Flow

1. Client sends an HTTP request
2. Server checks for an x402 payment proof
3. If missing or invalid:

   * responds with `402 Payment Required`
   * includes pricing and recipient metadata as headers
4. Client signs a payment and retries the request
5. Server verifies the payment signature
6. Request handler executes

Payment enforcement occurs **inside the HTTP request lifecycle**.

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
x402-currency: ETH
x402-recipient: 0xMerchantAddress
```

---

### Paid Request

```bash
curl \
  -H "x402-payment: <base64-encoded-payment-proof>" \
  http://localhost:3000/api/agent/weather
```

Response:

```json
{
  "data": "weather data",
  "paidBy": "0xPayerAddress"
}
```

---

## Architecture

* Express-compatible HTTP middleware
* Cryptographic signature verification
* Stateless request handling
* Fixed per-request pricing (configurable)

The middleware does not require:

* databases
* background jobs
* billing state
* long-lived credentials

---

## Comparison with Traditional Billing Systems

Traditional systems enforce payment at the level of:

* users
* accounts
* sessions
* subscriptions

x402-gateway enforces payment at the level of:

* individual HTTP requests

Traditional systems answer:

> “Has this user paid?”

x402-gateway answers:

> “Has this request paid?”

These operate at different layers of the stack.

---

## Intended Use Cases

x402-gateway is designed to be composed into systems such as:

* pay-per-request APIs
* agent-to-agent services
* autonomous software tooling
* usage-based infrastructure services
* protocol-native SaaS backends

The package does not implement these systems directly.
It provides the enforcement primitive they depend on.

---

## Status

Early reference implementation.

The focus is correctness, composability, and clarity of abstraction.
The API surface is intentionally small and opinionated.

---

