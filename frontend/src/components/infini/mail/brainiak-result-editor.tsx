import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { BrainiakMailResult } from "./mail-types";

type BrainiakResultEditorProps = {
  result: BrainiakMailResult;
  onSave: (updatedResult: BrainiakMailResult) => void;
  onCancel: () => void;
};

export function BrainiakResultEditor({
  result,
  onSave,
  onCancel,
}: BrainiakResultEditorProps) {
  const [title, setTitle] = useState(result.title);
  const [content, setContent] = useState(result.content);

  function handleSave() {
    onSave({
      ...result,
      title: title.trim() || result.title,
      content: content.trim(),
      status: "edited",
      updatedAt: new Date().toISOString(),
    });
  }

  return (
    <div className="mt-5 rounded-2xl border border-cyan-500/30 bg-cyan-500/10 p-4">
      <p className="text-xs font-medium uppercase tracking-[0.18em] text-cyan-300">
        Modifier le résultat BrainiaK
      </p>

      <label className="mt-4 block text-xs font-medium text-[var(--text-secondary)]">
        Sujet / titre
      </label>

      <input
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        className="mt-2 h-11 w-full rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] px-4 text-sm text-[var(--text-primary)] outline-none focus:border-cyan-500/60"
      />

      <label className="mt-4 block text-xs font-medium text-[var(--text-secondary)]">
        Contenu
      </label>

      <textarea
        value={content}
        onChange={(event) => setContent(event.target.value)}
        rows={12}
        className="mt-2 w-full resize-y rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] p-4 text-sm leading-7 text-[var(--text-primary)] outline-none focus:border-cyan-500/60"
      />

      <div className="mt-4 flex flex-wrap gap-2">
        <Button
          type="button"
          onClick={handleSave}
          disabled={content.trim().length === 0}
          className="bg-cyan-500/90 text-black hover:bg-cyan-400 disabled:opacity-60"
        >
          Enregistrer
        </Button>

        <Button
          type="button"
          onClick={onCancel}
          className="bg-[var(--surface-3)] text-[var(--text-primary)] hover:bg-white/5"
        >
          Annuler
        </Button>
      </div>
    </div>
  );
}