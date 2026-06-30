import Link from "next/link";
import { formatEth } from "@/lib/eth";
import { watchStatus, type Watch } from "@/lib/contract";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { ProgressBar } from "@/components/ui/ProgressBar";

type WatchCardProps = {
  watch: Watch;
};

export function WatchCard({ watch }: WatchCardProps) {
  const status = watchStatus(watch);
  const soldPct =
    watch.totalShares > 0n
      ? Number((watch.sharesSold * 100n) / watch.totalShares)
      : 0;
  const sharePrice =
    watch.totalShares > 0n ? watch.purchasePrice / watch.totalShares : 0n;
  const returnPct =
    watch.sold && watch.purchasePrice > 0n
      ? Number(
          ((watch.salePrice - watch.purchasePrice) * 10000n) /
            watch.purchasePrice
        ) / 100
      : 0;

  return (
    <article className="card overflow-hidden transition hover:border-zinc-700">
      <div className="flex flex-col md:flex-row">
        <div className="relative h-48 w-full shrink-0 bg-gradient-to-br from-amber-950/40 to-zinc-900 md:h-auto md:w-72">
          {watch.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={watch.imageUrl}
              alt={`${watch.brand} ${watch.model}`}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full min-h-[12rem] items-center justify-center text-zinc-600">
              No image
            </div>
          )}
        </div>

        <div className="flex flex-1 flex-col p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-xl font-semibold text-zinc-100">
                {watch.brand} {watch.model}
              </h3>
              <p className="mt-1 text-sm text-zinc-500">
                {watch.model} · {watch.year.toString()}
              </p>
            </div>
            <StatusBadge status={status} />
          </div>

          <div className="mt-5 grid grid-cols-2 gap-6 sm:grid-cols-3">
            <div>
              <p className="text-xs text-zinc-500">Total Value</p>
              <p className="mt-0.5 font-semibold text-zinc-100">
                {formatEth(watch.purchasePrice)} ETH
              </p>
            </div>
            {watch.sold ? (
              <>
                <div>
                  <p className="text-xs text-zinc-500">Final Sale Price</p>
                  <p className="mt-0.5 font-semibold text-zinc-100">
                    {formatEth(watch.salePrice)} ETH
                  </p>
                </div>
                <div>
                  <p className="text-xs text-zinc-500">Total Return</p>
                  <p className="mt-0.5 font-semibold text-emerald-400">
                    {returnPct >= 0 ? "+" : ""}
                    {returnPct.toFixed(1)}%
                  </p>
                </div>
              </>
            ) : (
              <>
                <div>
                  <p className="text-xs text-zinc-500">Price per Share</p>
                  <p className="mt-0.5 font-semibold text-zinc-100">
                    {formatEth(sharePrice)} ETH
                  </p>
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <div className="flex items-center justify-between text-xs text-zinc-500">
                    <span>Shares Sold</span>
                    <span className="text-zinc-300">
                      {watch.sharesSold.toString()} / {watch.totalShares.toString()}{" "}
                      <span className="text-orange-400">({soldPct}%)</span>
                    </span>
                  </div>
                  <ProgressBar value={soldPct} className="mt-2" />
                </div>
              </>
            )}
          </div>

          <div className="mt-auto flex gap-3 pt-6">
            <Link
              href={`/watch/${watch.id.toString()}`}
              className="btn-secondary flex-1 px-4 py-2.5 text-center text-sm font-medium"
            >
              {watch.sold ? "View History" : "View Details"}
            </Link>
            {!watch.sold && (
              <Link
                href={`/watch/${watch.id.toString()}`}
                className="btn-primary flex-1 px-4 py-2.5 text-center text-sm font-medium"
              >
                Invest Now
              </Link>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
