import type { ReactNode } from "react";

type StatCardProps = {
  icon: ReactNode;
  label: string;
  value: string;
  subtext?: string;
  trend?: string;
  trendPositive?: boolean;
};

export function StatCard({
  icon,
  label,
  value,
  subtext,
  trend,
  trendPositive,
}: StatCardProps) {
  return (
    <div className="card flex items-start gap-4 p-5">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-orange-500/10 text-orange-500">
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm text-zinc-500">{label}</p>
        <div className="mt-1 flex items-baseline gap-2">
          <p className="text-2xl font-semibold text-zinc-100">{value}</p>
          {trend && (
            <span
              className={`text-sm font-medium ${
                trendPositive ? "text-emerald-400" : "text-red-400"
              }`}
            >
              {trend}
            </span>
          )}
        </div>
        {subtext && <p className="mt-0.5 text-xs text-zinc-600">{subtext}</p>}
      </div>
    </div>
  );
}
