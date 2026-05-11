import { Check, Clipboard, Trash2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useRuntimeStore } from "@/store/runtime-store";

function getStatusClass(status: string) {
  if (status === "success") return "text-emerald-300";
  if (status === "error") return "text-red-300";
  if (status === "running") return "text-amber-300";
  return "text-[var(--text-secondary)]";
}

export function ApiActivityPanel() {
  const [copied, setCopied] = useState(false);

  const apiEvents = useRuntimeStore((state) => state.apiEvents);
  const clearApiEvents = useRuntimeStore((state) => state.clearApiEvents);

  const latestEvent = apiEvents[0];
  const latestError = apiEvents.find((event) => event.error)?.error ?? null;

  async function handleCopyError() {
    if (!latestError) return;

    await navigator.clipboard.writeText(latestError);
    setCopied(true);

    window.setTimeout(() => {
      setCopied(false);
    }, 1500);
  }

  return (
    <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] p-4">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <h4 className="heading-brainiak text-sm">Global API Activity</h4>
          <p className="mt-1 text-xs text-[var(--text-secondary)]">
            Routes called by all dashboards
          </p>
        </div>

        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={clearApiEvents}
          className="h-8 px-2 text-[var(--text-secondary)]"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      {latestEvent ? (
        <div className="space-y-3">
          <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-1)] p-3">
            <div className="flex items-center justify-between gap-3">
              <span className="text-xs text-[var(--text-secondary)]">
                Dernière route
              </span>
              <span className={["text-xs font-semibold", getStatusClass(latestEvent.status)].join(" ")}>
                {latestEvent.status}
              </span>
            </div>

            <p className="mt-2 truncate font-mono text-xs text-cyan-200">
              {latestEvent.method} {latestEvent.route}
            </p>

            <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-[var(--text-secondary)]">
              <span>Module: {latestEvent.module}</span>
              <span>Action: {latestEvent.action}</span>
              <span>HTTP: {latestEvent.httpStatus ?? "—"}</span>
              <span>Durée: {latestEvent.durationMs ?? "—"} ms</span>
            </div>

            {latestEvent.payloadPreview ? (
              <pre className="mt-3 max-h-28 overflow-auto rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-2 text-[11px] leading-5 text-[var(--text-secondary)]">
                {latestEvent.payloadPreview}
              </pre>
            ) : null}
          </div>

          {latestError ? (
            <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-3">
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-semibold text-red-200">
                  Erreur lisible
                </p>

                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => void handleCopyError()}
                  className="h-7 px-2 text-red-100"
                >
                  {copied ? (
                    <Check className="h-3.5 w-3.5" />
                  ) : (
                    <Clipboard className="h-3.5 w-3.5" />
                  )}
                </Button>
              </div>

              <p className="mt-2 text-xs leading-5 text-red-100/80">
                {latestError}
              </p>
            </div>
          ) : null}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-[var(--border)] bg-[var(--surface-1)] p-3 text-sm text-[var(--text-secondary)]">
          Aucun événement API global.
        </div>
      )}
    </section>
  );
}