"use client";

import { useEffect, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useWalletStore } from "@/store/wallet-store";

export function Providers({ children }: { children: React.ReactNode }) {
  // rehydrate persisted wallet state after mount (skipHydration in store)
  useEffect(() => {
    useWalletStore.persist.rehydrate();
  }, []);
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { staleTime: 15_000, retry: 1, refetchOnWindowFocus: false },
        },
      }),
  );
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
