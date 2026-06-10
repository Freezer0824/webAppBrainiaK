import { useMemo, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Loader2,
  SearchCheck,
  Trash2,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  explainValidationRisk,
  reviewBeforeValidation,
} from "@/services/validation.service";
import { applyValidationDecision } from "@/services/validation-source.service";
import { useActivityStore } from "@/store/activity-store";
import { useMailboxStore } from "@/store/mailbox-store";
import {
  useValidationStore,
  type ValidationItem,
  type ValidationRiskLevel,
  type ValidationStatus,
} from "@/store/validation-store";
import {
  countMailPendingValidations,
  removeMailGeneratedResult,
} from "@/components/infini/mail/mail-persistence";

type ValidationAction = "review" | "risk";

type ValidationActionState = {
  validationId: string;
  action: ValidationAction;
  result: string;
} | null;

function getActionLabel(action: ValidationAction) {
  switch (action) {
    case "review":
      return "Analyse avant validation";
    case "risk":
      return "Explication du risque";
    default:
      return "Résultat BrainiaK";
  }
}

function getRiskClass(riskLevel: ValidationRiskLevel) {
  switch (riskLevel) {
    case "faible":
      return "border-emerald-500/30 bg-emerald-500/10 text-emerald-200";
    case "moyen":
      return "border-amber-500/30 bg-amber-500/10 text-amber-200";
    case "élevé":
      return "border-rose-500/30 bg-rose-500/10 text-rose-200";
    default:
      return "border-cyan-500/30 bg-cyan-500/10 text-cyan-200";
  }
}

function getStatusClass(status: ValidationStatus) {
  switch (status) {
    case "validé":
      return "border-emerald-500/30 bg-emerald-500/10 text-emerald-200";
    case "refusé":
      return "border-rose-500/30 bg-rose-500/10 text-rose-200";
    case "en attente":
      return "border-amber-500/30 bg-amber-500/10 text-amber-200";
    default:
      return "border-cyan-500/30 bg-cyan-500/10 text-cyan-200";
  }
}

function buildValidationContext(validation: ValidationItem) {
  return {
    type: validation.type,
    title: validation.title,
    description: validation.description,
    proposedAction: validation.proposedAction,
    riskLevel: validation.riskLevel,
  };
}

