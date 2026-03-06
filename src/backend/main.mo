import Map "mo:core/Map";
import Array "mo:core/Array";
import List "mo:core/List";
import Text "mo:core/Text";
import Int "mo:core/Int";
import Order "mo:core/Order";
import Time "mo:core/Time";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";

import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  module Product {
    public func compare(product1 : Product, product2 : Product) : Order.Order {
      Text.compare(product1.name, product2.name);
    };
  };

  module Category {
    public func compare(category1 : Category, category2 : Category) : Order.Order {
      Text.compare(category1.name, category2.name);
    };
  };

  module Coupon {
    public func compare(coupon1 : Coupon, coupon2 : Coupon) : Order.Order {
      Text.compare(coupon1.code, coupon2.code);
    };
  };

  module GiftCard {
    public func compare(giftCard1 : GiftCard, giftCard2 : GiftCard) : Order.Order {
      Text.compare(giftCard1.code, giftCard2.code);
    };
  };

  module PaymentInfo {
    public func compare(paymentInfo1 : PaymentInfo, paymentInfo2 : PaymentInfo) : Order.Order {
      Text.compare(paymentInfo1.method, paymentInfo2.method);
    };
  };

  public type Product = {
    id : Nat;
    name : Text;
    description : Text;
    price : Nat;
    stock : Nat;
    categoryId : Nat;
    imageUrl : Text;
    active : Bool;
  };

  public type Category = {
    id : Nat;
    name : Text;
  };

  public type OrderItem = {
    productId : Nat;
    quantity : Nat;
    unitPrice : Nat;
  };

  public type Order = {
    id : Nat;
    userId : Principal;
    items : [OrderItem];
    subtotal : Nat;
    discountAmount : Nat;
    shippingCost : Nat;
    total : Nat;
    status : Text;
    createdAt : Int;
  };

  public type Coupon = {
    id : Nat;
    code : Text;
    discountType : Text;
    value : Nat;
    active : Bool;
  };

  public type GiftCard = {
    id : Nat;
    code : Text;
    balance : Nat;
    purchasedBy : Principal;
    redeemedBy : ?Principal;
    active : Bool;
  };

  public type PaymentInfo = {
    method : Text;
    details : Text;
  };

  public type Address = {
    name : Text;
    line1 : Text;
    line2 : Text;
    city : Text;
    postcode : Text;
    country : Text;
  };

  public type UserProfile = {
    address : Address;
  };

  // State
  var nextProductId = 1;
  var nextCategoryId = 1;
  var nextOrderId = 1;
  var nextCouponId = 1;
  var nextGiftCardId = 1;

  // Data stores
  let products = Map.empty<Nat, Product>();
  let categories = Map.empty<Nat, Category>();
  let orders = Map.empty<Nat, Order>();
  let coupons = Map.empty<Nat, Coupon>();
  let giftCards = Map.empty<Nat, GiftCard>();
  let paymentInfo = Map.empty<Text, PaymentInfo>();
  let userProfiles = Map.empty<Principal, UserProfile>();

  // Authorization
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // User Profile functions
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Product functions
  public shared ({ caller }) func createProduct(product : Product) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    let newProduct : Product = {
      id = nextProductId;
      name = product.name;
      description = product.description;
      price = product.price;
      stock = product.stock;
      categoryId = product.categoryId;
      imageUrl = product.imageUrl;
      active = product.active;
    };
    products.add(nextProductId, newProduct);
    nextProductId += 1;
  };

  public query ({ caller }) func getProducts() : async [Product] {
    products.values().toArray().sort();
  };

  public shared ({ caller }) func updateProduct(id : Nat, product : Product) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    switch (products.get(id)) {
      case (null) { Runtime.trap("Product not found") };
      case (?_) {
        let updatedProduct : Product = {
          id;
          name = product.name;
          description = product.description;
          price = product.price;
          stock = product.stock;
          categoryId = product.categoryId;
          imageUrl = product.imageUrl;
          active = product.active;
        };
        products.add(id, updatedProduct);
      };
    };
  };

  public shared ({ caller }) func deleteProduct(id : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    products.remove(id);
  };

  // Category functions
  public shared ({ caller }) func createCategory(name : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    let newCategory : Category = {
      id = nextCategoryId;
      name;
    };
    categories.add(nextCategoryId, newCategory);
    nextCategoryId += 1;
  };

  public query ({ caller }) func getCategories() : async [Category] {
    categories.values().toArray().sort();
  };

  public shared ({ caller }) func updateCategory(id : Nat, name : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    switch (categories.get(id)) {
      case (null) { Runtime.trap("Category not found") };
      case (?_) {
        let updatedCategory : Category = {
          id;
          name;
        };
        categories.add(id, updatedCategory);
      };
    };
  };

  public shared ({ caller }) func deleteCategory(id : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    categories.remove(id);
  };

  // Order functions
  public shared ({ caller }) func placeOrder(items : [OrderItem], subtotal : Nat, discountAmount : Nat, shippingCost : Nat, total : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can place orders");
    };
    let newOrder : Order = {
      id = nextOrderId;
      userId = caller;
      items;
      subtotal;
      discountAmount;
      shippingCost;
      total;
      status = "pending";
      createdAt = Time.now();
    };
    orders.add(nextOrderId, newOrder);
    nextOrderId += 1;
  };

  public shared ({ caller }) func updateOrderStatus(id : Nat, status : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    switch (orders.get(id)) {
      case (null) { Runtime.trap("Order not found") };
      case (?order) {
        let updatedOrder : Order = {
          id = order.id;
          userId = order.userId;
          items = order.items;
          subtotal = order.subtotal;
          discountAmount = order.discountAmount;
          shippingCost = order.shippingCost;
          total = order.total;
          status;
          createdAt = order.createdAt;
        };
        orders.add(id, updatedOrder);
      };
    };
  };

  public query ({ caller }) func getOrdersByUser() : async [Order] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view orders");
    };
    let allOrders = orders.values().toArray();
    let filteredOrders = List.empty<Order>();
    for (order in allOrders.values()) {
      if (order.userId == caller) {
        filteredOrders.add(order);
      };
    };
    filteredOrders.toArray();
  };

  public query ({ caller }) func getAllOrders() : async [Order] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    orders.values().toArray();
  };

  // Coupon functions
  public shared ({ caller }) func createCoupon(coupon : Coupon) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    let newCoupon : Coupon = {
      id = nextCouponId;
      code = coupon.code;
      discountType = coupon.discountType;
      value = coupon.value;
      active = coupon.active;
    };
    coupons.add(nextCouponId, newCoupon);
    nextCouponId += 1;
  };

  public query ({ caller }) func getCoupons() : async [Coupon] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    coupons.values().toArray().sort();
  };

  public shared ({ caller }) func toggleCoupon(id : Nat, active : Bool) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    switch (coupons.get(id)) {
      case (null) { Runtime.trap("Coupon not found") };
      case (?coupon) {
        let updatedCoupon : Coupon = {
          id = coupon.id;
          code = coupon.code;
          discountType = coupon.discountType;
          value = coupon.value;
          active;
        };
        coupons.add(id, updatedCoupon);
      };
    };
  };

  public query ({ caller }) func validateCoupon(code : Text) : async ?Coupon {
    let allCoupons = coupons.values().toArray();
    for (coupon in allCoupons.values()) {
      if (coupon.code == code and coupon.active) { return ?coupon };
    };
    null;
  };

  // Gift card functions
  public shared ({ caller }) func createGiftCard(code : Text, balance : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    let newGiftCard : GiftCard = {
      id = nextGiftCardId;
      code;
      balance;
      purchasedBy = caller;
      redeemedBy = null;
      active = true;
    };
    giftCards.add(nextGiftCardId, newGiftCard);
    nextGiftCardId += 1;
  };

  public shared ({ caller }) func redeemGiftCard(code : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can redeem gift cards");
    };
    switch (findGiftCardByCode(code)) {
      case (null) { Runtime.trap("Gift card not found") };
      case (?cardId) {
        switch (giftCards.get(cardId)) {
          case (null) { Runtime.trap("Gift card not found") };
          case (?card) {
            if (not card.active) { Runtime.trap("Gift card is not active") };
            let updatedCard : GiftCard = {
              id = card.id;
              code = card.code;
              balance = card.balance;
              purchasedBy = card.purchasedBy;
              redeemedBy = ?caller;
              active = false;
            };
            giftCards.add(cardId, updatedCard);
          };
        };
      };
    };
  };

  public query ({ caller }) func getGiftCardByCode(code : Text) : async ?GiftCard {
    switch (findGiftCardByCode(code)) {
      case (null) { null };
      case (?cardId) { giftCards.get(cardId) };
    };
  };

  func findGiftCardByCode(code : Text) : ?Nat {
    let allGiftCards = giftCards.values().toArray();
    for (giftCard in allGiftCards.values()) {
      if (giftCard.code == code) { return ?giftCard.id };
    };
    null;
  };

  // Payment info functions
  public shared ({ caller }) func setPaymentInfo(method : Text, details : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    let newPaymentInfo : PaymentInfo = {
      method;
      details;
    };
    paymentInfo.add(method, newPaymentInfo);
  };

  public query ({ caller }) func getPaymentInfo() : async [PaymentInfo] {
    paymentInfo.values().toArray().sort();
  };

  // Staff auth
  public shared ({ caller }) func verifyStaffCode(code : Text) : async Bool {
    if (code == "staff2026") {
      AccessControl.assignRole(accessControlState, caller, caller, #admin);
      true;
    } else {
      false;
    };
  };
};
