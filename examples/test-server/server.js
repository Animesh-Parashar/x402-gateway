import express from "express";
import { x402 } from "@x402/gateway-express";
import ThirdwebAdapter from "@x402/adapter-thirdweb";
import { MockFacilitatorAdapter } from "@x402/adapter-mock";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Choose adapter based on environment
const USE_MOCK = process.env.USE_MOCK === "true";

const adapter = USE_MOCK 
  ? MockFacilitatorAdapter("http://localhost:4000")
  : ThirdwebAdapter({
      apiKey: process.env.THIRDWEB_API_KEY,
      baseUrl: process.env.THIRDWEB_FACILITATOR_URL || "https://x402.thirdweb.com",
      timeoutMs: 5000
    });

console.log(`\n🔧 Using ${USE_MOCK ? "MOCK" : "THIRDWEB"} facilitator adapter\n`);

// Middleware
app.use(express.json());

// Health check endpoint (no payment required)
app.get("/", (req, res) => {
  res.json({
    message: "x402 Gateway Test Server",
    status: "running",
    adapter: USE_MOCK ? "mock" : "thirdweb",
    endpoints: {
      "/": "Health check (free)",
      "/api/weather": "Weather data (requires 0.01 ETH payment)",
      "/api/greeting": "Greeting message (requires 0.005 ETH payment)"
    }
  });
});

// Protected endpoint #1: Weather data
app.get(
  "/api/weather",
  x402({
    price: "0.01",
    asset: "ETH",
    recipient: process.env.RECIPIENT_ADDRESS || "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
    adapter: adapter
  }),
  (req, res) => {
    res.json({
      message: "Weather data access granted!",
      payment: req.x402,
      data: {
        location: "San Francisco",
        temperature: "18°C",
        conditions: "Partly Cloudy",
        humidity: "65%"
      }
    });
  }
);

// Protected endpoint #2: Greeting
app.get(
  "/api/greeting",
  x402({
    price: "0.005",
    asset: "ETH",
    recipient: process.env.RECIPIENT_ADDRESS || "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
    adapter: adapter
  }),
  (req, res) => {
    const { payer } = req.x402;
    res.json({
      message: `Hello ${payer}! Thanks for your payment.`,
      payment: req.x402,
      data: {
        greeting: "Welcome to x402 payments!",
        timestamp: new Date().toISOString()
      }
    });
  }
);

// Error handler
app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(err.status || 500).json({
    error: {
      message: err.message || "Internal server error"
    }
  });
});

app.listen(PORT, () => {
  console.log(`\n🚀 x402 Test Server running on http://localhost:${PORT}`);
  console.log(`\n📋 Configuration:`);
  console.log(`   - Adapter: ${USE_MOCK ? "Mock (local testing)" : "Thirdweb (production)"}`);
  console.log(`   - Recipient: ${process.env.RECIPIENT_ADDRESS || "0x742d35Cc6634C0532925a3b844Bc454e4438f44e"}`);
  if (!USE_MOCK) {
    console.log(`   - Facilitator: ${process.env.THIRDWEB_FACILITATOR_URL || "https://x402.thirdweb.com"}`);
    console.log(`   - API Key: ${process.env.THIRDWEB_API_KEY ? "✓ Set" : "✗ Not set"}`);
  } else {
    console.log(`   - Mock Facilitator: http://localhost:4000`);
  }
  console.log(`\n💡 Test endpoints:`);
  console.log(`   - GET http://localhost:${PORT}/`);
  console.log(`   - GET http://localhost:${PORT}/api/weather (0.01 ETH)`);
  console.log(`   - GET http://localhost:${PORT}/api/greeting (0.005 ETH)`);
  console.log(`\n📖 See README.md for testing instructions\n`);
});
