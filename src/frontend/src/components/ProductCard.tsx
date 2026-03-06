import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/CartContext";
import { Link } from "@tanstack/react-router";
import { ShoppingCart, Star } from "lucide-react";
import { toast } from "sonner";
import type { Product } from "../backend.d";

interface ProductCardProps {
  product: Product;
  index?: number;
}

function formatPrice(pence: bigint): string {
  return `£${(Number(pence) / 100).toFixed(2)}`;
}

export function ProductCard({ product, index = 1 }: ProductCardProps) {
  const { addItem } = useCart();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem({
      productId: product.id.toString(),
      name: product.name,
      price: Number(product.price),
      quantity: 1,
      imageUrl: product.imageUrl,
    });
    toast.success(`${product.name} added to cart`);
  };

  return (
    <article
      className="crystal-card rounded-lg overflow-hidden group"
      data-ocid={`product.item.${index}`}
    >
      <Link
        to="/product/$id"
        params={{ id: product.id.toString() }}
        className="block"
      >
        {/* Image */}
        <div className="relative aspect-[4/3] bg-secondary overflow-hidden">
          {product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-secondary">
              <span className="text-muted-foreground text-4xl">❄</span>
            </div>
          )}
          {Number(product.stock) <= 5 && Number(product.stock) > 0 && (
            <Badge className="absolute top-3 left-3 bg-amber-500 text-white border-0 text-xs">
              Low stock
            </Badge>
          )}
          {Number(product.stock) === 0 && (
            <Badge className="absolute top-3 left-3 bg-destructive text-white border-0 text-xs">
              Out of stock
            </Badge>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="font-display font-semibold text-foreground text-sm leading-tight truncate mb-1">
            {product.name}
          </h3>
          <p className="text-muted-foreground text-xs line-clamp-2 mb-3 leading-relaxed">
            {product.description}
          </p>

          <div className="flex items-center justify-between">
            <span className="font-display font-bold text-primary text-lg">
              {formatPrice(product.price)}
            </span>
            <div className="flex items-center gap-1 text-amber-400">
              <Star className="h-3 w-3 fill-current" />
              <span className="text-xs text-muted-foreground">4.8</span>
            </div>
          </div>
        </div>
      </Link>

      {/* Add to cart */}
      <div className="px-4 pb-4">
        <Button
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground gap-2 h-9 text-sm"
          onClick={handleAddToCart}
          disabled={Number(product.stock) === 0}
          data-ocid={`product.cart.button.${index}`}
        >
          <ShoppingCart className="h-4 w-4" />
          {Number(product.stock) === 0 ? "Out of Stock" : "Add to Cart"}
        </Button>
      </div>
    </article>
  );
}
