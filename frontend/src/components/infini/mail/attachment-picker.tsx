import { Paperclip, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { AttachmentItem } from "./mail-types";
import { mockAttachments } from "./mail-mocks";

type AttachmentPickerProps = {
  attachments: AttachmentItem[];
  disabled?: boolean;
  onChange: (attachments: AttachmentItem[]) => void;
};

function getSourceLabel(source: AttachmentItem["source"]) {
  switch (source) {
    case "client_file":
      return "Dossier client";
    case "local":
      return "Local";
    case "vault":
      return "Coffre-fort";
    case "mailbox":
      return "Boîte mail";
  }
}

export function AttachmentPicker({
  attachments,
  disabled = false,
  onChange,
}: AttachmentPickerProps) {
  function handleRemove(attachmentId: string) {
    onChange(attachments.filter((attachment) => attachment.id !== attachmentId));
  }

  function handleAddMockAttachment() {
    const nextAttachment = mockAttachments.find(
      (mockAttachment) =>
        !attachments.some(
          (attachment) => attachment.id === mockAttachment.id,
        ),
    );

    if (!nextAttachment) {
      const localAttachment: AttachmentItem = {
        id: `att-local-${Date.now()}`,
        name: `Document_local_${attachments.length + 1}.pdf`,
        type: "pdf",
        source: "local",
        sizeLabel: "720 Ko",
      };

      onChange([...attachments, localAttachment]);
      return;
    }

    onChange([...attachments, nextAttachment]);
  }

  return (
    <div className="mt-4 rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-[var(--text-secondary)]">
            Pièces jointes
          </p>

          <p className="mt-1 text-xs text-[var(--text-secondary)]">
            Documents proposés par BrainiaK, modifiables avant validation.
          </p>
        </div>

        <Button
          type="button"
          onClick={handleAddMockAttachment}
          disabled={disabled}
          className="bg-[var(--surface-3)] text-[var(--text-primary)] hover:bg-cyan-500/10 hover:text-cyan-200 disabled:opacity-50"
        >
          <Plus className="mr-2 h-4 w-4" />
          Ajouter
        </Button>
      </div>

      {attachments.length === 0 ? (
        <div className="mt-4 rounded-xl border border-dashed border-[var(--border)] bg-[var(--surface-1)] p-4 text-sm text-[var(--text-secondary)]">
          Aucune pièce jointe ajoutée.
        </div>
      ) : (
        <div className="mt-4 space-y-2">
          {attachments.map((attachment) => (
            <div
              key={attachment.id}
              className="flex items-center justify-between gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface-1)] px-3 py-2 text-sm"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <Paperclip className="h-4 w-4 shrink-0 text-cyan-300" />

                  <span className="truncate text-[var(--text-primary)]">
                    {attachment.name}
                  </span>
                </div>

                <p className="mt-1 text-xs text-[var(--text-secondary)]">
                  {getSourceLabel(attachment.source)}
                  {attachment.sizeLabel ? ` · ${attachment.sizeLabel}` : ""}
                </p>
              </div>

              <button
                type="button"
                onClick={() => handleRemove(attachment.id)}
                disabled={disabled}
                className="rounded-full p-2 text-[var(--text-secondary)] transition hover:bg-rose-500/10 hover:text-rose-200 disabled:cursor-not-allowed disabled:opacity-40"
                aria-label={`Retirer ${attachment.name}`}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}