export function ValidationCenter() {
  const validations = useValidationStore((state) => state.validations);
  const updateValidationStatus = useValidationStore(
    (state) => state.updateValidationStatus,
  );
  const removeValidation = useValidationStore((state) => state.removeValidation);

  const markMailToProcess = useMailboxStore((state) => state.markMailToProcess);

  const addActivity = useActivityStore((state) => state.addActivity);

  const [activeResult, setActiveResult] = useState<ValidationActionState>(null);
  const [loadingAction, setLoadingAction] = useState<{
    validationId: string;
    action: ValidationAction;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const sortedValidations = useMemo(
    () =>
      [...validations].sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      ),
    [validations],
  );

  async function runValidationAction(
    validation: ValidationItem,
    action: ValidationAction,
  ) {
    setError(null);
    setLoadingAction({ validationId: validation.id, action });

    const context = buildValidationContext(validation);

    try {
      const result =
        action === "review"
          ? await reviewBeforeValidation(context)
          : await explainValidationRisk(context);

      setActiveResult({
        validationId: validation.id,
        action,
        result,
      });
    } catch (err) {
      console.error("Action validation BrainiaK échouée :", err);

      addActivity({
        title: "Erreur BrainiaK",
        description: `Impossible d'analyser la validation : ${validation.title}`,
        level: "error",
        relatedEntityId: validation.id,
        relatedEntityType: "validation",
      });

      setError(
        "BrainiaK n’a pas pu analyser cette validation pour le moment. Vous pouvez réessayer.",
      );
    } finally {
      setLoadingAction(null);
    }
  }

  function restoreMailActionIfNeeded(validation: ValidationItem) {
    if (
      validation.sourceType !== "mail" ||
      !validation.sourceId ||
      !validation.metadata?.mailAction
    ) {
      return;
    }

    removeMailGeneratedResult({
      mailId: validation.sourceId,
      action: validation.metadata.mailAction,
    });

    const remainingPendingCount = countMailPendingValidations(
      validation.sourceId,
    );

    if (remainingPendingCount === 0) {
      markMailToProcess(validation.sourceId);
    }
  }

  function handleValidate(validation: ValidationItem) {
    updateValidationStatus(validation.id, "validé");

    const sourceResult = applyValidationDecision(validation, "validé");

    addActivity({
      title: "Validation acceptée",
      description: `${validation.title} — ${sourceResult.message}`,
      level: "success",
      relatedEntityId: validation.id,
      relatedEntityType: "validation",
    });
  }

  function handleRefuse(validation: ValidationItem) {
    updateValidationStatus(validation.id, "refusé");

    restoreMailActionIfNeeded(validation);

    const sourceResult = applyValidationDecision(validation, "refusé");

    addActivity({
      title: "Validation refusée",
      description: `${validation.title} — ${sourceResult.message}`,
      level: "warning",
      relatedEntityId: validation.id,
      relatedEntityType: "validation",
    });
  }

  function handleRemove(validation: ValidationItem) {
    restoreMailActionIfNeeded(validation);
    removeValidation(validation.id);

    addActivity({
      title: "Validation supprimée",
      description: validation.title,
      level: "info",
      relatedEntityId: validation.id,
      relatedEntityType: "validation",
    });
  }

  function isLoading(validationId: string, action: ValidationAction) {
    return (
      loadingAction?.validationId === validationId &&
      loadingAction.action === action
    );
  }

  return (
    <section className="min-h-full bg-[var(--surface-0)] px-8 py-6">
      <div className="mx-auto grid w-full max-w-[1500px] gap-6 xl:grid-cols-[minmax(0,1fr)_460px]">
        <div className="space-y-6">
          <header className="rounded-3xl border border-[var(--border)] bg-[var(--surface-1)] p-6">
            <p className="text-xs font-medium uppercase tracking-[0.22em] text-cyan-300">
              Validations
            </p>

            <h1 className="mt-2 text-2xl font-semibold text-[var(--text-primary)]">
              Actions en attente
            </h1>

            <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--text-secondary)]">
              Les réponses générées par BrainiaK peuvent être ajoutées ici pour
              validation avant envoi, synchronisation ou utilisation finale.
            </p>
          </header>

          {error ? (
            <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-100">
              {error}
            </div>
          ) : null}

          {sortedValidations.length === 0 ? (
            <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface-1)] p-8 text-center">
              <h2 className="text-lg font-semibold text-[var(--text-primary)]">
                Aucune validation en attente
              </h2>

              <p className="mt-2 text-sm text-[var(--text-secondary)]">
                Ajoutez une réponse BrainiaK aux validations depuis la boîte
                mail, RIBDC, COMPLISOFT ou un autre module.
              </p>
            </div>
          ) : (
            <div className="grid gap-4">
              {sortedValidations.map((validation) => (
                <article
                  key={validation.id}
                  className="rounded-3xl border border-[var(--border)] bg-[var(--surface-1)] p-5"
                >
                  <div className="flex flex-col justify-between gap-4 lg:flex-row">
                    <div>
                      <div className="flex flex-wrap gap-2">
                        <span
                          className={[
                            "rounded-full border px-3 py-1 text-xs font-medium",
                            getStatusClass(validation.status),
                          ].join(" ")}
                        >
                          {validation.status}
                        </span>

                        <span
                          className={[
                            "rounded-full border px-3 py-1 text-xs font-medium",
                            getRiskClass(validation.riskLevel),
                          ].join(" ")}
                        >
                          Risque {validation.riskLevel}
                        </span>

                        <span className="rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-xs font-medium text-cyan-200">
                          {validation.type}
                        </span>
                      </div>

                      <h2 className="mt-5 text-lg font-semibold text-[var(--text-primary)]">
                        {validation.title}
                      </h2>

                      <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
                        {validation.description}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemove(validation)}
                      className="h-fit rounded-xl border border-[var(--border)] p-2 text-[var(--text-secondary)] hover:text-rose-300"
                      title="Supprimer"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="mt-5 rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] p-4">
                    <p className="text-xs font-medium uppercase tracking-[0.18em] text-cyan-300">
                      Action proposée
                    </p>

                    <p className="mt-2 text-sm leading-6 text-[var(--text-primary)]">
                      {validation.proposedAction}
                    </p>
                  </div>

                  <div className="mt-5 rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] p-4">
                    <p className="text-xs font-medium uppercase tracking-[0.18em] text-cyan-300">
                      Contenu à valider
                    </p>

                    <div className="mt-2 max-h-56 overflow-y-auto whitespace-pre-wrap text-sm leading-6 text-[var(--text-primary)]">
                      {validation.result}
                    </div>
                  </div>

                  <div className="mt-5 flex flex-wrap gap-2">
                    <Button
                      type="button"
                      onClick={() =>
                        void runValidationAction(validation, "review")
                      }
                      disabled={Boolean(loadingAction)}
                      className="bg-[var(--surface-3)] text-[var(--text-primary)] hover:bg-cyan-500/10 hover:text-cyan-200"
                    >
                      {isLoading(validation.id, "review") ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <SearchCheck className="mr-2 h-4 w-4" />
                      )}
                      Analyser avant validation
                    </Button>

                    <Button
                      type="button"
                      onClick={() =>
                        void runValidationAction(validation, "risk")
                      }
                      disabled={Boolean(loadingAction)}
                      className="bg-[var(--surface-3)] text-[var(--text-primary)] hover:bg-cyan-500/10 hover:text-cyan-200"
                    >
                      {isLoading(validation.id, "risk") ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <AlertTriangle className="mr-2 h-4 w-4" />
                      )}
                      Expliquer le risque
                    </Button>

                    <Button
                      type="button"
                      onClick={() => handleValidate(validation)}
                      disabled={validation.status === "validé"}
                      className="bg-emerald-500/90 text-white hover:bg-emerald-500 disabled:opacity-50"
                    >
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      Valider
                    </Button>

                    <Button
                      type="button"
                      onClick={() => handleRefuse(validation)}
                      disabled={validation.status === "refusé"}
                      className="bg-rose-500/90 text-white hover:bg-rose-500 disabled:opacity-50"
                    >
                      <XCircle className="mr-2 h-4 w-4" />
                      Refuser
                    </Button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>

        <aside className="h-fit rounded-3xl border border-[var(--border)] bg-[var(--surface-1)] p-5 xl:sticky xl:top-20">
          <p className="text-xs font-medium uppercase tracking-[0.22em] text-cyan-300">
            Analyse BrainiaK
          </p>

          {activeResult ? (
            <>
              <h2 className="mt-3 text-lg font-semibold text-[var(--text-primary)]">
                {getActionLabel(activeResult.action)}
              </h2>

              <div className="mt-4 whitespace-pre-wrap rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] p-4 text-sm leading-7 text-[var(--text-primary)]">
                {activeResult.result}
              </div>
            </>
          ) : (
            <div className="mt-4 rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] p-4 text-sm leading-6 text-[var(--text-secondary)]">
              Sélectionnez une validation pour demander à BrainiaK d’analyser
              l’action ou d’expliquer son niveau de risque.
            </div>
          )}
        </aside>
      </div>
    </section>
  );
}