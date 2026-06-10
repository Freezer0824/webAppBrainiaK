import { useState } from "react";
import { CheckCircle2, Loader2, Settings2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  checkSettingsConfiguration,
  recommendSettingsNextSteps,
} from "@/services/settings.service";
import { env } from "@/lib/config/env";
import { isInfiniDemoModeEnabled } from "@/features/infini/infini-demo-mode";

type SettingsAction = "check" | "next";

type SettingsActionState = {
  action: SettingsAction;
  result: string;
} | null;

const settingsModules = [
  {
    label: "Boîte mail",
    status: "Connexion à compléter",
  },
  {
    label: "COMPLISOFT",
    status: "Connexion à vérifier",
  },
  {
    label: "Coffre-fort",
    status: "Actif",
  },
  {
    label: "Assistant BrainiaK",
    status: "Connecté au backend",
  },
];

function getActionLabel(action: SettingsAction) {
  switch (action) {
    case "check":
      return "Vérification de configuration";
    case "next":
      return "Prochaines étapes recommandées";
    default:
      return "Résultat BrainiaK";
  }
}

function getStatusClass(status: string) {
  const normalized = status.toLowerCase();

  if (normalized.includes("actif") || normalized.includes("connecté")) {
    return "border-emerald-500/30 bg-emerald-500/10 text-emerald-200";
  }

  if (normalized.includes("vérifier") || normalized.includes("compléter")) {
    return "border-amber-500/30 bg-amber-500/10 text-amber-200";
  }

  return "border-cyan-500/30 bg-cyan-500/10 text-cyan-200";
}

function buildSettingsContext() {
  return {
    modules: settingsModules,
    environment: {
      apiBaseUrl: env.apiBaseUrl,
      demoMode: isInfiniDemoModeEnabled(),
      tenantId: env.tenantId,
    },
  };
}

export function SettingsDashboard() {
  const [activeResult, setActiveResult] = useState<SettingsActionState>(null);
  const [loadingAction, setLoadingAction] = useState<SettingsAction | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);

  async function runSettingsAction(action: SettingsAction) {
    setError(null);
    setLoadingAction(action);

    const context = buildSettingsContext();

    try {
      const result =
        action === "check"
          ? await checkSettingsConfiguration(context)
          : await recommendSettingsNextSteps(context);

      setActiveResult({
        action,
        result,
      });
    } catch (err) {
      console.error("Action paramètres BrainiaK échouée :", err);
      setError(
        "BrainiaK n’a pas pu analyser la configuration pour le moment. Vous pouvez réessayer.",
      );
    } finally {
      setLoadingAction(null);
    }
  }

  return (
    <section className="min-h-full bg-[var(--surface-0)] px-8 py-6">
      <div className="mx-auto grid w-full max-w-[1500px] gap-6 xl:grid-cols-[minmax(0,1fr)_460px]">
        <div className="space-y-6">
          <header className="rounded-3xl border border-[var(--border)] bg-[var(--surface-1)] p-6">
            <p className="text-xs font-medium uppercase tracking-[0.22em] text-cyan-300">
              Paramètres
            </p>

            <h1 className="mt-2 text-2xl font-semibold text-[var(--text-primary)]">
              Connexions et sécurité
            </h1>

            <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--text-secondary)]">
              BrainiaK peut vérifier l’état de configuration de l’espace Infini
              et recommander les prochaines étapes avant utilisation client.
            </p>
          </header>

          {error ? (
            <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-100">
              {error}
            </div>
          ) : null}

          <div className="grid gap-4 lg:grid-cols-2">
            {settingsModules.map((module) => (
              <article
                key={module.label}
                className="rounded-3xl border border-[var(--border)] bg-[var(--surface-1)] p-5"
              >
                <span
                  className={[
                    "rounded-full border px-3 py-1 text-xs font-medium",
                    getStatusClass(module.status),
                  ].join(" ")}
                >
                  {module.status}
                </span>

                <h2 className="mt-5 text-lg font-semibold text-[var(--text-primary)]">
                  {module.label}
                </h2>

                <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
                  État actuel : {module.status}
                </p>
              </article>
            ))}
          </div>

          <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface-1)] p-5">
            <h2 className="text-lg font-semibold text-[var(--text-primary)]">
              Actions de configuration
            </h2>

            <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
              Utilisez BrainiaK pour contrôler rapidement les points de
              configuration avant déploiement ou présentation client.
            </p>

            <div className="mt-5 flex flex-wrap gap-2">
              <Button
                type="button"
                onClick={() => void runSettingsAction("check")}
                disabled={Boolean(loadingAction)}
                className="bg-[var(--surface-3)] text-[var(--text-primary)] hover:bg-cyan-500/10 hover:text-cyan-200"
              >
                {loadingAction === "check" ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                )}
                Vérifier configuration
              </Button>

              <Button
                type="button"
                onClick={() => void runSettingsAction("next")}
                disabled={Boolean(loadingAction)}
                className="bg-[var(--surface-3)] text-[var(--text-primary)] hover:bg-cyan-500/10 hover:text-cyan-200"
              >
                {loadingAction === "next" ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Settings2 className="mr-2 h-4 w-4" />
                )}
                Recommander prochaines étapes
              </Button>
            </div>
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
                Toute modification de configuration sensible doit être validée
                avant utilisation en production.
              </div>
            </>
          ) : (
            <div className="mt-4 rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] p-4 text-sm leading-6 text-[var(--text-secondary)]">
              Lancez une vérification ou demandez des recommandations pour
              afficher ici l’analyse BrainiaK.
            </div>
          )}
        </aside>
      </div>
    </section>
  );
}