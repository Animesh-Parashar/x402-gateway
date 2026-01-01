const { Wallet } = require('ethers');
require('dotenv').config();

if (!process.env.PAYER_PRIVATE_KEY) {
  throw new Error('PAYER_PRIVATE_KEY not set');
}

const wallet = new Wallet(process.env.PAYER_PRIVATE_KEY);

async function run() {
  const payment = {
    payer: wallet.address,
    recipient: process.env.RECIPIENT_ADDRESS,
    amount: process.env.PRICE_WEI,
    nonce: Date.now().toString()
  };

  const message = JSON.stringify(payment);
  const signature = await wallet.signMessage(message);

  const payload = {
    ...payment,
    signature
  };

  const encoded = Buffer.from(JSON.stringify(payload)).toString('base64');
  console.log(encoded);
}

run();
