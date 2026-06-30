"use client";

import { useMemo, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { WatchCard } from "@/components/WatchCard";
import { useAllWatches } from "@/hooks/useWatchVault";
import { WATCH_VAULT_ADDRESS } from "@/lib/contract";

type Filter = "all" | "active" | "sold";
type Sort = "newest" | "oldest" | "value-high" | "value-low";

export function HomeContent() {
  const searchParams = useSearchParams();
  const { data: watches, isLoading, error } = useAllWatches();
  const [filter, setFilter] = useState<Filter>("active");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<Sort>("newest");

  useEffect(() => {
    const f = searchParams.get("filter");
    if (f === "sold" || f === "active" || f === "all") {
      setFilter(f);
    }
  }, [searchParams]);

  const noContract =
    WATCH_VAULT_ADDRESS === "0x0000000000000000000000000000000000000000";

  const filtered = useMemo(() => {
    if (!watches) return [];

    let list = [...watches];

    if (filter === "active") {
      list = list.filter((w) => !w.sold);
    } else if (filter === "sold") {
      list = list.filter((w) => w.sold);
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (w) =>
          w.brand.toLowerCase().includes(q) ||
          w.model.toLowerCase().includes(q)
      );
    }

    list.sort((a, b) => {
      if (sort === "newest") return Number(b.id - a.id);
      if (sort === "oldest") return Number(a.id - b.id);
      if (sort === "value-high")
        return Number(b.purchasePrice - a.purchasePrice);
      return Number(a.purchasePrice - b.purchasePrice);
    });

    return list;
  }, [watches, filter, search, sort]);

  const tabs: { id: Filter; label: string }[] = [
    { id: "all", label: "All Watches" },
    { id: "active", label: "Active" },
    { id: "sold", label: "Sold" },
  ];

  return (
    <div>
      <section className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-100">
          Luxury Watches
        </h1>
        <p className="mt-2 max-w-3xl text-zinc-500">
          Invest in fractional shares of tokenized luxury watches. When the
          platform sells a watch, proceeds are distributed proportionally to all
          investors.
        </p>
      </section>

      {noContract && (
        <div className="mb-6 rounded-lg border border-orange-500/30 bg-orange-500/10 px-4 py-3 text-sm text-orange-200">
          Set <code>NEXT_PUBLIC_WATCH_VAULT_ADDRESS</code> in{" "}
          <code>.env.local</code> after deploying the contract.
        </div>
      )}

      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFilter(tab.id)}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                filter === tab.id
                  ? "tab-active"
                  : "border border-transparent text-zinc-400 hover:text-zinc-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500">
              ⌕
            </span>
            <input
              type="search"
              placeholder="Search watches..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field w-56 pl-9 text-sm"
            />
          </div>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as Sort)}
            className="input-field w-auto text-sm"
          >
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="value-high">Highest Value</option>
            <option value="value-low">Lowest Value</option>
          </select>
        </div>
      </div>

      {isLoading && (
        <p className="py-12 text-center text-zinc-500">Loading watches...</p>
      )}
      {error && (
        <p className="py-12 text-center text-red-400">
          Failed to load watches: {error.message}
        </p>
      )}

      {!isLoading && filtered.length === 0 && (
        <div className="card px-6 py-16 text-center">
          <p className="text-zinc-400">No watches found.</p>
          <p className="mt-2 text-sm text-zinc-600">
            {filter !== "all"
              ? `Try switching to "All Watches" or register one from Admin.`
              : "An admin can register the first watch from the Admin dashboard."}
          </p>
        </div>
      )}

      <div className="flex flex-col gap-5">
        {filtered.map((watch) => (
          <WatchCard key={watch.id.toString()} watch={watch} />
        ))}
      </div>
    </div>
  );
}
