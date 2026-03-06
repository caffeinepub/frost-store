import { motion } from "motion/react";

export interface PromoBanner {
  id: string;
  title: string;
  subtitle: string;
  ctaText: string;
  ctaLink: string;
  bgColor: string;
}

const STORAGE_KEY = "gw_promo_banners";

/** Load banners from localStorage (plain function, not a React hook). */
export function loadPromoBanners(): PromoBanner[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? (JSON.parse(stored) as PromoBanner[]) : [];
  } catch {
    return [];
  }
}

export function savePromoBanners(banners: PromoBanner[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(banners));
}

export function PromoBanners() {
  const banners = loadPromoBanners();

  if (banners.length === 0) return null;

  return (
    <section className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {banners.map((banner, i) => (
          <motion.a
            key={banner.id}
            href={banner.ctaLink || "#"}
            target={banner.ctaLink?.startsWith("http") ? "_blank" : undefined}
            rel={
              banner.ctaLink?.startsWith("http")
                ? "noopener noreferrer"
                : undefined
            }
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: i * 0.07 }}
            whileHover={{ scale: 1.02 }}
            className="block rounded-xl overflow-hidden shadow-md cursor-pointer group"
            style={{ backgroundColor: banner.bgColor || "#1a4d2e" }}
          >
            <div className="p-6 flex flex-col justify-between min-h-[140px]">
              <div>
                <h3 className="font-display text-xl font-bold text-white mb-1 leading-tight">
                  {banner.title}
                </h3>
                {banner.subtitle && (
                  <p className="text-white/75 text-sm leading-relaxed">
                    {banner.subtitle}
                  </p>
                )}
              </div>
              {banner.ctaText && (
                <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-white bg-white/20 group-hover:bg-white/30 transition-colors rounded-lg px-3 py-1.5 w-fit">
                  {banner.ctaText}
                  <svg
                    className="h-3.5 w-3.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2.5}
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M17 8l4 4m0 0l-4 4m4-4H3"
                    />
                  </svg>
                </span>
              )}
            </div>
          </motion.a>
        ))}
      </div>
    </section>
  );
}
