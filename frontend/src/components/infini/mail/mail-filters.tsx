import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";

export type MailFilter =
  | "all"
  | "to_process"
  | "high_priority"
  | "summarized"
  | "reply_ready"
  | "followup_ready"
  | "in_validation";

type MailFilterOption = {
  value: MailFilter;
  label: string;
};

const filterOptions: MailFilterOption[] = [
  { value: "all", label: "Tous" },
  { value: "to_process", label: "À traiter" },
  { value: "high_priority", label: "Priorité haute" },
  { value: "summarized", label: "Résumés" },
  { value: "reply_ready", label: "Réponses préparées" },
  { value: "followup_ready", label: "Relances préparées" },
  { value: "in_validation", label: "En validation" },
];

type MailFiltersProps = {
  selectedFilter: MailFilter;
  searchQuery: string;
  onFilterChange: (filter: MailFilter) => void;
  onSearchChange: (query: string) => void;
};

export function MailFilters({
  selectedFilter,
  searchQuery,
  onFilterChange,
  onSearchChange,
}: MailFiltersProps) {
  return (
    <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface-1)] p-4">
      <div className="flex flex-col gap-4">
        <div className="relative">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-secondary)]" />

          <input
            value={searchQuery}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Rechercher un mail, un client, un sujet..."
            className="h-11 w-full rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] pl-11 pr-4 text-sm text-[var(--text-primary)] outline-none placeholder:text-[var(--text-secondary)] focus:border-cyan-500/60"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {filterOptions.map((option) => {
            const isActive = selectedFilter === option.value;

            return (
              <Button
                key={option.value}
                type="button"
                onClick={() => onFilterChange(option.value)}
                className={
                  isActive
                    ? "bg-cyan-500/90 text-black hover:bg-cyan-400"
                    : "bg-[var(--surface-3)] text-[var(--text-primary)] hover:bg-cyan-500/10 hover:text-cyan-200"
                }
              >
                {option.label}
              </Button>
            );
          })}
        </div>
      </div>
    </div>
  );
}