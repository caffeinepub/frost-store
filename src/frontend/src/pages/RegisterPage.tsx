import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { Link, useNavigate } from "@tanstack/react-router";
import { CheckCircle, Loader2, Snowflake, UserPlus } from "lucide-react";
import { motion } from "motion/react";
import { useEffect } from "react";

export function RegisterPage() {
  const { isLoggedIn, login, isLoggingIn } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoggedIn) {
      navigate({ to: "/profile" });
    }
  }, [isLoggedIn, navigate]);

  const perks = [
    "Track your orders in real-time",
    "Save your delivery address",
    "Buy and redeem gift cards",
    "View full order history",
  ];

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-sm"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl frost-gradient mb-4">
            <Snowflake className="h-8 w-8 text-white" strokeWidth={1.5} />
          </div>
          <h1 className="font-display text-2xl font-bold text-foreground">
            Create your account
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Join Gardening World for a premium shopping experience
          </p>
        </div>

        {/* Perks */}
        <div className="crystal-card rounded-2xl p-8 space-y-6">
          <ul className="space-y-3">
            {perks.map((perk) => (
              <li key={perk} className="flex items-center gap-3 text-sm">
                <CheckCircle className="h-4 w-4 text-accent shrink-0" />
                <span className="text-foreground/80">{perk}</span>
              </li>
            ))}
          </ul>

          <Button
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-12 gap-3 font-semibold"
            onClick={login}
            disabled={isLoggingIn}
            data-ocid="register.submit.button"
          >
            {isLoggingIn ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Creating account…
              </>
            ) : (
              <>
                <UserPlus className="h-5 w-5" />
                Register with Internet Identity
              </>
            )}
          </Button>

          <p className="text-xs text-muted-foreground text-center leading-relaxed">
            Registration is free and instant via Internet Identity — no
            passwords required.
          </p>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-card px-2 text-muted-foreground">
                Already have an account?
              </span>
            </div>
          </div>

          <Link to="/login">
            <Button
              variant="outline"
              className="w-full h-11"
              data-ocid="register.login.link"
            >
              Sign in instead
            </Button>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
