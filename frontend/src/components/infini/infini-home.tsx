import { ArrowRight, CheckCircle2, ShieldCheck, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { AppView } from "@/features/infini/infini-types";
import {
  infiniKpis,
  infiniQuickActions,
  infiniWorkflows,
  type InfiniKpi,
} from "@/features/infini/infini-mock-data";
import { WorkflowCard } from "./workflow-card";

type InfiniHomeProps = {
  onViewChange: (view: AppView) => void;
};

function getKpiToneClass(tone: InfiniKpi["tone"]) {
  switch (tone) {
    case "success":
      return "border-emerald-500/30 bg-emerald-500/10 text-emerald-200";
    case "warning":
      return "border-amber-500/30 bg-amber-500/10 text-amber-200";
    case "danger":
      return "border-rose-500/30 bg-rose-500/10 text-rose-200";
    case "info":
    default:
      return "border-cyan-500/30 bg-cyan-500/10 text-cyan-200";
  }
}

export function InfiniHome({ onViewChange }: InfiniHomeProps) {
  return (
    <section className="min-h-full bg-[var(--surface-0)] px-8 py-6">
      <div className="mx-auto w-full max-w-[1500px] space-y-6">
        <header className="overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--surface-1)] shadow-sm">
          <div className="grid gap-6 p-6 lg:grid-cols-[1fr_320px] lg:p-8">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-xs font-medium text-cyan-200">
                <Sparkles className="h-3.5 w-3.5" />
                Espace Infini
              </div>

              <h1 className="mt-5 max-w-3xl text-3xl font-semibold tracking-tight text-[var(--text-primary)] lg:text-4xl">
                BrainiaK accompagne les opérations du cabinet.
              </h1>

              <p className="mt-4 max-w-2xl text-sm leading-6 text-[var(--text-secondary)]">
                Suivez les mails, dossiers clients, actions de conformité,
                RIBDDC et validations depuis un espace clair. BrainiaK prépare,
                vous gardez le contrôle.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <Button
                  type="button"
                  onClick={() => onViewChange("mailbox")}
                  className="bg-cyan-500 text-slate-950 hover:bg-cyan-400"
                >
                  Traiter les mails
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>

                <Button
                  type="button"
                  onClick={() => onViewChange("assistant")}
                  className="bg-[var(--surface-3)] text-[var(--text-primary)] hover:bg-cyan-500/10 hover:text-cyan-200"
                >
                  Ouvrir Assistant BrainiaK
                </Button>
              </div>
            </div>

            <aside className="rounded-3xl border border-[var(--border)] bg-[var(--surface-2)] p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-emerald-500/30 bg-emerald-500/10">
                  <ShieldCheck className="h-5 w-5 text-emerald-200" />
                </div>

                <div>
                  <h2 className="text-sm font-semibold text-[var(--text-primary)]">
                    Contrôle humain actif
                  </h2>
                  <p className="mt-1 text-xs text-[var(--text-secondary)]">
                    Aucune action sensible n’est envoyée sans validation.
                  </p>
                </div>
              </div>

              <div className="mt-5 space-y-3 text-sm">
                <div className="flex items-center gap-2 text-[var(--text-secondary)]">
                  <CheckCircle2 className="h-4 w-4 text-emerald-300" />
                  Brouillons avant envoi
                </div>
                <div className="flex items-center gap-2 text-[var(--text-secondary)]">
                  <CheckCircle2 className="h-4 w-4 text-emerald-300" />
                  Vérification des données COMPLISOFT
                </div>
                <div className="flex items-center gap-2 text-[var(--text-secondary)]">
                  <CheckCircle2 className="h-4 w-4 text-emerald-300" />
                  Validation obligatoire des RIBDDC
                </div>
              </div>
            </aside>
          </div>
        </header>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {infiniKpis.map((kpi) => (
            <article
              key={kpi.id}
              className="rounded-3xl border border-[var(--border)] bg-[var(--surface-1)] p-5"
            >
              <span
                className={[
                  "rounded-full border px-3 py-1 text-xs font-medium",
                  getKpiToneClass(kpi.tone),
                ].join(" ")}
              >
                {kpi.label}
              </span>

              <p className="mt-5 text-4xl font-semibold text-[var(--text-primary)]">
                {kpi.value}
              </p>

              <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
                {kpi.detail}
              </p>
            </article>
          ))}
        </div>

        <section className="rounded-3xl border border-[var(--border)] bg-[var(--surface-1)] p-6">
          <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.22em] text-cyan-300">
                Actions rapides
              </p>
              <h2 className="mt-2 text-xl font-semibold text-[var(--text-primary)]">
                Démarrer une tâche métier
              </h2>
              <p className="mt-2 text-sm text-[var(--text-secondary)]">
                Choisissez une action. BrainiaK prépare le travail, puis vous
                validez avant toute action sensible.
              </p>
            </div>
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {infiniQuickActions.map((action) => (
              <button
                key={action.id}
                type="button"
                onClick={() => onViewChange(action.targetView)}
                className="rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] p-4 text-left transition hover:border-cyan-500/30 hover:bg-cyan-500/10"
              >
                <h3 className="text-sm font-semibold text-[var(--text-primary)]">
                  {action.title}
                </h3>
                <p className="mt-2 text-xs leading-5 text-[var(--text-secondary)]">
                  {action.description}
                </p>
              </button>
            ))}
          </div>
        </section>

        <section>
          <div className="mb-4">
            <p className="text-xs font-medium uppercase tracking-[0.22em] text-cyan-300">
              Workflows
            </p>
            <h2 className="mt-2 text-xl font-semibold text-[var(--text-primary)]">
              Modules métier disponibles
            </h2>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {infiniWorkflows.map((workflow) => (
              <WorkflowCard
                key={workflow.id}
                workflow={workflow}
                onOpen={onViewChange}
              />
            ))}
          </div>
        </section>
      </div>
    </section>
  );
}