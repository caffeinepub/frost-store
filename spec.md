# Gardening World

## Current State
- Ecommerce store named "Frost Store" with a Dobbies-inspired garden centre aesthetic
- Staff panel at `/staff` with Products, Categories, Coupons, Payment, Orders, Gift Cards tabs
- HomePage has a static hero section, features strip, product grid, and gift card CTA
- No promotional banners exist anywhere in the app
- All "Frost" / "Frost Store" branding throughout the UI

## Requested Changes (Diff)

### Add
- Promotional banners section on the HomePage, displayed between the hero and the features strip (or between features strip and product grid). Up to 3 banners, each with: title, subtitle, CTA text, CTA link, and a background colour or gradient.
- "Banners" tab in the Staff Panel, allowing staff to add/edit/delete the promotional banners (stored in localStorage for frontend-only persistence since no backend schema change is needed).

### Modify
- Rename all UI text, titles, and labels from "Frost" / "Frost Store" to "Gardening World"
- StaffPage: session storage key should change from `frost_staff_auth` to `gw_staff_auth`
- StaffPage: gift card generate code prefix changes from `FROST-` to `GW-`
- StaffPage: localStorage key for gift cards changes from `frost_issued_gift_cards` to `gw_issued_gift_cards`
- StaffPage: default payment details text should reference "Gardening World" instead of "Frost Store"
- StaffPage: "Manage your Frost store" subtitle → "Manage your Gardening World store"
- StaffPage: "Lock Panel" description subtitle update
- GiftCard CTA section on HomePage: title "Give the Gift of Frost" → "Give the Gift of Gardening World"

### Remove
- Nothing removed

## Implementation Plan
1. Add a PromoBanners component in `components/` that renders banners stored in localStorage (`gw_promo_banners`). Each banner: `{ id, title, subtitle, ctaText, ctaLink, bgColor }`.
2. Insert PromoBanners into HomePage between the features strip and the products section.
3. Add a BannersTab component in StaffPage that lets staff add/edit/delete banners (title, subtitle, CTA text, CTA link, background colour picker). Stored/read from localStorage.
4. Add the Banners tab to the StaffPage Tabs list with an appropriate icon (e.g. `Image` or `Megaphone`).
5. Find and replace all "Frost" / "Frost Store" / "frost_" branding text with "Gardening World" / "gw_" across StaffPage.tsx and HomePage.tsx.
