import { cn } from "@/lib/utils";

type PipelinePhaseBadgeProps = {
  status: "idle" | "running" | "done" | "error";
  children: React.ReactNode;
};

export function PipelinePhaseBadge({
  status,
  children,
}: PipelinePhaseBadgeProps) {
  return (
    <span
      className={cn(
        "rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.14em]",
        status === "running" && "bg-cyan-500/10 text-cyan-300",
        status === "done" && "bg-emerald-500/10 text-emerald-300",
        status === "error" && "bg-red-500/10 text-red-300",
        status === "idle" && "bg-white/5 text-[var(--text-secondary)]",
      )}
    >
      {children}
    </span>
  );
}