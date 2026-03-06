const KEY = "gw_order_tracking";

export function getTrackingStore(): Record<
  string,
  { trackingNumber: string; carrier: string }
> {
  try {
    return JSON.parse(localStorage.getItem(KEY) || "{}");
  } catch {
    return {};
  }
}

export function setOrderTracking(
  orderId: string,
  trackingNumber: string,
  carrier: string,
) {
  const store = getTrackingStore();
  store[orderId] = { trackingNumber, carrier };
  localStorage.setItem(KEY, JSON.stringify(store));
}

export function getOrderTracking(
  orderId: string,
): { trackingNumber: string; carrier: string } | null {
  const store = getTrackingStore();
  return store[orderId] || null;
}

export const CARRIER_URLS: Record<string, string> = {
  "Royal Mail":
    "https://www.royalmail.com/track-your-item#/tracking-results/{trackingNumber}",
  DPD: "https://www.dpd.co.uk/apps/tracking/?reference={trackingNumber}",
  Evri: "https://www.evri.com/track-a-parcel/result/{trackingNumber}",
  Hermes: "https://www.evri.com/track-a-parcel/result/{trackingNumber}",
  Parcelforce:
    "https://www.parcelforce.com/track-trace?trackNumber={trackingNumber}",
  Other: "",
};

export function getTrackingUrl(
  carrier: string,
  trackingNumber: string,
): string {
  const template = CARRIER_URLS[carrier];
  if (!template) return "";
  return template.replace(
    "{trackingNumber}",
    encodeURIComponent(trackingNumber),
  );
}

export const CARRIER_OPTIONS = Object.keys(CARRIER_URLS);
