interface StatusBadgeProps {
  tone: "primary" | "emerald" | "amber" | "zinc" | "rose";
  children: React.ReactNode;
}

const toneClasses: Record<StatusBadgeProps["tone"], string> = {
  primary:
    "bg-primary-400/15 text-primary-800 ring-primary-400/20 dark:bg-primary-400/20 dark:text-primary-200",
  emerald:
    "bg-emerald-500/12 text-emerald-700 ring-emerald-500/20 dark:bg-emerald-500/18 dark:text-emerald-300",
  amber:
    "bg-amber-500/12 text-amber-700 ring-amber-500/20 dark:bg-amber-500/18 dark:text-amber-300",
  rose: "bg-rose-500/12 text-rose-700 ring-rose-500/20 dark:bg-rose-500/18 dark:text-rose-300",
  zinc: "bg-zinc-900/6 text-zinc-700 ring-zinc-900/10 dark:bg-white/8 dark:text-zinc-300",
};

export function StatusBadge({ tone, children }: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${toneClasses[tone]}`}
    >
      {children}
    </span>
  );
}
