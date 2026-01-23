import fetch from "node-fetch";
import crypto from "crypto";

const SERVER_URL = process.env.SERVER_URL || "http://localhost:3000";

/**
 * Create a mock payment proof
 * In a real scenario, this would involve wallet signatures and blockchain interactions
 */
function createMockPaymentProof(config) {
  const { amount, recipient, from, asset = "ETH" } = config;
  
  // Generate a mock signature (in real life, this would be a wallet signature)
  const timestamp = Date.now();
  const nonce = crypto.randomBytes(16).toString("hex");
  
  return {
    from: from || "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
    to: recipient,
    amount: amount,
    asset: asset,
    timestamp: timestamp,
    nonce: nonce,
    // Mock signature - in real scenario, this would be a proper cryptographic signature
    signature: "0x" + crypto.randomBytes(65).toString("hex")
  };
}

/**
 * Make a paid request to a protected endpoint
 */
async function makePaidRequest(endpoint, paymentConfig) {
  console.log(`\n📡 Making paid request to ${endpoint}`);
  console.log(`💰 Payment: ${paymentConfig.amount} ${paymentConfig.asset}`);
  
  try {
    // Step 1: Try request without payment (should get 402)
    console.log("\n1️⃣ First attempt: No payment");
    let response = await fetch(`${SERVER_URL}${endpoint}`);
    
    if (response.status === 402) {
      console.log("✅ Received 402 Payment Required");
      
      const paymentInfo = await response.json();
      console.log("📋 Payment requirements:", {
        price: paymentInfo.x402?.price,
        asset: paymentInfo.x402?.asset,
        recipient: paymentInfo.x402?.recipient,
        facilitator: paymentInfo.x402?.facilitator
      });
      
      // Step 2: Create payment proof
      console.log("\n2️⃣ Creating payment proof...");
      const proof = createMockPaymentProof({
        amount: paymentInfo.x402.price,
        recipient: paymentInfo.x402.recipient,
        asset: paymentInfo.x402.asset
      });
      console.log("✅ Payment proof created");
      
      // Step 3: Retry with payment
      console.log("\n3️⃣ Retrying with payment proof...");
      response = await fetch(`${SERVER_URL}${endpoint}`, {
        headers: {
          "x-payment": JSON.stringify(proof),
          "Content-Type": "application/json"
        }
      });
      
      if (response.ok) {
        console.log("✅ Payment verified! Access granted.");
        const data = await response.json();
        console.log("\n📦 Response data:");
        console.log(JSON.stringify(data, null, 2));
        return data;
      } else {
        console.log(`❌ Payment failed: ${response.status} ${response.statusText}`);
        const error = await response.text();
        console.log("Error:", error);
        return null;
      }
    } else if (response.ok) {
      console.log("✅ Access granted without payment (free endpoint)");
      const data = await response.json();
      console.log(JSON.stringify(data, null, 2));
      return data;
    } else {
      console.log(`❌ Error: ${response.status} ${response.statusText}`);
      return null;
    }
  } catch (error) {
    console.error("❌ Request failed:", error.message);
    return null;
  }
}

/**
 * Test multiple endpoints
 */
async function runTests() {
  console.log("🚀 x402 Payment Flow Test Client");
  console.log("=================================\n");
  console.log(`Server: ${SERVER_URL}`);
  
  // Test 1: Free endpoint
  console.log("\n" + "=".repeat(50));
  console.log("TEST 1: Free endpoint (no payment required)");
  console.log("=".repeat(50));
  await makePaidRequest("/", {});
  
  // Wait a bit between requests
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Test 2: Weather endpoint (0.01 ETH)
  console.log("\n" + "=".repeat(50));
  console.log("TEST 2: Weather endpoint (requires payment)");
  console.log("=".repeat(50));
  await makePaidRequest("/api/weather", {
    amount: "0.01",
    asset: "ETH"
  });
  
  // Wait a bit between requests
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Test 3: Greeting endpoint (0.005 ETH)
  console.log("\n" + "=".repeat(50));
  console.log("TEST 3: Greeting endpoint (requires payment)");
  console.log("=".repeat(50));
  await makePaidRequest("/api/greeting", {
    amount: "0.005",
    asset: "ETH"
  });
  
  console.log("\n" + "=".repeat(50));
  console.log("✅ All tests completed!");
  console.log("=".repeat(50));
}

// Run tests
runTests().catch(console.error);
