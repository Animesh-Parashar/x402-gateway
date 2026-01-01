const fetch = require('node-fetch');

function paywall({
  priceWei,
  recipient,
  facilitatorUrl,
  header = 'x-payment',
  timeoutMs = 5000
}) {
  if (!priceWei) throw new Error('x402.paywall requires priceWei');
  if (!recipient) throw new Error('x402.paywall requires recipient');
  if (!facilitatorUrl) throw new Error('x402.paywall requires facilitatorUrl');

  return async function requirePayment(req, res, next) {
    const payment = req.headers[header];

    // 1. No payment → advertise terms
    if (!payment) {
      return res.status(402).set({
        'x402-price': priceWei,
        'x402-recipient': recipient,
        'x402-facilitator': facilitatorUrl
      }).json({ error: 'Payment required' });
    }

    let verifyResponse;
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), timeoutMs);

      verifyResponse = await fetch(`${facilitatorUrl}/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          payment,
          priceWei,
          recipient
        }),
        signal: controller.signal
      });

      clearTimeout(timeout);
    } catch (err) {
      return res.status(502).json({
        error: 'Payment verification service unavailable',
        facilitator: facilitatorUrl
      });
    }

    if (!verifyResponse.ok) {
      return res.status(402).json({
        error: 'Payment verification failed'
      });
    }

    let result;
    try {
      result = await verifyResponse.json();
    } catch {
      return res.status(502).json({
        error: 'Invalid response from payment verifier'
      });
    }

    // 2. Facilitator decides
    if (!result.verified) {
      return res.status(402).json({
        error: 'Payment not verified'
      });
    }

    // 3. Verified → release resource
    req.payment = result;
    next();
  };
}

module.exports = { paywall };
