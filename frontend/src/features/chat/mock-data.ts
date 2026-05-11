import type { ChatMessage, ConversationItem, ToolEvent } from "@/types/chat";

export const conversations: ConversationItem[] = [
  {
    id: "conv-1",
    title: "Topological reasoning session",
    updatedAt: "2 min ago",
  },
  {
    id: "conv-2",
    title: "Brainiak API planning",
    updatedAt: "18 min ago",
  },
  {
    id: "conv-3",
    title: "Mathematical agent workflow",
    updatedAt: "1 hour ago",
  },
];

export const messages: ChatMessage[] = [
  {
    id: "m-1",
    role: "user",
    content: "Propose une architecture pour une interface Copilot Brainiak.",
    timestamp: "11:02",
  },
  {
    id: "m-2",
    role: "assistant",
    content:
      "Je propose une interface structurée autour d’une sidebar de sessions, d’une zone de streaming centralisée, d’un panneau outils et d’un composer orienté agent.",
    timestamp: "11:03",
  },
  {
    id: "m-3",
    role: "assistant",
    content:
      "La prochaine étape consiste à construire un AppShell modulaire prêt pour le SSE et la visualisation des tools.",
    timestamp: "11:03",
    isStreaming: true,
  },
];

export const toolEvents: ToolEvent[] = [
  {
    id: "t-1",
    name: "Memory",
    status: "done",
    detail: "Session context loaded",
  },
  {
    id: "t-2",
    name: "Tool Hub",
    status: "running",
    detail: "Inspecting available capabilities",
  },
  {
    id: "t-3",
    name: "Reasoner",
    status: "idle",
    detail: "Waiting for execution",
  },
];