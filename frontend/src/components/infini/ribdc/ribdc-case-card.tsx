import type { RibdcCase, RibdcWorkType } from "./ribdc-types";

type RibdcCaseCardProps = {
  item: RibdcCase;
  onGenerate: (item: RibdcCase, type: RibdcWorkType) => void;
};

export function RibdcCaseCard({
  item,
}: RibdcCaseCardProps) {
  return (
    <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface-1)] p-5">
      <h3 className="text-lg font-semibold text-[var(--text-primary)]">
        {item.clientName}
      </h3>

      <p className="mt-2 text-sm text-[var(--text-secondary)]">
        {item.description}
      </p>
    </div>
  );
}