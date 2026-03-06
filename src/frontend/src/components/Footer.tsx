import { Link } from "@tanstack/react-router";
import { Heart, Leaf } from "lucide-react";

export function Footer() {
  const year = new Date().getFullYear();
  const utmLink = `https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`;

  return (
    <footer className="frost-gradient text-white/80 mt-auto">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-3">
              <Leaf className="h-5 w-5 text-white/80" strokeWidth={1.5} />
              <span className="font-display text-lg font-bold text-white">
                Gardening World
              </span>
            </div>
            <p className="text-white/60 text-sm leading-relaxed max-w-xs">
              Quality plants and garden products delivered to your door.
              Carefully selected for those who love their outdoor spaces.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-display font-semibold text-white text-sm mb-3">
              Shop
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  to="/"
                  className="text-white/60 hover:text-white transition-colors"
                >
                  All Products
                </Link>
              </li>
              <li>
                <Link
                  to="/cart"
                  className="text-white/60 hover:text-white transition-colors"
                >
                  Cart
                </Link>
              </li>
            </ul>
          </div>

          {/* Account */}
          <div>
            <h4 className="font-display font-semibold text-white text-sm mb-3">
              Account
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  to="/login"
                  className="text-white/60 hover:text-white transition-colors"
                >
                  Sign In
                </Link>
              </li>
              <li>
                <Link
                  to="/register"
                  className="text-white/60 hover:text-white transition-colors"
                >
                  Register
                </Link>
              </li>
              <li>
                <Link
                  to="/profile"
                  className="text-white/60 hover:text-white transition-colors"
                >
                  My Orders
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-white/40">
          <p>© {year} Gardening World. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Built with{" "}
            <Heart
              className="h-3 w-3 text-rose-300 inline"
              fill="currentColor"
            />{" "}
            using{" "}
            <a
              href={utmLink}
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/60 hover:text-white transition-colors"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
