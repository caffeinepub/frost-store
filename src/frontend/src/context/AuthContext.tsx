import { type ReactNode, createContext, useContext } from "react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

interface AuthContextType {
  isLoggedIn: boolean;
  isInitializing: boolean;
  principal: string | null;
  login: () => void;
  logout: () => void;
  isLoggingIn: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { identity, login, clear, isInitializing, isLoggingIn } =
    useInternetIdentity();

  const isLoggedIn = !!identity && !identity.getPrincipal().isAnonymous();
  const principal = isLoggedIn ? identity!.getPrincipal().toString() : null;

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn,
        isInitializing,
        principal,
        login,
        logout: clear,
        isLoggingIn,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
