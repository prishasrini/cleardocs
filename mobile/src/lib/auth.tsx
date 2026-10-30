import { createContext, use, useCallback, useEffect, useMemo, useState, type PropsWithChildren } from "react";
import { api, ApiError } from "./api";
import { getItem, setItem } from "./storage";
import type { User } from "./types";

const TOKEN_KEY = "cleardocs_token";

type AuthState = {
  token: string | null;
  user: User | null;
  isLoading: boolean; // true while we check for a saved login on app start
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (name: string, email: string, password: string) => Promise<void>;
  signOut: () => void;
};

const AuthContext = createContext<AuthState | null>(null);

// Any screen can call useAuth() to get the user, the token, and the sign in/out functions
export function useAuth() {
  const value = use(AuthContext);
  if (!value) throw new Error("useAuth must be used inside <AuthProvider>");
  return value;
}

export function AuthProvider({ children }: PropsWithChildren) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // On app start: if a token was saved, check it's still valid and load the user
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const saved = await getItem(TOKEN_KEY);
      if (saved) {
        try {
          const { user } = await api.me(saved);
          if (!cancelled) {
            setToken(saved);
            setUser(user);
          }
        } catch (err) {
          // Expired or invalid token: forget it. (If the server is just unreachable, keep it.)
          if (err instanceof ApiError && err.status === 401) await setItem(TOKEN_KEY, null);
        }
      }
      if (!cancelled) setIsLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const saveSession = useCallback(async (newToken: string, newUser: User) => {
    await setItem(TOKEN_KEY, newToken);
    setToken(newToken);
    setUser(newUser);
  }, []);

  const signIn = useCallback(
    async (email: string, password: string) => {
      const res = await api.login(email, password);
      await saveSession(res.token, res.user);
    },
    [saveSession],
  );

  const signUp = useCallback(
    async (name: string, email: string, password: string) => {
      const res = await api.register(name, email, password);
      await saveSession(res.token, res.user);
    },
    [saveSession],
  );

  const signOut = useCallback(() => {
    setItem(TOKEN_KEY, null);
    setToken(null);
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ token, user, isLoading, signIn, signUp, signOut }),
    [token, user, isLoading, signIn, signUp, signOut],
  );

  return <AuthContext value={value}>{children}</AuthContext>;
}
