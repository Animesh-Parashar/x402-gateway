/**
 * Production Client for Testing x402 Protected APIs with Thirdweb Facilitator
 * 
 * This is a reference implementation showing how to interact with
 * x402 protected endpoints using real payment verification.
 * 
 * NOTE: This is a conceptual example. The exact Thirdweb x402 integration
 * may differ. Check Thirdweb's official documentation for the latest API.
 */

import fetch from "node-fetch";
import crypto from "crypto";
import dotenv from "dotenv";

dotenv.config();

const SERVER_URL = process.env.SERVER_URL || "http://localhost:3000";

/**
 * Configuration
 */
const config = {
  // Your API server
  serverUrl: SERVER_URL,
  
  // Wallet configuration (for signing payments)
  // In production, use a proper wallet SDK like Thirdweb, ethers, or viem
  walletAddress: process.env.WALLET_ADDRESS || "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
  walletPrivateKey: process.env.WALLET_PRIVATE_KEY,  // Optional: for automated testing
  
  // Thirdweb configuration
  thirdwebClientId: process.env.THIRDWEB_CLIENT_ID,
  
  // Payment configuration
  chainId: parseInt(process.env.CHAIN_ID || "8453"),  // Base mainnet
  network: process.env.NETWORK || "base"
};

/**
 * Generate a payment proof
 * 
 * In a real implementation, this would:
 * 1. Use Thirdweb SDK to create a signed payment authorization
 * 2. Include proper EIP-712 signatures or similar
 * 3. Handle wallet connection and user approval
 * 
 * For now, this creates a mock proof for demonstration
 */
async function generatePaymentProof(paymentRequirements) {
  console.log("\n🔐 Generating payment proof...");
  
  // In production, you would use Thirdweb SDK:
  /*
  import { createThirdwebClient } from "thirdweb";
  import { privateKeyToAccount } from "thirdweb/wallets";
  
  const client = createThirdwebClient({
    clientId: config.thirdwebClientId
  });
  
  const account = privateKeyToAccount({
    client,
    privateKey: config.walletPrivateKey
  });
  
  // Create payment authorization
  const proof = await createPaymentProof({
    account,
    amount: paymentRequirements.price,
    recipient: paymentRequirements.recipient,
    asset: paymentRequirements.asset,
    chainId: config.chainId
  });
  */
  
  // Mock proof for demonstration
  const proof = {
    version: "1.0",
    chainId: config.chainId,
    network: config.network,
    from: config.walletAddress,
    to: paymentRequirements.recipient,
    amount: paymentRequirements.price,
    asset: paymentRequirements.asset,
    timestamp: Date.now(),
    nonce: crypto.randomBytes(16).toString("hex"),
    // In production, this would be a real signature
    signature: "0x" + crypto.randomBytes(65).toString("hex"),
    
    // Payment method info (for Thirdweb facilitator)
    paymentMethod: {
      type: "crypto",
      provider: "thirdweb"
    }
  };
  
  console.log("✅ Payment proof generated");
  console.log("   From:", proof.from);
  console.log("   Amount:", proof.amount, proof.asset);
  console.log("   To:", proof.to);
  
  return proof;
}

/**
 * Make a request to an x402 protected endpoint
 * Handles the 402 flow automatically
 */
