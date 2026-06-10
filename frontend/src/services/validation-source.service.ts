import {
  useMailboxStore,
  type MailboxStatus,
} from "@/store/mailbox-store";
import type {
  ValidationItem,
  ValidationStatus,
  ValidationType,
} from "@/store/validation-store";

export type ValidationDecision = Extract<
  ValidationStatus,
  "validé" | "refusé"
>;

type SourceDecisionResult = {
  handled: boolean;
  sourceType?: ValidationType;
  sourceId?: string;
  nextStatus?: string;
  message: string;
};

function applyMailDecision(
  sourceId: string,
  decision: ValidationDecision,
): SourceDecisionResult {
  const mailboxStore = useMailboxStore.getState();

  const nextStatus: MailboxStatus =
    decision === "validé" ? "valide" : "refuse";

  mailboxStore.setMailStatus(sourceId, nextStatus);

  return {
    handled: true,
    sourceType: "mail",
    sourceId,
    nextStatus,
    message:
      decision === "validé"
        ? "Le mail source a été marqué comme validé."
        : "Le mail source a été marqué comme refusé.",
  };
}

function notImplementedSource(
  validation: ValidationItem,
  decision: ValidationDecision,
): SourceDecisionResult {
  return {
    handled: false,
    sourceType: validation.sourceType,
    sourceId: validation.sourceId,
    message: `Source ${validation.sourceType ?? "inconnue"} non encore branchée pour la décision ${decision}.`,
  };
}

export function applyValidationDecision(
  validation: ValidationItem,
  decision: ValidationDecision,
): SourceDecisionResult {
  if (!validation.sourceId || !validation.sourceType) {
    return {
      handled: false,
      message: "Aucune source métier associée à cette validation.",
    };
  }

  switch (validation.sourceType) {
    case "mail":
      return applyMailDecision(validation.sourceId, decision);

    case "ribddc":
    case "complisoft":
    case "dossier-client":
    case "template":
    case "coffre-fort":
    case "paramètres":
    case "autre":
      return notImplementedSource(validation, decision);

    default:
      return notImplementedSource(validation, decision);
  }
}