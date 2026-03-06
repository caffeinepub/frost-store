import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  Category,
  Coupon,
  GiftCard,
  Order,
  OrderItem,
  PaymentInfo,
  Product,
  UserProfile,
} from "../backend.d";
import { useActor } from "./useActor";

// ── Products ──────────────────────────────────────────────────────────────────

export function useProducts() {
  const { actor, isFetching } = useActor();
  return useQuery<Product[]>({
    queryKey: ["products"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getProducts();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreateProduct() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (product: Product) => actor!.createProduct(product),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["products"] }),
  });
}

export function useUpdateProduct() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, product }: { id: bigint; product: Product }) =>
      actor!.updateProduct(id, product),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["products"] }),
  });
}

export function useDeleteProduct() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: bigint) => actor!.deleteProduct(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["products"] }),
  });
}

// ── Categories ────────────────────────────────────────────────────────────────

export function useCategories() {
  const { actor, isFetching } = useActor();
  return useQuery<Category[]>({
    queryKey: ["categories"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getCategories();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreateCategory() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (name: string) => actor!.createCategory(name),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["categories"] }),
  });
}

export function useUpdateCategory() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, name }: { id: bigint; name: string }) =>
      actor!.updateCategory(id, name),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["categories"] }),
  });
}

export function useDeleteCategory() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: bigint) => actor!.deleteCategory(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["categories"] }),
  });
}

// ── Coupons ───────────────────────────────────────────────────────────────────

export function useCoupons() {
  const { actor, isFetching } = useActor();
  return useQuery<Coupon[]>({
    queryKey: ["coupons"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getCoupons();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreateCoupon() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (coupon: Coupon) => actor!.createCoupon(coupon),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["coupons"] }),
  });
}

export function useToggleCoupon() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, active }: { id: bigint; active: boolean }) =>
      actor!.toggleCoupon(id, active),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["coupons"] }),
  });
}

export function useValidateCoupon() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: (code: string) => actor!.validateCoupon(code),
  });
}

// ── Orders ────────────────────────────────────────────────────────────────────

export function useMyOrders() {
  const { actor, isFetching } = useActor();
  return useQuery<Order[]>({
    queryKey: ["my-orders"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getOrdersByUser();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAllOrders() {
  const { actor, isFetching } = useActor();
  return useQuery<Order[]>({
    queryKey: ["all-orders"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllOrders();
    },
    enabled: !!actor && !isFetching,
  });
}

export function usePlaceOrder() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (args: {
      items: OrderItem[];
      subtotal: bigint;
      discountAmount: bigint;
      shippingCost: bigint;
      total: bigint;
    }) =>
      actor!.placeOrder(
        args.items,
        args.subtotal,
        args.discountAmount,
        args.shippingCost,
        args.total,
      ),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["my-orders"] }),
  });
}

export function useUpdateOrderStatus() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: bigint; status: string }) =>
      actor!.updateOrderStatus(id, status),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["all-orders"] }),
  });
}

// ── Gift Cards ────────────────────────────────────────────────────────────────

export function useGetGiftCard() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: (code: string) => actor!.getGiftCardByCode(code),
  });
}

export function useRedeemGiftCard() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: (code: string) => actor!.redeemGiftCard(code),
  });
}

export function useCreateGiftCard() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: ({ code, balance }: { code: string; balance: bigint }) =>
      actor!.createGiftCard(code, balance),
  });
}

// ── Payment Info ──────────────────────────────────────────────────────────────

export function usePaymentInfo() {
  const { actor, isFetching } = useActor();
  return useQuery<PaymentInfo[]>({
    queryKey: ["payment-info"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getPaymentInfo();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSetPaymentInfo() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ method, details }: { method: string; details: string }) =>
      actor!.setPaymentInfo(method, details),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["payment-info"] }),
  });
}

// ── User Profile ──────────────────────────────────────────────────────────────

export function useUserProfile() {
  const { actor, isFetching } = useActor();
  return useQuery<UserProfile | null>({
    queryKey: ["user-profile"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSaveUserProfile() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (profile: UserProfile) => actor!.saveCallerUserProfile(profile),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["user-profile"] }),
  });
}

// ── Staff ─────────────────────────────────────────────────────────────────────

export function useVerifyStaffCode() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: (code: string) => actor!.verifyStaffCode(code),
  });
}

// ── Gift Cards (admin list) ───────────────────────────────────────────────────

export function useGiftCards() {
  const { actor, isFetching } = useActor();
  // We store gift cards locally since backend doesn't have a getAllGiftCards
  // Instead we'll use the ones we created via staff panel stored in localStorage
  return useQuery<GiftCard[]>({
    queryKey: ["gift-cards-admin"],
    queryFn: async () => {
      if (!actor) return [];
      // Read from localStorage store
      const stored = localStorage.getItem("frost_staff_gift_cards");
      if (!stored) return [];
      return JSON.parse(stored) as GiftCard[];
    },
    enabled: !!actor && !isFetching,
  });
}
