type ProgressBarProps = {
  value: number;
  className?: string;
};

export function ProgressBar({ value, className = "" }: ProgressBarProps) {
  const pct = Math.min(100, Math.max(0, value));
  return (
    <div className={`h-1.5 w-full overflow-hidden rounded-full bg-zinc-800 ${className}`}>
      <div
        className="h-full rounded-full bg-orange-500 transition-all duration-500"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
