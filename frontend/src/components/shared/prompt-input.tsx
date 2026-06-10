import {
  useRef,
  useState,
  type ChangeEvent,
  type KeyboardEvent,
} from "react";
import {
  Paperclip,
  RotateCcw,
  SendHorizonal,
  Sparkles,
  Square,
  Wand2,
  X,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useBrainiakChat } from "@/features/chat/use-brainiak-chat";
import { useComposerStore } from "@/store/composer-store";
import { useChatStore } from "@/store/chat-store";
import { uploadFiles } from "@/lib/api/upload-api";
import type { ToolPresetDto } from "@/types/api";
import { cn } from "@/lib/utils";

type ToolKey = "web_search" | "code" | "analysis";

const LOCAL_TOOL_PRESETS: ToolPresetDto[] = [
  {
    id: "web_search",
    label: "Recherche web",
    description: "Rechercher ou compléter des informations externes.",
  },
  {
    id: "code",
    label: "Code",
    description: "Lire, écrire, corriger ou expliquer du code.",
  },
  {
    id: "analysis",
    label: "Analyse",
    description: "Analyser, comparer ou structurer des informations.",
  },
];

export function PromptInput() {
  const [toolsOpen, setToolsOpen] = useState(false);
  const [presets] = useState<ToolPresetDto[]>(LOCAL_TOOL_PRESETS);
  const [uploading, setUploading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const { sendPrompt, retryLastPrompt, stopPrompt } = useBrainiakChat();

  const isStreaming = useChatStore((state) => state.isStreaming);
  const lastUserPrompt = useChatStore((state) => state.lastUserPrompt);
  const lastBackendError = useChatStore((state) => state.lastBackendError);

  const {
    value,
    setValue,
    clearValue,
    attachedFiles,
    addLocalFiles,
    markUploadedFiles,
    removeFile,
    selectedTools,
    toggleTool,
    reasoningEnabled,
    toggleReasoning,
  } = useComposerStore();

  const trimmedValue = value.trim();
  const canSend = !isStreaming && !uploading && trimmedValue.length > 0;
  const canRetry = !isStreaming && !uploading && Boolean(lastUserPrompt);

  async function handleSend() {
    if (!canSend) return;

    const promptToSend = trimmedValue;

    clearValue();
    setToolsOpen(false);

    try {
      await sendPrompt(promptToSend);
    } catch (error) {
      console.error("Send failed", error);
      setValue(promptToSend);
    }
  }

  async function handleRetry() {
    if (!canRetry) return;

    setToolsOpen(false);

    try {
      await retryLastPrompt();
    } catch (error) {
      console.error("Retry failed", error);
    }
  }

  async function handleStop() {
    try {
      await stopPrompt();
    } catch (error) {
      console.error("Stop failed", error);
    }
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void handleSend();
    }
  }

  function handleAttachClick() {
    if (isStreaming || uploading) return;

    fileInputRef.current?.click();
  }

  async function handleFilesSelected(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);

    if (!files.length) return;

    addLocalFiles(files);
    setUploading(true);

    try {
      const result = await uploadFiles(files);

      markUploadedFiles(
        result.files.map((file: { id: string; name: string }, index: number) => ({
          localName: files[index]?.name ?? file.name,
          uploadedId: file.id,
        })),
      );
    } catch (error) {
      console.error("Upload failed", error);
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  }

  return (
    <div className="p-4">
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] p-3 shadow-[0_0_0_1px_rgba(255,255,255,0.02)]">
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          onChange={handleFilesSelected}
        />

        {lastBackendError ? (
          <div className="mb-3 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {lastBackendError}
          </div>
        ) : null}

        {attachedFiles.length > 0 ? (
          <div className="mb-3 flex flex-wrap gap-2">
            {attachedFiles.map((file) => (
              <div
                key={file.id}
                className="flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface-1)] px-3 py-1 text-xs text-[var(--text-primary)]"
              >
                <span className="max-w-[180px] truncate">{file.name}</span>

                <span
                  className={cn(
                    "rounded-full px-2 py-0.5 text-[10px]",
                    file.uploaded
                      ? "bg-emerald-500/10 text-emerald-300"
                      : "bg-amber-500/10 text-amber-300",
                  )}
                >
                  {file.uploaded ? "ajouté" : "en attente"}
                </span>

                <button
                  type="button"
                  onClick={() => removeFile(file.id)}
                  disabled={isStreaming}
                  className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] disabled:opacity-50"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        ) : null}

        <Textarea
          value={value}
          onChange={(event) => setValue(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Demandez à BrainiaK de préparer une relance, résumer un mail, générer un RIBDDC..."
          disabled={isStreaming}
          className="max-h-[220px] min-h-[96px] resize-none overflow-y-auto border-0 bg-transparent text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] focus-visible:ring-0 disabled:opacity-70"
        />

        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          <div className="relative flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAttachClick}
              disabled={isStreaming || uploading}
              className="border-[var(--border)] bg-transparent"
            >
              <Paperclip className="mr-2 h-4 w-4" />
              {uploading ? "Upload..." : "Attacher"}
            </Button>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setToolsOpen((open) => !open)}
              disabled={isStreaming}
              className={cn(
                "border-[var(--border)] bg-transparent",
                toolsOpen && "border-cyan-400/40 text-cyan-300",
              )}
            >
              <Wand2 className="mr-2 h-4 w-4" />
              Actions
            </Button>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={toggleReasoning}
              disabled={isStreaming}
              className={cn(
                "border-[var(--border)] bg-transparent",
                reasoningEnabled &&
                  "border-cyan-400/40 bg-cyan-500/10 text-cyan-300",
              )}
            >
              <Sparkles className="mr-2 h-4 w-4" />
              Analyse
            </Button>

            {canRetry ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => void handleRetry()}
                className="border-[var(--border)] bg-transparent"
              >
                <RotateCcw className="mr-2 h-4 w-4" />
                Réessayer
              </Button>
            ) : null}

            {toolsOpen ? (
              <div className="absolute bottom-12 left-0 z-20 min-w-[240px] rounded-2xl border border-[var(--border)] bg-[var(--surface-1)] p-2 shadow-xl">
                <div className="mb-2 px-2 py-1 text-xs uppercase tracking-[0.14em] text-[var(--text-secondary)]">
                  Actions Brainiak
                </div>

                <div className="space-y-1">
                  {presets.map((preset) => {
                    const active = selectedTools.includes(preset.id as ToolKey);

                    return (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => toggleTool(preset.id as ToolKey)}
                        className={cn(
                          "flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm",
                          active
                            ? "bg-cyan-500/10 text-cyan-300"
                            : "text-[var(--text-primary)] hover:bg-[var(--surface-2)]",
                        )}
                      >
                        <div>
                          <div>{preset.label}</div>

                          {preset.description ? (
                            <div className="text-xs text-[var(--text-secondary)]">
                              {preset.description}
                            </div>
                          ) : null}
                        </div>

                        {active ? <Check className="h-4 w-4" /> : null}
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : null}
          </div>

          {isStreaming ? (
            <Button
              type="button"
              onClick={() => void handleStop()}
              className="bg-red-500/90 text-white hover:bg-red-500"
            >
              <Square className="mr-2 h-4 w-4" />
              Stop
            </Button>
          ) : (
            <Button
              type="button"
              onClick={() => void handleSend()}
              disabled={!canSend}
              className="bg-gradient-brainiak text-black hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <SendHorizonal className="mr-2 h-4 w-4" />
              Envoyer
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}