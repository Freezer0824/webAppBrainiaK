import { useMemo, useState } from "react";
import {
  Clipboard,
  MessageSquare,
  Play,
  RefreshCw,
  RotateCcw,
  Send,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRuntimeStore } from "@/store/runtime-store";
import {
  appendDevSessionMessages,
  clearDevSession,
  getDevChatJobResult,
  getDevChatJobStatus,
  getDevSession,
  sendDevChat,
  sendDevChatAsync,
} from "@/lib/api/dev-chat-api";
import { env } from "@/lib/config/env";

type DevLog = {
  id: string;
  time: string;
  label: string;
  payload: unknown;
};

const DEFAULT_CHAT_PAYLOAD = {
  session_id: "debug-dev-chat",
  tenant_id: "dev",
  messages: [
    {
      role: "user",
      content: "Bonjour, réponds simplement en une phrase.",
    },
  ],
  enable_thinking: false,
  stream: false,
};

const DEFAULT_APPEND_PAYLOAD = {
  messages: [
    {
      role: "user",
      content: "Message ajouté depuis Dev Console.",
    },
  ],
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

function nowLabel() {
  return new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function extractJobId(payload: unknown): string {
  if (!payload || typeof payload !== "object") return "";

  const data = payload as Record<string, unknown>;
  const candidates = [data.job_id, data.jobId, data.id];

  for (const candidate of candidates) {
    if (typeof candidate === "string" && candidate.trim()) {
      return candidate.trim();
    }
  }

  return "";
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

export function DevChatDashboard() {
  const [chatPayload, setChatPayload] = useState(prettyJson(DEFAULT_CHAT_PAYLOAD));
  const [appendPayload, setAppendPayload] = useState(
    prettyJson(DEFAULT_APPEND_PAYLOAD),
  );
  const [sessionId, setSessionId] = useState("debug-dev-chat");
  const [jobId, setJobId] = useState("");
  const [result, setResult] = useState<unknown>(null);
  const [logs, setLogs] = useState<DevLog[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [copiedJobId, setCopiedJobId] = useState(false);
  const [lastAction, setLastAction] = useState<null | (() => Promise<void>)>(null);

  const pushApiEvent = useRuntimeStore((state) => state.pushApiEvent);

  const parsedChatPayload = useMemo(
    () => parseJsonInput(chatPayload),
    [chatPayload],
  );

  const parsedAppendPayload = useMemo(
    () => parseJsonInput(appendPayload),
    [appendPayload],
  );

  function pushLog(label: string, payload: unknown) {
    setLogs((items) => [
      {
        id: crypto.randomUUID(),
        time: nowLabel(),
        label,
        payload,
      },
      ...items,
    ]);
  }

  function handleResult(label: string, payload: unknown) {
    setResult(payload);
    pushLog(label, payload);
  }

  async function runAction(
    actionName: string,
    route: string,
    method: string,
    callback: () => Promise<unknown>,
  ) {
    const startedAt = performance.now();

    setLastAction(() => async () => {
      await runAction(actionName, route, method, callback);
    });

    setLoadingAction(actionName);
    setError(null);

    pushApiEvent({
      module: "Dev Chat",
      action: actionName,
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

      handleResult(actionName, payload);

      pushApiEvent({
        module: "Dev Chat",
        action: actionName,
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
      pushLog(`${actionName} error`, { message });

      pushApiEvent({
        module: "Dev Chat",
        action: actionName,
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

  async function handleSendSync() {
    if (!parsedChatPayload.ok) {
      setError(`JSON chat invalide : ${parsedChatPayload.error}`);
      return;
    }

    await runAction(
      "send-sync",
      "POST /v0/dev/chat",
      "POST",
      () => sendDevChat(parsedChatPayload.value),
    );
  }

  async function handleSendStream() {
    if (!parsedChatPayload.ok) {
      setError(`JSON chat invalide : ${parsedChatPayload.error}`);
      return;
    }

    await runAction("send-stream", "POST /v0/dev/chat/stream", "POST", async () => {
      const response = await fetch(`${env.apiBaseUrl}/v0/dev/chat/stream`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "text/event-stream",
        },
        body: JSON.stringify({
          ...(parsedChatPayload.value as Record<string, unknown>),
          stream: true,
        }),
      });

      if (!response.ok) {
        const text = await response.text().catch(() => "");
        throw new Error(
          `Dev stream failed (${response.status})${text ? `: ${text}` : ""}`,
        );
      }

      const text = await response.text();

      return {
        raw_stream: text,
      };
    });
  }

  async function handleSendAsync() {
    if (!parsedChatPayload.ok) {
      setError(`JSON chat invalide : ${parsedChatPayload.error}`);
      return;
    }

    const payload = await runAction(
      "send-async",
      "POST /v0/dev/chat/async",
      "POST",
      () => sendDevChatAsync(parsedChatPayload.value),
    );

    const nextJobId = extractJobId(payload);

    if (nextJobId) {
      setJobId(nextJobId);
    }
  }

  async function handleCheckJob() {
    const id = jobId.trim();

    if (!id) {
      setError("Aucun job_id à vérifier.");
      return;
    }

    await runAction(
      "check-job",
      "GET /v0/dev/chat/{job_id}/status",
      "GET",
      () => getDevChatJobStatus(id),
    );
  }

  async function handleGetResult() {
    const id = jobId.trim();

    if (!id) {
      setError("Aucun job_id pour récupérer le résultat.");
      return;
    }

    await runAction(
      "get-job-result",
      "GET /v0/dev/chat/{job_id}/result",
      "GET",
      () => getDevChatJobResult(id),
    );
  }

  async function handleGetSession() {
    const id = sessionId.trim();

    if (!id) {
      setError("Aucun session_id à consulter.");
      return;
    }

    await runAction(
      "get-session",
      "GET /v0/dev/session",
      "GET",
      () => getDevSession(id),
    );
  }

  async function handleAppendMessage() {
    const id = sessionId.trim();

    if (!id) {
      setError("Aucun session_id pour ajouter des messages.");
      return;
    }

    if (!parsedAppendPayload.ok) {
      setError(`JSON append invalide : ${parsedAppendPayload.error}`);
      return;
    }

    await runAction(
      "append-session",
      "POST /v0/dev/session/messages",
      "POST",
      () => appendDevSessionMessages(id, parsedAppendPayload.value),
    );
  }

  async function handleClearSession() {
    const id = sessionId.trim();

    if (!id) {
      setError("Aucun session_id à supprimer.");
      return;
    }

    const confirmed = window.confirm(
      `Supprimer la session dev "${id}" côté backend ?`,
    );

    if (!confirmed) return;

    await runAction(
      "clear-session",
      "DELETE /v0/dev/session",
      "DELETE",
      () => clearDevSession(id),
    );
  }

  async function handleCopyJobId() {
    const id = jobId.trim();

    if (!id) return;

    await navigator.clipboard.writeText(id);
    setCopiedJobId(true);

    window.setTimeout(() => {
      setCopiedJobId(false);
    }, 1500);
  }

  function handleReset() {
    setChatPayload(prettyJson(DEFAULT_CHAT_PAYLOAD));
    setAppendPayload(prettyJson(DEFAULT_APPEND_PAYLOAD));
    setSessionId("debug-dev-chat");
    setJobId("");
    setResult(null);
    setError(null);
    setLoadingAction(null);
    setCopiedJobId(false);
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
                Dev Chat
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--text-secondary)]">
                Tester les routes de chat dev, diagnostiquer le backend LLM et
                manipuler les sessions de développement.
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
              "POST /v0/dev/chat",
              "POST /v0/dev/chat/stream",
              "POST /v0/dev/chat/async",
              "GET /v0/dev/chat/{job_id}/status",
              "GET /v0/dev/chat/{job_id}/result",
              "GET /v0/dev/session",
              "POST /v0/dev/session/messages",
              "DELETE /v0/dev/session",
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

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
          <div className="space-y-6">
            <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface-2)] p-5">
              <div className="mb-3 flex items-center justify-between gap-3">
                <h2 className="text-sm font-semibold text-[var(--text-primary)]">
                  Chat Payload JSON
                </h2>

                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={handleReset}
                  className="border-[var(--border)] bg-transparent"
                >
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Reset
                </Button>
              </div>

              <textarea
                value={chatPayload}
                onChange={(event) => setChatPayload(event.target.value)}
                spellCheck={false}
                className="min-h-[300px] w-full resize-y rounded-2xl border border-[var(--border)] bg-[var(--surface-1)] p-4 font-mono text-sm leading-6 text-[var(--text-primary)] outline-none focus:border-cyan-500/50"
              />

              {!parsedChatPayload.ok ? (
                <p className="mt-3 text-sm text-red-300">
                  JSON invalide : {parsedChatPayload.error}
                </p>
              ) : null}

              <div className="mt-4 flex flex-wrap gap-2">
                <Button
                  type="button"
                  onClick={() => void handleSendSync()}
                  disabled={loadingAction !== null || !parsedChatPayload.ok}
                  className="bg-gradient-brainiak text-black hover:opacity-90 disabled:opacity-50"
                >
                  <Send className="mr-2 h-4 w-4" />
                  Send Sync
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  onClick={() => void handleSendStream()}
                  disabled={loadingAction !== null || !parsedChatPayload.ok}
                  className="border-[var(--border)] bg-transparent"
                >
                  <Play className="mr-2 h-4 w-4" />
                  Send Stream
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  onClick={() => void handleSendAsync()}
                  disabled={loadingAction !== null || !parsedChatPayload.ok}
                  className="border-[var(--border)] bg-transparent"
                >
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Send Async
                </Button>
              </div>
            </div>

            <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface-2)] p-5">
              <h2 className="text-sm font-semibold text-[var(--text-primary)]">
                Session Dev
              </h2>

              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <label className="block">
                  <span className="text-xs text-[var(--text-secondary)]">
                    session_id
                  </span>
                  <input
                    value={sessionId}
                    onChange={(event) => setSessionId(event.target.value)}
                    className="mt-2 w-full rounded-2xl border border-[var(--border)] bg-[var(--surface-1)] px-4 py-3 text-sm text-[var(--text-primary)] outline-none focus:border-cyan-500/50"
                  />
                </label>

                <label className="block">
                  <span className="text-xs text-[var(--text-secondary)]">
                    job_id
                  </span>
                  <input
                    value={jobId}
                    onChange={(event) => setJobId(event.target.value)}
                    className="mt-2 w-full rounded-2xl border border-[var(--border)] bg-[var(--surface-1)] px-4 py-3 text-sm text-[var(--text-primary)] outline-none focus:border-cyan-500/50"
                  />
                </label>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => void handleCheckJob()}
                  disabled={loadingAction !== null || !jobId.trim()}
                  className="border-[var(--border)] bg-transparent"
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Check Job
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  onClick={() => void handleGetResult()}
                  disabled={loadingAction !== null || !jobId.trim()}
                  className="border-[var(--border)] bg-transparent"
                >
                  Get Result
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  onClick={() => void handleCopyJobId()}
                  disabled={!jobId.trim()}
                  className="border-[var(--border)] bg-transparent"
                >
                  <Clipboard className="mr-2 h-4 w-4" />
                  {copiedJobId ? "Copié" : "Copier job_id"}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  onClick={() => void handleGetSession()}
                  disabled={loadingAction !== null || !sessionId.trim()}
                  className="border-[var(--border)] bg-transparent"
                >
                  Get Session
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  onClick={() => void handleClearSession()}
                  disabled={loadingAction !== null || !sessionId.trim()}
                  className="border-red-500/30 bg-transparent text-red-300 hover:bg-red-500/10"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Clear Session
                </Button>
              </div>
            </div>

            <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface-2)] p-5">
              <h2 className="text-sm font-semibold text-[var(--text-primary)]">
                Append Message JSON
              </h2>

              <textarea
                value={appendPayload}
                onChange={(event) => setAppendPayload(event.target.value)}
                spellCheck={false}
                className="mt-3 min-h-[180px] w-full resize-y rounded-2xl border border-[var(--border)] bg-[var(--surface-1)] p-4 font-mono text-sm leading-6 text-[var(--text-primary)] outline-none focus:border-cyan-500/50"
              />

              {!parsedAppendPayload.ok ? (
                <p className="mt-3 text-sm text-red-300">
                  JSON invalide : {parsedAppendPayload.error}
                </p>
              ) : null}

              <Button
                type="button"
                onClick={() => void handleAppendMessage()}
                disabled={
                  loadingAction !== null ||
                  !sessionId.trim() ||
                  !parsedAppendPayload.ok
                }
                className="mt-4 bg-[var(--surface-3)] text-[var(--text-primary)] hover:bg-cyan-500/10 hover:text-cyan-200"
              >
                Append Message
              </Button>
            </div>
          </div>

          <aside className="space-y-6">
            <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface-2)] p-5">
              <h2 className="text-sm font-semibold text-[var(--text-primary)]">
                Résultat
              </h2>

              <pre className="mt-3 max-h-[420px] overflow-auto rounded-2xl border border-[var(--border)] bg-[var(--surface-1)] p-4 text-xs leading-6 text-[var(--text-secondary)]">
                {result ? prettyJson(result) : "Aucun résultat pour le moment."}
              </pre>
            </div>

            <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface-2)] p-5">
              <h2 className="text-sm font-semibold text-[var(--text-primary)]">
                Logs bruts
              </h2>

              <div className="mt-3 max-h-[360px] space-y-2 overflow-auto">
                {logs.length === 0 ? (
                  <p className="text-sm text-[var(--text-secondary)]">
                    Aucun log pour le moment.
                  </p>
                ) : (
                  logs.map((log) => (
                    <div
                      key={log.id}
                      className="rounded-2xl border border-[var(--border)] bg-[var(--surface-1)] p-3"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-xs font-medium text-cyan-200">
                          {log.label}
                        </p>
                        <p className="text-xs text-[var(--text-secondary)]">
                          {log.time}
                        </p>
                      </div>

                      <pre className="mt-2 max-h-40 overflow-auto text-xs leading-5 text-[var(--text-secondary)]">
                        {prettyJson(log.payload)}
                      </pre>
                    </div>
                  ))
                )}
              </div>
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