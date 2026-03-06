import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import {
  usePaymentInfo,
  usePlaceOrder,
  useUserProfile,
} from "@/hooks/useQueries";
import { useNavigate } from "@tanstack/react-router";
import { CheckCircle, CreditCard, Loader2, MapPin, Truck } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { OrderItem } from "../backend.d";

function formatPrice(pence: number): string {
  return `£${(pence / 100).toFixed(2)}`;
}

const FREE_SHIPPING_THRESHOLD = 5000;
const SHIPPING_COST = 499;

export function CheckoutPage() {
  const { items, subtotal, clearCart } = useCart();
  const { isLoggedIn, login } = useAuth();
  const navigate = useNavigate();
  const { data: profile } = useUserProfile();
  const { data: paymentInfo } = usePaymentInfo();
  const placeOrder = usePlaceOrder();

  const [orderPlaced, setOrderPlaced] = useState(false);
  const [address, setAddress] = useState({
    name: "",
    line1: "",
    line2: "",
    city: "",
    postcode: "",
    country: "United Kingdom",
  });

  useEffect(() => {
    if (profile?.address) {
      setAddress(profile.address);
    }
  }, [profile]);

  const shippingCost = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;
  const total = subtotal + shippingCost;

  if (items.length === 0 && !orderPlaced) {
    navigate({ to: "/cart" });
    return null;
  }

  if (!isLoggedIn) {
    return (
      <div className="container mx-auto px-4 py-24 text-center">
        <h2 className="font-display text-2xl font-bold mb-3">
          Sign in to checkout
        </h2>
        <p className="text-muted-foreground mb-8">
          You need an account to place an order and track your delivery.
        </p>
        <Button
          className="bg-primary text-primary-foreground hover:bg-primary/90"
          onClick={login}
          data-ocid="checkout.login.button"
        >
          Sign In
        </Button>
      </div>
    );
  }

  if (orderPlaced) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="container mx-auto px-4 py-24 text-center"
        data-ocid="checkout.success_state"
      >
        <div className="inline-flex items-center justify-center h-20 w-20 rounded-full bg-green-100 mb-6">
          <CheckCircle className="h-10 w-10 text-green-600" />
        </div>
        <h2 className="font-display text-3xl font-bold mb-3">Order Placed!</h2>
        <p className="text-muted-foreground mb-8 max-w-sm mx-auto">
          Thank you for your order. You can track your delivery in your profile.
        </p>
        <div className="flex gap-3 justify-center">
          <Button
            onClick={() => navigate({ to: "/profile" })}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
            data-ocid="checkout.view_orders.button"
          >
            View Orders
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate({ to: "/" })}
            data-ocid="checkout.continue_shopping.button"
          >
            Continue Shopping
          </Button>
        </div>
      </motion.div>
    );
  }

  const handlePlaceOrder = async () => {
    if (!address.name || !address.line1 || !address.city || !address.postcode) {
      toast.error("Please fill in all required address fields");
      return;
    }

    const orderItems: OrderItem[] = items.map((item) => ({
      productId: BigInt(item.productId),
      quantity: BigInt(item.quantity),
      unitPrice: BigInt(item.price),
    }));

    try {
      await placeOrder.mutateAsync({
        items: orderItems,
        subtotal: BigInt(subtotal),
        discountAmount: BigInt(0),
        shippingCost: BigInt(shippingCost),
        total: BigInt(total),
      });
      clearCart();
      setOrderPlaced(true);
    } catch {
      toast.error("Failed to place order. Please try again.");
    }
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="font-display text-3xl font-bold text-foreground mb-8">
        Checkout
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Address + Payment */}
        <div className="lg:col-span-2 space-y-6">
          {/* Delivery address */}
          <div className="crystal-card rounded-xl p-6">
            <div className="flex items-center gap-2 mb-5">
              <MapPin className="h-5 w-5 text-accent" />
              <h2 className="font-display font-bold text-lg">
                Delivery Address
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  value={address.name}
                  onChange={(e) =>
                    setAddress((a) => ({ ...a, name: e.target.value }))
                  }
                  placeholder="Jane Smith"
                  className="mt-1"
                  data-ocid="checkout.name.input"
                />
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="line1">Address Line 1 *</Label>
                <Input
                  id="line1"
                  value={address.line1}
                  onChange={(e) =>
                    setAddress((a) => ({ ...a, line1: e.target.value }))
                  }
                  placeholder="123 High Street"
                  className="mt-1"
                  data-ocid="checkout.line1.input"
                />
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="line2">Address Line 2</Label>
                <Input
                  id="line2"
                  value={address.line2}
                  onChange={(e) =>
                    setAddress((a) => ({ ...a, line2: e.target.value }))
                  }
                  placeholder="Apartment, suite, etc."
                  className="mt-1"
                  data-ocid="checkout.line2.input"
                />
              </div>
              <div>
                <Label htmlFor="city">City *</Label>
                <Input
                  id="city"
                  value={address.city}
                  onChange={(e) =>
                    setAddress((a) => ({ ...a, city: e.target.value }))
                  }
                  placeholder="London"
                  className="mt-1"
                  data-ocid="checkout.city.input"
                />
              </div>
              <div>
                <Label htmlFor="postcode">Postcode *</Label>
                <Input
                  id="postcode"
                  value={address.postcode}
                  onChange={(e) =>
                    setAddress((a) => ({
                      ...a,
                      postcode: e.target.value.toUpperCase(),
                    }))
                  }
                  placeholder="SW1A 1AA"
                  className="mt-1"
                  data-ocid="checkout.postcode.input"
                />
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="country">Country *</Label>
                <Input
                  id="country"
                  value={address.country}
                  onChange={(e) =>
                    setAddress((a) => ({ ...a, country: e.target.value }))
                  }
                  placeholder="United Kingdom"
                  className="mt-1"
                  data-ocid="checkout.country.input"
                />
              </div>
            </div>
          </div>

          {/* Payment info */}
          <div className="crystal-card rounded-xl p-6">
            <div className="flex items-center gap-2 mb-5">
              <CreditCard className="h-5 w-5 text-accent" />
              <h2 className="font-display font-bold text-lg">Payment</h2>
            </div>
            {paymentInfo && paymentInfo.length > 0 ? (
              <div className="space-y-3">
                {paymentInfo.map((info) => (
                  <div
                    key={info.method}
                    className="flex items-start gap-3 p-4 rounded-lg bg-secondary"
                  >
                    <div className="h-8 w-8 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
                      <CreditCard className="h-4 w-4 text-accent" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm">{info.method}</p>
                      <p className="text-muted-foreground text-sm">
                        {info.details}
                      </p>
                    </div>
                  </div>
                ))}
                <p className="text-xs text-muted-foreground mt-2">
                  Please complete payment using the method above after placing
                  your order.
                </p>
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">
                Payment instructions will be provided upon order confirmation.
              </p>
            )}
          </div>
        </div>

        {/* Order summary */}
        <div className="crystal-card rounded-xl p-6 h-fit">
          <h3 className="font-display font-bold text-lg mb-5">Order Summary</h3>

          <div className="space-y-3 mb-5">
            {items.map((item) => (
              <div
                key={item.productId}
                className="flex justify-between text-sm"
              >
                <span className="text-muted-foreground truncate max-w-[160px]">
                  {item.name} ×{item.quantity}
                </span>
                <span className="font-medium shrink-0">
                  {formatPrice(item.price * item.quantity)}
                </span>
              </div>
            ))}
          </div>

          <Separator className="mb-4" />

          <div className="space-y-2 text-sm mb-5">
            <div className="flex justify-between text-muted-foreground">
              <span>Subtotal</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
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
            <Separator />
            <div className="flex justify-between font-bold text-base">
              <span>Total</span>
              <span>{formatPrice(total)}</span>
            </div>
          </div>

          <Button
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-11 font-semibold"
            onClick={handlePlaceOrder}
            disabled={placeOrder.isPending}
            data-ocid="checkout.place_order.button"
          >
            {placeOrder.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Placing Order…
              </>
            ) : (
              `Place Order — ${formatPrice(total)}`
            )}
          </Button>

          <p className="text-xs text-muted-foreground text-center mt-3">
            By placing your order, you agree to our terms and conditions.
          </p>
        </div>
      </div>
    </div>
  );
}
