"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Link2 } from "lucide-react";
import { Button, type ButtonProps } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { useWalletStore } from "@/store/wallet-store";

/** Opens the Stellar Wallets Kit modal directly and routes to /dashboard on success. */
export function useConnectWallet() {
  const router = useRouter();
  const { network, setDash } = useWalletStore();
  const [connecting, setConnecting] = useState(false);

  async function connect() {
    setConnecting(true);
    try {
      const { getWalletKit } = await import("@/lib/wallet-kit");
      const kit = getWalletKit(network);
      await kit.openModal({
        onWalletSelected: async (option) => {
          kit.setWallet(option.id);
          const { address } = await kit.getAddress();
          setDash({ publicKey: address, label: option.name, signer: "kit" });
          toast({ title: `${option.name} connected 🛸`, variant: "success" });
          router.push("/dashboard");
        },
      });
    } catch (e) {
      toast({
        title: "Connection failed",
        description: e instanceof Error ? e.message : String(e),
        variant: "destructive",
      });
    } finally {
      setConnecting(false);
    }
  }

  return { connect, connecting };
}

export function ConnectWalletButton({
  children,
  variant = "gold",
  size,
  className,
}: {
  children?: React.ReactNode;
  variant?: ButtonProps["variant"];
  size?: ButtonProps["size"];
  className?: string;
}) {
  const { connect, connecting } = useConnectWallet();
  return (
    <Button onClick={connect} disabled={connecting} variant={variant} size={size} className={className}>
      {connecting ? <Loader2 className="animate-spin" /> : <Link2 />}
      {children ?? "Connect Wallet"}
    </Button>
  );
}
