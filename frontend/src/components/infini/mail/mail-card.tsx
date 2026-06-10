import { Button } from "@/components/ui/button";
import type { MailboxItem, MailboxStatus } from "@/store/mailbox-store";
import type {
  BrainiakMailResult,
  InfiniMailItem,
  MailActionType,
} from "./mail-types";
import { MailActionButton } from "./mail-action-button";

type MailCardProps = {
  mail: InfiniMailItem;
  generatedActions: Partial<Record<MailActionType, BrainiakMailResult>>;
  pendingValidationCount: number;
  isDisabled: boolean;
  loadingAction: MailActionType | null;
  runningTaskDescription?: string;
  onRunAction: (mail: InfiniMailItem, action: MailActionType) => void;
  onMarkSent: (mail: InfiniMailItem) => void;
  onArchive: (mail: InfiniMailItem) => void;
};

function getPriorityClass(priority: MailboxItem["priority"]) {
  switch (priority) {
    case "haute":
      return "border-rose-500/30 bg-rose-500/10 text-rose-200";
    case "moyenne":
      return "border-amber-500/30 bg-amber-500/10 text-amber-200";
    case "basse":
      return "border-emerald-500/30 bg-emerald-500/10 text-emerald-200";
    default:
      return "border-cyan-500/30 bg-cyan-500/10 text-cyan-200";
  }
}

function getWorkflowStatusLabel(status: MailboxStatus) {
  switch (status) {
    case "a-traiter":
      return "À traiter";
    case "prepare":
      return "Préparé";
    case "en-validation":
      return "En validation";
    case "valide":
      return "Validé";
    case "refuse":
      return "Refusé";
    case "envoye":
      return "Envoyé";
    case "archive":
      return "Archivé";
  }
}

function getWorkflowStatusClass(status: MailboxStatus) {
  switch (status) {
    case "a-traiter":
      return "border-amber-500/30 bg-amber-500/10 text-amber-200";
    case "prepare":
      return "border-cyan-500/30 bg-cyan-500/10 text-cyan-200";
    case "en-validation":
      return "border-violet-500/30 bg-violet-500/10 text-violet-200";
    case "valide":
      return "border-emerald-500/30 bg-emerald-500/10 text-emerald-200";
    case "refuse":
      return "border-rose-500/30 bg-rose-500/10 text-rose-200";
    case "envoye":
      return "border-emerald-500/30 bg-emerald-500/10 text-emerald-200";
    case "archive":
      return "border-slate-500/30 bg-slate-500/10 text-slate-200";
  }
}

function getLatestHistoryLabels(mail: InfiniMailItem) {
  return mail.history?.slice(-3) ?? [];
}

export function MailCard({
  mail,
  generatedActions,
  pendingValidationCount,
  isDisabled,
  loadingAction,
  runningTaskDescription,
  onRunAction,
  onMarkSent,
  onArchive,
}: MailCardProps) {
  const history = getLatestHistoryLabels(mail);

  return (
    <article className="rounded-3xl border border-[var(--border)] bg-[var(--surface-1)] p-5">
      <div className="flex flex-col justify-between gap-3 lg:flex-row">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={[
                "rounded-full border px-3 py-1 text-xs font-medium",
                getPriorityClass(mail.priority),
              ].join(" ")}
            >
              Priorité {mail.priority}
            </span>

            <span
              className={[
                "rounded-full border px-3 py-1 text-xs font-medium",
                getWorkflowStatusClass(mail.workflowStatus),
              ].join(" ")}
            >
              {getWorkflowStatusLabel(mail.workflowStatus)}
            </span>

            {pendingValidationCount > 0 ? (
              <span className="rounded-full border border-violet-500/30 bg-violet-500/10 px-3 py-1 text-xs font-medium text-violet-200">
                {pendingValidationCount}/3 en validation
              </span>
            ) : null}

            {runningTaskDescription ? (
              <span className="rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-xs font-medium text-cyan-200">
                Traitement en cours
              </span>
            ) : null}
          </div>

          <p className="mt-4 text-base font-semibold text-[var(--text-primary)]">
            {mail.subject}
          </p>

          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            {mail.sender} · {mail.receivedAt}
          </p>
        </div>
      </div>

      <p className="mt-4 text-sm leading-6 text-[var(--text-secondary)]">
        {mail.summary}
      </p>

      <div className="mt-4 rounded-2xl border border-cyan-500/20 bg-cyan-500/10 p-4">
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-cyan-300">
          Action proposée
        </p>

        <p className="mt-2 text-sm text-[var(--text-primary)]">
          {runningTaskDescription ?? mail.suggestedAction}
        </p>
      </div>

      {history.length > 0 ? (
        <div className="mt-4 rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] p-4">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-[var(--text-secondary)]">
            Historique récent
          </p>

          <div className="mt-3 space-y-2">
            {history.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between gap-3 text-xs"
              >
                <span className="text-[var(--text-primary)]">
                  {item.label}
                </span>

                <span className="text-[var(--text-secondary)]">
                  {item.createdAt}
                </span>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      <div className="mt-5 flex flex-wrap gap-2">
        <MailActionButton
          action="summary"
          result={generatedActions.summary}
          isLoading={loadingAction === "summary"}
          isDisabled={isDisabled}
          onClick={() => onRunAction(mail, "summary")}
        />

        <MailActionButton
          action="reply"
          result={generatedActions.reply}
          isLoading={loadingAction === "reply"}
          isDisabled={isDisabled}
          onClick={() => onRunAction(mail, "reply")}
        />

        <MailActionButton
          action="followup"
          result={generatedActions.followup}
          isLoading={loadingAction === "followup"}
          isDisabled={isDisabled}
          onClick={() => onRunAction(mail, "followup")}
        />
      </div>

      {mail.workflowStatus === "valide" ? (
        <div className="mt-3 flex flex-wrap gap-2">
          <Button
            type="button"
            onClick={() => onMarkSent(mail)}
            className="bg-emerald-500/90 text-white hover:bg-emerald-500"
          >
            Marquer envoyé
          </Button>

          <Button
            type="button"
            onClick={() => onArchive(mail)}
            className="bg-[var(--surface-3)] text-[var(--text-primary)] hover:bg-white/5"
          >
            Archiver
          </Button>
        </div>
      ) : null}

      {mail.workflowStatus === "envoye" ? (
        <div className="mt-3 flex flex-wrap gap-2">
          <Button
            type="button"
            onClick={() => onArchive(mail)}
            className="bg-[var(--surface-3)] text-[var(--text-primary)] hover:bg-white/5"
          >
            Archiver
          </Button>
        </div>
      ) : null}
    </article>
  );
}