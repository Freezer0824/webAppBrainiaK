type StreamingMessageProps = {
  content: string;
};

export function StreamingMessage({ content }: StreamingMessageProps) {
  return (
    <div className="flex justify-start">
      <div className="max-w-[85%] rounded-2xl border border-cyan-500/20 bg-cyan-500/5 px-4 py-3 md:max-w-[75%]">
        <div className="mb-2 flex items-center gap-2">
          <span className="text-xs font-medium uppercase tracking-[0.16em] text-cyan-300">
            Brainiak
          </span>
          <span className="h-2 w-2 animate-pulse rounded-full bg-cyan-400" />
        </div>

        <p className="whitespace-pre-wrap text-sm leading-7 text-[var(--text-primary)]">
          {content || "BrainiaK prépare une réponse…"}
        </p>
      </div>
    </div>
  );
}