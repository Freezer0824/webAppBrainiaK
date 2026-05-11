import { useCallback, useRef } from "react";
import { env } from "@/lib/config/env";
import { controlPrompt, streamPrompt } from "@/lib/api/prompt-api";
import { getOrCreateSessionId } from "@/lib/session/session";
import { useChatStore } from "@/store/chat-store";
import { useRuntimeStore } from "@/store/runtime-store";
import { useComposerStore } from "@/store/composer-store";
import type { ChatMessage, ToolEvent } from "@/types/chat";
import type { ChatMessageDto, StreamEvent } from "@/types/api";

function toApiMessages(messages: ChatMessage[]): ChatMessageDto[] {
  return messages
    .filter((message) => !message.isStreaming)
    .map((message) => ({
      role: message.role,
      content: message.content,
    }));
}

function nowLabel(): string {
  return new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function makeToolEvent(
  partial: Omit<ToolEvent, "timestamp"> & { timestamp?: string },
): ToolEvent {
  return {
    ...partial,
    timestamp: partial.timestamp ?? nowLabel(),
  };
}

function isNoAnswerProduced(value: string) {
  return value.trim().toLowerCase() === "(no answer produced)";
}

function extractTextFromUnknown(value: unknown, depth = 0): string {
  if (depth > 6) return "";

  if (typeof value === "string") {
    return value.trim();
  }

  if (Array.isArray(value)) {
    for (const item of [...value].reverse()) {
      const text = extractTextFromUnknown(item, depth + 1);
      if (text) return text;
    }

    return "";
  }

  if (!value || typeof value !== "object") {
    return "";
  }

  const data = value as Record<string, unknown>;

  const directCandidates = [
    data.final_answer,
    data.finalAnswer,
    data.answer,
    data.response,
    data.content,
    data.delta,
    data.token,
    data.chunk,
    data.text,
    data.output_text,
    data.outputText,
    data.final,
    data.final_output,
    data.finalOutput,
  ];

  for (const candidate of directCandidates) {
    const text = extractTextFromUnknown(candidate, depth + 1);
    if (text) return text;
  }

  const nestedCandidates = [
    data.data,
    data.payload,
    data.result,
    data.output,
    data.message,
    data.choice,
    data.choices,
    data.messages,
  ];

  for (const candidate of nestedCandidates) {
    const text = extractTextFromUnknown(candidate, depth + 1);
    if (text) return text;
  }

  return "";
}

function extractFinalAnswer(event: StreamEvent): string {
  return extractTextFromUnknown(event);
}

function extractRequestId(event: StreamEvent): string | null {
  if (!event || typeof event !== "object") return null;

  const data = event as Record<string, unknown>;
  const candidates = [data.request_id, data.requestId, data.id];

  for (const candidate of candidates) {
    if (typeof candidate === "string" && candidate.trim()) {
      return candidate.trim();
    }
  }

  return null;
}

export function useBrainiakChat() {
  const abortControllerRef = useRef<AbortController | null>(null);

  const {
    sessionId,
    setSessionId,
    messages,
    pushMessage,
    replaceStreamingMessage,
    finishStreamingMessage,
    upsertToolEvent,
    setStatusLabel,
    setIsStreaming,
    lastUserPrompt,
    currentRequestId,
    setLastUserPrompt,
    setCurrentRequestId,
    setLastBackendError,
  } = useChatStore();

  const {
    setRuntimeMetrics,
    resetRuntimeMetrics,
    setMemoryState,
    pushLog,
    setFinalStatus,
    clearLogs,
  } = useRuntimeStore();

  const {
    selectedTools,
    reasoningEnabled,
    attachedFiles,
    clearFiles,
    clearTools,
  } = useComposerStore();

  const sendPrompt = useCallback(
    async (prompt: string) => {
      const trimmed = prompt.trim();
      if (!trimmed) return;

      abortControllerRef.current?.abort();

      const abortController = new AbortController();
      abortControllerRef.current = abortController;

      const sid = sessionId || getOrCreateSessionId();

      if (!sessionId) {
        setSessionId(sid);
      }

      const timestamp = nowLabel();
      const previousMessages = [...messages];

      const attachmentIds = attachedFiles
        .map((file) => file.uploadedId)
        .filter((id): id is string => Boolean(id));

      const messageAttachments = attachedFiles.map((file) => ({
        id: file.id,
        name: file.name,
        type: file.type,
        size: file.size,
        uploadedId: file.uploadedId,
      }));

      resetRuntimeMetrics();
      clearLogs();
      setFinalStatus("running");

      setRuntimeMetrics({
        lastError: null,
        signals: null,
      });

      setLastUserPrompt(trimmed);
      setCurrentRequestId(null);
      setLastBackendError(null);

      setMemoryState({
        activeSessionId: sid,
        lastUserPrompt: trimmed,
        messageCount: previousMessages.length + 2,
        lastPipelineStatus: "thinking",
        currentContext: `Active session • intent: ${trimmed.slice(0, 120)}`,
      });

      pushMessage({
        id: `user-${crypto.randomUUID()}`,
        role: "user",
        content: trimmed,
        timestamp,
        attachments: messageAttachments,
      });

      pushMessage({
        id: `assistant-stream-${crypto.randomUUID()}`,
        role: "assistant",
        content: "",
        timestamp,
        isStreaming: true,
      });

      clearFiles();
      clearTools();

      setIsStreaming(true);
      setStatusLabel("thinking");
      pushLog(`[${timestamp}] request → ${trimmed}`);

      let accumulatedAnswer = "";
      let didReceiveFinalAnswer = false;

      try {
        await streamPrompt(
          {
            session_id: sid,
            tenant_id: env.tenantId,
            messages: [
              ...toApiMessages(previousMessages),
              {
                role: "user",
                content: trimmed,
              },
            ],
            enable_thinking: reasoningEnabled,
            stream: true,
            max_tokens: 16000,
            max_turns: 12,
            preset_tools: selectedTools,
            attachment_ids: attachmentIds,
          },
          {
            onEvent: (event: StreamEvent) => {
              const time = nowLabel();
              const requestId = extractRequestId(event);

              if (requestId) {
                setCurrentRequestId(requestId);
              }

              const isStatusEvent = "event" in event && event.event === "status";
              const isToolEvent = "event" in event && event.event === "tool";
              const isAnswerEvent = "event" in event && event.event === "answer";
              const isCloseEvent = "event" in event && event.event === "close";
              const isErrorEvent =
                "event_type" in event && event.event_type === "error";

              const possibleChunk = extractFinalAnswer(event);

              if (
                possibleChunk &&
                !isStatusEvent &&
                !isToolEvent &&
                !isAnswerEvent &&
                !isCloseEvent &&
                !isErrorEvent
              ) {
                accumulatedAnswer = `${accumulatedAnswer}${possibleChunk}`;
                replaceStreamingMessage(accumulatedAnswer);
              }

              if (isStatusEvent) {
                const phase = event.phase ?? "thinking";
                const isDone = phase.toLowerCase().includes("done");

                setStatusLabel(phase);

                if (!accumulatedAnswer.trim()) {
                  replaceStreamingMessage(
                    `Brainiak réfléchit…\n\nPhase : ${phase}`,
                  );
                }

                setMemoryState({
                  lastPipelineStatus: phase,
                });

                pushLog(
                  `[${time}] phase → ${phase}${
                    event.turn ? ` (turn ${event.turn})` : ""
                  }`,
                );

                upsertToolEvent(
                  makeToolEvent({
                    id: `phase-${event.turn ?? "na"}-${phase}`,
                    name: phase,
                    status: isDone ? "done" : "running",
                    detail: event.turn ? `Turn ${event.turn}` : "Pipeline",
                    turn: event.turn,
                    category: "phase",
                  }),
                );

                return;
              }

              if (isToolEvent) {
                const name = event.tool ?? "tool";
                const { recentTools } = useRuntimeStore.getState();

                setMemoryState({
                  recentTools: Array.from(new Set([name, ...recentTools])).slice(
                    0,
                    6,
                  ),
                });

                pushLog(
                  `[${time}] tool → ${name}${
                    event.turn ? ` (turn ${event.turn})` : ""
                  }`,
                );

                upsertToolEvent(
                  makeToolEvent({
                    id: `tool-${name}-${event.turn ?? crypto.randomUUID()}`,
                    name,
                    status: "running",
                    detail: `Step ${event.turn ?? 0}`,
                    turn: event.turn,
                    category: "tool",
                  }),
                );

                return;
              }

              if (isErrorEvent) {
                const errorContent =
                  typeof event.content === "string"
                    ? event.content
                    : "Erreur inconnue";

                finishStreamingMessage(`Erreur backend : ${errorContent}`);
                setStatusLabel("error");
                setIsStreaming(false);
                setLastBackendError(errorContent);

                pushLog(`[${time}] error → ${errorContent}`);

                setRuntimeMetrics({
                  lastError: errorContent,
                });

                setFinalStatus("error");

                setMemoryState({
                  lastPipelineStatus: "error",
                  currentContext: `Failed: ${trimmed.slice(0, 120)}`,
                });

                upsertToolEvent(
                  makeToolEvent({
                    id: `error-${crypto.randomUUID()}`,
                    name: "pipeline_error",
                    status: "error",
                    detail: errorContent,
                    category: "answer",
                  }),
                );

                return;
              }

              if (isAnswerEvent) {
                const extractedAnswer = extractFinalAnswer(event);
                const finalAnswer =
                  extractedAnswer && !isNoAnswerProduced(extractedAnswer)
                    ? extractedAnswer
                    : accumulatedAnswer;

                didReceiveFinalAnswer = true;

                if (!finalAnswer || isNoAnswerProduced(extractedAnswer)) {
                  const errorMessage =
                    "Le backend a terminé la requête, mais n’a produit aucune réponse exploitable.";

                  finishStreamingMessage(`Erreur backend : ${errorMessage}`);
                  setStatusLabel("error");
                  setIsStreaming(false);
                  setLastBackendError(errorMessage);

                  setRuntimeMetrics({
                    totalLatencyMs: event.latency_ms ?? null,
                    toolsUsed: event.tools_used ?? null,
                    signals: event.signals ?? null,
                    lastError: errorMessage,
                  });

                  setFinalStatus("error");

                  setMemoryState({
                    messageCount: previousMessages.length + 2,
                    lastPipelineStatus: "error",
                    currentContext: `No answer: ${trimmed.slice(0, 120)}`,
                  });

                  upsertToolEvent(
                    makeToolEvent({
                      id: `answer-error-${crypto.randomUUID()}`,
                      name: "answer",
                      status: "error",
                      detail: errorMessage,
                      latencyMs: event.latency_ms,
                      category: "answer",
                    }),
                  );

                  return;
                }

                finishStreamingMessage(finalAnswer);

                setStatusLabel(null);
                setIsStreaming(false);

                pushLog(
                  `[${time}] answer → ${event.tools_used ?? 0} tools • ${
                    event.latency_ms ?? 0
                  } ms`,
                );

                setRuntimeMetrics({
                  totalLatencyMs: event.latency_ms ?? null,
                  toolsUsed: event.tools_used ?? null,
                  signals: event.signals ?? null,
                });

                setFinalStatus("done");

                setMemoryState({
                  messageCount: previousMessages.length + 2,
                  lastPipelineStatus: "done",
                  currentContext: `Completed: ${trimmed.slice(0, 120)}`,
                });

                upsertToolEvent(
                  makeToolEvent({
                    id: `answer-${crypto.randomUUID()}`,
                    name: "answer",
                    status: "done",
                    detail: `${event.tools_used ?? 0} tools • ${
                      event.latency_ms ?? 0
                    } ms`,
                    latencyMs: event.latency_ms,
                    category: "answer",
                  }),
                );

                return;
              }

              if (isCloseEvent) {
                pushLog(`[${time}] stream → close`);
                setStatusLabel(null);
                setIsStreaming(false);
              }
            },

            onError: (error) => {
              const message = error.message;

              finishStreamingMessage(`Erreur : ${message}`);
              setStatusLabel("error");
              setIsStreaming(false);
              setLastBackendError(message);

              pushLog(`[ERROR] network → ${message}`);

              setRuntimeMetrics({
                lastError: message,
              });

              setFinalStatus("error");

              setMemoryState({
                lastPipelineStatus: "error",
                currentContext: `Network error: ${trimmed.slice(0, 120)}`,
              });

              upsertToolEvent(
                makeToolEvent({
                  id: `network-error-${crypto.randomUUID()}`,
                  name: "network_error",
                  status: "error",
                  detail: message,
                  category: "answer",
                }),
              );
            },

            onDone: () => {
              if (!didReceiveFinalAnswer) {
                if (accumulatedAnswer.trim()) {
                  finishStreamingMessage(accumulatedAnswer.trim());

                  setFinalStatus("done");

                  setMemoryState({
                    lastPipelineStatus: "done",
                    currentContext: `Completed: ${trimmed.slice(0, 120)}`,
                  });

                  upsertToolEvent(
                    makeToolEvent({
                      id: `answer-${crypto.randomUUID()}`,
                      name: "answer",
                      status: "done",
                      detail: "stream completed",
                      category: "answer",
                    }),
                  );
                } else {
                  const errorMessage =
                    "Le stream s’est terminé sans réponse finale exploitable.";

                  finishStreamingMessage(`Erreur backend : ${errorMessage}`);
                  setLastBackendError(errorMessage);

                  setRuntimeMetrics({
                    lastError: errorMessage,
                  });

                  setFinalStatus("error");

                  setMemoryState({
                    lastPipelineStatus: "error",
                    currentContext: `No final answer: ${trimmed.slice(0, 120)}`,
                  });

                  upsertToolEvent(
                    makeToolEvent({
                      id: `answer-missing-${crypto.randomUUID()}`,
                      name: "answer",
                      status: "error",
                      detail: errorMessage,
                      category: "answer",
                    }),
                  );
                }
              }

              setIsStreaming(false);
              setStatusLabel(null);
              abortControllerRef.current = null;
            },
          },
          60_000,
        );
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Unknown request error";

        finishStreamingMessage(`Erreur : ${message}`);
        setStatusLabel("error");
        setIsStreaming(false);
        setLastBackendError(message);

        pushLog(`[FATAL] ${message}`);

        setRuntimeMetrics({
          lastError: message,
        });

        setFinalStatus("error");

        setMemoryState({
          lastPipelineStatus: "error",
          currentContext: `Fatal error: ${trimmed.slice(0, 120)}`,
        });

        upsertToolEvent(
          makeToolEvent({
            id: `request-error-${crypto.randomUUID()}`,
            name: "request_error",
            status: "error",
            detail: message,
            category: "answer",
          }),
        );
      }
    },
    [
      attachedFiles,
      clearFiles,
      clearLogs,
      clearTools,
      finishStreamingMessage,
      messages,
      pushMessage,
      reasoningEnabled,
      replaceStreamingMessage,
      resetRuntimeMetrics,
      selectedTools,
      sessionId,
      setCurrentRequestId,
      setFinalStatus,
      setIsStreaming,
      setLastBackendError,
      setLastUserPrompt,
      setMemoryState,
      setRuntimeMetrics,
      setSessionId,
      setStatusLabel,
      upsertToolEvent,
      pushLog,
    ],
  );

  const retryLastPrompt = useCallback(async () => {
    if (!lastUserPrompt) return;

    await sendPrompt(lastUserPrompt);
  }, [lastUserPrompt, sendPrompt]);

  const stopPrompt = useCallback(async () => {
    abortControllerRef.current?.abort();

    if (currentRequestId) {
      try {
        await controlPrompt(currentRequestId, {
          action: "stop",
        });
      } catch (error) {
        console.warn("Failed to stop backend prompt:", error);
      }
    }

    setStatusLabel(null);
    setIsStreaming(false);
    setFinalStatus("error");
    setLastBackendError("Requête arrêtée par l’utilisateur.");
    finishStreamingMessage("Requête arrêtée par l’utilisateur.");
  }, [
    currentRequestId,
    finishStreamingMessage,
    setFinalStatus,
    setIsStreaming,
    setLastBackendError,
    setStatusLabel,
  ]);

  return {
    sendPrompt,
    retryLastPrompt,
    stopPrompt,
  };
}