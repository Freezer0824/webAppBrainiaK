import {
  CheckCircle2,
  Loader2,
  MailCheck,
  MessageSquareText,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { BrainiakMailResult, MailActionType } from "./mail-types";

type MailActionButtonProps = {
  action: MailActionType;
  result?: BrainiakMailResult;
  isLoading: boolean;
  isDisabled: boolean;
  onClick: () => void;
};

function getActionConfig(action: MailActionType, result?: BrainiakMailResult) {
  const isDone = Boolean(result);

  if (isDone && result?.status === "pending_validation") {
    return {
      label: "✓ En validation",
      Icon: CheckCircle2,
    };
  }

  switch (action) {
    case "summary":
      return {
        label: isDone ? "✓ Résumé généré" : "Résumer",
        Icon: isDone ? CheckCircle2 : MessageSquareText,
      };

    case "reply":
      return {
        label: isDone ? "✓ Réponse préparée" : "Préparer réponse",
        Icon: isDone ? CheckCircle2 : MailCheck,
      };

    case "followup":
      return {
        label: isDone ? "✓ Relance préparée" : "Préparer relance",
        Icon: isDone ? CheckCircle2 : RefreshCw,
      };
  }
}

export function MailActionButton({
  action,
  result,
  isLoading,
  isDisabled,
  onClick,
}: MailActionButtonProps) {
  const { label, Icon } = getActionConfig(action, result);
  const isGenerated = Boolean(result);

  return (
    <Button
      type="button"
      onClick={onClick}
      disabled={isDisabled || isGenerated}
      className={
        isGenerated
          ? "cursor-not-allowed border border-emerald-500/30 bg-emerald-500/10 text-emerald-200 hover:bg-emerald-500/10"
          : "bg-[var(--surface-3)] text-[var(--text-primary)] hover:bg-cyan-500/10 hover:text-cyan-200"
      }
    >
      {isLoading ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <Icon className="mr-2 h-4 w-4" />
      )}

      {label}
    </Button>
  );
}