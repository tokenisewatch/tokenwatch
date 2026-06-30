"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useConnection } from "wagmi";
import { ConnectWallet } from "./ConnectWallet";
import { NetworkBadge } from "./NetworkBadge";
import { useIsOwner, useContractOwner } from "@/hooks/useWatchVault";

const publicLinks = [
  { href: "/", label: "Watches" },
  { href: "/portfolio", label: "Portfolio" },
];

const adminLink = { href: "/admin", label: "Admin" };

export function Navbar() {
  const pathname = usePathname();
  const { isConnected } = useConnection();
  const isOwner = useIsOwner();
  const { isLoading: ownerLoading } = useContractOwner();

  const links =
    isConnected && isOwner && !ownerLoading
      ? [...publicLinks, adminLink]
      : publicLinks;

  return (
    <header className="sticky top-0 z-50 border-b border-zinc-800/80 bg-[#0a0a0a]/95 backdrop-blur-md">
      <div className="mx-auto grid max-w-7xl grid-cols-[1fr_auto_1fr] items-center gap-4 px-6 py-4">
        <Link href="/" className="text-xl font-semibold tracking-tight">
          <span className="text-orange-500">Token</span>
          <span className="text-white">Watch</span>
        </Link>

        <nav className="flex items-center gap-8">
          {links.map((link) => {
            const active =
              link.href === "/"
                ? pathname === "/"
                : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`relative text-sm font-medium transition ${
                  active
                    ? "text-orange-400"
                    : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                {link.label}
                {active && (
                  <span className="absolute -bottom-[1.35rem] left-0 right-0 h-0.5 bg-orange-500" />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center justify-end gap-3">
          <NetworkBadge />
          <ConnectWallet />
        </div>
      </div>
    </header>
  );
}
