import Link from "next/link";
import { formatEth } from "@/lib/eth";
import { watchStatus, type Watch } from "@/lib/contract";

type WatchCardProps = {
  watch: Watch;
  remaining?: bigint;
};

export function WatchCard({ watch, remaining }: WatchCardProps) {
  const status = watchStatus(watch);
  const remainingShares = remaining ?? watch.totalShares - watch.sharesSold;

  return (
    <Link
      href={`/watch/${watch.id.toString()}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900 transition hover:border-amber-600/50 hover:shadow-lg hover:shadow-amber-900/10"
    >
      <div className="relative aspect-[4/3] bg-zinc-800">
        {watch.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={watch.imageUrl}
            alt={`${watch.brand} ${watch.model}`}
            className="h-full w-full object-cover transition group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-zinc-600">
            No image
          </div>
        )}
        <span
          className={`absolute right-3 top-3 rounded-full px-2.5 py-1 text-xs font-medium ${
            status === "Active"
              ? "bg-emerald-500/20 text-emerald-300"
              : "bg-zinc-700/80 text-zinc-300"
          }`}
        >
          {status}
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-2 p-5">
        <h3 className="text-lg font-medium text-zinc-100">
          {watch.brand} {watch.model}
        </h3>
        <p className="text-sm text-zinc-500">{watch.year.toString()}</p>
        <div className="mt-auto flex items-end justify-between pt-3">
          <div>
            <p className="text-xs text-zinc-500">Purchase Price</p>
            <p className="text-base font-medium text-amber-500">
              {formatEth(watch.purchasePrice)} ETH
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-zinc-500">Available</p>
            <p className="text-base text-zinc-200">
              {remainingShares.toString()} shares
            </p>
          </div>
        </div>
      </div>
    </Link>
  );
}
