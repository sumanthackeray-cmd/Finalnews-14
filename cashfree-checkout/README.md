# 💳 Cashfree Payment Checkout App

A fully functional, production-ready payment checkout app built with **Next.js 15**, **TypeScript**, and **Tailwind CSS** — integrated with the **Cashfree Payments Production API**.

## 🚀 Features

- ✅ Beautiful, mobile-first checkout form
- ✅ 5 payment methods: UPI, Card, Net Banking, Wallet, EMI
- ✅ Server-side order creation (secret key never exposed to browser)
- ✅ Real-time payment status page (auto-refresh for pending)
- ✅ Receipt download
- ✅ Webhook handler with HMAC-SHA256 signature verification
- ✅ Full input validation (client + server)
- ✅ Security headers (XSS, clickjacking, etc.)
- ✅ 256-bit SSL trust badges

---

## ⚙️ Setup

### 1. Install dependencies

```bash
cd cashfree-checkout
npm install
```

### 2. Configure environment variables

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```env
CASHFREE_APP_ID=your_production_app_id
CASHFREE_SECRET_KEY=your_production_secret_key
CASHFREE_ENV=production
NEXT_PUBLIC_APP_URL=https://cv.vogats.com
```

> ⚠️ **Never commit `.env.local` to Git.** It contains your secret key.

### 3. Run locally

```bash
npm run dev
```

Open → **http://localhost:3000**

---

## 📁 Project Structure

```
cashfree-checkout/
├── app/
│   ├── layout.tsx                   # Root layout (loads Cashfree SDK)
│   ├── globals.css                  # Global styles + animations
│   ├── page.tsx                     # Main checkout page
│   ├── payment-status/
│   │   └── page.tsx                 # Payment result page (success/fail/pending)
│   └── api/
│       ├── create-order/route.ts    # POST — Creates Cashfree order (server-side)
│       ├── verify-order/route.ts    # GET  — Verifies order status
│       └── webhook/route.ts         # POST — Cashfree webhook handler (HMAC verified)
├── components/
│   ├── CheckoutForm.tsx             # Customer details form
│   ├── PaymentMethodSelector.tsx    # UPI / Card / NetBanking / Wallet / EMI
│   ├── OrderSummary.tsx             # Real-time order summary card
│   ├── TrustBadges.tsx              # SSL, PCI DSS, Cashfree badges
│   └── LoadingOverlay.tsx           # Loading screen during order creation
├── .env.local                       # ← Your production credentials
├── .env.example                     # Template (safe to commit)
└── next.config.ts
```

---

## 🔐 Payment Flow

```
User fills form → Selects payment method → Clicks Pay
  → POST /api/create-order (server-side, credentials never exposed)
  → Cashfree returns payment_session_id
  → User redirected to: https://payments.cashfree.com/order/#<session_id>
  → User pays on Cashfree's secure page
  → Cashfree redirects to: /payment-status?order_id=xxx
  → App calls GET /api/verify-order to confirm status
  → Shows SUCCESS / FAILED / PENDING screen
```

---

## 🔗 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/create-order` | Creates Cashfree order, returns `payment_session_id` |
| GET | `/api/verify-order?order_id=xxx` | Fetches real order status from Cashfree |
| POST | `/api/webhook` | Receives Cashfree payment notifications (HMAC verified) |

---

## 🌐 Deployment (Vercel)

```bash
npm i -g vercel
vercel --prod
```

Set these in Vercel → Project → Settings → Environment Variables:
- `CASHFREE_APP_ID`
- `CASHFREE_SECRET_KEY`
- `CASHFREE_ENV` = `production`
- `NEXT_PUBLIC_APP_URL` = `https://your-domain.vercel.app`

Then in Cashfree Dashboard → Webhooks → Add URL:  
`https://your-domain.vercel.app/api/webhook`

---

## 🔒 Security Notes

- The `CASHFREE_SECRET_KEY` is only read in API routes (Node.js server) — **never sent to the browser**
- All Cashfree API calls are made server-side
- Webhook payloads are verified using HMAC-SHA256
- Security headers (XSS, clickjacking) applied to all routes
- All inputs validated both client-side and server-side
