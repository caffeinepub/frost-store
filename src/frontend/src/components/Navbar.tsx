import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { Link, useLocation } from "@tanstack/react-router";
import { Menu, ShoppingCart, Snowflake, User, X } from "lucide-react";
import { useState } from "react";

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { totalItems } = useCart();
  const { isLoggedIn, principal, logout } = useAuth();
  const location = useLocation();

  const navLinks = [
    { label: "Shop", href: "/" },
    { label: "Profile", href: "/profile" },
  ];

  return (
    <header className="frost-nav sticky top-0 z-50 shadow-frost">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link
          to="/"
          className="flex items-center gap-2 text-white no-underline"
          data-ocid="nav.link"
        >
          <Snowflake className="h-6 w-6 text-accent" strokeWidth={1.5} />
          <span className="font-display text-xl font-bold tracking-tight text-white">
            Frost
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className={`text-sm font-medium transition-colors hover:text-accent ${
                location.pathname === link.href
                  ? "text-accent"
                  : "text-white/80"
              }`}
              data-ocid={`nav.${link.label.toLowerCase()}.link`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <Link to="/cart" className="relative" data-ocid="nav.cart.link">
            <Button
              variant="ghost"
              size="icon"
              className="text-white/80 hover:text-white hover:bg-white/10"
            >
              <ShoppingCart className="h-5 w-5" />
              {totalItems > 0 && (
                <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs bg-accent text-white border-0">
                  {totalItems}
                </Badge>
              )}
            </Button>
          </Link>

          {isLoggedIn ? (
            <div className="hidden md:flex items-center gap-2">
              <Link to="/profile" data-ocid="nav.profile.link">
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white/80 hover:text-white hover:bg-white/10"
                >
                  <User className="h-5 w-5" />
                </Button>
              </Link>
              <Button
                variant="ghost"
                size="sm"
                onClick={logout}
                className="text-white/70 hover:text-white hover:bg-white/10 text-xs"
                data-ocid="nav.logout.button"
              >
                Sign out
              </Button>
            </div>
          ) : (
            <div className="hidden md:flex items-center gap-2">
              <Link to="/login" data-ocid="nav.login.link">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white/80 hover:text-white hover:bg-white/10"
                >
                  Sign in
                </Button>
              </Link>
              <Link to="/register" data-ocid="nav.register.link">
                <Button
                  size="sm"
                  className="bg-accent hover:bg-accent/90 text-white border-0"
                >
                  Register
                </Button>
              </Link>
            </div>
          )}

          {/* Mobile menu toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden text-white/80 hover:text-white hover:bg-white/10"
            onClick={() => setMobileOpen((o) => !o)}
            data-ocid="nav.menu.toggle"
          >
            {mobileOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>

      {/* Mobile nav */}
      {mobileOpen && (
        <div className="md:hidden bg-primary/95 backdrop-blur border-t border-white/10 px-4 py-4 flex flex-col gap-3">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className="text-white/80 hover:text-white text-sm font-medium py-2"
              onClick={() => setMobileOpen(false)}
              data-ocid={`nav.mobile.${link.label.toLowerCase()}.link`}
            >
              {link.label}
            </Link>
          ))}
          {isLoggedIn ? (
            <button
              type="button"
              className="text-white/70 hover:text-white text-sm text-left py-2"
              onClick={() => {
                logout();
                setMobileOpen(false);
              }}
              data-ocid="nav.mobile.logout.button"
            >
              Sign out ({principal?.slice(0, 8)}…)
            </button>
          ) : (
            <>
              <Link
                to="/login"
                className="text-white/80 hover:text-white text-sm py-2"
                onClick={() => setMobileOpen(false)}
                data-ocid="nav.mobile.login.link"
              >
                Sign in
              </Link>
              <Link
                to="/register"
                className="text-white/80 hover:text-white text-sm py-2"
                onClick={() => setMobileOpen(false)}
                data-ocid="nav.mobile.register.link"
              >
                Register
              </Link>
            </>
          )}
          <Link
            to="/staff"
            className="text-white/40 hover:text-white/70 text-xs py-2"
            onClick={() => setMobileOpen(false)}
            data-ocid="nav.mobile.staff.link"
          >
            Staff Panel
          </Link>
        </div>
      )}
    </header>
  );
}
