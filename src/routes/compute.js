const express = require('express');
const requirePayment = require('../middleware/requirePayment');

const router = express.Router();

router.get('/', requirePayment, (req, res) => {
  const input = req.query.input || 'empty';

  res.json({
    result: `Processed: ${input}`,
    paidBy: req.payment.payer,
    amountPaid: req.payment.amount,
    timestamp: new Date().toISOString()
  });
});


module.exports = router;
