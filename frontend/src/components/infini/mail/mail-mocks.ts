import type {
  AttachmentItem,
  BrainiakMailResult,
  InfiniMailItem,
  MailActionType,
} from "./mail-types";

export const mockAttachments: AttachmentItem[] = [
  {
    id: "att-cni-001",
    name: "CNI_Client.pdf",
    type: "pdf",
    source: "client_file",
    sizeLabel: "1.2 Mo",
  },
  {
    id: "att-rib-001",
    name: "RIB_Client.pdf",
    type: "pdf",
    source: "client_file",
    sizeLabel: "540 Ko",
  },
  {
    id: "att-justif-001",
    name: "Justificatif_Domicile.pdf",
    type: "pdf",
    source: "local",
    sizeLabel: "860 Ko",
  },
];

export const mockMailItems: InfiniMailItem[] = [
  {
    id: "mail-001",
    sender: "Claire Martin <claire.martin@email.fr>",
    subject: "Documents manquants pour le dossier assurance-vie",
    receivedAt: "Aujourd’hui · 09:12",
    priority: "haute",
    status: "à traiter",
    workflowStatus: "a-traiter",
    summary:
      "La cliente demande confirmation des documents restants pour finaliser son dossier.",
    suggestedAction:
      "Préparer une réponse listant les documents manquants et proposer un créneau de rappel.",
    actions: {},
    history: [],
  },
  {
    id: "mail-002",
    sender: "Julien Moreau <julien.moreau@email.fr>",
    subject: "Relance concernant le comparatif PER",
    receivedAt: "Hier · 16:40",
    priority: "moyenne",
    status: "à traiter",
    workflowStatus: "a-traiter",
    summary:
      "Le client souhaite recevoir une mise à jour sur le comparatif des solutions PER.",
    suggestedAction:
      "Préparer une relance avec rappel du contexte et pièces jointes disponibles.",
    actions: {},
    history: [],
  },
  {
    id: "mail-003",
    sender: "Sophie Lambert <sophie.lambert@email.fr>",
    subject: "Question sur le formulaire de souscription",
    receivedAt: "Hier · 11:25",
    priority: "basse",
    status: "brouillon prêt",
    workflowStatus: "prepare",
    summary:
      "La cliente demande une précision sur plusieurs champs du formulaire de souscription.",
    suggestedAction:
      "Résumer la demande et préparer une réponse courte avant validation.",
    actions: {},
    history: [],
  },
];

export function createMockResult(params: {
  mailId: string;
  action: MailActionType;
  content: string;
}): BrainiakMailResult {
  const title =
    params.action === "summary"
      ? "Résumé BrainiaK"
      : params.action === "reply"
        ? "Brouillon de réponse"
        : "Brouillon de relance";

  return {
    id: `${params.mailId}-${params.action}-${Date.now()}`,
    mailId: params.mailId,
    action: params.action,
    title,
    content: params.content,
    status: "generated",
    attachments:
      params.action === "summary"
        ? []
        : mockAttachments.slice(0, 2),
    createdAt: new Date().toISOString(),
  };
}