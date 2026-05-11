type ReasoningStepProps = {
  title: string;
  content: string;
  index?: number;
};

export function ReasoningStep({
  title,
  content,
  index,
}: ReasoningStepProps) {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-1)] p-4">
      <div className="mb-2 flex items-center gap-2">
        {index !== undefined ? (
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-cyan-500/10 text-xs font-semibold text-cyan-300">
            {index + 1}
          </span>
        ) : null}

        <h5 className="heading-brainiak text-sm text-[var(--text-primary)]">
          {title}
        </h5>
      </div>

      <p className="whitespace-pre-wrap text-sm leading-7 text-[var(--text-secondary)]">
        {content}
      </p>
    </div>
  );
}