# x402 Gateway Quick Reference

## 📦 Installation

### From NPM (once published)
```bash
npm install @x402/gateway-express @x402/adapter-thirdweb
```

### From GitHub (current)
```bash
npm install \
  "github:Animesh-Parashar/x402-gateway#main:packages/gateway-express" \
  "github:Animesh-Parashar/x402-gateway#main:packages/adapter-thirdweb"
```

## 🚀 Basic Usage

```javascript
import express from "express";
import { x402 } from "@x402/gateway-express";
import ThirdwebAdapter from "@x402/adapter-thirdweb";

const app = express();

app.get(
  "/api/data",
  x402({
    price: "0.01",
    recipient: "0xYourAddress",
    adapter: ThirdwebAdapter({ apiKey: process.env.THIRDWEB_API_KEY })
  }),
  (req, res) => {
    res.json({ data: "Protected content", payment: req.x402 });
  }
);

app.listen(3000);
```

## 🧪 Testing Scripts

| Script | Purpose |
|--------|---------|
| `npm run mock` | Start mock facilitator (port 4000) |
| `npm start` | Start server (with mock or real adapter) |
| `npm run client` | Test with mock payments |
| `npm run real-client` | Test with real Thirdweb (requires API key) |

## ⚙️ Configuration (.env)

```bash
# For Mock Testing
USE_MOCK=true

# For Production
USE_MOCK=false
THIRDWEB_API_KEY=your_api_key
RECIPIENT_ADDRESS=0xYourWalletAddress
```

## 📖 Detailed Guides

- [COMPLETE-FLOW-TEST.md](./COMPLETE-FLOW-TEST.md) - Complete testing guide
- [README.md](./README.md) - Overview and setup
- [TESTING.md](./TESTING.md) - Test results

## 🔗 Resources

- [x402 Docs](https://docs.x402.org)
- [Thirdweb Dashboard](https://thirdweb.com/dashboard)
- [GitHub Repo](https://github.com/Animesh-Parashar/x402-gateway)
