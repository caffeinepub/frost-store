import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { Link, useLocation } from "@tanstack/react-router";
import { Leaf, Menu, ShoppingCart, User, X } from "lucide-react";
import { useState } from "react";

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { totalItems } = useCart();
  const { isLoggedIn, principal, logout } = useAuth();
  const location = useLocation();

  const navLinks = [
    { label: "Shop", href: "/" },
    { label: "Gift Cards", href: "/gift-cards" },
    { label: "Profile", href: "/profile" },
  ];

  return (
    <header className="frost-nav sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link
          to="/"
          className="flex items-center gap-2 no-underline"
          data-ocid="nav.link"
        >
          <Leaf className="h-6 w-6 text-primary" strokeWidth={1.5} />
          <span className="font-display text-xl font-bold tracking-tight text-primary">
            Gardening World
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className={`text-sm font-medium transition-colors relative after:absolute after:bottom-[-2px] after:left-0 after:h-[2px] after:bg-primary after:transition-all ${
                location.pathname === link.href
                  ? "text-primary after:w-full"
                  : "text-foreground/80 hover:text-primary after:w-0 hover:after:w-full"
              }`}
              data-ocid={
                link.href === "/gift-cards"
                  ? "nav.giftcards.link"
                  : `nav.${link.label.toLowerCase()}.link`
              }
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
              className="text-foreground/70 hover:text-primary hover:bg-primary/10"
            >
              <ShoppingCart className="h-5 w-5" />
              {totalItems > 0 && (
                <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs bg-primary text-primary-foreground border-0">
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
                  className="text-foreground/70 hover:text-primary hover:bg-primary/10"
                >
                  <User className="h-5 w-5" />
                </Button>
              </Link>
              <Button
                variant="ghost"
                size="sm"
                onClick={logout}
                className="text-foreground/60 hover:text-primary hover:bg-primary/10 text-xs"
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
                  className="text-foreground/70 hover:text-primary hover:bg-primary/10"
                >
                  Sign in
                </Button>
              </Link>
              <Link to="/register" data-ocid="nav.register.link">
                <Button
                  size="sm"
                  className="bg-primary hover:bg-primary/90 text-primary-foreground border-0"
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
            className="md:hidden text-foreground/70 hover:text-primary hover:bg-primary/10"
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
        <div className="md:hidden bg-white border-t border-border px-4 py-4 flex flex-col gap-3">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className="text-foreground/80 hover:text-primary text-sm font-medium py-2 transition-colors"
              onClick={() => setMobileOpen(false)}
              data-ocid={
                link.href === "/gift-cards"
                  ? "nav.mobile.giftcards.link"
                  : `nav.mobile.${link.label.toLowerCase()}.link`
              }
            >
              {link.label}
            </Link>
          ))}
          {isLoggedIn ? (
            <button
              type="button"
              className="text-foreground/60 hover:text-primary text-sm text-left py-2 transition-colors"
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
                className="text-foreground/80 hover:text-primary text-sm py-2 transition-colors"
                onClick={() => setMobileOpen(false)}
                data-ocid="nav.mobile.login.link"
              >
                Sign in
              </Link>
              <Link
                to="/register"
                className="text-foreground/80 hover:text-primary text-sm py-2 transition-colors"
                onClick={() => setMobileOpen(false)}
                data-ocid="nav.mobile.register.link"
              >
                Register
              </Link>
            </>
          )}
          <Link
            to="/staff"
            className="text-foreground/40 hover:text-foreground/70 text-xs py-2 transition-colors"
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
