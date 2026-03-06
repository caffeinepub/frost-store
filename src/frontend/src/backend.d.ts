import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Category {
    id: bigint;
    name: string;
}
export interface Address {
    postcode: string;
    country: string;
    city: string;
    name: string;
    line1: string;
    line2: string;
}
export interface GiftCard {
    id: bigint;
    redeemedBy?: Principal;
    active: boolean;
    balance: bigint;
    code: string;
    purchasedBy: Principal;
}
export interface Coupon {
    id: bigint;
    active: boolean;
    value: bigint;
    code: string;
    discountType: string;
}
export interface OrderItem {
    productId: bigint;
    quantity: bigint;
    unitPrice: bigint;
}
export interface PaymentInfo {
    method: string;
    details: string;
}
export interface Order {
    id: bigint;
    status: string;
    total: bigint;
    userId: Principal;
    discountAmount: bigint;
    createdAt: bigint;
    shippingCost: bigint;
    items: Array<OrderItem>;
    subtotal: bigint;
}
export interface UserProfile {
    address: Address;
}
export interface Product {
    id: bigint;
    categoryId: bigint;
    active: boolean;
    name: string;
    description: string;
    stock: bigint;
    imageUrl: string;
    price: bigint;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createCategory(name: string): Promise<void>;
    createCoupon(coupon: Coupon): Promise<void>;
    createGiftCard(code: string, balance: bigint): Promise<void>;
    createProduct(product: Product): Promise<void>;
    deleteCategory(id: bigint): Promise<void>;
    deleteProduct(id: bigint): Promise<void>;
    getAllOrders(): Promise<Array<Order>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getCategories(): Promise<Array<Category>>;
    getCoupons(): Promise<Array<Coupon>>;
    getGiftCardByCode(code: string): Promise<GiftCard | null>;
    getOrdersByUser(): Promise<Array<Order>>;
    getPaymentInfo(): Promise<Array<PaymentInfo>>;
    getProducts(): Promise<Array<Product>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    placeOrder(items: Array<OrderItem>, subtotal: bigint, discountAmount: bigint, shippingCost: bigint, total: bigint): Promise<void>;
    redeemGiftCard(code: string): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    setPaymentInfo(method: string, details: string): Promise<void>;
    toggleCoupon(id: bigint, active: boolean): Promise<void>;
    updateCategory(id: bigint, name: string): Promise<void>;
    updateOrderStatus(id: bigint, status: string): Promise<void>;
    updateProduct(id: bigint, product: Product): Promise<void>;
    validateCoupon(code: string): Promise<Coupon | null>;
    verifyStaffCode(code: string): Promise<boolean>;
}