async function makeProtectedRequest(endpoint, options = {}) {
  const url = `${config.serverUrl}${endpoint}`;
  console.log(`\n${"=".repeat(60)}`);
  console.log(`📡 Making request to: ${endpoint}`);
  console.log(`${"=".repeat(60)}`);
  
  try {
    // Step 1: Initial request (no payment)
    console.log("\n1️⃣  First attempt: No payment");
    let response = await fetch(url, {
      method: options.method || "GET",
      headers: {
        "Content-Type": "application/json",
        ...options.headers
      },
      body: options.body ? JSON.stringify(options.body) : undefined
    });
    
    // Check if payment is required
    if (response.status === 402) {
      console.log("✅ Received 402 Payment Required");
      
      // Extract payment requirements from headers
      const headers = response.headers;
      const paymentInfo = await response.json();
      
      const requirements = {
        price: headers.get("x402-price") || paymentInfo.x402?.price,
        asset: headers.get("x402-asset") || paymentInfo.x402?.asset,
        recipient: headers.get("x402-recipient") || paymentInfo.x402?.recipient,
        facilitator: headers.get("x402-facilitator") || paymentInfo.x402?.facilitator
      };
      
      console.log("\n📋 Payment Requirements:");
      console.log(`   Price: ${requirements.price} ${requirements.asset}`);
      console.log(`   Recipient: ${requirements.recipient}`);
      console.log(`   Facilitator: ${requirements.facilitator}`);
      
      // Step 2: Generate payment proof
      console.log("\n2️⃣  Creating payment proof...");
      const proof = await generatePaymentProof(requirements);
      
      // Step 3: Retry with payment
      console.log("\n3️⃣  Retrying with payment proof...");
      response = await fetch(url, {
        method: options.method || "GET",
        headers: {
          "Content-Type": "application/json",
          "x-payment": JSON.stringify(proof),  // Payment proof in header
          ...options.headers
        },
        body: options.body ? JSON.stringify(options.body) : undefined
      });
      
      // Check result
      if (response.ok) {
        console.log("✅ Payment verified! Access granted.");
        const data = await response.json();
        
        console.log("\n📦 Response Data:");
        console.log(JSON.stringify(data, null, 2));
        
        if (data.payment) {
          console.log("\n💰 Payment Details:");
          console.log(`   Verified: ${data.payment.verified}`);
          console.log(`   Payer: ${data.payment.payer}`);
          console.log(`   Amount: ${data.payment.amount} ${data.payment.asset}`);
        }
        
        return {
          success: true,
          paid: true,
          data,
          payment: data.payment
        };
      } else {
        console.log(`❌ Payment verification failed: ${response.status} ${response.statusText}`);
        const error = await response.json();
        console.log("\nError details:");
        console.log(JSON.stringify(error, null, 2));
        
        return {
          success: false,
          paid: true,
          error
        };
      }
      
    } else if (response.ok) {
      // No payment required
      console.log("✅ Access granted (no payment required)");
      const data = await response.json();
      console.log("\n📦 Response Data:");
      console.log(JSON.stringify(data, null, 2));
      
      return {
        success: true,
        paid: false,
        data
      };
      
    } else {
      // Other error
      console.log(`❌ Request failed: ${response.status} ${response.statusText}`);
      const error = await response.text();
      console.log(error);
      
      return {
        success: false,
        error
      };
    }
    
  } catch (error) {
    console.error("❌ Request error:", error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Run a test suite against your x402 protected API
 */
async function runTests() {
  console.log("\n🚀 x402 Production Client Test");
  console.log("================================");
  console.log(`Server: ${config.serverUrl}`);
  console.log(`Wallet: ${config.walletAddress}`);
  console.log(`Facilitator: Thirdweb (production)`);
  console.log("\n");
  
  // Test 1: Free endpoint
  await makeProtectedRequest("/");
  await sleep(1000);
  
  // Test 2: Protected endpoint (weather)
  await makeProtectedRequest("/api/weather");
  await sleep(1000);
  
  // Test 3: Protected endpoint (greeting)
  await makeProtectedRequest("/api/greeting");
  
  console.log("\n" + "=".repeat(60));
  console.log("✅ Test suite completed!");
  console.log("=".repeat(60) + "\n");
}

/**
 * Test a single endpoint
 */
async function testEndpoint(endpoint) {
  const result = await makeProtectedRequest(endpoint);
  
  if (result.success) {
    console.log(`\n✅ Test passed for ${endpoint}`);
    if (result.paid) {
      console.log("   Payment was required and verified");
    } else {
      console.log("   No payment required");
    }
  } else {
    console.log(`\n❌ Test failed for ${endpoint}`);
  }
  
  return result;
}

/**
 * Utility: Sleep
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Export for use as a module
export {
  makeProtectedRequest,
  testEndpoint,
  generatePaymentProof,
  config
};

// Run tests if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runTests().catch(console.error);
}
