import { useState } from "react";
import { Check, Clipboard, RefreshCw, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { runSystemCheckup } from "@/lib/api/system-api";
import { useRuntimeStore } from "@/store/runtime-store";

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

export function SystemDashboard() {
  const [scale, setScale] = useState("standard");
  const [category, setCategory] = useState("");
  const [result, setResult] = useState<unknown>(null);
  const [error, setError] = useState<string | null>(null);
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const [lastAction, setLastAction] = useState<null | (() => Promise<void>)>(null);

  const pushApiEvent = useRuntimeStore((state) => state.pushApiEvent);

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
      module: "System",
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
        module: "System",
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
        actionError instanceof Error
          ? actionError.message
          : "Erreur inconnue.";

      setError(message);

      pushApiEvent({
        module: "System",
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

  async function handleRunCheckup() {
    await runAction(
      "run-checkup",
      "GET /v1/system/checkup",
      "GET",
      () =>
        runSystemCheckup(
          scale.trim() || "standard",
          category.trim() || undefined,
        ),
    );
  }

  async function handleCopyResult() {
    if (!result) return;

    await navigator.clipboard.writeText(prettyJson(result));
    setCopied(true);

    window.setTimeout(() => {
      setCopied(false);
    }, 1500);
  }

  function handleReset() {
    setScale("standard");
    setCategory("");
    setResult(null);
    setError(null);
    setCopied(false);
    setLoadingAction(null);
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
                System
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--text-secondary)]">
                Supervision légère du système Brainiak via checkup contrôlé.
                Les routes admin dangereuses restent hors du front principal.
              </p>
            </div>

            <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-1)] px-4 py-3 text-sm">
              <div className="text-xs uppercase tracking-[0.16em] text-[var(--text-secondary)]">
                État connexion
              </div>
              <div className="mt-1 font-medium text-[var(--text-primary)]">
                {loadingAction ? "Checkup en cours..." : "Prêt"}
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            <span className="rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-xs font-medium text-cyan-200">
              GET /v1/system/checkup
            </span>
          </div>
        </header>

        <div className="grid gap-6 xl:grid-cols-[380px_minmax(0,1fr)]">
          <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface-2)] p-5">
            <h2 className="text-sm font-semibold text-[var(--text-primary)]">
              Paramètres checkup
            </h2>

            <label className="mt-4 block">
              <span className="text-xs text-[var(--text-secondary)]">
                scale
              </span>

              <select
                value={scale}
                onChange={(event) => setScale(event.target.value)}
                className="mt-2 w-full rounded-2xl border border-[var(--border)] bg-[var(--surface-1)] px-4 py-3 text-sm text-[var(--text-primary)] outline-none focus:border-cyan-500/50"
              >
                <option value="standard">standard</option>
                <option value="quick">quick</option>
                <option value="full">full</option>
                <option value="deep">deep</option>
              </select>
            </label>

            <label className="mt-4 block">
              <span className="text-xs text-[var(--text-secondary)]">
                category
              </span>

              <input
                value={category}
                onChange={(event) => setCategory(event.target.value)}
                placeholder="optionnel"
                className="mt-2 w-full rounded-2xl border border-[var(--border)] bg-[var(--surface-1)] px-4 py-3 text-sm text-[var(--text-primary)] outline-none placeholder:text-[var(--text-secondary)] focus:border-cyan-500/50"
              />
            </label>

            <div className="mt-5 flex flex-wrap gap-2">
              <Button
                type="button"
                onClick={() => void handleRunCheckup()}
                disabled={loadingAction !== null}
                className="bg-gradient-brainiak text-black hover:opacity-90 disabled:opacity-50"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Run Checkup
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={handleReset}
                className="border-[var(--border)] bg-transparent"
              >
                <RotateCcw className="mr-2 h-4 w-4" />
                Reset
              </Button>
            </div>
          </div>

          <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface-2)] p-5">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-sm font-semibold text-[var(--text-primary)]">
                Résultat JSON
              </h2>

              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => void handleCopyResult()}
                disabled={!result}
                className="border-[var(--border)] bg-transparent"
              >
                {copied ? (
                  <Check className="mr-2 h-4 w-4 text-emerald-300" />
                ) : (
                  <Clipboard className="mr-2 h-4 w-4" />
                )}
                {copied ? "Copié" : "Copy Result"}
              </Button>
            </div>

            <pre className="mt-4 max-h-[560px] overflow-auto rounded-2xl border border-[var(--border)] bg-[var(--surface-1)] p-4 text-xs leading-6 text-[var(--text-secondary)]">
              {result ? prettyJson(result) : "Aucun checkup exécuté."}
            </pre>
          </div>
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