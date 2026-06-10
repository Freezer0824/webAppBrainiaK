import { Sparkles } from "lucide-react";
import type { AssistantSuggestion } from "@/features/infini/assistant-context";

type AssistantSuggestionsProps = {
  suggestions: AssistantSuggestion[];
  onSelect: (prompt: string) => void;
};

export function AssistantSuggestions({
  suggestions,
  onSelect,
}: AssistantSuggestionsProps) {
  return (
    <div className="border-b border-[var(--border)] bg-[var(--surface-1)] px-6 py-3">
      <div className="mb-3 flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-cyan-300" />
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-[var(--text-secondary)]">
          Actions rapides
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {suggestions.map((suggestion) => (
          <button
            key={suggestion.id}
            type="button"
            onClick={() => onSelect(suggestion.prompt)}
            className="rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-1.5 text-xs font-medium text-cyan-100 transition hover:border-cyan-400/40 hover:bg-cyan-500/20"
          >
            {suggestion.label}
          </button>
        ))}
      </div>
    </div>
  );
}