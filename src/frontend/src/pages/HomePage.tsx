import { ProductCard } from "@/components/ProductCard";
import { PromoBanners } from "@/components/PromoBanners";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useProducts } from "@/hooks/useQueries";
import { useCategories } from "@/hooks/useQueries";
import { Link } from "@tanstack/react-router";
import { ArrowRight, Gift, Leaf, Shield, Truck } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";

export function HomePage() {
  const { data: products, isLoading: productsLoading } = useProducts();
  const { data: categories } = useCategories();
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const activeProducts = (products ?? []).filter((p) => p.active);
  const filtered =
    selectedCategory === "all"
      ? activeProducts
      : activeProducts.filter(
          (p) => p.categoryId.toString() === selectedCategory,
        );

  const features = [
    {
      icon: Truck,
      title: "Free Shipping",
      desc: "On orders over £50",
    },
    {
      icon: Shield,
      title: "Secure Checkout",
      desc: "100% protected payments",
    },
    {
      icon: Gift,
      title: "Gift Cards",
      desc: "Give the perfect present",
    },
    {
      icon: Leaf,
      title: "Premium Quality",
      desc: "Carefully curated products",
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section
        className="relative overflow-hidden"
        style={{ minHeight: "520px" }}
      >
        <img
          src="/assets/generated/frost-hero.dim_1600x600.jpg"
          alt="Gardening World"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 hero-gradient" />
        <div className="relative container mx-auto px-4 py-24 flex flex-col items-start justify-center h-full min-h-[520px]">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
          >
            <Badge className="mb-4 bg-accent/20 text-white border-accent/50 text-xs font-medium px-3 py-1">
              ✦ Spring Collection
            </Badge>
            <h1 className="font-display text-5xl md:text-7xl font-bold text-white leading-[1.05] mb-6 max-w-2xl">
              Beautiful
              <br />
              Gardens
              <br />
              <span style={{ color: "oklch(0.82 0.14 55)" }}>Start Here.</span>
            </h1>
            <p className="text-white/80 text-lg max-w-md mb-8 leading-relaxed">
              Quality plants and garden products delivered to your door.
            </p>
            <div className="flex gap-3">
              <a href="#products">
                <Button
                  size="lg"
                  className="bg-white text-primary hover:bg-white/90 font-semibold gap-2"
                  data-ocid="hero.shop.button"
                >
                  Shop Now
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </a>
              <Link to="/register">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white/50 text-white hover:bg-white/10 hover:border-white/70"
                  data-ocid="hero.register.button"
                >
                  Create Account
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features strip */}
      <section className="bg-white border-b border-border">
        <div className="container mx-auto px-4 py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {features.map((f) => (
              <div key={f.title} className="flex items-center gap-3 py-2">
                <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <f.icon className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    {f.title}
                  </p>
                  <p className="text-xs text-muted-foreground">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Promo Banners */}
      <PromoBanners />

      {/* Products */}
      <section id="products" className="container mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-10"
        >
          <h2 className="font-display text-3xl font-bold text-foreground mb-2">
            Our Collection
          </h2>
          <p className="text-muted-foreground">
            Discover premium products crafted with care
          </p>
        </motion.div>

        {/* Category filters */}
        {categories && categories.length > 0 && (
          <div
            className="flex flex-wrap gap-2 mb-8"
            data-ocid="product.filter.tab"
          >
            <button
              type="button"
              onClick={() => setSelectedCategory("all")}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                selectedCategory === "all"
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/70"
              }`}
              data-ocid="product.category.all.tab"
            >
              All
            </button>
            {categories.map((cat) => (
              <button
                type="button"
                key={cat.id.toString()}
                onClick={() => setSelectedCategory(cat.id.toString())}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  selectedCategory === cat.id.toString()
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/70"
                }`}
                data-ocid="product.category.tab"
              >
                {cat.name}
              </button>
            ))}
          </div>
        )}

        {/* Product grid */}
        {productsLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {Array.from({ length: 8 }, (_, i) => String(i)).map((key) => (
              <div
                key={key}
                className="rounded overflow-hidden border border-border"
              >
                <Skeleton className="aspect-[4/3] w-full" />
                <div className="p-4 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-2/3" />
                  <Skeleton className="h-8 w-full mt-3" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-24"
            data-ocid="product.empty_state"
          >
            <div className="inline-flex items-center justify-center h-20 w-20 rounded-full bg-secondary mb-6">
              <Leaf className="h-9 w-9 text-primary" strokeWidth={1} />
            </div>
            <h3 className="font-display text-xl font-semibold text-foreground mb-2">
              No products yet
            </h3>
            <p className="text-muted-foreground text-sm max-w-sm mx-auto mb-6">
              Our team is carefully curating the collection. Check back soon for
              something extraordinary.
            </p>
            <Link to="/staff">
              <Button
                variant="outline"
                size="sm"
                data-ocid="product.staff.link"
              >
                Staff Login
              </Button>
            </Link>
          </motion.div>
        ) : (
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={{
              hidden: {},
              visible: {
                transition: { staggerChildren: 0.07 },
              },
            }}
          >
            {filtered.map((product, i) => (
              <motion.div
                key={product.id.toString()}
                variants={{
                  hidden: { opacity: 0, y: 16 },
                  visible: { opacity: 1, y: 0 },
                }}
                transition={{ duration: 0.4 }}
              >
                <ProductCard product={product} index={i + 1} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </section>

      {/* Gift card CTA */}
      <section className="container mx-auto px-4 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="frost-gradient rounded p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-6"
        >
          <div>
            <h3 className="font-display text-2xl font-bold text-white mb-2">
              Give the Gift of Gardening World
            </h3>
            <p className="text-white/70 max-w-md">
              Gift cards available from £10 — the perfect present for anyone who
              appreciates quality.
            </p>
          </div>
          <Link to="/gift-cards">
            <Button
              size="lg"
              className="bg-white text-primary hover:bg-white/90 shrink-0 gap-2"
              data-ocid="hero.giftcard.button"
            >
              <Gift className="h-4 w-4" />
              Buy a Gift Card
            </Button>
          </Link>
        </motion.div>
      </section>
    </div>
  );
}
