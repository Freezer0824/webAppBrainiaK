import { MessageBubble } from "./message-bubble";
import { StreamingMessage } from "./streaming-message";
import { PromptInput } from "./prompt-input";
import type { ChatMessage } from "@/types/chat";

type ChatWindowProps = {
  messages: ChatMessage[];
};

export function ChatWindow({ messages }: ChatWindowProps) {
  const streaming = messages.find((message) => message.isStreaming);

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden">
      <div className="scrollbar-brainiak min-h-0 flex-1 overflow-y-auto px-6 py-6">
        <div className="flex min-h-full w-full flex-col justify-end gap-4">
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