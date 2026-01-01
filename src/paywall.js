// Public API — do not change without a major version bump

const fetch = require('node-fetch');

function createReplayCache(ttlMs) {
  const seen = new Map();

  return {
    has(key) {
      const ts = seen.get(key);
      if (!ts) return false;
      if (Date.now() - ts > ttlMs) {
        seen.delete(key);
        return false;
      }
      return true;
    },
    add(key) {
      seen.set(key, Date.now());
    }
  };
}

function paywall({
  priceWei,
  recipient,
  facilitatorUrl,
  header = 'x-payment',
  timeoutMs = 2000,
  replayProtection = { enabled: false, ttlMs: 60000 }
}) {
  if (!priceWei) throw new Error('x402.paywall requires priceWei');
  if (!recipient) throw new Error('x402.paywall requires recipient');
  if (!facilitatorUrl) throw new Error('x402.paywall requires facilitatorUrl');

  const cache = replayProtection.enabled
    ? createReplayCache(replayProtection.ttlMs)
    : null;

  return async function requirePayment(req, res, next) {
    const payment = req.headers[header];

    // No payment → advertise terms
    if (!payment) {
      return res.status(402).set({
        'x402-price': priceWei,
        'x402-recipient': recipient,
        'x402-facilitator': facilitatorUrl
      }).json({ error: 'Payment required' });
    }

    // Optional local replay guard (rate-safety, not security)
    if (cache && cache.has(payment)) {
      return res.status(402).json({
        error: 'Payment already used'
      });
    }

    let response;
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), timeoutMs);

      response = await fetch(`${facilitatorUrl}/verify`, {
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
    } catch {
      return res.status(502).json({
        error: 'Payment verification service unavailable',
        facilitator: facilitatorUrl
      });
    }

    if (!response.ok) {
      return res.status(502).json({
        error: 'Payment verification failed'
      });
    }

    let data;
    try {
      data = await response.json();
    } catch {
      return res.status(502).json({
        error: 'Invalid verification response'
      });
    }

    // Strict invariant checks
    if (
      data.verified !== true ||
      !data.recipient ||
      data.recipient.toLowerCase() !== recipient.toLowerCase()
    ) {
      return res.status(402).json({
        error: 'Payment not verified'
      });
    }

    // Mark locally seen only AFTER facilitator approval
    if (cache) cache.add(payment);

    req.payment = data;
    next();
  };
}

module.exports = { paywall };
