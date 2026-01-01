const { ethers } = require('ethers');
const { isNonceUsed, markNonceUsed } = require('./utils/nonceCache');

function paywall({ priceWei, recipient }) {
  if (!priceWei || !recipient) {
    throw new Error('x402.paywall requires priceWei and recipient');
  }

  return function requirePayment(req, res, next) {
    const paymentHeader = req.headers['x402-payment'];

    if (!paymentHeader) {
      return res.status(402).set({
        'x402-price': priceWei,
        'x402-currency': 'ETH',
        'x402-recipient': recipient
      }).json({ error: 'Payment required' });
    }

    let payment;
    try {
      payment = JSON.parse(
        Buffer.from(paymentHeader, 'base64').toString()
      );
    } catch {
      return res.status(400).json({ error: 'Invalid payment encoding' });
    }

    const { payer, amount, nonce, signature } = payment;

    if (amount !== priceWei) {
      return res.status(402).json({ error: 'Incorrect payment amount' });
    }

    if (isNonceUsed(nonce)) {
      return res.status(402).json({ error: 'Payment already used' });
    }

    const message = JSON.stringify({
      payer,
      recipient,
      amount,
      nonce
    });

    const recovered = ethers.verifyMessage(message, signature);

    if (recovered.toLowerCase() !== payer.toLowerCase()) {
      return res.status(402).json({ error: 'Invalid signature' });
    }

    markNonceUsed(nonce);
    req.payment = payment;
    next();
  };
}

module.exports = { paywall };
