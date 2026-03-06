import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { Link, useNavigate } from "@tanstack/react-router";
import { Loader2, LogIn, Snowflake } from "lucide-react";
import { motion } from "motion/react";
import { useEffect } from "react";

export function LoginPage() {
  const { isLoggedIn, login, isLoggingIn } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoggedIn) {
      navigate({ to: "/profile" });
    }
  }, [isLoggedIn, navigate]);

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
            Welcome back
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Sign in to your Frost account
          </p>
        </div>

        {/* Card */}
        <div className="crystal-card rounded-2xl p-8 space-y-6">
          <div className="space-y-3">
            <Button
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-12 gap-3 font-semibold"
              onClick={login}
              disabled={isLoggingIn}
              data-ocid="login.submit.button"
            >
              {isLoggingIn ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Signing in…
                </>
              ) : (
                <>
                  <LogIn className="h-5 w-5" />
                  Sign In with Internet Identity
                </>
              )}
            </Button>

            <p className="text-xs text-muted-foreground text-center leading-relaxed">
              Frost uses Internet Identity — a secure, password-free
              authentication system.
            </p>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-card px-2 text-muted-foreground">
                New to Frost?
              </span>
            </div>
          </div>

          <Link to="/register">
            <Button
              variant="outline"
              className="w-full h-11"
              data-ocid="login.register.link"
            >
              Create an account
            </Button>
          </Link>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-6">
          Staff?{" "}
          <Link
            to="/staff"
            className="text-accent hover:underline"
            data-ocid="login.staff.link"
          >
            Staff Panel
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
