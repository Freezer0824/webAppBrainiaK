export type Role = "user" | "assistant" | "system";

export type ChatMessageDto = {
  role: "user" | "assistant" | "system";
  content: string;
};

export type UploadedFileDto = {
  id: string;
  name: string;
  mime_type: string;
  size: number;
};

export type UploadResponseDto = {
  files: Array<{
    id: string;
    name: string;
  }>;
};

export type ToolPresetDto = {
  id: string;
  label: string;
  description?: string;
};

export type ToolPresetListDto = {
  presets: ToolPresetDto[];
};

export type PromptRequest = {
  session_id: string;
  tenant_id?: string;
  messages: ChatMessageDto[];
  stream?: boolean;
  enable_thinking?: boolean;
  max_tokens?: number;
  max_turns?: number;
  preset_tools?: string[];
  attachment_ids?: string[];
};

export type StreamEvent =
  | { event: "status"; phase?: string; detail?: string; turn?: number }
  | { event: "tool"; tool?: string; turn?: number }
  | {
      event: "answer";
      final_answer: string;
      tools_used?: number;
      latency_ms?: number;
      signals?: Record<string, unknown>;
      diagnostics?: Record<string, unknown>;
    }
  | {
      event_type: "error";
      content: string;
    }
  | { event: "close" };

export type PromptResponse = {
  answer: string;
  route: string;
  mode: string;
  total_steps: number;
  total_latency_ms: number;
  signals: Record<string, unknown>;
  diagnostics?: Record<string, unknown> | null;
};

export type ToolSchema = {
  type: string;
  function?: {
    name: string;
    description?: string;
    parameters?: Record<string, unknown>;
  };
  name?: string;
  description?: string;
};

export type ToolsListResponse = {
  tools: ToolSchema[];
  count: number;
  node: string;
};

export type ToolCallRequest = {
  tool: string;
  arguments?: Record<string, unknown>;
  role?: string;
  forwarded?: boolean;
};

export type ToolCallResponse = {
  success: boolean;
  output?: unknown;
  error?: string | null;
  node?: string;
  forwarded_to?: string | null;
};

export type LearningStatusResponse = {
  mode: string;
  session_id: string;
  adaptive?: Record<string, unknown>;
};

export type DiagnoseResponse = Record<string, unknown>;

export type FeedbackRequest = {
  verdict: "positive" | "negative";
  word?: string;
  text?: string;
  session_id: string;
};

export type TeachRequest = {
  word: string;
  definition: string;
  session_id: string;
};

export type TeachContrastiveRequest = {
  word: string;
  sense_label: string;
  positive_context: string;
  negative_context?: string;
  session_id: string;
};

export type FeedbackSenseRequest = {
  word: string;
  sense_label: string;
  verdict: "positive" | "negative";
  context_sentence: string;
  session_id: string;
};

export type HealthResponse = {
  status: string;
  db?: string;
  version?: string;
};