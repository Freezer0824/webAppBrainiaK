export type AppView =
  | "home"
  | "assistant"
  | "mailbox"
  | "clients"
  | "complisoft"
  | "ribddc"
  | "templates"
  | "vault"
  | "validations"
  | "settings";

export type InfiniConnectionStatus =
  | "connected"
  | "warning"
  | "disconnected";

export type InfiniNavigationItem = {
  view: AppView;
  label: string;
  description: string;
};