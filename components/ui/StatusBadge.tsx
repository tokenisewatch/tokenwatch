type StatusBadgeProps = {
  status: "Active" | "Sold" | "Closed";
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const styles =
    status === "Active"
      ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
      : "bg-zinc-700/50 text-zinc-400 border-zinc-600/50";

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${styles}`}
    >
      {status}
    </span>
  );
}
