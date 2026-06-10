import { useState } from "react";
import { KeyRound, Loader2, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  demoVaultAccesses,
  type DemoVaultAccess,
} from "@/features/infini/infini-mock-data";
import {
  explainVaultAccess,
  prepareVaultChecklist,
} from "@/services/vault.service";

type VaultAction = "explain" | "checklist";

type VaultActionState = {
  accessId: string;
  action: VaultAction;
  result: string;
} | null;

function getActionLabel(action: VaultAction) {
  switch (action) {
    case "explain":
      return "Explication de l’accès";
    case "checklist":
      return "Checklist sécurité";
    default:
      return "Résultat BrainiaK";
  }
}

function getStatusClass(status: DemoVaultAccess["status"]) {
  switch (status) {
    case "connecté":
      return "border-emerald-500/30 bg-emerald-500/10 text-emerald-200";
    case "à vérifier":
      return "border-amber-500/30 bg-amber-500/10 text-amber-200";
    case "non configuré":
      return "border-rose-500/30 bg-rose-500/10 text-rose-200";
    default:
      return "border-cyan-500/30 bg-cyan-500/10 text-cyan-200";
  }
}

function buildVaultContext(access: DemoVaultAccess) {
  return {
    platform: access.platform,
    username: access.username,
    status: access.status,
    lastUsed: access.lastUsed,
  };
}

export function VaultDashboard() {
  const [activeResult, setActiveResult] = useState<VaultActionState>(null);
  const [loadingAction, setLoadingAction] = useState<{
    accessId: string;
    action: VaultAction;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function runVaultAction(access: DemoVaultAccess, action: VaultAction) {
    setError(null);
    setLoadingAction({ accessId: access.id, action });

    const context = buildVaultContext(access);

    try {
      const result =
        action === "explain"
          ? await explainVaultAccess(context)
          : await prepareVaultChecklist(context);

      setActiveResult({
        accessId: access.id,
        action,
        result,
      });
    } catch (err) {
      console.error("Action coffre-fort BrainiaK échouée :", err);
      setError(
        "BrainiaK n’a pas pu analyser cet accès pour le moment. Vous pouvez réessayer.",
      );
    } finally {
      setLoadingAction(null);
    }
  }

  function isLoading(accessId: string, action: VaultAction) {
    return loadingAction?.accessId === accessId && loadingAction.action === action;
  }

  return (
    <section className="min-h-full bg-[var(--surface-0)] px-8 py-6">
      <div className="mx-auto grid w-full max-w-[1500px] gap-6 xl:grid-cols-[minmax(0,1fr)_460px]">
        <div className="space-y-6">
          <header className="rounded-3xl border border-[var(--border)] bg-[var(--surface-1)] p-6">
            <p className="text-xs font-medium uppercase tracking-[0.22em] text-cyan-300">
              Coffre-fort
            </p>

            <h1 className="mt-2 text-2xl font-semibold text-[var(--text-primary)]">
              Accès sécurisés
            </h1>

            <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--text-secondary)]">
              BrainiaK peut expliquer l’usage d’un accès et préparer une
              checklist de sécurité. Les mots de passe ne sont jamais affichés
              en clair.
            </p>
          </header>

          {error ? (
            <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-100">
              {error}
            </div>
          ) : null}

          <div className="grid gap-4">
            {demoVaultAccesses.map((access) => (
              <article
                key={access.id}
                className="rounded-3xl border border-[var(--border)] bg-[var(--surface-1)] p-5"
              >
                <div className="flex flex-col justify-between gap-4 lg:flex-row">
                  <div>
                    <span
                      className={[
                        "rounded-full border px-3 py-1 text-xs font-medium",
                        getStatusClass(access.status),
                      ].join(" ")}
                    >
                      {access.status}
                    </span>

                    <h2 className="mt-5 text-lg font-semibold text-[var(--text-primary)]">
                      {access.platform}
                    </h2>

                    <p className="mt-1 text-sm text-[var(--text-secondary)]">
                      Identifiant : {access.username}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] px-4 py-3 text-sm text-[var(--text-secondary)]">
                    Dernière utilisation
                    <div className="mt-1 font-medium text-[var(--text-primary)]">
                      {access.lastUsed}
                    </div>
                  </div>
                </div>

                <div className="mt-5 rounded-2xl border border-cyan-500/20 bg-cyan-500/10 p-4 text-sm leading-6 text-cyan-100">
                  Les informations sensibles restent protégées. BrainiaK ne doit
                  jamais afficher de mot de passe en clair.
                </div>

                <div className="mt-5 flex flex-wrap gap-2">
                  <Button
                    type="button"
                    onClick={() => void runVaultAction(access, "explain")}
                    disabled={Boolean(loadingAction)}
                    className="bg-[var(--surface-3)] text-[var(--text-primary)] hover:bg-cyan-500/10 hover:text-cyan-200"
                  >
                    {isLoading(access.id, "explain") ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <KeyRound className="mr-2 h-4 w-4" />
                    )}
                    Expliquer l’accès
                  </Button>

                  <Button
                    type="button"
                    onClick={() => void runVaultAction(access, "checklist")}
                    disabled={Boolean(loadingAction)}
                    className="bg-[var(--surface-3)] text-[var(--text-primary)] hover:bg-cyan-500/10 hover:text-cyan-200"
                  >
                    {isLoading(access.id, "checklist") ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <ShieldCheck className="mr-2 h-4 w-4" />
                    )}
                    Checklist sécurité
                  </Button>
                </div>
              </article>
            ))}
          </div>
        </div>

        <aside className="h-fit rounded-3xl border border-[var(--border)] bg-[var(--surface-1)] p-5 xl:sticky xl:top-20">
          <p className="text-xs font-medium uppercase tracking-[0.22em] text-cyan-300">
            Résultat BrainiaK
          </p>

          {activeResult ? (
            <>
              <h2 className="mt-3 text-lg font-semibold text-[var(--text-primary)]">
                {getActionLabel(activeResult.action)}
              </h2>

              <div className="mt-4 whitespace-pre-wrap rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] p-4 text-sm leading-7 text-[var(--text-primary)]">
                {activeResult.result}
              </div>

              <div className="mt-4 rounded-2xl border border-amber-500/20 bg-amber-500/10 p-4 text-sm text-amber-100">
                Toute utilisation d’un accès sensible doit rester tracée et
                validée selon les règles du cabinet.
              </div>
            </>
          ) : (
            <div className="mt-4 rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] p-4 text-sm leading-6 text-[var(--text-secondary)]">
              Sélectionnez une action pour expliquer l’usage d’un accès ou
              préparer une checklist de sécurité avec BrainiaK.
            </div>
          )}
        </aside>
      </div>
    </section>
  );
}