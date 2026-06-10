import { useEffect, useMemo, useState } from "react";
import {
  prepareFollowUp,
  prepareMailReply,
  summarizeMail,
} from "@/services/mailbox.service";
import {
  useMailboxStore,
  type MailboxItem,
} from "@/store/mailbox-store";
import { useValidationStore } from "@/store/validation-store";
import { useActivityStore } from "@/store/activity-store";
import { useWorkflowStore } from "@/store/workflow-store";
import {
  createMockResult,
  mockMailItems,
} from "@/components/infini/mail/mail-mocks";
import {
  MailFilters,
  type MailFilter,
} from "@/components/infini/mail/mail-filters";
import { MailCard } from "@/components/infini/mail/mail-card";
import { BrainiakWorkPanel } from "@/components/infini/mail/brainiak-work-panel";
import {
  loadMailGeneratedResults,
  saveMailGeneratedResults,
  type MailGeneratedResults,
} from "@/components/infini/mail/mail-persistence";
import type {
  AttachmentItem,
  BrainiakMailResult,
  InfiniMailItem,
  MailActionType,
} from "@/components/infini/mail/mail-types";

type MailAction = MailActionType;

function getActionLabel(action: MailAction) {
  switch (action) {
    case "summary":
      return "Résumé BrainiaK";
    case "reply":
      return "Brouillon de réponse";
    case "followup":
      return "Brouillon de relance";
  }
}

function buildMailBody(mail: MailboxItem) {
  return [
    `Expéditeur : ${mail.sender}`,
    `Objet : ${mail.subject}`,
    `Reçu : ${mail.receivedAt}`,
    `Priorité : ${mail.priority}`,
    "",
    `Résumé actuel : ${mail.summary}`,
    `Action proposée : ${mail.suggestedAction}`,
  ].join("\n");
}

function flattenGeneratedResults(results: MailGeneratedResults) {
  return Object.values(results)
    .flatMap((mailResults) => Object.values(mailResults))
    .filter((result): result is BrainiakMailResult => Boolean(result));
}

