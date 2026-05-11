import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

type DashboardShellProps = {
  title: string;
  description: string;
  routes: string[];
  connectionLabel?: string;
  onRefresh?: () => void;
};

export function DashboardShell({
  title,
  description,
  routes,
  connectionLabel = "Non vérifié",
  onRefresh,
}: DashboardShellProps) {
  return (
    <section className="scrollbar-brainiak min-h-0 flex-1 overflow-y-auto bg-[var(--surface-0)] p-6">
      <div className="mx-auto max-w-6xl space-y-6">
        <header className="rounded-3xl border border-[var(--border)] bg-[var(--surface-2)] p-6 shadow-xl">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.24em] text-cyan-300">
            Brainiak Control Console
          </p>

          <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
            <div>
              <h1 className="heading-brainiak text-3xl text-[var(--text-primary)]">
                {title}
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--text-secondary)]">
                {description}
              </p>
            </div>

            <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-1)] px-4 py-3 text-sm">
              <div className="text-xs uppercase tracking-[0.16em] text-[var(--text-secondary)]">
                État connexion
              </div>
              <div className="mt-1 font-medium text-[var(--text-primary)]">
                {connectionLabel}
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            {routes.map((route) => (
              <span
                key={route}
                className="rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-xs font-medium text-cyan-200"
              >
                {route}
              </span>
            ))}
          </div>
        </header>

        <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface-2)] p-5">
          <Button
            type="button"
            onClick={onRefresh}
            className="bg-[var(--surface-3)] text-[var(--text-primary)] hover:bg-cyan-500/10 hover:text-cyan-200"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Rafraîchir
          </Button>

          <div className="mt-5 rounded-2xl border border-[var(--border)] bg-[var(--surface-1)] p-5">
            <h2 className="text-sm font-semibold text-[var(--text-primary)]">
              Résultat
            </h2>
            <p className="mt-2 text-sm text-[var(--text-secondary)]">
              Aucun appel API effectué pour le moment.
            </p>
          </div>

          <div className="mt-4 rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4">
            <h3 className="text-sm font-semibold text-amber-200">
              Message d’erreur
            </h3>
            <p className="mt-1 text-sm text-amber-100/70">
              Aucun problème détecté.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}