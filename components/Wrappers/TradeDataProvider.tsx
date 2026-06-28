"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useTradeStore } from "@/store/trade-store";

export default function TradeDataProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { status } = useSession();
  const initializeData = useTradeStore((s) => s.initializeData);
  const resetStore = useTradeStore((s) => s.resetStore);
  const isInitialized = useTradeStore((s) => s.isInitialized);
  const isLoading = useTradeStore((s) => s.isLoading);

  useEffect(() => {
    if (status === "authenticated" && !isInitialized) {
      initializeData();
    }
    if (status === "unauthenticated") {
      resetStore();
    }
  }, [status, isInitialized, initializeData, resetStore]);

  if (status === "loading" || (status === "authenticated" && !isInitialized && isLoading)) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative h-12 w-12">
            <div className="absolute inset-0 rounded-full border-2 border-primary/20" />
            <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-primary animate-spin" />
          </div>
          <p className="text-sm text-muted-foreground">Loading your journal...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
