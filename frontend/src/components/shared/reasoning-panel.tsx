import { ReasoningStep } from "./reasoning-step";
import type { ParsedReasoningBlock } from "@/features/reasoning/parse-structured-answer";

type ReasoningPanelProps = {
  blocks: ParsedReasoningBlock[];
};

export function ReasoningPanel({ blocks }: ReasoningPanelProps) {
  const reasoningBlocks = blocks.filter(
    (block) => block.type === "step" || block.type === "text",
  );

  if (!reasoningBlocks.length) return null;

  return (
    <div className="mt-4 space-y-3">
      <div>
        <h4 className="heading-brainiak text-sm">Reasoning Structure</h4>
        <p className="mt-1 text-xs text-[var(--text-secondary)]">
          Logical steps and intermediate analytical blocks
        </p>
      </div>

      {reasoningBlocks.map((block, index) => (
        <ReasoningStep
          key={`${block.type}-${index}`}
          title={block.title}
          content={block.content}
          index={index}
        />
      ))}
    </div>
  );
}