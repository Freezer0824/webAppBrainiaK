import { useMemo, useState } from "react";
import { Check, Clipboard, RefreshCw, RotateCcw, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRuntimeStore } from "@/store/runtime-store";
import {
  getRequestResponse,
  getRequestStatus,
  submitRequest,
} from "@/lib/api/requests-api";

type RequestHistoryItem = {
  id: string;
  requestId: string;
  createdAt: string;
  status?: unknown;
  response?: unknown;
};

const DEFAULT_REQUEST_INPUT = {
  tenant_id: "dev",
  user_id: "front-user",
  input: {
    type: "text",
    content: "Bonjour Brainiak, traite cette requête via le Core.",
  },
  metadata: {
    source: "frontend",
  },
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

function extractRequestId(payload: unknown): string {
  if (!payload || typeof payload !== "object") return "";

  const data = payload as Record<string, unknown>;

  const candidates = [
    data.request_id,
    data.requestId,
    data.id,
    data.uuid,
    data.request && typeof data.request === "object"
      ? (data.request as Record<string, unknown>).id
      : undefined,
  ];

  for (const candidate of candidates) {
    if (typeof candidate === "string" && candidate.trim()) {
      return candidate.trim();
    }
  }

  return "";
}

export function RequestsDashboard() {
  const [input, setInput] = useState(prettyJson(DEFAULT_REQUEST_INPUT));
  const [requestId, setRequestId] = useState("");
  const [result, setResult] = useState<unknown>(null);
  const [error, setError] = useState<string | null>(null);
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [history, setHistory] = useState<RequestHistoryItem[]>([]);
  const [lastAction, setLastAction] = useState<null | (() => Promise<unknown>)>(
    null,
  );

  const pushApiEvent = useRuntimeStore((state) => state.pushApiEvent);

  const parsedInput = useMemo(() => {
    try {
      return {
        ok: true as const,
        value: JSON.parse(input) as unknown,
      };
    } catch (parseError) {
      return {
        ok: false as const,
        error:
          parseError instanceof Error
            ? parseError.message
            : "JSON invalide",
      };
    }
  }, [input]);

  async function runAction(
    action: string,
    route: string,
    method: string,
    callback: () => Promise<unknown>,
  ) {
    const startedAt = performance.now();

    setLastAction(() => () => runAction(action, route, method, callback));

    setLoadingAction(action);
    setError(null);

    pushApiEvent({
      module: "Requests",
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
        module: "Requests",
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
        module: "Requests",
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

  async function handleSubmit() {
    if (!parsedInput.ok) {
      setError(`JSON invalide : ${parsedInput.error}`);
      return;
    }

    const payload = await runAction(
      "submit-request",
      "POST /v0/request",
      "POST",
      () => submitRequest(parsedInput.value),
    );

    if (!payload) return;

    const nextRequestId = extractRequestId(payload);

    if (nextRequestId) {
      setRequestId(nextRequestId);

      setHistory((items) => [
        {
          id: crypto.randomUUID(),
          requestId: nextRequestId,
          createdAt: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
          response: payload,
        },
        ...items,
      ]);
    } else {
      const message =
        "Requête envoyée, mais aucun request_id n’a été trouvé dans la réponse.";

      setError(message);

      pushApiEvent({
        module: "Requests",
        action: "extract-request-id",
        method: "POST",
        route: "POST /v0/request",
        status: "error",
        httpStatus: 200,
        durationMs: null,
        payloadPreview: previewPayload(payload),
        error: message,
      });
    }
  }

  async function handleCheckStatus() {
    const id = requestId.trim();

    if (!id) {
      setError("Aucun request_id à vérifier.");
      return;
    }

    const payload = await runAction(
      "check-status",
      "GET /v0/request/{request_id}/status",
      "GET",
      () => getRequestStatus(id),
    );

    if (!payload) return;

    setHistory((items) =>
      items.map((item) =>
        item.requestId === id
          ? {
              ...item,
              status: payload,
            }
          : item,
      ),
    );
  }

  async function handleGetResponse() {
    const id = requestId.trim();

    if (!id) {
      setError("Aucun request_id pour récupérer la réponse.");
      return;
    }

    const payload = await runAction(
      "get-response",
      "GET /v0/request/{request_id}/response",
      "GET",
      () => getRequestResponse(id),
    );

    if (!payload) return;

    setHistory((items) =>
      items.map((item) =>
        item.requestId === id
          ? {
              ...item,
              response: payload,
            }
          : item,
      ),
    );
  }

  async function handleCopyRequestId() {
    const id = requestId.trim();

    if (!id) return;

    await navigator.clipboard.writeText(id);
    setCopied(true);

    window.setTimeout(() => {
      setCopied(false);
    }, 1500);
  }

  function handleReset() {
    setInput(prettyJson(DEFAULT_REQUEST_INPUT));
    setRequestId("");
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
                Requests
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--text-secondary)]">
                Soumettre une requête au Core Brainiak, suivre son statut et
                récupérer sa réponse finale.
              </p>
            </div>

            <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-1)] px-4 py-3 text-sm">
              <div className="text-xs uppercase tracking-[0.16em] text-[var(--text-secondary)]">
                État connexion
              </div>
              <div className="mt-1 font-medium text-[var(--text-primary)]">
                {loadingAction ? "Requête en cours..." : "Prêt"}
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            {[
              "POST /v0/request",
              "GET /v0/request/{request_id}/status",
              "GET /v0/request/{request_id}/response",
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

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
          <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface-2)] p-5">
            <div className="mb-3 flex items-center justify-between gap-3">
              <h2 className="text-sm font-semibold text-[var(--text-primary)]">
                RequestInput JSON
              </h2>

              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={handleReset}
                className="border-[var(--border)] bg-transparent"
              >
                <RotateCcw className="mr-2 h-4 w-4" />
                Reset formulaire
              </Button>
            </div>

            <textarea
              value={input}
              onChange={(event) => setInput(event.target.value)}
              spellCheck={false}
              className="min-h-[360px] w-full resize-y rounded-2xl border border-[var(--border)] bg-[var(--surface-1)] p-4 font-mono text-sm leading-6 text-[var(--text-primary)] outline-none focus:border-cyan-500/50"
            />

            {!parsedInput.ok ? (
              <p className="mt-3 text-sm text-red-300">
                JSON invalide : {parsedInput.error}
              </p>
            ) : null}

            <div className="mt-4 flex flex-wrap gap-2">
              <Button
                type="button"
                onClick={() => void handleSubmit()}
                disabled={loadingAction !== null || !parsedInput.ok}
                className="bg-gradient-brainiak text-black hover:opacity-90 disabled:opacity-50"
              >
                <Send className="mr-2 h-4 w-4" />
                Submit Request
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={() => void handleCheckStatus()}
                disabled={loadingAction !== null || !requestId.trim()}
                className="border-[var(--border)] bg-transparent"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Check Status
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={() => void handleGetResponse()}
                disabled={loadingAction !== null || !requestId.trim()}
                className="border-[var(--border)] bg-transparent"
              >
                Get Response
              </Button>
            </div>
          </div>

          <aside className="space-y-6">
            <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface-2)] p-5">
              <h2 className="text-sm font-semibold text-[var(--text-primary)]">
                Request ID
              </h2>

              <div className="mt-3 rounded-2xl border border-[var(--border)] bg-[var(--surface-1)] p-3 font-mono text-xs text-[var(--text-secondary)]">
                {requestId || "Aucun request_id"}
              </div>

              <Button
                type="button"
                variant="outline"
                onClick={() => void handleCopyRequestId()}
                disabled={!requestId.trim()}
                className="mt-3 w-full border-[var(--border)] bg-transparent"
              >
                {copied ? (
                  <Check className="mr-2 h-4 w-4 text-emerald-300" />
                ) : (
                  <Clipboard className="mr-2 h-4 w-4" />
                )}
                {copied ? "Copié" : "Copier request_id"}
              </Button>
            </div>

            <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface-2)] p-5">
              <h2 className="text-sm font-semibold text-[var(--text-primary)]">
                Historique
              </h2>

              <div className="mt-3 space-y-2">
                {history.length === 0 ? (
                  <p className="text-sm text-[var(--text-secondary)]">
                    Aucune requête soumise.
                  </p>
                ) : (
                  history.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setRequestId(item.requestId)}
                      className="block w-full rounded-2xl border border-[var(--border)] bg-[var(--surface-1)] p-3 text-left hover:border-cyan-500/40"
                    >
                      <p className="truncate font-mono text-xs text-cyan-200">
                        {item.requestId}
                      </p>
                      <p className="mt-1 text-xs text-[var(--text-secondary)]">
                        {item.createdAt}
                      </p>
                    </button>
                  ))
                )}
              </div>
            </div>
          </aside>
        </div>

        <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface-2)] p-5">
          <h2 className="text-sm font-semibold text-[var(--text-primary)]">
            Résultat
          </h2>

          <pre className="mt-3 max-h-[420px] overflow-auto rounded-2xl border border-[var(--border)] bg-[var(--surface-1)] p-4 text-xs leading-6 text-[var(--text-secondary)]">
            {result ? prettyJson(result) : "Aucun résultat pour le moment."}
          </pre>
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
                className="mt-4 border-red-500/30 bg-transparent text-red-200 hover:bg-red-500/10 disabled:opacity-50"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Réessayer
              </Button>
            ) : null}
          </div>
        ) : null}
      </div>
    </section>
  );
}