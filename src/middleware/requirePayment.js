module.exports = function requirePayment(req, res, next) {
  const paymentHeader = req.headers['x402-payment'];

  if (!paymentHeader) {
    return res.status(402).set({
      'x402-price': process.env.PRICE_WEI,
      'x402-currency': 'ETH',
      'x402-recipient': process.env.RECIPIENT_ADDRESS
    }).json({
      error: 'Payment required'
    });
  }

  // Payment verification comes later
  next();
};
