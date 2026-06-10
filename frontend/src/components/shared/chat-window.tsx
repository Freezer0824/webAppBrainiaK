import { MessageBubble } from "./message-bubble";
import { StreamingMessage } from "./streaming-message";
import { PromptInput } from "./prompt-input";
import { AssistantSuggestions } from "@/components/infini/assistant-suggestions";
import { assistantSuggestions } from "@/features/infini/assistant-context";
import { useComposerStore } from "@/store/composer-store";
import type { ChatMessage } from "@/types/chat";

type ChatWindowProps = {
  messages: ChatMessage[];
};

export function ChatWindow({ messages }: ChatWindowProps) {
  const streaming = messages.find((message) => message.isStreaming);
  const setValue = useComposerStore((state) => state.setValue);

  function handleSuggestionSelect(prompt: string) {
    setValue(prompt);
  }

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden">

      <AssistantSuggestions
        suggestions={assistantSuggestions}
        onSelect={handleSuggestionSelect}
      />

      <div className="scrollbar-brainiak min-h-0 flex-1 overflow-y-auto px-6 py-4">
        <div className="flex w-full flex-col gap-4">
          {messages.length === 0 ? (
            <div className="mx-auto max-w-2xl rounded-3xl border border-[var(--border)] bg-[var(--surface-1)] p-6 text-center">
              <h2 className="text-lg font-semibold text-[var(--text-primary)]">
                Comment BrainiaK peut vous aider ?
              </h2>

              <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
                Choisissez une suggestion ou décrivez naturellement la tâche à
                préparer. BrainiaK vous aidera à structurer le travail avant
                toute validation.
              </p>
            </div>
          ) : null}

          {messages
            .filter((message) => !message.isStreaming)
            .map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))}

          {streaming ? <StreamingMessage content={streaming.content} /> : null}
        </div>
      </div>

      <div className="shrink-0 border-t border-[var(--border)] bg-[var(--surface-1)]">
        <PromptInput />
      </div>
    </div>
  );
}