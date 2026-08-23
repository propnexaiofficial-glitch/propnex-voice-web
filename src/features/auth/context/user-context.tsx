"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";

type UserContextType = {
  user: any | null;
  mainBalance: number;
  mainUsed: number;
  refreshUser: () => void;
};

const UserContext = createContext<UserContextType>({
  user: null,
  mainBalance: 0,
  mainUsed: 0,
  refreshUser: () => {},
});

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [mainBalance, setMainBalance] = useState(0);
  const [mainUsed, setMainUsed] = useState(0);

  const refreshUser = () => {
    try {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        const parsed = JSON.parse(storedUser);
        setUser(parsed);
        if (parsed.creditBalance) {
          setMainBalance(parsed.creditBalance.creditsRemaining || 0);
          setMainUsed(parsed.creditBalance.creditsUsed || 0);
        }
      }
    } catch {}
  };

  useEffect(() => {
    // Initial load
    refreshUser();

    // Listen to custom event for manual syncs across the app
    window.addEventListener("user-updated", refreshUser);
    
    // Auto-refresh quietly every 30 seconds to stay updated
    const interval = setInterval(refreshUser, 30_000);

    return () => {
      window.removeEventListener("user-updated", refreshUser);
      clearInterval(interval);
    };
  }, []);

  return (
    <UserContext.Provider value={{ user, mainBalance, mainUsed, refreshUser }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUserContext() {
  return useContext(UserContext);
}
