# Gardening World

## Current State
Full-stack e-commerce store with Motoko backend and React frontend. Features include:
- Product listings, categories, orders, coupons, gift cards, payment info
- Customer accounts with order history, delivery address, gift card redemption
- Staff panel (code: staff2026) with tabs: Products, Categories, Coupons, Payment, Orders, Gift Cards, Banners, Wallet
- Order type: { id, userId, items, subtotal, discountAmount, shippingCost, total, status, createdAt }
- No tracking number field on orders

## Requested Changes (Diff)

### Add
- `trackingNumber: ?Text` and `trackingCarrier: ?Text` fields to the `Order` type in Motoko
- `setOrderTracking(id: Nat, trackingNumber: Text, trackingCarrier: Text)` admin-only backend function
- In Staff Orders tab: a "Add Tracking" button per order row that opens a dialog to enter tracking number + carrier (e.g. Royal Mail, DPD, Evri, Hermes, Parcelforce)
- In customer Profile Orders tab: when an order is expanded, if a tracking number exists, show a "Track Package" section with:
  - The tracking number displayed (copyable)
  - Carrier name
  - An embedded iframe or deep-link to the carrier's tracking page (pre-filled with the tracking number)
  - Supported carriers with their tracking URLs:
    - Royal Mail: https://www.royalmail.com/track-your-item#/tracking-results/{trackingNumber}
    - DPD: https://www.dpd.co.uk/apps/tracking/?reference={trackingNumber}
    - Evri: https://www.evri.com/track-a-parcel/result/{trackingNumber}
    - Hermes: https://www.evri.com/track-a-parcel/result/{trackingNumber} (same as Evri, rebranded)
    - Parcelforce: https://www.parcelforce.com/track-trace?trackNumber={trackingNumber}
    - Other: show a plain display of the tracking number

### Modify
- `Order` type in backend: add optional `trackingNumber` and `trackingCarrier` fields
- `updateOrderStatus` must preserve tracking fields when updating status
- Staff Orders tab: add a tracking column and "Add Tracking" action button per row
- Customer profile order detail view: show tracking section when tracking number is present

### Remove
- Nothing removed

## Implementation Plan
1. Update `main.mo`: add `trackingNumber: ?Text` and `trackingCarrier: ?Text` to `Order` type; update `placeOrder` to set them as null; update `updateOrderStatus` to preserve them; add `setOrderTracking` function
2. Update `backend.d.ts`: add `trackingNumber?: string` and `trackingCarrier?: string` to `Order` interface; add `setOrderTracking` method signature
3. Update `useQueries.ts`: add `useSetOrderTracking` mutation hook
4. Update `StaffPage.tsx` Orders tab: add tracking column, "Add Tracking" dialog per order
5. Update `ProfilePage.tsx` Orders tab: show tracking section with carrier link/iframe when tracking info is present
