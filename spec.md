# Frost Store

## Current State
New project. No existing code.

## Requested Changes (Diff)

### Add
- Full ecommerce store named "Frost" selling physical products
- Customer account system: register, login, profile with saved delivery address
- Order tracking and order history for logged-in customers
- Gift card purchase and redemption in customer profile
- Staff panel (access code: staff2026) for store management
- Staff: manage product listings (create, edit, delete) with categories
- Staff: manage product categories
- Staff: configure payment info (currently PayPal only)
- Staff: create coupons (percentage off, fixed GBP off)
- Automatic free shipping on orders over £50
- Gift card creation by staff; redemption by customers at checkout

### Modify
- N/A (new project)

### Remove
- N/A (new project)

## Implementation Plan

### Backend (Motoko)
- User accounts: register/login with username + password, store profile data (delivery address)
- Products: id, name, description, price (GBP pence), stock, category, imageUrl, active flag
- Categories: id, name
- Orders: id, userId, items (productId, qty, price), subtotal, discount, shipping, total, status, createdAt
- Coupons: id, code, type (percent | fixed), value, active flag
- Gift cards: id, code, balance (GBP pence), purchasedBy, redeemedBy
- Payment info: key-value store for staff to record accepted methods/details
- Staff authentication: hardcoded passphrase check (staff2026)
- Free shipping rule: automatic when order subtotal >= £50

### Frontend
- Public storefront: homepage with product grid, category filter, product detail page
- Cart: add/remove items, apply coupon code, apply gift card, show shipping calculation
- Checkout: delivery address (pre-filled from profile), order summary, place order
- Customer auth: register/login pages
- Customer profile: view/edit delivery address, order history, gift card balance
- Staff panel (/staff): login with code staff2026, then dashboard with tabs:
  - Products tab: list, add, edit, delete products
  - Categories tab: manage categories
  - Coupons tab: create and list coupons
  - Payment Info tab: view/edit accepted payment methods and details
  - Orders tab: view all orders and update status
  - Gift Cards tab: create gift cards, view issued cards
