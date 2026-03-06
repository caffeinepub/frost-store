import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/context/AuthContext";
import {
  useMyOrders,
  useProducts,
  useRedeemGiftCard,
  useSaveUserProfile,
  useUserProfile,
} from "@/hooks/useQueries";
import { useNavigate } from "@tanstack/react-router";
import {
  CheckCircle,
  ChevronDown,
  Copy,
  ExternalLink,
  Gift,
  Loader2,
  LogOut,
  MapPin,
  Package,
  Save,
  Truck,
  User,
} from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { Address } from "../backend.d";
import { getOrderTracking, getTrackingUrl } from "../utils/trackingStore";

function formatPrice(pence: bigint): string {
  return `£${(Number(pence) / 100).toFixed(2)}`;
}

function formatDate(ns: bigint): string {
  return new Date(Number(ns) / 1_000_000).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-amber-100 text-amber-800 border-amber-200",
  processing: "bg-blue-100 text-blue-800 border-blue-200",
  shipped: "bg-purple-100 text-purple-800 border-purple-200",
  delivered: "bg-green-100 text-green-800 border-green-200",
  cancelled: "bg-red-100 text-red-800 border-red-200",
};

export function ProfilePage() {
  const { isLoggedIn, principal, logout, isInitializing } = useAuth();
  const navigate = useNavigate();
  const { data: profile, isLoading: profileLoading } = useUserProfile();
  const { data: orders, isLoading: ordersLoading } = useMyOrders();
  const { data: products } = useProducts();
  const saveProfile = useSaveUserProfile();
  const redeemGiftCard = useRedeemGiftCard();

  const [giftCardCode, setGiftCardCode] = useState("");
  const [address, setAddress] = useState<Address>({
    name: "",
    line1: "",
    line2: "",
    city: "",
    postcode: "",
    country: "United Kingdom",
  });
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  useEffect(() => {
    if (!isInitializing && !isLoggedIn) {
      navigate({ to: "/login" });
    }
  }, [isLoggedIn, isInitializing, navigate]);

  useEffect(() => {
    if (profile?.address) {
      setAddress(profile.address);
    }
  }, [profile]);

  const handleSaveAddress = async () => {
    try {
      await saveProfile.mutateAsync({ address });
      toast.success("Address saved successfully");
    } catch {
      toast.error("Failed to save address");
    }
  };

  const handleRedeemGiftCard = async () => {
    if (!giftCardCode.trim()) return;
    try {
      await redeemGiftCard.mutateAsync(giftCardCode.trim().toUpperCase());
      toast.success("Gift card redeemed successfully!");
      setGiftCardCode("");
    } catch {
      toast.error(
        "Failed to redeem gift card. It may be invalid or already used.",
      );
    }
  };

  if (isInitializing || profileLoading) {
    return (
      <div
        className="container mx-auto px-4 py-12"
        data-ocid="profile.loading_state"
      >
        <Skeleton className="h-8 w-48 mb-8" />
        <div className="space-y-4">
          <Skeleton className="h-40 w-full rounded-xl" />
          <Skeleton className="h-60 w-full rounded-xl" />
        </div>
      </div>
    );
  }

  const getProductName = (productId: bigint) => {
    return (
      products?.find((p) => p.id.toString() === productId.toString())?.name ||
      `Product #${productId.toString()}`
    );
  };

  return (
    <div className="container mx-auto px-4 py-12">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-8"
      >
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-full frost-gradient flex items-center justify-center">
            <User className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">
              My Account
            </h1>
            <p className="text-xs text-muted-foreground font-mono">
              {principal?.slice(0, 20)}…
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={logout}
          className="text-muted-foreground hover:text-destructive gap-2"
          data-ocid="profile.logout.button"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </Button>
      </motion.div>

      <Tabs defaultValue="orders">
        <TabsList className="mb-6 bg-secondary">
          <TabsTrigger
            value="orders"
            className="gap-2"
            data-ocid="profile.orders.tab"
          >
            <Package className="h-4 w-4" />
            Orders
          </TabsTrigger>
          <TabsTrigger
            value="address"
            className="gap-2"
            data-ocid="profile.address.tab"
          >
            <MapPin className="h-4 w-4" />
            Address
          </TabsTrigger>
          <TabsTrigger
            value="giftcards"
            className="gap-2"
            data-ocid="profile.giftcards.tab"
          >
            <Gift className="h-4 w-4" />
            Gift Cards
          </TabsTrigger>
        </TabsList>

        {/* Orders */}
        <TabsContent value="orders">
          {ordersLoading ? (
            <div className="space-y-3" data-ocid="profile.orders.loading_state">
              {Array.from({ length: 3 }).map((_, i) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: skeleton placeholders
                <Skeleton key={i} className="h-20 rounded-xl" />
              ))}
            </div>
          ) : !orders || orders.length === 0 ? (
            <div
              className="crystal-card rounded-xl p-12 text-center"
              data-ocid="profile.orders.empty_state"
            >
              <Package className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-semibold text-foreground mb-2">
                No orders yet
              </h3>
              <p className="text-muted-foreground text-sm">
                Your orders will appear here once you make a purchase.
              </p>
            </div>
          ) : (
            <div className="space-y-3" data-ocid="profile.orders.list">
              {orders.map((order, i) => (
                <motion.div
                  key={order.id.toString()}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="crystal-card rounded-xl overflow-hidden"
                  data-ocid={`profile.order.item.${i + 1}`}
                >
                  <button
                    type="button"
                    className="w-full text-left p-5 flex items-center justify-between hover:bg-secondary/30 transition-colors"
                    onClick={() =>
                      setExpandedOrder(
                        expandedOrder === order.id.toString()
                          ? null
                          : order.id.toString(),
                      )
                    }
                    data-ocid={`profile.order.toggle.${i + 1}`}
                  >
                    <div className="flex items-center gap-4">
                      <div>
                        <p className="font-semibold text-sm text-foreground">
                          Order #{order.id.toString()}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {formatDate(order.createdAt)} · {order.items.length}{" "}
                          item
                          {order.items.length !== 1 ? "s" : ""}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge
                        className={`${STATUS_COLORS[order.status] || "bg-gray-100 text-gray-800"} capitalize text-xs`}
                      >
                        {order.status}
                      </Badge>
                      <span className="font-bold text-sm">
                        {formatPrice(order.total)}
                      </span>
                      <ChevronDown
                        className={`h-4 w-4 text-muted-foreground transition-transform ${
                          expandedOrder === order.id.toString()
                            ? "rotate-180"
                            : ""
                        }`}
                      />
                    </div>
                  </button>

                  {expandedOrder === order.id.toString() && (
                    <div className="border-t border-border px-5 py-4 bg-secondary/20">
                      <div className="space-y-2 mb-3">
                        {order.items.map((item, j) => (
                          // biome-ignore lint/suspicious/noArrayIndexKey: order items have no stable unique id
                          <div key={j} className="flex justify-between text-sm">
                            <span className="text-muted-foreground">
                              {getProductName(item.productId)} ×
                              {Number(item.quantity)}
                            </span>
                            <span className="font-medium">
                              {formatPrice(item.unitPrice * item.quantity)}
                            </span>
                          </div>
                        ))}
                      </div>
                      <div className="border-t border-border pt-2 space-y-1 text-xs text-muted-foreground">
                        <div className="flex justify-between">
                          <span>Subtotal</span>
                          <span>{formatPrice(order.subtotal)}</span>
                        </div>
                        {Number(order.discountAmount) > 0 && (
                          <div className="flex justify-between text-green-600">
                            <span>Discount</span>
                            <span>−{formatPrice(order.discountAmount)}</span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span>Shipping</span>
                          <span>
                            {Number(order.shippingCost) === 0
                              ? "FREE"
                              : formatPrice(order.shippingCost)}
                          </span>
                        </div>
                        <div className="flex justify-between font-semibold text-sm text-foreground pt-1">
                          <span>Total</span>
                          <span>{formatPrice(order.total)}</span>
                        </div>
                      </div>

                      {/* Tracking Section */}
                      {(() => {
                        const tracking = getOrderTracking(order.id.toString());
                        if (!tracking) return null;
                        const trackingUrl = getTrackingUrl(
                          tracking.carrier,
                          tracking.trackingNumber,
                        );
                        return (
                          <div
                            className="mt-4 rounded-xl bg-green-50 border border-green-200 p-4"
                            data-ocid={`profile.order.tracking.${i + 1}`}
                          >
                            <div className="flex items-center gap-2 mb-3">
                              <div className="h-8 w-8 rounded-lg bg-green-600 flex items-center justify-center shrink-0">
                                <Truck className="h-4 w-4 text-white" />
                              </div>
                              <h4 className="font-semibold text-sm text-green-900">
                                Track Your Package
                              </h4>
                            </div>

                            <div className="space-y-3">
                              {/* Carrier */}
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-green-700 font-medium">
                                  Carrier:
                                </span>
                                <Badge className="bg-green-700 text-white border-transparent text-xs gap-1">
                                  <Truck className="h-3 w-3" />
                                  {tracking.carrier}
                                </Badge>
                              </div>

                              {/* Tracking number */}
                              <div>
                                <span className="text-xs text-green-700 font-medium block mb-1">
                                  Tracking Number:
                                </span>
                                <div className="flex items-center gap-2">
                                  <code className="flex-1 bg-white border border-green-200 rounded-lg px-3 py-2 text-sm font-mono text-green-900 select-all">
                                    {tracking.trackingNumber}
                                  </code>
                                  <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-9 w-9 border-green-200 text-green-700 hover:bg-green-100 hover:text-green-900 shrink-0"
                                    onClick={() => {
                                      navigator.clipboard.writeText(
                                        tracking.trackingNumber,
                                      );
                                      toast.success("Tracking number copied!");
                                    }}
                                    data-ocid="profile.order.tracking.copy.button"
                                    title="Copy tracking number"
                                  >
                                    <Copy className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>

                              {/* Open on carrier site */}
                              {trackingUrl && (
                                <Button
                                  className="w-full bg-green-700 hover:bg-green-800 text-white gap-2 h-10"
                                  onClick={() =>
                                    window.open(
                                      trackingUrl,
                                      "_blank",
                                      "noopener,noreferrer",
                                    )
                                  }
                                  data-ocid="profile.order.tracking.open.button"
                                >
                                  <ExternalLink className="h-4 w-4" />
                                  Track on {tracking.carrier} Website
                                </Button>
                              )}

                              {/* Embedded iframe */}
                              {trackingUrl && (
                                <div className="mt-2">
                                  <iframe
                                    src={trackingUrl}
                                    width="100%"
                                    height="400"
                                    className="rounded-lg border border-green-200 mt-3 bg-white"
                                    title="Package Tracking"
                                  />
                                  <p className="text-xs text-green-700/70 mt-2 text-center">
                                    If the tracking page doesn't load in the
                                    frame, use the button above to open it
                                    directly.
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Address */}
        <TabsContent value="address">
          <div className="crystal-card rounded-xl p-6 max-w-lg">
            <div className="flex items-center gap-2 mb-5">
              <MapPin className="h-5 w-5 text-accent" />
              <h2 className="font-display font-bold">Delivery Address</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <Label htmlFor="p-name">Full Name</Label>
                <Input
                  id="p-name"
                  value={address.name}
                  onChange={(e) =>
                    setAddress((a) => ({ ...a, name: e.target.value }))
                  }
                  placeholder="Jane Smith"
                  className="mt-1"
                  data-ocid="profile.address.name.input"
                />
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="p-line1">Address Line 1</Label>
                <Input
                  id="p-line1"
                  value={address.line1}
                  onChange={(e) =>
                    setAddress((a) => ({ ...a, line1: e.target.value }))
                  }
                  placeholder="123 High Street"
                  className="mt-1"
                  data-ocid="profile.address.line1.input"
                />
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="p-line2">Address Line 2</Label>
                <Input
                  id="p-line2"
                  value={address.line2}
                  onChange={(e) =>
                    setAddress((a) => ({ ...a, line2: e.target.value }))
                  }
                  placeholder="Apt, suite, etc."
                  className="mt-1"
                  data-ocid="profile.address.line2.input"
                />
              </div>
              <div>
                <Label htmlFor="p-city">City</Label>
                <Input
                  id="p-city"
                  value={address.city}
                  onChange={(e) =>
                    setAddress((a) => ({ ...a, city: e.target.value }))
                  }
                  placeholder="London"
                  className="mt-1"
                  data-ocid="profile.address.city.input"
                />
              </div>
              <div>
                <Label htmlFor="p-postcode">Postcode</Label>
                <Input
                  id="p-postcode"
                  value={address.postcode}
                  onChange={(e) =>
                    setAddress((a) => ({
                      ...a,
                      postcode: e.target.value.toUpperCase(),
                    }))
                  }
                  placeholder="SW1A 1AA"
                  className="mt-1"
                  data-ocid="profile.address.postcode.input"
                />
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="p-country">Country</Label>
                <Input
                  id="p-country"
                  value={address.country}
                  onChange={(e) =>
                    setAddress((a) => ({ ...a, country: e.target.value }))
                  }
                  placeholder="United Kingdom"
                  className="mt-1"
                  data-ocid="profile.address.country.input"
                />
              </div>
            </div>

            <Button
              className="mt-5 bg-primary text-primary-foreground hover:bg-primary/90 gap-2"
              onClick={handleSaveAddress}
              disabled={saveProfile.isPending}
              data-ocid="profile.address.save.button"
            >
              {saveProfile.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving…
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Save Address
                </>
              )}
            </Button>
          </div>
        </TabsContent>

        {/* Gift Cards */}
        <TabsContent value="giftcards">
          <div className="max-w-lg space-y-6">
            {/* Redeem */}
            <div className="crystal-card rounded-xl p-6">
              <div className="flex items-center gap-2 mb-5">
                <Gift className="h-5 w-5 text-accent" />
                <h2 className="font-display font-bold">Redeem a Gift Card</h2>
              </div>
              <p className="text-muted-foreground text-sm mb-4">
                Enter your gift card code below to add the balance to your
                account.
              </p>
              <div className="flex gap-3">
                <Input
                  value={giftCardCode}
                  onChange={(e) =>
                    setGiftCardCode(e.target.value.toUpperCase())
                  }
                  onKeyDown={(e) => e.key === "Enter" && handleRedeemGiftCard()}
                  placeholder="FROST-XXXX-XXXX"
                  className="font-mono"
                  data-ocid="profile.giftcard.input"
                />
                <Button
                  onClick={handleRedeemGiftCard}
                  disabled={redeemGiftCard.isPending || !giftCardCode.trim()}
                  className="bg-primary text-primary-foreground hover:bg-primary/90 shrink-0"
                  data-ocid="profile.giftcard.redeem.button"
                >
                  {redeemGiftCard.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Redeem"
                  )}
                </Button>
              </div>
              {redeemGiftCard.isSuccess && (
                <div
                  className="flex items-center gap-2 mt-3 text-green-600 text-sm"
                  data-ocid="profile.giftcard.success_state"
                >
                  <CheckCircle className="h-4 w-4" />
                  Gift card redeemed successfully!
                </div>
              )}
            </div>

            {/* How it works */}
            <div className="crystal-card rounded-xl p-6">
              <h3 className="font-semibold mb-3 text-sm">
                How Gift Cards Work
              </h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-accent mt-0.5">1.</span>
                  Purchase a gift card from the store
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-accent mt-0.5">2.</span>
                  Enter your unique code above to redeem it
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-accent mt-0.5">3.</span>
                  Apply it at checkout using the gift card field in your cart
                </li>
              </ul>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
