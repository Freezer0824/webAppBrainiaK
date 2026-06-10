import type { MailboxItem } from "@/store/mailbox-store";

export type MailActionType = "summary" | "reply" | "followup";

export type MailActionStatus =
  | "draft"
  | "generated"
  | "edited"
  | "pending_validation"
  | "validated"
  | "rejected"
  | "deleted";

export interface AttachmentItem {
  id: string;
  name: string;
  type: "pdf" | "image" | "doc" | "spreadsheet" | "other";
  source: "client_file" | "local" | "vault" | "mailbox";
  sizeLabel?: string;
}

export interface BrainiakMailResult {
  id: string;
  mailId: string;
  action: MailActionType;
  title: string;
  content: string;
  status: MailActionStatus;
  attachments: AttachmentItem[];
  createdAt: string;
  updatedAt?: string;
}

export type MailActionState = {
  summary?: BrainiakMailResult;
  reply?: BrainiakMailResult;
  followup?: BrainiakMailResult;
};

export interface MailHistoryItem {
  id: string;
  label: string;
  createdAt: string;
  level?: "info" | "success" | "warning" | "error";
}

export interface InfiniMailItem extends MailboxItem {
  actions?: MailActionState;
  history?: MailHistoryItem[];
}