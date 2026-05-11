import { useMemo, useState } from "react";
import {
  Brain,
  RefreshCw,
  RotateCcw,
  Send,
  Sparkles,
  ToggleLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRuntimeStore } from "@/store/runtime-store";
import {
  getTokenlessStatus,
  sendFeedback,
  sendFeedbackSense,
  sendSkinnerFeedback,
  teachContrastive,
  teachWord,
  toggleTokenless,
} from "@/lib/api/learning-api";

type LearningTab =
  | "feedback"
  | "feedback-sense"
  | "skinner"
  | "teach"
  | "teach-contrastive"
  | "tokenless";

const TABS: Array<{ id: LearningTab; label: string }> = [
  { id: "feedback", label: "Feedback" },
  { id: "feedback-sense", label: "Feedback Sense" },
  { id: "skinner", label: "Skinner" },
  { id: "teach", label: "Teach" },
  { id: "teach-contrastive", label: "Teach Contrastive" },
  { id: "tokenless", label: "Tokenless" },
];

const DEFAULT_FEEDBACK = {
  session_id: "learning-front",
  tenant_id: "dev",
  rating: 1,
  comment: "Réponse utile.",
};

const DEFAULT_FEEDBACK_SENSE = {
  tenant_id: "dev",
  signal: "positive",
  intensity: 0.8,
  context: "Feedback utilisateur depuis le front.",
};

const DEFAULT_SKINNER = {
  tenant_id: "dev",
  stimulus: "question utilisateur",
  response: "réponse Brainiak",
  reward: 1.0,
};

const DEFAULT_TEACH = {
  word: "brainiak",
  definition: "Système intelligent de raisonnement et d’orchestration.",
};

