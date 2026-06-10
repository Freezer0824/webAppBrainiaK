import { Button } from "@/components/ui/button";
import type { AppView } from "@/features/infini/infini-types";
import type { InfiniWorkflow } from "@/features/infini/infini-mock-data";

type WorkflowCardProps = {
  workflow: InfiniWorkflow;
  onOpen: (view: AppView) => void;
};

function getStatusLabel(status: InfiniWorkflow["status"]) {
  switch (status) {
    case "ready":
      return "Prêt";
    case "pending":
      return "À préparer";
    case "warning":
      return "Validation requise";
    default:
      return "À vérifier";
  }
}

function getStatusClass(status: InfiniWorkflow["status"]) {
  switch (status) {
    case "ready":
      return "border-emerald-500/30 bg-emerald-500/10 text-emerald-200";
    case "pending":
      return "border-cyan-500/30 bg-cyan-500/10 text-cyan-200";
    case "warning":
      return "border-amber-500/30 bg-amber-500/10 text-amber-200";
    default:
      return "border-[var(--border)] bg-[var(--surface-2)] text-[var(--text-secondary)]";
  }
}

export function WorkflowCard({ workflow, onOpen }: WorkflowCardProps) {
  const Icon = workflow.icon;

  return (
    <article className="rounded-3xl border border-[var(--border)] bg-[var(--surface-1)] p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-cyan-500/30 hover:bg-[var(--surface-2)]">
      <div className="flex items-start justify-between gap-4">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-cyan-500/20 bg-cyan-500/10">
          <Icon className="h-5 w-5 text-cyan-200" />
        </div>

        <span
          className={[
            "rounded-full border px-3 py-1 text-xs font-medium",
            getStatusClass(workflow.status),
          ].join(" ")}
        >
          {getStatusLabel(workflow.status)}
        </span>
      </div>

      <h3 className="mt-5 text-base font-semibold text-[var(--text-primary)]">
        {workflow.title}
      </h3>

      <p className="mt-2 min-h-[48px] text-sm leading-6 text-[var(--text-secondary)]">
        {workflow.description}
      </p>

      <Button
        type="button"
        onClick={() => onOpen(workflow.targetView)}
        className="mt-5 w-full justify-center bg-[var(--surface-3)] text-[var(--text-primary)] hover:bg-cyan-500/10 hover:text-cyan-200"
      >
        {workflow.actionLabel}
      </Button>
    </article>
  );
}