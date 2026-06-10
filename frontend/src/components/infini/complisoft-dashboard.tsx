import { useState } from "react";
import { CheckCircle2, ClipboardCheck, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  demoComplisoftFiles,
  type DemoComplisoftFile,
} from "@/features/infini/infini-mock-data";
import {
  checkComplianceReadiness,
  prepareComplisoftData,
} from "@/services/complisoft.service";

type ComplisoftAction = "prepare" | "check";

type ComplisoftActionState = {
  fileId: string;
  action: ComplisoftAction;
  result: string;
} | null;

function getActionLabel(action: ComplisoftAction) {
  switch (action) {
    case "prepare":
      return "Données COMPLISOFT préparées";
    case "check":
      return "Vérification du dossier";
    default:
      return "Résultat BrainiaK";
  }
}

function getStatusClass(status: DemoComplisoftFile["status"]) {
  switch (status) {
    case "prêt":
      return "border-emerald-500/30 bg-emerald-500/10 text-emerald-200";
    case "à vérifier":
      return "border-amber-500/30 bg-amber-500/10 text-amber-200";
    case "incomplet":
      return "border-rose-500/30 bg-rose-500/10 text-rose-200";
    default:
      return "border-cyan-500/30 bg-cyan-500/10 text-cyan-200";
  }
}

function buildComplisoftContext(file: DemoComplisoftFile) {
  return {
    clientName: file.clientName,
    availableData: [
      "Identité client",
      "Coordonnées",
      "Profil investisseur",
      "Objectif déclaré",
      "Situation patrimoniale partielle",
    ],
    missingData: file.missingItems,
    availableDocuments: [
      "Questionnaire client",
      "Synthèse rendez-vous",
      "Préconisations initiales",
    ],
    missingDocuments: file.missingItems,
    fieldsReady: file.fieldsReady,
    fieldsTotal: file.fieldsTotal,
    status: file.status,
  };
}

export function ComplisoftDashboard() {
  const [activeResult, setActiveResult] =
    useState<ComplisoftActionState>(null);
  const [loadingAction, setLoadingAction] = useState<{
    fileId: string;
    action: ComplisoftAction;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function runComplisoftAction(
    file: DemoComplisoftFile,
    action: ComplisoftAction,
  ) {
    setError(null);
    setLoadingAction({ fileId: file.id, action });

    const context = buildComplisoftContext(file);

    try {
      const result =
        action === "prepare"
          ? await prepareComplisoftData(context)
          : await checkComplianceReadiness(context);

      setActiveResult({
        fileId: file.id,
        action,
        result,
      });
    } catch (err) {
      console.error("Action COMPLISOFT BrainiaK échouée :", err);
      setError(
        "BrainiaK n’a pas pu préparer les données COMPLISOFT pour le moment. Vous pouvez réessayer.",
      );
    } finally {
      setLoadingAction(null);
    }
  }

  function isLoading(fileId: string, action: ComplisoftAction) {
    return loadingAction?.fileId === fileId && loadingAction.action === action;
  }

  return (
    <section className="min-h-full bg-[var(--surface-0)] px-8 py-6">
      <div className="mx-auto grid w-full max-w-[1500px] gap-6 xl:grid-cols-[minmax(0,1fr)_460px]">
        <div className="space-y-6">
          <header className="rounded-3xl border border-[var(--border)] bg-[var(--surface-1)] p-6">
            <p className="text-xs font-medium uppercase tracking-[0.22em] text-cyan-300">
              COMPLISOFT
            </p>

            <h1 className="mt-2 text-2xl font-semibold text-[var(--text-primary)]">
              Préparation conformité
            </h1>

            <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--text-secondary)]">
              BrainiaK prépare les champs et documents à contrôler avant
              alimentation COMPLISOFT. Aucune synchronisation n’est effectuée
              sans validation humaine.
            </p>
          </header>

          {error ? (
            <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-100">
              {error}
            </div>
          ) : null}

          <div className="grid gap-4">
            {demoComplisoftFiles.map((file) => {
              const progress = Math.round(
                (file.fieldsReady / file.fieldsTotal) * 100,
              );

              return (
                <article
                  key={file.id}
                  className="rounded-3xl border border-[var(--border)] bg-[var(--surface-1)] p-5"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <span
                        className={[
                          "rounded-full border px-3 py-1 text-xs font-medium",
                          getStatusClass(file.status),
                        ].join(" ")}
                      >
                        {file.status}
                      </span>

                      <h2 className="mt-5 text-lg font-semibold text-[var(--text-primary)]">
                        {file.clientName}
                      </h2>

                      <p className="mt-1 text-sm text-[var(--text-secondary)]">
                        {file.fieldsReady}/{file.fieldsTotal} champs prêts ·{" "}
                        {progress}%
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 h-2 overflow-hidden rounded-full bg-[var(--surface-3)]">
                    <div
                      className="h-full rounded-full bg-cyan-400"
                      style={{ width: `${progress}%` }}
                    />
                  </div>

                  <div className="mt-5 rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] p-4">
                    <p className="text-xs font-medium uppercase tracking-[0.18em] text-cyan-300">
                      Points à compléter
                    </p>

                    {file.missingItems.length > 0 ? (
                      <ul className="mt-2 space-y-1 text-sm text-[var(--text-primary)]">
                        {file.missingItems.map((item) => (
                          <li key={item}>• {item}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="mt-2 text-sm text-emerald-300">
                        Aucun élément manquant détecté.
                      </p>
                    )}
                  </div>

                  <div className="mt-5 flex flex-wrap gap-2">
                    <Button
                      type="button"
                      onClick={() => void runComplisoftAction(file, "prepare")}
                      disabled={Boolean(loadingAction)}
                      className="bg-[var(--surface-3)] text-[var(--text-primary)] hover:bg-cyan-500/10 hover:text-cyan-200"
                    >
                      {isLoading(file.id, "prepare") ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <ClipboardCheck className="mr-2 h-4 w-4" />
                      )}
                      Préparer données COMPLISOFT
                    </Button>

                    <Button
                      type="button"
                      onClick={() => void runComplisoftAction(file, "check")}
                      disabled={Boolean(loadingAction)}
                      className="bg-[var(--surface-3)] text-[var(--text-primary)] hover:bg-cyan-500/10 hover:text-cyan-200"
                    >
                      {isLoading(file.id, "check") ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                      )}
                      Vérifier si le dossier est prêt
                    </Button>
                  </div>
                </article>
              );
            })}
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
                Validation humaine obligatoire avant synchronisation
                COMPLISOFT.
              </div>
            </>
          ) : (
            <div className="mt-4 rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] p-4 text-sm leading-6 text-[var(--text-secondary)]">
              Sélectionnez une action pour préparer les données COMPLISOFT ou
              vérifier l’état du dossier.
            </div>
          )}
        </aside>
      </div>
    </section>
  );
}