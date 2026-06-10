import { Button } from "@/components/ui/button";
import type { RibdcWorkResult } from "./ribdc-types";

type RibdcWorkPanelProps = {
  results: RibdcWorkResult[];
  selectedResultId: string | null;
  onSelect: (id: string) => void;
  onAddToValidation: (result: RibdcWorkResult) => void;
};

function getStatusClass(status: RibdcWorkResult["status"]) {
  switch (status) {
    case "generated":
      return "border-cyan-500/30 bg-cyan-500/10 text-cyan-200";
    case "edited":
      return "border-amber-500/30 bg-amber-500/10 text-amber-200";
    case "pending_validation":
      return "border-violet-500/30 bg-violet-500/10 text-violet-200";
  }
}

export function RibdcWorkPanel({
  results,
  selectedResultId,
  onSelect,
  onAddToValidation,
}: RibdcWorkPanelProps) {
  const selectedResult =
    results.find((result) => result.id === selectedResultId) ?? results[0];

  return (
    <aside className="h-fit rounded-3xl border border-[var(--border)] bg-[var(--surface-1)] p-5 xl:sticky xl:top-20">
      <p className="text-xs font-medium uppercase tracking-[0.22em] text-cyan-300">
        Travaux RIBDC
      </p>

      {results.length === 0 ? (
        <div className="mt-4 rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] p-4 text-sm leading-6 text-[var(--text-secondary)]">
          Lancez une action sur un formulaire pour afficher ici le préremplissage,
          les champs manquants ou le rapport de contrôle.
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
                  onClick={() => onSelect(result.id)}
                  className={[
                    "w-full rounded-2xl border p-3 text-left transition",
                    isSelected
                      ? "border-cyan-500/50 bg-cyan-500/10"
                      : "border-[var(--border)] bg-[var(--surface-2)] hover:border-cyan-500/30",
                  ].join(" ")}
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm font-medium text-[var(--text-primary)]">
                      {result.title}
                    </span>

                    <span
                      className={[
                        "rounded-full border px-2 py-0.5 text-[11px]",
                        getStatusClass(result.status),
                      ].join(" ")}
                    >
                      {result.status === "pending_validation"
                        ? "En validation"
                        : "Généré"}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {selectedResult ? (
            <div className="mt-5">
              <h2 className="text-lg font-semibold text-[var(--text-primary)]">
                {selectedResult.title}
              </h2>

              <div className="mt-4 whitespace-pre-wrap rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] p-4 text-sm leading-7 text-[var(--text-primary)]">
                {selectedResult.content}
              </div>

              <div className="mt-4 rounded-2xl border border-amber-500/20 bg-amber-500/10 p-4 text-sm text-amber-100">
                Validation humaine requise avant utilisation du formulaire
                prérempli.
              </div>

              <Button
                type="button"
                onClick={() => onAddToValidation(selectedResult)}
                disabled={selectedResult.status === "pending_validation"}
                className="mt-4 w-full bg-cyan-500/90 text-black hover:bg-cyan-400 disabled:opacity-60"
              >
                {selectedResult.status === "pending_validation"
                  ? "Déjà en validation ✓"
                  : "Ajouter aux validations"}
              </Button>
            </div>
          ) : null}
        </>
      )}
    </aside>
  );
}