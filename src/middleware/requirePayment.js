const { ethers } = require("ethers");

const { isNonceUsed, markNonceUsed } = require("../utils/nonceCache");

module.exports = function requirePayment(req, res, next) {
  const paymentHeader = req.headers["x402-payment"];

  if (!paymentHeader) {
    return res
      .status(402)
      .set({
        "x402-price": process.env.PRICE_WEI,
        "x402-currency": "ETH",
        "x402-recipient": process.env.RECIPIENT_ADDRESS,
      })
      .json({ error: "Payment required" });
  }

  let payment;
  try {
    const decoded = Buffer.from(paymentHeader, "base64").toString();
    payment = JSON.parse(decoded);
  } catch {
    return res.status(400).json({ error: "Invalid payment encoding" });
  }

  const { payer, recipient, amount, nonce, signature } = payment;

  if (!payer || !recipient || !amount || !nonce || !signature) {
    return res.status(400).json({ error: "Malformed payment object" });
  }

  if (recipient.toLowerCase() !== process.env.RECIPIENT_ADDRESS.toLowerCase()) {
    return res.status(402).json({ error: "Incorrect recipient" });
  }

  if (amount !== process.env.PRICE_WEI) {
    return res.status(402).json({ error: "Incorrect payment amount" });
  }

  // Message to verify
  const message = JSON.stringify({
    payer,
    recipient,
    amount,
    nonce,
  });

  let recovered;
  try {
    recovered = ethers.verifyMessage(message, signature);
  } catch {
    return res.status(400).json({ error: "Invalid signature" });
  }

  if (recovered.toLowerCase() !== payer.toLowerCase()) {
    return res.status(402).json({ error: "Signature mismatch" });
  }

  // Payment accepted
  req.payment = payment;
  if (isNonceUsed(nonce)) {
    return res.status(402).json({ error: "Payment already used" });
  }

  markNonceUsed(nonce);

  next();
};
