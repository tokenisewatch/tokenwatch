"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useConnection } from "wagmi";
import { useIsOwner, useContractOwner } from "@/hooks/useWatchVault";

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isConnected } = useConnection();
  const isOwner = useIsOwner();
  const { isLoading: ownerLoading } = useContractOwner();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (!isConnected) {
      router.replace("/");
      return;
    }
    if (ownerLoading) return;
    if (!isOwner) {
      router.replace("/");
      return;
    }
    setChecked(true);
  }, [isConnected, isOwner, ownerLoading, router]);

  if (!checked) {
    return (
      <div className="card px-6 py-16 text-center">
        <p className="text-zinc-500">Checking access...</p>
      </div>
    );
  }

  return <>{children}</>;
}
