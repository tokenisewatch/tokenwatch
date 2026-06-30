import Link from "next/link";
import { ConnectWallet } from "./ConnectWallet";

const links = [
  { href: "/", label: "Watches" },
  { href: "/portfolio", label: "Portfolio" },
  { href: "/admin", label: "Admin" },
];

export function Navbar() {
  return (
    <header className="border-b border-zinc-800 bg-zinc-950/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <Link href="/" className="text-lg font-semibold tracking-wide text-amber-500">
          TokenWatch
        </Link>
        <nav className="flex items-center gap-6">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm text-zinc-400 transition hover:text-zinc-100"
            >
              {link.label}
            </Link>
          ))}
          <ConnectWallet />
        </nav>
      </div>
    </header>
  );
}
