import express from "express";

const app = express();
app.use(express.json());

const PORT = process.env.MOCK_PORT || 4000;

/**
 * Mock facilitator /verify endpoint
 * This simulates what a real x402 facilitator does
 * 
 * The mock adapter sends the VerifyInput directly: { proof, price, asset, recipient }
 * So we need to handle that format
 */
app.post("/verify", (req, res) => {
  console.log("\n🔍 Mock Facilitator: Verification Request Received");
  console.log("Request body:", JSON.stringify(req.body, null, 2));

  const { proof, price, asset, recipient } = req.body;

  // Simulate validation delay
  setTimeout(() => {
    // Mock validation logic
    if (!proof) {
      console.log("❌ Mock Facilitator: Missing payment proof");
      return res.json({
        verified: false,
        reason: "missing_proof"
      });
    }

    // Parse the proof (it comes as a JSON string from the client)
    let paymentPayload;
    try {
      paymentPayload = typeof proof === 'string' ? JSON.parse(proof) : proof;
    } catch (err) {
      console.log("❌ Mock Facilitator: Invalid proof format");
      return res.json({
        verified: false,
        reason: "invalid_proof_format"
      });
    }

    // Check if payment meets requirements
    const paymentAmount = parseFloat(paymentPayload.amount);
    const requiredAmount = parseFloat(price);

    if (paymentAmount < requiredAmount) {
      console.log(`❌ Mock Facilitator: Insufficient amount (${paymentAmount} < ${requiredAmount})`);
      return res.json({
        verified: false,
        reason: "insufficient_amount",
        expected: price,
        received: paymentPayload.amount
      });
    }

    // Success response
    console.log("✅ Mock Facilitator: Payment verified");
    console.log(`   Payer: ${paymentPayload.from}`);
    console.log(`   Amount: ${paymentPayload.amount} ${asset}`);
    console.log(`   Recipient: ${recipient}`);
    
    res.json({
      verified: true,
      from: paymentPayload.from,
      to: recipient,
      amount: paymentPayload.amount,
      asset: asset,
      transactionHash: "0x" + Math.random().toString(16).substring(2, 66),
      timestamp: new Date().toISOString()
    });
  }, 100); // Small delay to simulate network
});

/**
 * Mock facilitator /settle endpoint (optional)
 */
app.post("/settle", (req, res) => {
  console.log("\n💰 Mock Facilitator: Settlement Request Received");
  
  setTimeout(() => {
    res.json({
      settled: true,
      transactionHash: "0x" + Math.random().toString(16).substring(2, 66),
      blockNumber: Math.floor(Math.random() * 1000000),
      timestamp: new Date().toISOString()
    });
  }, 200);
});

app.get("/", (req, res) => {
  res.json({
    service: "Mock x402 Facilitator",
    status: "running",
    endpoints: {
      "POST /verify": "Verify payment proof",
      "POST /settle": "Settle payment"
    }
  });
});

app.listen(PORT, () => {
  console.log(`\n🧪 Mock x402 Facilitator running on http://localhost:${PORT}`);
  console.log(`Ready to verify payments!\n`);
});
