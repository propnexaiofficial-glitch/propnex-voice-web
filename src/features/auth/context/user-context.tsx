"use client";

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from "react";

type UserContextType = {
  user: any | null;
  mainBalance: number;
  mainUsed: number;
  isLoading: boolean;
  refreshUser: () => void;
};

const UserContext = createContext<UserContextType>({
  user: null,
  mainBalance: 0,
  mainUsed: 0,
  isLoading: true,
  refreshUser: () => {},
});

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [mainBalance, setMainBalance] = useState(0);
  const [mainUsed, setMainUsed] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const applyUser = useCallback((parsed: any) => {
    setUser(parsed);
    if (parsed.creditBalance) {
      setMainBalance(parsed.creditBalance.creditsRemaining || 0);
      setMainUsed(parsed.creditBalance.creditsUsed || 0);
    }
  }, []);

  const fetchFreshUser = useCallback(async () => {
    try {
      const token = localStorage.getItem("accessToken") || localStorage.getItem("access_token");
      if (!token) {
        setIsLoading(false);
        return;
      }
      const res = await fetch("/api/users/me", {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      });
      if (res.ok) {
        const data = await res.json();
        if (data.user) {
          localStorage.setItem("user", JSON.stringify(data.user));
          applyUser(data.user);
        }
      }
    } catch {}
    setIsLoading(false);
  }, [applyUser]);

  const refreshUser = useCallback(() => {
    // Read from localStorage immediately for instant display
    try {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        const parsed = JSON.parse(storedUser);
        applyUser(parsed);
      }
    } catch {}
    // Then fetch fresh data from API
    fetchFreshUser();
  }, [applyUser, fetchFreshUser]);

  useEffect(() => {
    // On mount: load from localStorage immediately (no flash), then fetch fresh
    try {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        const parsed = JSON.parse(storedUser);
        applyUser(parsed);
        setIsLoading(false); // We have cached data, no need to show loading
      }
    } catch {}

    // Always fetch fresh data from the API
    fetchFreshUser();

    // Listen to custom event for manual syncs across the app
    window.addEventListener("user-updated", refreshUser);

    // Auto-refresh quietly every 60 seconds to stay updated
    const interval = setInterval(fetchFreshUser, 60_000);

    return () => {
      window.removeEventListener("user-updated", refreshUser);
      clearInterval(interval);
    };
  }, []);

  return (
    <UserContext.Provider value={{ user, mainBalance, mainUsed, isLoading, refreshUser }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUserContext() {
  return useContext(UserContext);
}
