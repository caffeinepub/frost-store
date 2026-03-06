import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useCart } from "@/context/CartContext";
import { useGetGiftCard, useValidateCoupon } from "@/hooks/useQueries";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  ArrowRight,
  Gift,
  ShoppingCart,
  Tag,
  Trash2,
  Truck,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import type { Coupon, GiftCard } from "../backend.d";

function formatPrice(pence: number): string {
  return `£${(pence / 100).toFixed(2)}`;
}

const FREE_SHIPPING_THRESHOLD = 5000; // £50 in pence
const SHIPPING_COST = 499; // £4.99

export function CartPage() {
  const { items, removeItem, updateQuantity, subtotal } = useCart();
  const navigate = useNavigate();

  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [giftCardCode, setGiftCardCode] = useState("");
  const [appliedGiftCard, setAppliedGiftCard] = useState<GiftCard | null>(null);

  const validateCoupon = useValidateCoupon();
  const getGiftCard = useGetGiftCard();

  const couponDiscount = appliedCoupon
    ? appliedCoupon.discountType === "percent"
      ? Math.floor((subtotal * Number(appliedCoupon.value)) / 100)
      : Number(appliedCoupon.value)
    : 0;

  const giftCardDiscount = appliedGiftCard
    ? Number(appliedGiftCard.balance)
    : 0;
  const totalDiscount = couponDiscount + giftCardDiscount;
  const discountedSubtotal = Math.max(0, subtotal - totalDiscount);

  const shippingCost =
    discountedSubtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;
  const total = discountedSubtotal + shippingCost;

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    try {
      const coupon = await validateCoupon.mutateAsync(
        couponCode.trim().toUpperCase(),
      );
      if (coupon) {
        setAppliedCoupon(coupon);
        toast.success(`Coupon "${coupon.code}" applied!`);
        setCouponCode("");
      } else {
        toast.error("Invalid or expired coupon code");
      }
    } catch {
      toast.error("Failed to validate coupon");
    }
  };

  const handleApplyGiftCard = async () => {
    if (!giftCardCode.trim()) return;
    try {
      const card = await getGiftCard.mutateAsync(
        giftCardCode.trim().toUpperCase(),
      );
      if (card?.active && !card.redeemedBy) {
        setAppliedGiftCard(card);
        toast.success(
          `Gift card applied! £${(Number(card.balance) / 100).toFixed(2)} credit`,
        );
        setGiftCardCode("");
      } else if (card?.redeemedBy) {
        toast.error("This gift card has already been redeemed");
      } else {
        toast.error("Invalid or expired gift card");
      }
    } catch {
      toast.error("Failed to validate gift card");
    }
  };

  const handleCheckout = () => {
    navigate({ to: "/checkout" });
  };

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-24 text-center">
        <div className="inline-flex items-center justify-center h-20 w-20 rounded-full bg-secondary mb-6">
          <ShoppingCart className="h-9 w-9 text-muted-foreground" />
        </div>
        <h2
          className="font-display text-2xl font-bold mb-3"
          data-ocid="cart.empty_state"
        >
          Your cart is empty
        </h2>
        <p className="text-muted-foreground mb-8">
          Add some products to get started
        </p>
        <Link to="/">
          <Button
            className="bg-primary text-primary-foreground hover:bg-primary/90"
            data-ocid="cart.shop.button"
          >
            Continue Shopping
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="font-display text-3xl font-bold text-foreground mb-8">
        Your Cart
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Items */}
        <div className="lg:col-span-2 space-y-4" data-ocid="cart.list">
          <AnimatePresence>
            {items.map((item, i) => (
              <motion.div
                key={item.productId}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 16, height: 0 }}
                transition={{ duration: 0.2 }}
                className="crystal-card rounded-xl p-4 flex gap-4"
                data-ocid={`cart.item.${i + 1}`}
              >
                {/* Image */}
                <div className="h-20 w-20 rounded-lg bg-secondary overflow-hidden shrink-0">
                  {item.imageUrl ? (
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-2xl">
                      ❄
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-foreground text-sm truncate mb-1">
                    {item.name}
                  </h3>
                  <p className="text-muted-foreground text-xs mb-3">
                    {formatPrice(item.price)} each
                  </p>

                  <div className="flex items-center justify-between">
                    {/* Qty controls */}
                    <div className="flex items-center border border-border rounded-lg overflow-hidden">
                      <button
                        type="button"
                        className="h-8 w-8 flex items-center justify-center hover:bg-secondary transition-colors text-sm"
                        onClick={() =>
                          updateQuantity(item.productId, item.quantity - 1)
                        }
                        data-ocid={`cart.qty.decrease.button.${i + 1}`}
                      >
                        −
                      </button>
                      <span className="h-8 w-8 flex items-center justify-center text-sm font-semibold border-x border-border">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        className="h-8 w-8 flex items-center justify-center hover:bg-secondary transition-colors text-sm"
                        onClick={() =>
                          updateQuantity(item.productId, item.quantity + 1)
                        }
                        data-ocid={`cart.qty.increase.button.${i + 1}`}
                      >
                        +
                      </button>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="font-bold text-foreground text-sm">
                        {formatPrice(item.price * item.quantity)}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        onClick={() => removeItem(item.productId)}
                        data-ocid={`cart.delete.button.${i + 1}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Summary */}
        <div className="space-y-4">
          {/* Coupon */}
          <div className="crystal-card rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <Tag className="h-4 w-4 text-accent" />
              <h3 className="font-semibold text-sm">Coupon Code</h3>
            </div>
            {appliedCoupon ? (
              <div className="flex items-center justify-between">
                <Badge className="bg-green-100 text-green-800 border-green-200">
                  {appliedCoupon.code}{" "}
                  {appliedCoupon.discountType === "percent"
                    ? `${appliedCoupon.value}% off`
                    : `£${(Number(appliedCoupon.value) / 100).toFixed(2)} off`}
                </Badge>
                <button
                  type="button"
                  className="text-xs text-muted-foreground hover:text-destructive"
                  onClick={() => setAppliedCoupon(null)}
                  data-ocid="cart.coupon.remove.button"
                >
                  Remove
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <Input
                  placeholder="Enter code"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleApplyCoupon()}
                  className="text-sm h-9"
                  data-ocid="cart.coupon.input"
                />
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleApplyCoupon}
                  disabled={validateCoupon.isPending}
                  data-ocid="cart.coupon.apply.button"
                >
                  Apply
                </Button>
              </div>
            )}
          </div>

          {/* Gift Card */}
          <div className="crystal-card rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <Gift className="h-4 w-4 text-accent" />
              <h3 className="font-semibold text-sm">Gift Card</h3>
            </div>
            {appliedGiftCard ? (
              <div className="flex items-center justify-between">
                <Badge className="bg-purple-100 text-purple-800 border-purple-200">
                  {appliedGiftCard.code} — £
                  {(Number(appliedGiftCard.balance) / 100).toFixed(2)} credit
                </Badge>
                <button
                  type="button"
                  className="text-xs text-muted-foreground hover:text-destructive"
                  onClick={() => setAppliedGiftCard(null)}
                  data-ocid="cart.giftcard.remove.button"
                >
                  Remove
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <Input
                  placeholder="Gift card code"
                  value={giftCardCode}
                  onChange={(e) => setGiftCardCode(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleApplyGiftCard()}
                  className="text-sm h-9"
                  data-ocid="cart.giftcard.input"
                />
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleApplyGiftCard}
                  disabled={getGiftCard.isPending}
                  data-ocid="cart.giftcard.apply.button"
                >
                  Apply
                </Button>
              </div>
            )}
          </div>

          {/* Order summary */}
          <div className="crystal-card rounded-xl p-5">
            <h3 className="font-semibold mb-4">Order Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              {totalDiscount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount</span>
                  <span>−{formatPrice(totalDiscount)}</span>
                </div>
              )}
              <div className="flex justify-between text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Truck className="h-3 w-3" />
                  Shipping
                </span>
                {shippingCost === 0 ? (
                  <span className="text-green-600 font-medium">FREE</span>
                ) : (
                  <span>{formatPrice(shippingCost)}</span>
                )}
              </div>
              {discountedSubtotal < FREE_SHIPPING_THRESHOLD && (
                <p className="text-xs text-muted-foreground pt-1">
                  Add{" "}
                  {formatPrice(FREE_SHIPPING_THRESHOLD - discountedSubtotal)}{" "}
                  more for free shipping
                </p>
              )}
              <Separator className="my-2" />
              <div className="flex justify-between font-bold text-base text-foreground">
                <span>Total</span>
                <span>{formatPrice(total)}</span>
              </div>
            </div>

            <Button
              className="w-full mt-5 bg-primary text-primary-foreground hover:bg-primary/90 gap-2 h-11"
              onClick={handleCheckout}
              data-ocid="cart.checkout.button"
            >
              Proceed to Checkout
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
