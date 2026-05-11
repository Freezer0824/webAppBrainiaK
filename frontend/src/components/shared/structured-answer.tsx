import { parseStructuredAnswer } from "@/features/reasoning/parse-structured-answer";
import { ReasoningPanel } from "./reasoning-panel";

type StructuredAnswerProps = {
  content: string;
};

export function StructuredAnswer({ content }: StructuredAnswerProps) {
  const parsed = parseStructuredAnswer(content);

  if (!parsed.blocks.length) {
    return (
      <p className="whitespace-pre-wrap text-sm leading-7 text-[var(--text-primary)]">
        {content}
      </p>
    );
  }

  const summary = parsed.blocks.find((block) => block.type === "summary");
  const result = parsed.blocks.find((block) => block.type === "result");
  const codeBlocks = parsed.blocks.filter((block) => block.type === "code");

  return (
    <div className="space-y-4">
      {summary ? (
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-1)] p-4">
          <h4 className="heading-brainiak mb-2 text-sm">{summary.title}</h4>
          <p className="whitespace-pre-wrap text-sm leading-7 text-[var(--text-primary)]">
            {summary.content}
          </p>
        </div>
      ) : null}

      <ReasoningPanel blocks={parsed.blocks} />

      {codeBlocks.map((block, index) => (
        <div
          key={`code-${index}`}
          className="rounded-2xl border border-[var(--border)] bg-black/30 p-4"
        >
          <div className="mb-2 flex items-center justify-between">
            <h4 className="heading-brainiak text-sm">{block.title}</h4>
            <span className="rounded-full bg-cyan-500/10 px-2 py-1 text-xs text-cyan-300">
              {block.language ?? "text"}
            </span>
          </div>

          <pre className="scrollbar-brainiak overflow-x-auto rounded-xl bg-black/30 p-3 text-sm leading-7 text-[var(--text-primary)]">
            <code>{block.content}</code>
          </pre>
        </div>
      ))}

      {result ? (
        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4">
          <h4 className="heading-brainiak mb-2 text-sm text-emerald-300">
            {result.title}
          </h4>
          <p className="whitespace-pre-wrap text-sm leading-7 text-[var(--text-primary)]">
            {result.content}
          </p>
        </div>
      ) : null}
    </div>
  );
}