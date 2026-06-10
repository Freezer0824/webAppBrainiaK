import type {
  AttachmentItem,
  BrainiakMailResult,
  MailActionType,
} from "./mail-types";
import { BrainiakResultCard } from "./brainiak-result-card";

type BrainiakWorkPanelProps = {
  results: BrainiakMailResult[];
  selectedResultId: string | null;
  editingResultId: string | null;
  addedToValidation: boolean;
  onSelectResult: (resultId: string) => void;
  onEditResult: (result: BrainiakMailResult) => void;
  onSaveEdit: (result: BrainiakMailResult) => void;
  onCancelEdit: () => void;
  onDeleteResult: (result: BrainiakMailResult) => void;
  onUpdateAttachments: (
    result: BrainiakMailResult,
    attachments: AttachmentItem[],
  ) => void;
  onAddToValidations: () => void;
};

function getActionLabel(action: MailActionType) {
  switch (action) {
    case "summary":
      return "Résumé";
    case "reply":
      return "Réponse";
    case "followup":
      return "Relance";
  }
}

function getStatusLabel(status: BrainiakMailResult["status"]) {
  switch (status) {
    case "draft":
      return "Brouillon";
    case "generated":
      return "Généré";
    case "edited":
      return "Modifié";
    case "pending_validation":
      return "En validation";
    case "validated":
      return "Validé";
    case "rejected":
      return "Refusé";
    case "deleted":
      return "Supprimé";
  }
}

function getStatusClass(status: BrainiakMailResult["status"]) {
  switch (status) {
    case "generated":
      return "border-cyan-500/30 bg-cyan-500/10 text-cyan-200";
    case "edited":
      return "border-amber-500/30 bg-amber-500/10 text-amber-200";
    case "pending_validation":
      return "border-violet-500/30 bg-violet-500/10 text-violet-200";
    case "validated":
      return "border-emerald-500/30 bg-emerald-500/10 text-emerald-200";
    case "rejected":
    case "deleted":
      return "border-rose-500/30 bg-rose-500/10 text-rose-200";
    default:
      return "border-slate-500/30 bg-slate-500/10 text-slate-200";
  }
}

export function BrainiakWorkPanel({
  results,
  selectedResultId,
  editingResultId,
  addedToValidation,
  onSelectResult,
  onEditResult,
  onSaveEdit,
  onCancelEdit,
  onDeleteResult,
  onUpdateAttachments,
  onAddToValidations,
}: BrainiakWorkPanelProps) {
  const selectedResult =
    results.find((result) => result.id === selectedResultId) ?? results[0];

  return (
    <aside className="h-fit rounded-3xl border border-[var(--border)] bg-[var(--surface-1)] p-5 xl:sticky xl:top-20">
      <p className="text-xs font-medium uppercase tracking-[0.22em] text-cyan-300">
        Travaux BrainiaK
      </p>

      {results.length === 0 ? (
        <div className="mt-4 rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] p-4 text-sm leading-6 text-[var(--text-secondary)]">
          Sélectionnez une action sur un mail pour afficher ici le résumé, la
          réponse ou la relance préparée par BrainiaK.
        </div>
      ) : (
        <>
          <div className="mt-4 space-y-2">
            {results.map((result) => {
              const isSelected = selectedResult?.id === result.id;

              return (
                <button
                  key={result.id}
                  type="button"
                  onClick={() => onSelectResult(result.id)}
                  className={[
                    "w-full rounded-2xl border p-3 text-left transition",
                    isSelected
                      ? "border-cyan-500/50 bg-cyan-500/10"
                      : "border-[var(--border)] bg-[var(--surface-2)] hover:border-cyan-500/30 hover:bg-cyan-500/5",
                  ].join(" ")}
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm font-medium text-[var(--text-primary)]">
                      {result.title}
                    </span>

                    <span
                      className={[
                        "shrink-0 rounded-full border px-2 py-0.5 text-[11px] font-medium",
                        getStatusClass(result.status),
                      ].join(" ")}
                    >
                      {getStatusLabel(result.status)}
                    </span>
                  </div>

                  <p className="mt-1 text-xs text-[var(--text-secondary)]">
                    {getActionLabel(result.action)} · {result.createdAt}
                  </p>
                </button>
              );
            })}
          </div>

          {selectedResult ? (
            <BrainiakResultCard
              result={selectedResult}
              editingResultId={editingResultId}
              addedToValidation={addedToValidation}
              onEdit={onEditResult}
              onSaveEdit={onSaveEdit}
              onCancelEdit={onCancelEdit}
              onDelete={onDeleteResult}
              onUpdateAttachments={onUpdateAttachments}
              onAddToValidations={onAddToValidations}
            />
          ) : null}
        </>
      )}
    </aside>
  );
}