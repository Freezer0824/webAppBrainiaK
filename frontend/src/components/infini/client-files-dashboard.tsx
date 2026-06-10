import { useState } from "react";
import { FileSearch, ListChecks, Loader2, Route } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  demoClientFiles,
  type DemoClientFile,
} from "@/features/infini/infini-mock-data";
import {
  analyzeClientFile,
  listMissingDocuments,
  prepareNextClientAction,
} from "@/services/client-files.service";

type ClientAction = "analysis" | "missing" | "next";

type ClientActionState = {
  clientId: string;
  action: ClientAction;
  result: string;
} | null;

function getActionLabel(action: ClientAction) {
  switch (action) {
    case "analysis":
      return "Analyse du dossier";
    case "missing":
      return "Pièces manquantes";
    case "next":
      return "Prochaine action";
    default:
      return "Résultat BrainiaK";
  }
}

function getStatusClass(status: DemoClientFile["status"]) {
  switch (status) {
    case "complet":
      return "border-emerald-500/30 bg-emerald-500/10 text-emerald-200";
    case "à vérifier":
      return "border-amber-500/30 bg-amber-500/10 text-amber-200";
    case "incomplet":
      return "border-rose-500/30 bg-rose-500/10 text-rose-200";
    default:
      return "border-cyan-500/30 bg-cyan-500/10 text-cyan-200";
  }
}

function buildClientContext(client: DemoClientFile) {
  return {
    clientName: client.clientName,
    profile: client.profile,
    status: client.status,
    missingDocuments: client.missingDocuments,
    nextAction: client.nextAction,
  };
}

export function ClientFilesDashboard() {
  const [activeResult, setActiveResult] = useState<ClientActionState>(null);
  const [loadingAction, setLoadingAction] = useState<{
    clientId: string;
    action: ClientAction;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function runClientAction(client: DemoClientFile, action: ClientAction) {
    setError(null);
    setLoadingAction({ clientId: client.id, action });

    const context = buildClientContext(client);

    try {
      const result =
        action === "analysis"
          ? await analyzeClientFile(context)
          : action === "missing"
            ? await listMissingDocuments(context)
            : await prepareNextClientAction(context);

      setActiveResult({
        clientId: client.id,
        action,
        result,
      });
    } catch (err) {
      console.error("Action dossier client BrainiaK échouée :", err);
      setError(
        "BrainiaK n’a pas pu analyser ce dossier pour le moment. Vous pouvez réessayer.",
      );
    } finally {
      setLoadingAction(null);
    }
  }

  function isLoading(clientId: string, action: ClientAction) {
    return loadingAction?.clientId === clientId && loadingAction.action === action;
  }

  return (
    <section className="min-h-full bg-[var(--surface-0)] px-8 py-6">
      <div className="mx-auto grid w-full max-w-[1500px] gap-6 xl:grid-cols-[minmax(0,1fr)_460px]">
        <div className="space-y-6">
          <header className="rounded-3xl border border-[var(--border)] bg-[var(--surface-1)] p-6">
            <p className="text-xs font-medium uppercase tracking-[0.22em] text-cyan-300">
              Dossiers clients
            </p>

            <h1 className="mt-2 text-2xl font-semibold text-[var(--text-primary)]">
              Suivi des dossiers
            </h1>

            <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--text-secondary)]">
              BrainiaK peut analyser les dossiers, lister les pièces manquantes
              et préparer la prochaine action à réaliser.
            </p>
          </header>

          {error ? (
            <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-100">
              {error}
            </div>
          ) : null}

          <div className="grid gap-4 lg:grid-cols-2">
            {demoClientFiles.map((client) => (
              <article
                key={client.id}
                className="rounded-3xl border border-[var(--border)] bg-[var(--surface-1)] p-5"
              >
                <span
                  className={[
                    "rounded-full border px-3 py-1 text-xs font-medium",
                    getStatusClass(client.status),
                  ].join(" ")}
                >
                  {client.status}
                </span>

                <h2 className="mt-5 text-lg font-semibold text-[var(--text-primary)]">
                  {client.clientName}
                </h2>

                <p className="mt-1 text-sm text-[var(--text-secondary)]">
                  {client.profile}
                </p>

                <div className="mt-5">
                  <p className="text-xs font-medium uppercase tracking-[0.18em] text-[var(--text-secondary)]">
                    Pièces manquantes
                  </p>

                  {client.missingDocuments.length > 0 ? (
                    <ul className="mt-2 space-y-1 text-sm text-amber-200">
                      {client.missingDocuments.map((doc) => (
                        <li key={doc}>• {doc}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="mt-2 text-sm text-emerald-300">
                      Dossier complet
                    </p>
                  )}
                </div>

                <div className="mt-5 rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] p-4">
                  <p className="text-sm leading-6 text-[var(--text-primary)]">
                    {client.nextAction}
                  </p>
                </div>

                <div className="mt-5 flex flex-wrap gap-2">
                  <Button
                    type="button"
                    onClick={() => void runClientAction(client, "analysis")}
                    disabled={Boolean(loadingAction)}
                    className="bg-[var(--surface-3)] text-[var(--text-primary)] hover:bg-cyan-500/10 hover:text-cyan-200"
                  >
                    {isLoading(client.id, "analysis") ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <FileSearch className="mr-2 h-4 w-4" />
                    )}
                    Analyser le dossier
                  </Button>

                  <Button
                    type="button"
                    onClick={() => void runClientAction(client, "missing")}
                    disabled={Boolean(loadingAction)}
                    className="bg-[var(--surface-3)] text-[var(--text-primary)] hover:bg-cyan-500/10 hover:text-cyan-200"
                  >
                    {isLoading(client.id, "missing") ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <ListChecks className="mr-2 h-4 w-4" />
                    )}
                    Lister pièces manquantes
                  </Button>

                  <Button
                    type="button"
                    onClick={() => void runClientAction(client, "next")}
                    disabled={Boolean(loadingAction)}
                    className="bg-[var(--surface-3)] text-[var(--text-primary)] hover:bg-cyan-500/10 hover:text-cyan-200"
                  >
                    {isLoading(client.id, "next") ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Route className="mr-2 h-4 w-4" />
                    )}
                    Préparer prochaine action
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
                Les actions sensibles restent soumises à validation humaine.
              </div>
            </>
          ) : (
            <div className="mt-4 rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] p-4 text-sm leading-6 text-[var(--text-secondary)]">
              Sélectionnez une action pour analyser un dossier client avec
              BrainiaK.
            </div>
          )}
        </aside>
      </div>
    </section>
  );
}