const DEFAULT_TEACH_CONTRASTIVE = {
  anchor: "raisonnement",
  positive: "analyse structurée",
  negative: "réponse aléatoire",
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

export function LearningDashboard() {
  const [activeTab, setActiveTab] = useState<LearningTab>("feedback");

  const [feedbackPayload, setFeedbackPayload] = useState(
    prettyJson(DEFAULT_FEEDBACK),
  );
  const [feedbackSensePayload, setFeedbackSensePayload] = useState(
    prettyJson(DEFAULT_FEEDBACK_SENSE),
  );
  const [skinnerPayload, setSkinnerPayload] = useState(
    prettyJson(DEFAULT_SKINNER),
  );
  const [teachPayload, setTeachPayload] = useState(prettyJson(DEFAULT_TEACH));
  const [teachContrastivePayload, setTeachContrastivePayload] = useState(
    prettyJson(DEFAULT_TEACH_CONTRASTIVE),
  );

  const [tokenlessEnabled, setTokenlessEnabled] = useState(true);

  const [result, setResult] = useState<unknown>(null);
  const [error, setError] = useState<string | null>(null);
  const [loadingAction, setLoadingAction] = useState<string | null>(null);

  const pushApiEvent = useRuntimeStore((state) => state.pushApiEvent);

  const parsedFeedback = useMemo(
    () => parseJsonInput(feedbackPayload),
    [feedbackPayload],
  );

  const parsedFeedbackSense = useMemo(
    () => parseJsonInput(feedbackSensePayload),
    [feedbackSensePayload],
  );

  const parsedSkinner = useMemo(
    () => parseJsonInput(skinnerPayload),
    [skinnerPayload],
  );

  const parsedTeach = useMemo(() => parseJsonInput(teachPayload), [teachPayload]);

  const parsedTeachContrastive = useMemo(
    () => parseJsonInput(teachContrastivePayload),
    [teachContrastivePayload],
  );

  const [lastAction, setLastAction] = useState<null | (() => Promise<void>)>(null);

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
      module: "Learning",
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
        module: "Learning",
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
        module: "Learning",
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

  function resetInputs() {
    setFeedbackPayload(prettyJson(DEFAULT_FEEDBACK));
    setFeedbackSensePayload(prettyJson(DEFAULT_FEEDBACK_SENSE));
    setSkinnerPayload(prettyJson(DEFAULT_SKINNER));
    setTeachPayload(prettyJson(DEFAULT_TEACH));
    setTeachContrastivePayload(prettyJson(DEFAULT_TEACH_CONTRASTIVE));
    setTokenlessEnabled(true);
    setError(null);
    setLastAction(null);
  }

  async function handleSendFeedback() {
    if (!parsedFeedback.ok) {
      setError(`JSON feedback invalide : ${parsedFeedback.error}`);
      return;
    }

    await runAction(
      "send-feedback",
      "POST /v1/feedback",
      "POST",
      () => sendFeedback(parsedFeedback.value),
    );
  }

  async function handleSendFeedbackSense() {
    if (!parsedFeedbackSense.ok) {
      setError(`JSON feedback sense invalide : ${parsedFeedbackSense.error}`);
      return;
    }

    await runAction(
      "send-feedback-sense",
      "POST /v1/feedback-sense",
      "POST",
      () => sendFeedbackSense(parsedFeedbackSense.value),
    );
  }

  async function handleSendSkinner() {
    if (!parsedSkinner.ok) {
      setError(`JSON skinner invalide : ${parsedSkinner.error}`);
      return;
    }

    await runAction(
      "send-skinner",
      "POST /v1/skinner",
      "POST",
      () => sendSkinnerFeedback(parsedSkinner.value),
    );
  }

  async function handleTeachWord() {
    if (!parsedTeach.ok) {
      setError(`JSON teach invalide : ${parsedTeach.error}`);
      return;
    }

    await runAction(
      "teach-word",
      "POST /v1/teach",
      "POST",
      () => teachWord(parsedTeach.value),
    );
  }

  async function handleTeachContrastive() {
    if (!parsedTeachContrastive.ok) {
      setError(
        `JSON teach contrastive invalide : ${parsedTeachContrastive.error}`,
      );
      return;
    }

    await runAction(
      "teach-contrastive",
      "POST /v1/teach-contrastive",
      "POST",
      () => teachContrastive(parsedTeachContrastive.value),
    );
  }

  async function handleRefreshTokenless() {
    await runAction(
      "refresh-tokenless",
      "GET /v1/tokenless",
      "GET",
      getTokenlessStatus,
    );
  }

  async function handleToggleTokenless() {
    await runAction(
      "toggle-tokenless",
      "POST /v1/tokenless",
      "POST",
      () => toggleTokenless(tokenlessEnabled),
    );
  }

  function JsonEditor({
    title,
    value,
    onChange,
    valid,
    errorText,
  }: {
    title: string;
    value: string;
    onChange: (value: string) => void;
    valid: boolean;
    errorText?: string;
  }) {
    return (
      <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface-2)] p-5">
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2 className="text-sm font-semibold text-[var(--text-primary)]">
            {title}
          </h2>

          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={resetInputs}
            className="border-[var(--border)] bg-transparent"
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            Reset
          </Button>
        </div>

        <textarea
          value={value}
          onChange={(event) => onChange(event.target.value)}
          spellCheck={false}
          className="min-h-[220px] w-full resize-y rounded-2xl border border-[var(--border)] bg-[var(--surface-1)] p-4 font-mono text-sm leading-6 text-[var(--text-primary)] outline-none focus:border-cyan-500/50"
        />

        {!valid ? (
          <p className="mt-3 text-sm text-red-300">JSON invalide : {errorText}</p>
        ) : null}
      </div>
    );
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
                Learning
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--text-secondary)]">
                Envoyer du feedback, renforcer des réponses, enseigner des
                éléments simples et piloter le mode tokenless.
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
              "POST /v1/feedback",
              "POST /v1/feedback-sense",
              "POST /v1/skinner",
              "POST /v1/teach",
              "POST /v1/teach-contrastive",
              "GET /v1/tokenless",
              "POST /v1/tokenless",
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
            {activeTab === "feedback" && (
              <>
                <JsonEditor
                  title="Feedback JSON"
                  value={feedbackPayload}
                  onChange={setFeedbackPayload}
                  valid={parsedFeedback.ok}
                  errorText={parsedFeedback.ok ? undefined : parsedFeedback.error}
                />

                <Button
                  type="button"
                  onClick={() => void handleSendFeedback()}
                  disabled={loadingAction !== null || !parsedFeedback.ok}
                  className="bg-gradient-brainiak text-black hover:opacity-90 disabled:opacity-50"
                >
                  <Send className="mr-2 h-4 w-4" />
                  Send Feedback
                </Button>
              </>
            )}

            {activeTab === "feedback-sense" && (
              <>
                <JsonEditor
                  title="Feedback Sense JSON"
                  value={feedbackSensePayload}
                  onChange={setFeedbackSensePayload}
                  valid={parsedFeedbackSense.ok}
                  errorText={
                    parsedFeedbackSense.ok
                      ? undefined
                      : parsedFeedbackSense.error
                  }
                />

                <Button
                  type="button"
                  onClick={() => void handleSendFeedbackSense()}
                  disabled={loadingAction !== null || !parsedFeedbackSense.ok}
                  className="bg-gradient-brainiak text-black hover:opacity-90 disabled:opacity-50"
                >
                  <Brain className="mr-2 h-4 w-4" />
                  Send Feedback Sense
                </Button>
              </>
            )}

            {activeTab === "skinner" && (
              <>
                <JsonEditor
                  title="Skinner JSON"
                  value={skinnerPayload}
                  onChange={setSkinnerPayload}
                  valid={parsedSkinner.ok}
                  errorText={parsedSkinner.ok ? undefined : parsedSkinner.error}
                />

                <Button
                  type="button"
                  onClick={() => void handleSendSkinner()}
                  disabled={loadingAction !== null || !parsedSkinner.ok}
                  className="bg-gradient-brainiak text-black hover:opacity-90 disabled:opacity-50"
                >
                  <Sparkles className="mr-2 h-4 w-4" />
                  Send Skinner
                </Button>
              </>
            )}

            {activeTab === "teach" && (
              <>
                <JsonEditor
                  title="Teach Word JSON"
                  value={teachPayload}
                  onChange={setTeachPayload}
                  valid={parsedTeach.ok}
                  errorText={parsedTeach.ok ? undefined : parsedTeach.error}
                />

                <Button
                  type="button"
                  onClick={() => void handleTeachWord()}
                  disabled={loadingAction !== null || !parsedTeach.ok}
                  className="bg-gradient-brainiak text-black hover:opacity-90 disabled:opacity-50"
                >
                  <Send className="mr-2 h-4 w-4" />
                  Teach Word
                </Button>
              </>
            )}

            {activeTab === "teach-contrastive" && (
              <>
                <JsonEditor
                  title="Teach Contrastive JSON"
                  value={teachContrastivePayload}
                  onChange={setTeachContrastivePayload}
                  valid={parsedTeachContrastive.ok}
                  errorText={
                    parsedTeachContrastive.ok
                      ? undefined
                      : parsedTeachContrastive.error
                  }
                />

                <Button
                  type="button"
                  onClick={() => void handleTeachContrastive()}
                  disabled={loadingAction !== null || !parsedTeachContrastive.ok}
                  className="bg-gradient-brainiak text-black hover:opacity-90 disabled:opacity-50"
                >
                  <Send className="mr-2 h-4 w-4" />
                  Teach Contrastive
                </Button>
              </>
            )}

            {activeTab === "tokenless" && (
              <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface-2)] p-5">
                <h2 className="text-sm font-semibold text-[var(--text-primary)]">
                  Tokenless
                </h2>

                <p className="mt-2 text-sm text-[var(--text-secondary)]">
                  Vérifier ou modifier l’état du mode tokenless.
                </p>

                <label className="mt-4 flex items-center gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface-1)] px-4 py-3">
                  <input
                    type="checkbox"
                    checked={tokenlessEnabled}
                    onChange={(event) =>
                      setTokenlessEnabled(event.target.checked)
                    }
                    className="h-4 w-4"
                  />
                  <span className="text-sm text-[var(--text-primary)]">
                    Activer tokenless
                  </span>
                </label>

                <div className="mt-4 flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => void handleRefreshTokenless()}
                    disabled={loadingAction !== null}
                    className="border-[var(--border)] bg-transparent"
                  >
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Refresh Tokenless
                  </Button>

                  <Button
                    type="button"
                    onClick={() => void handleToggleTokenless()}
                    disabled={loadingAction !== null}
                    className="bg-gradient-brainiak text-black hover:opacity-90 disabled:opacity-50"
                  >
                    <ToggleLeft className="mr-2 h-4 w-4" />
                    Toggle Tokenless
                  </Button>
                </div>
              </div>
            )}
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