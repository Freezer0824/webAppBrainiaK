import { useMemo, useState } from "react";
import { Search, RefreshCw, Send, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRuntimeStore } from "@/store/runtime-store";
import {
  encodeCrystals,
  getCrystalsInfo,
  lookupCrystal,
  lookupCrystalsBatch,
  nearestCrystals,
} from "@/lib/api/crystals-api";

type CrystalTab = "info" | "lookup" | "lookup-batch" | "encode" | "nearest";

const TABS: Array<{ id: CrystalTab; label: string }> = [
  { id: "info", label: "Info" },
  { id: "lookup", label: "Lookup" },
  { id: "lookup-batch", label: "Lookup Batch" },
  { id: "encode", label: "Encode" },
  { id: "nearest", label: "Nearest" },
];

const DEFAULT_LOOKUP_BATCH = {
  words: ["brainiak", "raisonnement", "mémoire"],
  include_s5: false,
};

const DEFAULT_NEAREST = {
  word: "brainiak",
  k: 10,
  include_s5: false,
};

function prettyJson(value: unknown) {
  return JSON.stringify(value, null, 2);
}

function previewPayload(value: unknown) {
  try {
    return prettyJson(value).slice(0, 600);
  } catch {
    return String(value).slice(0, 600);
  }
}

function parseJsonInput(value: string) {
  try {
    return {
      ok: true as const,
      value: JSON.parse(value) as unknown,
    };
  } catch (error) {
    return {
      ok: false as const,
      error: error instanceof Error ? error.message : "JSON invalide",
    };
  }
}

