const fetch = require('node-fetch');

function paywall({
  priceWei,
  recipient,
  facilitatorUrl,
  header = 'x-payment',
  timeoutMs = 3000
}) {
  if (!priceWei) throw new Error('x402.paywall requires priceWei');
  if (!recipient) throw new Error('x402.paywall requires recipient');
  if (!facilitatorUrl) throw new Error('x402.paywall requires facilitatorUrl');

  return async function requirePayment(req, res, next) {
    const payment = req.headers[header];

    // 1. No payment → advertise price
    if (!payment) {
      return res.status(402).set({
        'x402-price': priceWei,
        'x402-recipient': recipient
      }).json({ error: 'Payment required' });
    }

    let verifyResponse;
    try {
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), timeoutMs);

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

      clearTimeout(id);
    } catch (err) {
      return res.status(502).json({
        error: 'Payment verification service unavailable'
      });
    }

    if (!verifyResponse.ok) {
      return res.status(402).json({ error: 'Payment verification failed' });
    }

    let result;
    try {
      result = await verifyResponse.json();
    } catch {
      return res.status(502).json({
        error: 'Invalid verification response'
      });
    }

    // 2. Facilitator says NO → reject
    if (!result.verified) {
      return res.status(402).json({ error: 'Payment not verified' });
    }

    // 3. Facilitator says YES → release resource
    req.payment = result;
    next();
  };
}

module.exports = { paywall };
