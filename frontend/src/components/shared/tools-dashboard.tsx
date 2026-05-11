import { useMemo, useState } from "react";
import {
  Check,
  Clipboard,
  HeartPulse,
  RefreshCw,
  RotateCcw,
  Send,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { getToolhubHealth } from "@/lib/api/core-api";
import { callTool, listTools } from "@/lib/api/tools-api";
import { useRuntimeStore } from "@/store/runtime-store";

type ToolRecord = {
  type?: string;
  function?: {
    name?: string;
    description?: string;
    parameters?: unknown;
  };
  id?: string;
  name?: string;
  key?: string;
  description?: string;
  [key: string]: unknown;
};

const DEFAULT_TOOL_CALL = {
  tool: "read_file",
  arguments: {
    path: "/tmp/example.txt",
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

function getToolName(tool: ToolRecord) {
  return (
    tool.function?.name ??
    tool.name ??
    tool.id ??
    tool.key ??
    "unknown_tool"
  );
}

function getToolDescription(tool: ToolRecord) {
  return tool.function?.description ?? tool.description ?? "Aucune description.";
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

export function ToolsDashboard() {
  const [role, setRole] = useState("dev");
  const [search, setSearch] = useState("");
  const [toolsPayload, setToolsPayload] = useState<unknown>(null);
  const [tools, setTools] = useState<ToolRecord[]>([]);
  const [selectedToolName, setSelectedToolName] = useState("");
  const [callInput, setCallInput] = useState(prettyJson(DEFAULT_TOOL_CALL));
  const [result, setResult] = useState<unknown>(null);
  const [health, setHealth] = useState<unknown>(null);
  const [error, setError] = useState<string | null>(null);
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [lastAction, setLastAction] = useState<null | (() => Promise<void>)>(null);

  const pushApiEvent = useRuntimeStore((state) => state.pushApiEvent);

  const parsedCallInput = useMemo(() => parseJsonInput(callInput), [callInput]);

  const selectedTool = useMemo(() => {
    return tools.find((tool) => getToolName(tool) === selectedToolName) ?? null;
  }, [tools, selectedToolName]);

  const filteredTools = useMemo(() => {
    const normalized = search.trim().toLowerCase();

    if (!normalized) return tools;

    return tools.filter((tool) => {
      const name = getToolName(tool).toLowerCase();
      const description = getToolDescription(tool).toLowerCase();

      return name.includes(normalized) || description.includes(normalized);
    });
  }, [tools, search]);

  function extractTools(payload: unknown): ToolRecord[] {
    if (!payload || typeof payload !== "object") return [];

    const data = payload as Record<string, unknown>;
    const candidates = [data.tools, data.items, data.results, data.data];

    const array = candidates.find(Array.isArray);

    return Array.isArray(array) ? (array as ToolRecord[]) : [];
  }

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
      module: "Tools",
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
        module: "Tools",
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
        module: "Tools",
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

  async function handleHealth() {
    const payload = await runAction(
      "health",
      "GET /toolhub/health",
      "GET",
      getToolhubHealth,
    );

    if (payload) {
      setHealth(payload);
    }
  }

  async function handleRefreshTools() {
    const payload = await runAction(
      "refresh-tools",
      "GET /v1/tools/list",
      "GET",
      () => listTools(role),
    );

    if (!payload) return;

    const extracted = extractTools(payload);
    setToolsPayload(payload);
    setTools(extracted);

    if (extracted.length > 0) {
      const firstName = getToolName(extracted[0]);
      setSelectedToolName(firstName);
      setCallInput(
        prettyJson({
          tool: firstName,
          arguments: {},
        }),
      );
    }
  }

  function handleSelectTool(tool: ToolRecord) {
    const name = getToolName(tool);

    setSelectedToolName(name);
    setCallInput(
      prettyJson({
        tool: name,
        arguments: {},
      }),
    );
  }

  async function handleCallTool() {
    if (!parsedCallInput.ok) {
      setError(`JSON invalide : ${parsedCallInput.error}`);
      return;
    }

    await runAction(
      "call-tool",
      "POST /v1/tools/call",
      "POST",
      () => callTool(parsedCallInput.value),
    );
  }

  async function handleCopyJson() {
    const content = result
      ? prettyJson(result)
      : selectedTool
        ? prettyJson(selectedTool)
        : "";

    if (!content) return;

    await navigator.clipboard.writeText(content);
    setCopied(true);

    window.setTimeout(() => {
      setCopied(false);
    }, 1500);
  }

  function handleResetInput() {
    setCallInput(
      prettyJson({
        tool: selectedToolName || "read_file",
        arguments: {},
      }),
    );
    setError(null);
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
                Tools
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--text-secondary)]">
                Inspecter le registry Tool Hub, rechercher les outils disponibles
                et tester un appel manuel.
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
            {["GET /toolhub/health", "GET /v1/tools/list", "POST /v1/tools/call"].map(
              (route) => (
                <span
                  key={route}
                  className="rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-xs font-medium text-cyan-200"
                >
                  {route}
                </span>
              ),
            )}
          </div>
        </header>

        <div className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
          <aside className="space-y-6">
            <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface-2)] p-5">
              <h2 className="text-sm font-semibold text-[var(--text-primary)]">
                ToolHub
              </h2>

              <div className="mt-4 grid gap-3">
                <label className="block">
                  <span className="text-xs text-[var(--text-secondary)]">role</span>
                  <input
                    value={role}
                    onChange={(event) => setRole(event.target.value)}
                    className="mt-2 w-full rounded-2xl border border-[var(--border)] bg-[var(--surface-1)] px-4 py-3 text-sm text-[var(--text-primary)] outline-none focus:border-cyan-500/50"
                  />
                </label>

                <Button
                  type="button"
                  variant="outline"
                  onClick={() => void handleHealth()}
                  disabled={loadingAction !== null}
                  className="border-[var(--border)] bg-transparent"
                >
                  <HeartPulse className="mr-2 h-4 w-4" />
                  Health
                </Button>

                <Button
                  type="button"
                  onClick={() => void handleRefreshTools()}
                  disabled={loadingAction !== null}
                  className="bg-gradient-brainiak text-black hover:opacity-90 disabled:opacity-50"
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Refresh Tools
                </Button>
              </div>

              <pre className="mt-4 max-h-48 overflow-auto rounded-2xl border border-[var(--border)] bg-[var(--surface-1)] p-3 text-xs leading-5 text-[var(--text-secondary)]">
                {health ? prettyJson(health) : "Health non vérifié."}
              </pre>
            </div>

            <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface-2)] p-5">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-sm font-semibold text-[var(--text-primary)]">
                  Liste tools
                </h2>

                <span className="rounded-full border border-[var(--border)] bg-[var(--surface-1)] px-3 py-1 text-xs text-[var(--text-secondary)]">
                  {filteredTools.length}/{tools.length}
                </span>
              </div>

              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Rechercher un tool..."
                className="mt-4 w-full rounded-2xl border border-[var(--border)] bg-[var(--surface-1)] px-4 py-3 text-sm text-[var(--text-primary)] outline-none placeholder:text-[var(--text-secondary)] focus:border-cyan-500/50"
              />

              <div className="mt-4 max-h-[480px] space-y-2 overflow-auto">
                {filteredTools.length === 0 ? (
                  <p className="rounded-2xl border border-dashed border-[var(--border)] bg-[var(--surface-1)] p-4 text-sm text-[var(--text-secondary)]">
                    Aucun tool à afficher.
                  </p>
                ) : (
                  filteredTools.map((tool) => {
                    const name = getToolName(tool);
                    const selected = selectedToolName === name;

                    return (
                      <button
                        key={name}
                        type="button"
                        onClick={() => handleSelectTool(tool)}
                        className={[
                          "block w-full rounded-2xl border p-3 text-left transition",
                          selected
                            ? "border-cyan-500/50 bg-cyan-500/10"
                            : "border-[var(--border)] bg-[var(--surface-1)] hover:border-cyan-500/30",
                        ].join(" ")}
                      >
                        <p className="truncate font-mono text-xs text-cyan-200">
                          {name}
                        </p>
                        <p className="mt-1 line-clamp-2 text-xs text-[var(--text-secondary)]">
                          {getToolDescription(tool)}
                        </p>
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          </aside>

          <div className="space-y-6">
            <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface-2)] p-5">
              <h2 className="text-sm font-semibold text-[var(--text-primary)]">
                Détail function/schema
              </h2>

              <pre className="mt-3 max-h-[360px] overflow-auto rounded-2xl border border-[var(--border)] bg-[var(--surface-1)] p-4 text-xs leading-6 text-[var(--text-secondary)]">
                {selectedTool
                  ? prettyJson(selectedTool)
                  : toolsPayload
                    ? "Sélectionne un tool dans la liste."
                    : "Charge d’abord la liste des tools."}
              </pre>
            </div>

            <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface-2)] p-5">
              <div className="mb-3 flex items-center justify-between gap-3">
                <h2 className="text-sm font-semibold text-[var(--text-primary)]">
                  Call Tool JSON
                </h2>

                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={handleResetInput}
                  className="border-[var(--border)] bg-transparent"
                >
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Reset Input
                </Button>
              </div>

              <textarea
                value={callInput}
                onChange={(event) => setCallInput(event.target.value)}
                spellCheck={false}
                className="min-h-[220px] w-full resize-y rounded-2xl border border-[var(--border)] bg-[var(--surface-1)] p-4 font-mono text-sm leading-6 text-[var(--text-primary)] outline-none focus:border-cyan-500/50"
              />

              {!parsedCallInput.ok ? (
                <p className="mt-3 text-sm text-red-300">
                  JSON invalide : {parsedCallInput.error}
                </p>
              ) : null}

              <div className="mt-4 flex flex-wrap gap-2">
                <Button
                  type="button"
                  onClick={() => void handleCallTool()}
                  disabled={loadingAction !== null || !parsedCallInput.ok}
                  className="bg-gradient-brainiak text-black hover:opacity-90 disabled:opacity-50"
                >
                  <Send className="mr-2 h-4 w-4" />
                  Call Tool
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  onClick={() => void handleCopyJson()}
                  disabled={!result && !selectedTool}
                  className="border-[var(--border)] bg-transparent"
                >
                  {copied ? (
                    <Check className="mr-2 h-4 w-4 text-emerald-300" />
                  ) : (
                    <Clipboard className="mr-2 h-4 w-4" />
                  )}
                  {copied ? "Copié" : "Copier JSON"}
                </Button>
              </div>
            </div>

            <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface-2)] p-5">
              <h2 className="text-sm font-semibold text-[var(--text-primary)]">
                Résultat brut
              </h2>

              <pre className="mt-3 max-h-[420px] overflow-auto rounded-2xl border border-[var(--border)] bg-[var(--surface-1)] p-4 text-xs leading-6 text-[var(--text-secondary)]">
                {result ? prettyJson(result) : "Aucun résultat pour le moment."}
              </pre>
            </div>
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