require('dotenv').config();
const express = require('express');

const computeRoute = require('./routes/compute');

const app = express();
app.use(express.json());

app.use('/api/compute', computeRoute);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`x402-gateway running on port ${PORT}`);
});