export function CrystalsDashboard() {
  const [activeTab, setActiveTab] = useState<CrystalTab>("info");

  const [word, setWord] = useState("brainiak");
  const [text, setText] = useState("Brainiak encode cette phrase.");
  const [includeS5, setIncludeS5] = useState(false);
  const [lastAction, setLastAction] = useState<null | (() => Promise<void>)>(null);

  const [lookupBatchPayload, setLookupBatchPayload] = useState(
    prettyJson(DEFAULT_LOOKUP_BATCH),
  );
  const [nearestPayload, setNearestPayload] = useState(
    prettyJson(DEFAULT_NEAREST),
  );

  const [result, setResult] = useState<unknown>(null);
  const [error, setError] = useState<string | null>(null);
  const [loadingAction, setLoadingAction] = useState<string | null>(null);

  const pushApiEvent = useRuntimeStore((state) => state.pushApiEvent);

  const parsedLookupBatch = useMemo(
    () => parseJsonInput(lookupBatchPayload),
    [lookupBatchPayload],
  );

  const parsedNearest = useMemo(
    () => parseJsonInput(nearestPayload),
    [nearestPayload],
  );

  async function runAction(
    action: string,
    route: string,
    method: string,
    callback: () => Promise<unknown>,
  ) {
    const startedAt = performance.now();

    setLastAction(() => async () => {
      await runAction(action, route, method, callback);
    });

    setLoadingAction(action);
    setError(null);

    pushApiEvent({
      module: "Crystals",
      action,
      method,
      route,
      status: "running",
      httpStatus: null,
      durationMs: null,
      payloadPreview: null,
      error: null,
    });

    try {
      const payload = await callback();
      const durationMs = Math.round(performance.now() - startedAt);

      setResult(payload);

      pushApiEvent({
        module: "Crystals",
        action,
        method,
        route,
        status: "success",
        httpStatus: 200,
        durationMs,
        payloadPreview: previewPayload(payload),
        error: null,
      });

      return payload;
    } catch (actionError) {
      const durationMs = Math.round(performance.now() - startedAt);
      const message =
        actionError instanceof Error ? actionError.message : "Erreur inconnue.";

      setError(message);

      pushApiEvent({
        module: "Crystals",
        action,
        method,
        route,
        status: "error",
        httpStatus: null,
        durationMs,
        payloadPreview: null,
        error: message,
      });

      return null;
    } finally {
      setLoadingAction(null);
    }
  }

  async function handleLoadInfo() {
    await runAction(
      "load-info",
      "GET /v1/crystals/info",
      "GET",
      getCrystalsInfo,
    );
  }

  async function handleLookupWord() {
    const normalizedWord = word.trim();

    if (!normalizedWord) {
      setError("Aucun mot à rechercher.");
      return;
    }

    await runAction(
      "lookup-word",
      "GET /v1/crystals/lookup",
      "GET",
      () => lookupCrystal(normalizedWord, includeS5),
    );
  }

  async function handleLookupBatch() {
    if (!parsedLookupBatch.ok) {
      setError(`JSON lookup batch invalide : ${parsedLookupBatch.error}`);
      return;
    }

    await runAction(
      "lookup-batch",
      "POST /v1/crystals/lookup_batch",
      "POST",
      () => lookupCrystalsBatch(parsedLookupBatch.value),
    );
  }

  async function handleEncodeText() {
    const normalizedText = text.trim();

    if (!normalizedText) {
      setError("Aucun texte à encoder.");
      return;
    }

    await runAction(
      "encode-text",
      "GET /v1/crystals/encode",
      "GET",
      () => encodeCrystals(normalizedText, includeS5),
    );
  }

  async function handleFindNearest() {
    if (!parsedNearest.ok) {
      setError(`JSON nearest invalide : ${parsedNearest.error}`);
      return;
    }

    await runAction(
      "find-nearest",
      "POST /v1/crystals/nearest",
      "POST",
      () => nearestCrystals(parsedNearest.value),
    );
  }

  function resetInputs() {
    setWord("brainiak");
    setText("Brainiak encode cette phrase.");
    setIncludeS5(false);
    setLookupBatchPayload(prettyJson(DEFAULT_LOOKUP_BATCH));
    setNearestPayload(prettyJson(DEFAULT_NEAREST));
    setResult(null);
    setError(null);
    setLastAction(null);
  }

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
                Crystals
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--text-secondary)]">
                Explorer les capacités Crystal : informations, lookup, batch,
                encodage et recherche des plus proches voisins.
              </p>
            </div>

            <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-1)] px-4 py-3 text-sm">
              <div className="text-xs uppercase tracking-[0.16em] text-[var(--text-secondary)]">
                État connexion
              </div>
              <div className="mt-1 font-medium text-[var(--text-primary)]">
                {loadingAction ? "Action en cours..." : "Prêt"}
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            {[
              "GET /v1/crystals/info",
              "GET /v1/crystals/lookup",
              "POST /v1/crystals/lookup_batch",
              "GET /v1/crystals/encode",
              "POST /v1/crystals/nearest",
            ].map((route) => (
              <span
                key={route}
                className="rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-xs font-medium text-cyan-200"
              >
                {route}
              </span>
            ))}
          </div>
        </header>

        <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface-2)] p-2">
          <div className="flex flex-wrap gap-2">
            {TABS.map((tab) => {
              const active = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={[
                    "rounded-2xl px-4 py-2 text-sm font-medium transition",
                    active
                      ? "bg-cyan-500/10 text-cyan-200"
                      : "text-[var(--text-secondary)] hover:bg-[var(--surface-1)] hover:text-[var(--text-primary)]",
                  ].join(" ")}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
          <div className="space-y-6">
            {activeTab === "info" && (
              <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface-2)] p-5">
                <h2 className="text-sm font-semibold text-[var(--text-primary)]">
                  Info
                </h2>

                <p className="mt-2 text-sm text-[var(--text-secondary)]">
                  Charger les informations générales du module Crystal.
                </p>

                <Button
                  type="button"
                  onClick={() => void handleLoadInfo()}
                  disabled={loadingAction !== null}
                  className="mt-4 bg-gradient-brainiak text-black hover:opacity-90 disabled:opacity-50"
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Load Info
                </Button>
              </div>
            )}

            {activeTab === "lookup" && (
              <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface-2)] p-5">
                <h2 className="text-sm font-semibold text-[var(--text-primary)]">
                  Lookup
                </h2>

                <label className="mt-4 block">
                  <span className="text-xs text-[var(--text-secondary)]">
                    word
                  </span>
                  <input
                    value={word}
                    onChange={(event) => setWord(event.target.value)}
                    className="mt-2 w-full rounded-2xl border border-[var(--border)] bg-[var(--surface-1)] px-4 py-3 text-sm text-[var(--text-primary)] outline-none focus:border-cyan-500/50"
                  />
                </label>

                <label className="mt-4 flex items-center gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface-1)] px-4 py-3">
                  <input
                    type="checkbox"
                    checked={includeS5}
                    onChange={(event) => setIncludeS5(event.target.checked)}
                    className="h-4 w-4"
                  />
                  <span className="text-sm text-[var(--text-primary)]">
                    include_s5
                  </span>
                </label>

                <Button
                  type="button"
                  onClick={() => void handleLookupWord()}
                  disabled={loadingAction !== null || !word.trim()}
                  className="mt-4 bg-gradient-brainiak text-black hover:opacity-90 disabled:opacity-50"
                >
                  <Search className="mr-2 h-4 w-4" />
                  Lookup Word
                </Button>
              </div>
            )}

            {activeTab === "lookup-batch" && (
              <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface-2)] p-5">
                <h2 className="text-sm font-semibold text-[var(--text-primary)]">
                  Lookup Batch JSON
                </h2>

                <textarea
                  value={lookupBatchPayload}
                  onChange={(event) =>
                    setLookupBatchPayload(event.target.value)
                  }
                  spellCheck={false}
                  className="mt-3 min-h-[260px] w-full resize-y rounded-2xl border border-[var(--border)] bg-[var(--surface-1)] p-4 font-mono text-sm leading-6 text-[var(--text-primary)] outline-none focus:border-cyan-500/50"
                />

                {!parsedLookupBatch.ok ? (
                  <p className="mt-3 text-sm text-red-300">
                    JSON invalide : {parsedLookupBatch.error}
                  </p>
                ) : null}

                <Button
                  type="button"
                  onClick={() => void handleLookupBatch()}
                  disabled={loadingAction !== null || !parsedLookupBatch.ok}
                  className="mt-4 bg-gradient-brainiak text-black hover:opacity-90 disabled:opacity-50"
                >
                  <Send className="mr-2 h-4 w-4" />
                  Lookup Batch
                </Button>
              </div>
            )}

            {activeTab === "encode" && (
              <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface-2)] p-5">
                <h2 className="text-sm font-semibold text-[var(--text-primary)]">
                  Encode
                </h2>

                <label className="mt-4 block">
                  <span className="text-xs text-[var(--text-secondary)]">
                    text
                  </span>
                  <textarea
                    value={text}
                    onChange={(event) => setText(event.target.value)}
                    className="mt-2 min-h-[180px] w-full resize-y rounded-2xl border border-[var(--border)] bg-[var(--surface-1)] px-4 py-3 text-sm text-[var(--text-primary)] outline-none focus:border-cyan-500/50"
                  />
                </label>

                <label className="mt-4 flex items-center gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface-1)] px-4 py-3">
                  <input
                    type="checkbox"
                    checked={includeS5}
                    onChange={(event) => setIncludeS5(event.target.checked)}
                    className="h-4 w-4"
                  />
                  <span className="text-sm text-[var(--text-primary)]">
                    include_s5
                  </span>
                </label>

                <Button
                  type="button"
                  onClick={() => void handleEncodeText()}
                  disabled={loadingAction !== null || !text.trim()}
                  className="mt-4 bg-gradient-brainiak text-black hover:opacity-90 disabled:opacity-50"
                >
                  <Sparkles className="mr-2 h-4 w-4" />
                  Encode Text
                </Button>
              </div>
            )}

            {activeTab === "nearest" && (
              <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface-2)] p-5">
                <h2 className="text-sm font-semibold text-[var(--text-primary)]">
                  Nearest JSON
                </h2>

                <textarea
                  value={nearestPayload}
                  onChange={(event) => setNearestPayload(event.target.value)}
                  spellCheck={false}
                  className="mt-3 min-h-[260px] w-full resize-y rounded-2xl border border-[var(--border)] bg-[var(--surface-1)] p-4 font-mono text-sm leading-6 text-[var(--text-primary)] outline-none focus:border-cyan-500/50"
                />

                {!parsedNearest.ok ? (
                  <p className="mt-3 text-sm text-red-300">
                    JSON invalide : {parsedNearest.error}
                  </p>
                ) : null}

                <Button
                  type="button"
                  onClick={() => void handleFindNearest()}
                  disabled={loadingAction !== null || !parsedNearest.ok}
                  className="mt-4 bg-gradient-brainiak text-black hover:opacity-90 disabled:opacity-50"
                >
                  <Search className="mr-2 h-4 w-4" />
                  Find Nearest
                </Button>
              </div>
            )}

            <Button
              type="button"
              variant="outline"
              onClick={resetInputs}
              className="border-[var(--border)] bg-transparent"
            >
              Reset Inputs
            </Button>
          </div>

          <aside className="space-y-6">
            <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface-2)] p-5">
              <h2 className="text-sm font-semibold text-[var(--text-primary)]">
                Résultat brut
              </h2>

              <pre className="mt-3 max-h-[520px] overflow-auto rounded-2xl border border-[var(--border)] bg-[var(--surface-1)] p-4 text-xs leading-6 text-[var(--text-secondary)]">
                {result ? prettyJson(result) : "Aucun résultat pour le moment."}
              </pre>
            </div>
          </aside>
        </div>

        {error ? (
          <div className="rounded-3xl border border-red-500/20 bg-red-500/10 p-5">
            <h2 className="text-sm font-semibold text-red-200">
              Message d’erreur
            </h2>

            <p className="mt-2 text-sm leading-6 text-red-100/80">{error}</p>

            {lastAction ? (
              <Button
                type="button"
                variant="outline"
                onClick={() => void lastAction()}
                disabled={loadingAction !== null}
                className="mt-4 border-red-500/30 bg-transparent text-red-200 hover:bg-red-500/10"
              >
                Réessayer
              </Button>
            ) : null}
          </div>
        ) : null}
      </div>
    </section>
  );
}