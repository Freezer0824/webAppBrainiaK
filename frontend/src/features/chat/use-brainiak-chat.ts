import { useCallback, useRef } from "react";
import { sendDevChatMessage } from "@/lib/api/dev-chat-api";
import { getOrCreateSessionId } from "@/lib/session/session";
import { useChatStore } from "@/store/chat-store";
import { useRuntimeStore } from "@/store/runtime-store";
import { useComposerStore } from "@/store/composer-store";
import type { ToolEvent } from "@/types/chat";

const GENERIC_ASSISTANT_ERROR =
  "BrainiaK n’a pas pu produire une réponse exploitable. Veuillez réessayer ou reformuler la demande.";

const TEMPORARY_ASSISTANT_ERROR =
  "BrainiaK rencontre un problème temporaire. Veuillez réessayer dans quelques instants.";

const STOPPED_BY_USER_MESSAGE =
  "La demande a été arrêtée. Vous pouvez reformuler ou relancer une nouvelle action.";

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

export function useBrainiakChat() {
  const abortControllerRef = useRef<AbortController | null>(null);

  const {
    sessionId,
    setSessionId,
    pushMessage,
    finishStreamingMessage,
    upsertToolEvent,
    setStatusLabel,
    setIsStreaming,
    lastUserPrompt,
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

  const { attachedFiles, clearFiles, clearTools } = useComposerStore();

  const sendPrompt = useCallback(
    async (prompt: string) => {
      const trimmed = prompt.trim();
      if (!trimmed) return;

      abortControllerRef.current?.abort();
      abortControllerRef.current = new AbortController();

      const sid = sessionId || getOrCreateSessionId();

      if (!sessionId) {
        setSessionId(sid);
      }

      const startedAt = performance.now();
      const timestamp = nowLabel();

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
        messageCount: 2,
        lastPipelineStatus: "Analyse en cours",
        currentContext: `Demande active : ${trimmed.slice(0, 120)}`,
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
        content: "Analyse en cours…",
        timestamp,
        isStreaming: true,
      });

      clearFiles();
      clearTools();

      setIsStreaming(true);
      setStatusLabel("Analyse en cours");
      pushLog(`[${timestamp}] demande → ${trimmed}`);

      upsertToolEvent(
        makeToolEvent({
          id: `brainiak-request-${crypto.randomUUID()}`,
          name: "Demande BrainiaK",
          status: "running",
          detail: "Analyse en cours",
          category: "answer",
        }),
      );

      try {
        const answer = await sendDevChatMessage(
          {
            messages: [
              {
                role: "user",
                content: trimmed,
              },
            ],
          },
          180_000,
        );

        const cleanAnswer = answer.trim();

        if (!cleanAnswer) {
          throw new Error(GENERIC_ASSISTANT_ERROR);
        }

        const latencyMs = Math.round(performance.now() - startedAt);

        finishStreamingMessage(cleanAnswer);
        setStatusLabel(null);
        setIsStreaming(false);
        setFinalStatus("done");

        setRuntimeMetrics({
          totalLatencyMs: latencyMs,
          toolsUsed: null,
          signals: null,
          lastError: null,
        });

        setMemoryState({
          messageCount: 2,
          lastPipelineStatus: "Réponse prête",
          currentContext: `Terminé : ${trimmed.slice(0, 120)}`,
        });

        upsertToolEvent(
          makeToolEvent({
            id: `brainiak-answer-${crypto.randomUUID()}`,
            name: "Réponse BrainiaK",
            status: "done",
            detail: "Réponse prête",
            latencyMs,
            category: "answer",
          }),
        );

        pushLog(`[${nowLabel()}] réponse prête → ${latencyMs} ms`);
      } catch (error) {
        const technicalMessage =
          error instanceof Error ? error.message : "Unknown request error";

        const message =
          technicalMessage === GENERIC_ASSISTANT_ERROR
            ? GENERIC_ASSISTANT_ERROR
            : TEMPORARY_ASSISTANT_ERROR;

        finishStreamingMessage(message);
        setStatusLabel("Une vérification est nécessaire");
        setIsStreaming(false);
        setLastBackendError(message);
        setFinalStatus("error");

        setRuntimeMetrics({
          lastError: technicalMessage,
        });

        setMemoryState({
          lastPipelineStatus: "Une vérification est nécessaire",
          currentContext: `Erreur : ${trimmed.slice(0, 120)}`,
        });

        upsertToolEvent(
          makeToolEvent({
            id: `brainiak-error-${crypto.randomUUID()}`,
            name: "Connexion BrainiaK",
            status: "error",
            detail: message,
            category: "answer",
          }),
        );

        pushLog(`[${nowLabel()}] erreur → ${technicalMessage}`);
      } finally {
        abortControllerRef.current = null;
      }
    },
    [
      attachedFiles,
      clearFiles,
      clearLogs,
      clearTools,
      finishStreamingMessage,
      pushMessage,
      resetRuntimeMetrics,
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

    setStatusLabel(null);
    setIsStreaming(false);
    setFinalStatus("error");
    setLastBackendError(STOPPED_BY_USER_MESSAGE);
    finishStreamingMessage(STOPPED_BY_USER_MESSAGE);
  }, [
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