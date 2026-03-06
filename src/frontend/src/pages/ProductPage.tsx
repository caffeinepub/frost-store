import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useCart } from "@/context/CartContext";
import { useCategories, useProducts } from "@/hooks/useQueries";
import { Link, useParams } from "@tanstack/react-router";
import {
  ArrowLeft,
  Package,
  Shield,
  ShoppingCart,
  Star,
  Truck,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";

function formatPrice(pence: bigint): string {
  return `£${(Number(pence) / 100).toFixed(2)}`;
}

export function ProductPage() {
  const { id } = useParams({ from: "/product/$id" });
  const { data: products, isLoading } = useProducts();
  const { data: categories } = useCategories();
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);

  const product = products?.find((p) => p.id.toString() === id);
  const category = categories?.find(
    (c) => c.id.toString() === product?.categoryId.toString(),
  );

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Skeleton className="h-6 w-32 mb-8" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <Skeleton className="aspect-square rounded-xl" />
          <div className="space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-12 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-24 text-center">
        <h2 className="font-display text-2xl font-bold mb-4">
          Product not found
        </h2>
        <Link to="/">
          <Button data-ocid="product.back.button">Back to Shop</Button>
        </Link>
      </div>
    );
  }

  const handleAddToCart = () => {
    if (Number(product.stock) === 0) return;
    addItem({
      productId: product.id.toString(),
      name: product.name,
      price: Number(product.price),
      quantity,
      imageUrl: product.imageUrl,
    });
    toast.success(`${product.name} added to cart`);
  };

  const inStock = Number(product.stock) > 0;

  return (
    <div className="container mx-auto px-4 py-12">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
        <Link
          to="/"
          className="hover:text-foreground transition-colors flex items-center gap-1"
          data-ocid="product.back.link"
        >
          <ArrowLeft className="h-3 w-3" />
          Shop
        </Link>
        <span>/</span>
        {category && <span>{category.name}</span>}
        {category && <span>/</span>}
        <span className="text-foreground font-medium truncate max-w-xs">
          {product.name}
        </span>
      </nav>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Image */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="relative"
        >
          <div className="aspect-square rounded-xl overflow-hidden bg-secondary">
            {product.imageUrl ? (
              <img
                src={product.imageUrl}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-6xl">
                ❄
              </div>
            )}
          </div>
          {!inStock && (
            <Badge className="absolute top-4 left-4 bg-destructive text-white border-0">
              Out of Stock
            </Badge>
          )}
          {inStock && Number(product.stock) <= 5 && (
            <Badge className="absolute top-4 left-4 bg-amber-500 text-white border-0">
              Only {Number(product.stock)} left
            </Badge>
          )}
        </motion.div>

        {/* Details */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex flex-col"
        >
          {category && (
            <span className="text-accent text-xs font-semibold uppercase tracking-widest mb-2">
              {category.name}
            </span>
          )}

          <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-3">
            {product.name}
          </h1>

          {/* Rating */}
          <div className="flex items-center gap-2 mb-4">
            <div className="flex">
              {Array.from({ length: 5 }).map((_, i) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: static 5-star array
                <Star key={i} className="h-4 w-4 text-amber-400 fill-current" />
              ))}
            </div>
            <span className="text-sm text-muted-foreground">
              4.8 (24 reviews)
            </span>
          </div>

          <p className="font-display text-4xl font-bold text-primary mb-6">
            {formatPrice(product.price)}
          </p>

          <p className="text-muted-foreground leading-relaxed mb-8">
            {product.description}
          </p>

          {/* Quantity selector */}
          {inStock && (
            <div className="flex items-center gap-4 mb-6">
              <span className="text-sm font-medium text-foreground">
                Quantity
              </span>
              <div className="flex items-center border border-border rounded-lg overflow-hidden">
                <button
                  type="button"
                  className="h-10 w-10 flex items-center justify-center hover:bg-secondary transition-colors"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  data-ocid="product.qty.decrease.button"
                >
                  −
                </button>
                <span className="h-10 w-10 flex items-center justify-center text-sm font-semibold border-x border-border">
                  {quantity}
                </span>
                <button
                  type="button"
                  className="h-10 w-10 flex items-center justify-center hover:bg-secondary transition-colors"
                  onClick={() =>
                    setQuantity((q) => Math.min(Number(product.stock), q + 1))
                  }
                  data-ocid="product.qty.increase.button"
                >
                  +
                </button>
              </div>
              <span className="text-xs text-muted-foreground">
                {Number(product.stock)} available
              </span>
            </div>
          )}

          {/* CTA */}
          <Button
            size="lg"
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground gap-2 h-12 mb-4"
            onClick={handleAddToCart}
            disabled={!inStock}
            data-ocid="product.add_to_cart.button"
          >
            <ShoppingCart className="h-5 w-5" />
            {inStock ? "Add to Cart" : "Out of Stock"}
          </Button>

          <Link to="/cart">
            <Button
              variant="outline"
              size="lg"
              className="w-full gap-2"
              data-ocid="product.view_cart.button"
            >
              View Cart
            </Button>
          </Link>

          {/* Trust signals */}
          <div className="grid grid-cols-3 gap-4 mt-8 pt-8 border-t border-border">
            <div className="flex flex-col items-center gap-1 text-center">
              <Truck className="h-5 w-5 text-accent" />
              <span className="text-xs text-muted-foreground">
                Free over £50
              </span>
            </div>
            <div className="flex flex-col items-center gap-1 text-center">
              <Shield className="h-5 w-5 text-accent" />
              <span className="text-xs text-muted-foreground">
                Secure payment
              </span>
            </div>
            <div className="flex flex-col items-center gap-1 text-center">
              <Package className="h-5 w-5 text-accent" />
              <span className="text-xs text-muted-foreground">
                Quality packed
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
