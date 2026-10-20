# Nakshi Closet — Premium Android Shopping App & Boutique Store

Nakshi Closet is an Android e-commerce application and boutique management suite for South Asian fashion, specializing in authentic handwoven Dhakai Jamdani sarees, Mirpur Katan silk, luxury embroidered salwar suits, and designer kurtis.

---

## 1. Architecture Overview

- **Mobile Client**: Expo React Native + Expo Router with TypeScript.
- **Web Applet & Admin Preview**: Vite + React 19 + Tailwind CSS with Android frame simulation.
- **Backend & Database**: Supabase (PostgreSQL with Row Level Security).
- **Authentication**: Supabase Auth (Email/Password and persistent sessions).
- **Security**: PostgreSQL RLS policies, atomic stock verification stored procedure (`process_checkout_rpc`), no exposed service-role keys.
- **Payments**: Cash on Delivery (COD) with architecture ready for Bangladeshi payment gateways (SSLCommerz, bKash).

---

## 2. Windows Local Development Setup

### Prerequisites
1. **Node.js**: Install Node.js (v18 or v20 LTS) from [nodejs.org](https://nodejs.org/).
2. **Git**: Install Git for Windows.
3. **Expo Go**: Install the free **Expo Go** app on your Android phone from Google Play Store.

### Step-by-Step Terminal Commands (Command Prompt / PowerShell)

#### A. Run the Interactive Web & Admin Preview
```powershell
# 1. Install root dependencies
npm install

# 2. Start the development server
npm run dev
```
Open your browser at `http://localhost:3000` to interact with:
- The simulated **Android Phone Frame** (Splash, Onboarding, Home, Catalog, Details, Cart, Checkout, Order Tracking).
- The toggleable **Admin Portal** (Product CRUD, Inventory, Orders processing, Voucher management, Shipping rates).

---

## 3. Supabase Cloud Database Setup

1. Create a free project at [supabase.com](https://supabase.com/).
2. In the Supabase Dashboard, open **SQL Editor**.
3. Copy and run the contents of:
   ```
   supabase/migrations/20261020000000_nakshi_closet_schema.sql
   ```
4. Copy and run the seed script to populate categories and products:
   ```
   supabase/seed.sql
   ```
5. In Supabase Dashboard, go to **Project Settings** → **API**:
   - Copy `Project URL`
   - Copy `anon` / `public` Key
6. In the app preview, tap the **Supabase** badge in the top bar to paste your keys, or set them in `.env`:
   ```env
   VITE_SUPABASE_URL="https://your-project.supabase.co"
   VITE_SUPABASE_ANON_KEY="your-anon-key"
   ```

---

## 4. Building the Android APK (EAS Build)

To build a standalone installable `.apk` file for your Android device:

```powershell
# 1. Navigate to the mobile app folder
cd expo-app

# 2. Install dependencies
npm install

# 3. Install EAS CLI globally (if not already installed)
npm install -g eas-cli

# 4. Log in to your Expo account (create a free account at expo.dev)
eas login

# 5. Configure project credentials
eas build:configure

# 6. Run Android APK Preview Build
eas build -p android --profile preview
```

When EAS finishes compiling in the cloud, you will receive a QR code and download URL for the `.apk` file. Open the link on your Android phone to install and test the app natively!

---

## 5. Security & Authoritative Checkout Rules

1. **Client Trust**: Prices, discounts, inventory levels, and order totals submitted by the client are never blindly trusted.
2. **Atomic Transaction**: The `process_checkout` routine revalidates item prices against the database, checks current variant stock, deducts inventory, and applies coupons in a single transaction.
3. **Customer Isolation**: RLS policies ensure customers can only read and insert their own orders and profile records.
4. **Admin Protection**: Admin role checking is verified via `public.is_admin()`. Customers cannot elevate their own permissions.

---

## 6. Troubleshooting Guide

| Issue | Cause | Fix |
|---|---|---|
| Stock error at checkout | Variant inventory reached 0 | Restock via the Admin Portal or choose another color/size |
| Coupon not applying | Minimum order amount not reached | Check minimum cart value (e.g. ৳4,000 for `NAKSHI10`) |
| EAS build fails | Missing Expo login or project ID | Run `eas login` followed by `eas init` |
| Local offline fallback | No Supabase URL configured | App gracefully uses resilient local storage repository |
