"use client";

import { useConnection } from "wagmi";
import {
  RegisterWatchForm,
  SellWatchForm,
  WatchesTable,
} from "@/components/AdminForms";
import { useIsOwner } from "@/hooks/useWatchVault";

export default function AdminPage() {
  const { isConnected, address } = useConnection();
  const isOwner = useIsOwner();

  if (!isConnected) {
    return (
      <div className="rounded-xl border border-zinc-800 bg-zinc-900 px-6 py-12 text-center">
        <h1 className="text-2xl font-semibold text-zinc-100">Admin Dashboard</h1>
        <p className="mt-4 text-zinc-400">
          Connect the platform owner wallet to manage watches.
        </p>
      </div>
    );
  }

  if (!isOwner) {
    return (
      <div className="rounded-xl border border-red-900/50 bg-red-950/20 px-6 py-12 text-center">
        <h1 className="text-2xl font-semibold text-zinc-100">Unauthorized</h1>
        <p className="mt-4 text-zinc-400">
          Connected wallet ({address?.slice(0, 10)}...) is not the contract
          owner.
        </p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="mb-2 text-3xl font-semibold text-zinc-100">
        Admin Dashboard
      </h1>
      <p className="mb-8 text-zinc-400">
        Register watches, record sales, and deposit sale proceeds on-chain.
      </p>

      <div className="flex flex-col gap-8">
        <RegisterWatchForm />
        <SellWatchForm />
        <div>
          <h3 className="mb-4 text-lg font-medium text-zinc-100">All Watches</h3>
          <WatchesTable />
        </div>
      </div>
    </div>
  );
}