export function MailboxDashboard() {
  const storeMails = useMailboxStore((state) => state.mails);
  const markMailPrepared = useMailboxStore((state) => state.markMailPrepared);
  const markMailInValidation = useMailboxStore(
    (state) => state.markMailInValidation,
  );
  const markMailSent = useMailboxStore((state) => state.markMailSent);
  const archiveMail = useMailboxStore((state) => state.archiveMail);

  const addValidation = useValidationStore((state) => state.addValidation);
  const addActivity = useActivityStore((state) => state.addActivity);

  const tasks = useWorkflowStore((state) => state.tasks);
  const startTask = useWorkflowStore((state) => state.startTask);
  const completeTask = useWorkflowStore((state) => state.completeTask);
  const failTask = useWorkflowStore((state) => state.failTask);
  const removeTask = useWorkflowStore((state) => state.removeTask);

  const [editingResultId, setEditingResultId] = useState<string | null>(null);

  const [selectedResultId, setSelectedResultId] = useState<string | null>(null);
  const [generatedResults, setGeneratedResults] = useState<MailGeneratedResults>(
    () => loadMailGeneratedResults(),
  );
  const [loadingAction, setLoadingAction] = useState<{
    mailId: string;
    action: MailAction;
  } | null>(null);
  const [addedToValidation, setAddedToValidation] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dismissedTaskIds, setDismissedTaskIds] = useState<string[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<MailFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    saveMailGeneratedResults(generatedResults);
  }, [generatedResults]);

  const mails = useMemo<InfiniMailItem[]>(() => {
    return storeMails.length > 0 ? storeMails : mockMailItems;
  }, [storeMails]);

  const workResults = useMemo(() => {
    return flattenGeneratedResults(generatedResults).filter(
      (result) =>
        result.status !== "pending_validation" &&
        result.status !== "deleted",
    );
  }, [generatedResults]);

  const selectedWorkResult = useMemo(() => {
    return (
      workResults.find((result) => result.id === selectedResultId) ??
      workResults[0] ??
      null
    );
  }, [workResults, selectedResultId]);

  const filteredMails = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    return mails.filter((mail) => {
      const generatedActions = generatedResults[mail.id] ?? mail.actions ?? {};

      const matchesSearch =
        normalizedQuery.length === 0 ||
        mail.sender.toLowerCase().includes(normalizedQuery) ||
        mail.subject.toLowerCase().includes(normalizedQuery) ||
        mail.summary.toLowerCase().includes(normalizedQuery) ||
        mail.suggestedAction.toLowerCase().includes(normalizedQuery);

      if (!matchesSearch) return false;

      switch (selectedFilter) {
        case "all":
          return true;
        case "to_process":
          return mail.workflowStatus === "a-traiter";
        case "high_priority":
          return mail.priority === "haute";
        case "summarized":
          return Boolean(generatedActions.summary);
        case "reply_ready":
          return Boolean(generatedActions.reply);
        case "followup_ready":
          return Boolean(generatedActions.followup);
        case "in_validation":
          return Object.values(generatedActions).some(
            (result) => result?.status === "pending_validation",
          );
        default:
          return true;
      }
    });
  }, [mails, searchQuery, selectedFilter, generatedResults]);

  function getRunningTaskForMail(mailId: string) {
    return tasks.find(
      (task) =>
        task.relatedEntityType === "mail" &&
        task.relatedEntityId === mailId &&
        task.status === "running",
    );
  }

  function getLatestDoneTaskForMail(mailId: string) {
    return tasks.find(
      (task) =>
        task.relatedEntityType === "mail" &&
        task.relatedEntityId === mailId &&
        task.status === "done" &&
        Boolean(task.result) &&
        !dismissedTaskIds.includes(task.id),
    );
  }

  function getLatestDoneTaskIdForMail(mailId: string) {
    return getLatestDoneTaskForMail(mailId)?.id;
  }

  function handleMarkMailSent(mail: InfiniMailItem) {
    markMailSent(mail.id);

    addActivity({
      title: "Mail marqué comme envoyé",
      description: mail.subject,
      level: "success",
      relatedEntityId: mail.id,
      relatedEntityType: "mail",
    });
  }

  function handleArchiveMail(mail: InfiniMailItem) {
    archiveMail(mail.id);

    addActivity({
      title: "Mail archivé",
      description: mail.subject,
      level: "info",
      relatedEntityId: mail.id,
      relatedEntityType: "mail",
    });
  }

  async function runMailAction(mail: InfiniMailItem, action: MailAction) {
    const alreadyGenerated =
      Boolean(generatedResults[mail.id]?.[action]) ||
      Boolean(mail.actions?.[action]);

    if (alreadyGenerated) return;

    setError(null);
    setAddedToValidation(false);

    setLoadingAction({
      mailId: mail.id,
      action,
    });

    const taskId = startTask({
      title: getActionLabel(action),
      description: `Traitement du mail : ${mail.subject}`,
      relatedEntityId: mail.id,
      relatedEntityType: "mail",
      metadata: {
        action,
        mailId: mail.id,
        subject: mail.subject,
      },
    });

    const mailContext = {
      sender: mail.sender,
      subject: mail.subject,
      body: buildMailBody(mail),
      receivedAt: mail.receivedAt,
    };

    try {
      const result =
        action === "summary"
          ? await summarizeMail(mailContext)
          : action === "reply"
            ? await prepareMailReply(mailContext)
            : await prepareFollowUp(mailContext);

      completeTask(taskId, result, {
        action,
        mailId: mail.id,
        subject: mail.subject,
      });

      markMailPrepared(mail.id);

      const generatedResult = createMockResult({
        mailId: mail.id,
        action,
        content: result,
      });

      setGeneratedResults((current) => ({
        ...current,
        [mail.id]: {
          ...current[mail.id],
          [action]: generatedResult,
        },
      }));

      setSelectedResultId(generatedResult.id);

      addActivity({
        title:
          action === "followup"
            ? "Relance préparée"
            : action === "reply"
              ? "Réponse préparée"
              : "Résumé préparé",
        description: `${getActionLabel(action)} généré pour : ${mail.subject}`,
        level: "info",
        relatedEntityId: mail.id,
        relatedEntityType: "mail",
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erreur inconnue";

      failTask(taskId, message, {
        action,
        mailId: mail.id,
        subject: mail.subject,
      });

      addActivity({
        title: "Erreur BrainiaK",
        description: `Impossible de traiter le mail : ${mail.subject}`,
        level: "error",
        relatedEntityId: mail.id,
        relatedEntityType: "mail",
      });

      console.error("Action mail BrainiaK échouée :", err);

      setError(
        "BrainiaK n’a pas pu traiter ce mail pour le moment. Vous pouvez réessayer.",
      );
    } finally {
      setLoadingAction(null);
    }
  }

  function handleAddToValidations() {
    if (!selectedWorkResult) return;

    const validationId = addValidation({
      type: "mail",
      sourceId: selectedWorkResult.mailId,
      sourceType: "mail",
      title: selectedWorkResult.title,
      description: "Action générée depuis la boîte mail.",
      proposedAction:
        selectedWorkResult.action === "summary"
          ? "Relire le résumé avant exploitation."
          : "Relire et valider avant envoi.",
      result: selectedWorkResult.content,
      riskLevel: selectedWorkResult.action === "summary" ? "faible" : "moyen",
      metadata: {
        mailAction: selectedWorkResult.action,
      },
    });

    markMailInValidation(selectedWorkResult.mailId);

    const taskId = getLatestDoneTaskIdForMail(selectedWorkResult.mailId);

    if (taskId) {
      removeTask(taskId);
      setDismissedTaskIds((ids) => [...ids, taskId]);
    }

    setGeneratedResults((current) => {
      const mailResults = current[selectedWorkResult.mailId];

      if (!mailResults) return current;

      return {
        ...current,
        [selectedWorkResult.mailId]: {
          ...mailResults,
          [selectedWorkResult.action]: {
            ...selectedWorkResult,
            status: "pending_validation",
            updatedAt: new Date().toISOString(),
          },
        },
      };
    });

    setSelectedResultId(null);
    setEditingResultId(null);
    setAddedToValidation(true);

    addActivity({
      title: "Ajoutée aux validations",
      description: `${selectedWorkResult.title} ajouté au centre de validation.`,
      level: "success",
      relatedEntityId: validationId,
      relatedEntityType: "validation",
    });

    window.setTimeout(() => {
      setAddedToValidation(false);
    }, 900);
  }

  function handleSaveEditedResult(updatedResult: BrainiakMailResult) {
    setGeneratedResults((current) => {
      const mailResults = current[updatedResult.mailId];

      if (!mailResults) return current;

      return {
        ...current,
        [updatedResult.mailId]: {
          ...mailResults,
          [updatedResult.action]: updatedResult,
        },
      };
    });

    setSelectedResultId(updatedResult.id);
    setEditingResultId(null);

    addActivity({
      title: "Résultat BrainiaK modifié",
      description: updatedResult.title,
      level: "info",
      relatedEntityId: updatedResult.mailId,
      relatedEntityType: "mail",
    });
  }

  function handleUpdateAttachments(
    result: BrainiakMailResult,
    attachments: AttachmentItem[],
  ) {
    const updatedResult: BrainiakMailResult = {
      ...result,
      attachments,
      status: result.status === "generated" ? "edited" : result.status,
      updatedAt: new Date().toISOString(),
    };

    setGeneratedResults((current) => {
      const mailResults = current[result.mailId];

      if (!mailResults) return current;

      return {
        ...current,
        [result.mailId]: {
          ...mailResults,
          [result.action]: updatedResult,
        },
      };
    });

    setSelectedResultId(updatedResult.id);

    addActivity({
      title: "Pièces jointes mises à jour",
      description: updatedResult.title,
      level: "info",
      relatedEntityId: updatedResult.mailId,
      relatedEntityType: "mail",
    });
  }

  function handleDeleteResult(result: BrainiakMailResult) {
    setGeneratedResults((current) => {
      const mailResults = current[result.mailId];

      if (!mailResults) return current;

      const nextMailResults = { ...mailResults };
      delete nextMailResults[result.action];

      return {
        ...current,
        [result.mailId]: nextMailResults,
      };
    });

    setSelectedResultId(null);
    setEditingResultId(null);

    addActivity({
      title: "Résultat BrainiaK supprimé",
      description: result.title,
      level: "info",
      relatedEntityId: result.mailId,
      relatedEntityType: "mail",
    });
  }

  return (
    <section className="min-h-full bg-[var(--surface-0)] px-8 py-6">
      <div className="mx-auto grid w-full max-w-[1500px] gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
        <div className="space-y-6">
          <header className="rounded-3xl border border-[var(--border)] bg-[var(--surface-1)] p-6">
            <p className="text-xs font-medium uppercase tracking-[0.22em] text-cyan-300">
              Boîte mail
            </p>

            <h1 className="mt-2 text-2xl font-semibold text-[var(--text-primary)]">
              Mails à traiter
            </h1>

            <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--text-secondary)]">
              BrainiaK peut résumer les mails, préparer une réponse ou proposer
              une relance. Aucun mail n’est envoyé sans validation humaine.
            </p>
          </header>

          <MailFilters
            selectedFilter={selectedFilter}
            searchQuery={searchQuery}
            onFilterChange={setSelectedFilter}
            onSearchChange={setSearchQuery}
          />

          {error ? (
            <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-100">
              {error}
            </div>
          ) : null}

          <div className="grid gap-4">
            {filteredMails.length === 0 ? (
              <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface-1)] p-6 text-sm text-[var(--text-secondary)]">
                Aucun mail ne correspond au filtre sélectionné.
              </div>
            ) : null}

            {filteredMails.map((mail) => {
              const runningTask = getRunningTaskForMail(mail.id);
              const generatedActions =
                generatedResults[mail.id] ?? mail.actions ?? {};
              const pendingValidationCount = Object.values(
                generatedActions,
              ).filter(
                (result) => result?.status === "pending_validation",
              ).length;

              const disabled = Boolean(loadingAction) || Boolean(runningTask);
              const currentLoadingAction =
                loadingAction?.mailId === mail.id ? loadingAction.action : null;

              return (
                <MailCard
                  key={mail.id}
                  mail={mail}
                  generatedActions={generatedActions}
                  pendingValidationCount={pendingValidationCount}
                  isDisabled={disabled}
                  loadingAction={currentLoadingAction}
                  runningTaskDescription={runningTask?.description}
                  onRunAction={(selectedMail, action) =>
                    void runMailAction(selectedMail, action)
                  }
                  onMarkSent={handleMarkMailSent}
                  onArchive={handleArchiveMail}
                />
              );
            })}
          </div>
        </div>

        <BrainiakWorkPanel
          results={workResults}
          selectedResultId={selectedWorkResult?.id ?? null}
          editingResultId={editingResultId}
          addedToValidation={addedToValidation}
          onUpdateAttachments={handleUpdateAttachments}
          onSelectResult={(resultId) => {
            setSelectedResultId(resultId);
            setEditingResultId(null);
          }}
          onEditResult={(result) => {
            setSelectedResultId(result.id);
            setEditingResultId(result.id);
          }}
          onSaveEdit={handleSaveEditedResult}
          onCancelEdit={() => setEditingResultId(null)}
          onDeleteResult={handleDeleteResult}
          onAddToValidations={handleAddToValidations}
        />
      </div>
    </section>
  );
}