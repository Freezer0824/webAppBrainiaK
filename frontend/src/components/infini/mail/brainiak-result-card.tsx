import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BrainiakResultEditor } from "./brainiak-result-editor";
import { AttachmentPicker } from "./attachment-picker";
import type { AttachmentItem, BrainiakMailResult } from "./mail-types";

type BrainiakResultCardProps = {
  result: BrainiakMailResult;
  editingResultId: string | null;
  addedToValidation: boolean;
  onEdit: (result: BrainiakMailResult) => void;
  onSaveEdit: (result: BrainiakMailResult) => void;
  onCancelEdit: () => void;
  onDelete: (result: BrainiakMailResult) => void;
  onUpdateAttachments: (
    result: BrainiakMailResult,
    attachments: AttachmentItem[],
  ) => void;
  onAddToValidations: () => void;
};

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

export function BrainiakResultCard({
  result,
  editingResultId,
  addedToValidation,
  onEdit,
  onSaveEdit,
  onCancelEdit,
  onDelete,
  onUpdateAttachments,
  onAddToValidations,
}: BrainiakResultCardProps) {
  const isPendingValidation = result.status === "pending_validation";
  const isEditing = editingResultId === result.id;

  if (isEditing) {
    return (
      <BrainiakResultEditor
        result={result}
        onSave={onSaveEdit}
        onCancel={onCancelEdit}
      />
    );
  }

  return (
    <div className="mt-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">
            {result.title}
          </h2>

          <p className="mt-1 text-xs text-[var(--text-secondary)]">
            Créé le {result.createdAt}
            {result.updatedAt ? ` · Modifié le ${result.updatedAt}` : ""}
          </p>
        </div>

        <span
          className={[
            "shrink-0 rounded-full border px-3 py-1 text-xs font-medium",
            getStatusClass(result.status),
          ].join(" ")}
        >
          {getStatusLabel(result.status)}
        </span>
      </div>

      <div className="mt-4 whitespace-pre-wrap rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] p-4 text-sm leading-7 text-[var(--text-primary)]">
        {result.content}
      </div>

      <div className="mt-4 rounded-2xl border border-amber-500/20 bg-amber-500/10 p-4 text-sm text-amber-100">
        Validation humaine requise avant envoi, archivage ou synchronisation.
      </div>

      {result.action !== "summary" ? (
        <AttachmentPicker
          attachments={result.attachments}
          disabled={isPendingValidation}
          onChange={(attachments) => onUpdateAttachments(result, attachments)}
        />
      ) : null}

      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        <Button
          type="button"
          onClick={() => onEdit(result)}
          disabled={isPendingValidation}
          className="bg-[var(--surface-3)] text-[var(--text-primary)] hover:bg-cyan-500/10 hover:text-cyan-200 disabled:opacity-50"
        >
          <Pencil className="mr-2 h-4 w-4" />
          Modifier
        </Button>

        <Button
          type="button"
          onClick={() => onDelete(result)}
          disabled={isPendingValidation}
          className="bg-rose-500/10 text-rose-100 hover:bg-rose-500/20 disabled:opacity-50"
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Supprimer
        </Button>
      </div>

      <Button
        type="button"
        onClick={onAddToValidations}
        disabled={addedToValidation || isPendingValidation}
        className="mt-3 w-full bg-cyan-500/90 text-black hover:bg-cyan-400 disabled:opacity-60"
      >
        {isPendingValidation
          ? "Déjà en validation ✓"
          : addedToValidation
            ? "Ajouté aux validations ✓"
            : "Ajouter aux validations"}
      </Button>
    </div>
  );
}