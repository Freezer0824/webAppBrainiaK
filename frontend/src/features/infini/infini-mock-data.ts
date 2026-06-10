import {
  CheckCircle2,
  FileCheck2,
  FileText,
  Inbox,
  Mail,
  ShieldCheck,
} from "lucide-react";
import type { AppView } from "./infini-types";

export type InfiniKpi = {
  id: string;
  label: string;
  value: string;
  detail: string;
  tone: "info" | "success" | "warning" | "danger";
};

export type InfiniQuickAction = {
  id: string;
  title: string;
  description: string;
  targetView: AppView;
};

export type InfiniWorkflow = {
  id: string;
  title: string;
  description: string;
  status: "ready" | "pending" | "warning";
  actionLabel: string;
  targetView: AppView;
  icon: React.ComponentType<{ className?: string }>;
};

export const infiniKpis: InfiniKpi[] = [
  {
    id: "emails",
    label: "Mails à traiter",
    value: "12",
    detail: "Dont 4 nécessitent une réponse aujourd’hui",
    tone: "info",
  },
  {
    id: "followups",
    label: "Relances suggérées",
    value: "3",
    detail: "Brouillons prêts à vérifier",
    tone: "warning",
  },
  {
    id: "validations",
    label: "Validations requises",
    value: "2",
    detail: "Aucune action sensible sans accord humain",
    tone: "danger",
  },
  {
    id: "folders",
    label: "Dossiers incomplets",
    value: "1",
    detail: "Pièces conformité manquantes",
    tone: "warning",
  },
];

export const infiniQuickActions: InfiniQuickAction[] = [
  {
    id: "process-mails",
    title: "Traiter les mails",
    description: "Classer, résumer et préparer les réponses prioritaires.",
    targetView: "mailbox",
  },
  {
    id: "generate-ribddc",
    title: "Générer un RIBDDC",
    description: "Préparer un document après rendez-vous client.",
    targetView: "ribddc",
  },
  {
    id: "prepare-complisoft",
    title: "Préparer COMPLISOFT",
    description: "Contrôler les données avant synchronisation.",
    targetView: "complisoft",
  },
  {
    id: "open-assistant",
    title: "Ouvrir Assistant BrainiaK",
    description: "Demander une action ou une analyse libre.",
    targetView: "assistant",
  },
];

export const infiniWorkflows: InfiniWorkflow[] = [
  {
    id: "mailbox",
    title: "Boîte mail",
    description: "Tri, archivage, réponses et relances proposées.",
    status: "ready",
    actionLabel: "Ouvrir",
    targetView: "mailbox",
    icon: Inbox,
  },
  {
    id: "complisoft",
    title: "COMPLISOFT",
    description: "Préparation des données et documents de conformité.",
    status: "pending",
    actionLabel: "Préparer",
    targetView: "complisoft",
    icon: FileCheck2,
  },
  {
    id: "ribddc",
    title: "RIBDDC",
    description: "Génération guidée avec tableau comparatif.",
    status: "warning",
    actionLabel: "Générer",
    targetView: "ribddc",
    icon: FileText,
  },
  {
    id: "templates",
    title: "Mails modèles",
    description: "Devis, relances, confirmations et demandes de pièces.",
    status: "ready",
    actionLabel: "Voir",
    targetView: "templates",
    icon: Mail,
  },
  {
    id: "vault",
    title: "Coffre-fort",
    description: "Accès sécurisés aux plateformes utilisées par BrainiaK.",
    status: "ready",
    actionLabel: "Sécuriser",
    targetView: "vault",
    icon: ShieldCheck,
  },
  {
    id: "validations",
    title: "Validations",
    description: "Contrôle humain avant envoi ou synchronisation.",
    status: "ready",
    actionLabel: "Contrôler",
    targetView: "validations",
    icon: CheckCircle2,
  },
];

export type DemoMail = {
  id: string;
  sender: string;
  subject: string;
  receivedAt: string;
  priority: "haute" | "moyenne" | "basse";
  status: "à traiter" | "brouillon prêt" | "validé";
  summary: string;
  suggestedAction: string;
};

export type DemoClientFile = {
  id: string;
  clientName: string;
  profile: string;
  status: "complet" | "incomplet" | "à vérifier";
  missingDocuments: string[];
  nextAction: string;
};

export type DemoRibddc = {
  id: string;
  clientName: string;
  context: string;
  selectedSolutions: string[];
  status: "brouillon" | "validation requise" | "validé";
};

export type DemoValidation = {
  id: string;
  type: "mail" | "complisoft" | "ribddc" | "coffre-fort";
  title: string;
  description: string;
  riskLevel: "faible" | "moyen" | "élevé";
  status: "en attente" | "validé" | "refusé";
};

export const demoMails: DemoMail[] = [
  {
    id: "mail-001",
    sender: "Claire Martin",
    subject: "Documents manquants pour mon dossier",
    receivedAt: "Aujourd’hui · 09:14",
    priority: "haute",
    status: "à traiter",
    summary:
      "La cliente demande confirmation des pièces restantes pour finaliser son dossier.",
    suggestedAction:
      "Préparer une réponse listant la pièce d’identité et le justificatif de domicile.",
  },
  {
    id: "mail-002",
    sender: "Julien Moreau",
    subject: "Confirmation rendez-vous investissement",
    receivedAt: "Aujourd’hui · 10:32",
    priority: "moyenne",
    status: "brouillon prêt",
    summary:
      "Le client confirme sa disponibilité pour un rendez-vous de présentation.",
    suggestedAction:
      "Préparer un mail de confirmation avec rappel des documents à apporter.",
  },
  {
    id: "mail-003",
    sender: "Sophie Lambert",
    subject: "Relance devis assurance emprunteur",
    receivedAt: "Hier · 16:48",
    priority: "moyenne",
    status: "à traiter",
    summary:
      "La cliente souhaite recevoir une mise à jour sur le devis transmis.",
    suggestedAction:
      "Générer une relance commerciale courte et professionnelle.",
  },
];

export const demoClientFiles: DemoClientFile[] = [
  {
    id: "client-001",
    clientName: "Claire Martin",
    profile: "Assurance vie · Profil prudent",
    status: "incomplet",
    missingDocuments: ["Pièce d’identité", "Justificatif de domicile"],
    nextAction: "Demander les pièces manquantes avant alimentation COMPLISOFT.",
  },
  {
    id: "client-002",
    clientName: "Julien Moreau",
    profile: "Investissement · Horizon 8 ans",
    status: "à vérifier",
    missingDocuments: ["Questionnaire de connaissance client à relire"],
    nextAction: "Vérifier le contexte client avant génération RIBDDC.",
  },
  {
    id: "client-003",
    clientName: "Sophie Lambert",
    profile: "Assurance emprunteur",
    status: "complet",
    missingDocuments: [],
    nextAction: "Préparer une relance commerciale.",
  },
];

export const demoRibddc: DemoRibddc[] = [
  {
    id: "ribddc-001",
    clientName: "Julien Moreau",
    context:
      "Client souhaitant investir progressivement avec une tolérance au risque modérée.",
    selectedSolutions: [
      "Assurance vie fonds euros",
      "ETF monde en gestion pilotée",
      "SCPI diversifiée",
    ],
    status: "validation requise",
  },
  {
    id: "ribddc-002",
    clientName: "Claire Martin",
    context:
      "Cliente recherchant une solution prudente avec disponibilité partielle du capital.",
    selectedSolutions: [
      "Contrat assurance vie prudent",
      "Fonds euros nouvelle génération",
      "Compte à terme",
    ],
    status: "brouillon",
  },
];

export const demoValidations: DemoValidation[] = [
  {
    id: "validation-001",
    type: "mail",
    title: "Relance pièces manquantes — Claire Martin",
    description:
      "BrainiaK a préparé un brouillon demandant une pièce d’identité et un justificatif de domicile.",
    riskLevel: "moyen",
    status: "en attente",
  },
  {
    id: "validation-002",
    type: "ribddc",
    title: "RIBDDC — Julien Moreau",
    description:
      "Document généré avec tableau comparatif des trois solutions retenues. Relecture obligatoire.",
    riskLevel: "élevé",
    status: "en attente",
  },
  {
    id: "validation-003",
    type: "complisoft",
    title: "Synchronisation COMPLISOFT — Claire Martin",
    description:
      "Les données de conformité sont prêtes, mais deux pièces justificatives restent manquantes.",
    riskLevel: "élevé",
    status: "en attente",
  },
];

export type DemoComplisoftFile = {
  id: string;
  clientName: string;
  status: "prêt" | "incomplet" | "à vérifier";
  fieldsReady: number;
  fieldsTotal: number;
  missingItems: string[];
};

export type DemoMailTemplate = {
  id: string;
  name: string;
  subject: string;
  variables: string[];
};

export type DemoVaultAccess = {
  id: string;
  platform: string;
  username: string;
  status: "connecté" | "à vérifier" | "non configuré";
  lastUsed: string;
};

export const demoComplisoftFiles: DemoComplisoftFile[] = [
  {
    id: "comp-001",
    clientName: "Claire Martin",
    status: "incomplet",
    fieldsReady: 14,
    fieldsTotal: 18,
    missingItems: ["Pièce d’identité", "Justificatif de domicile"],
  },
  {
    id: "comp-002",
    clientName: "Julien Moreau",
    status: "à vérifier",
    fieldsReady: 17,
    fieldsTotal: 18,
    missingItems: ["Questionnaire client à relire"],
  },
];

export const demoMailTemplates: DemoMailTemplate[] = [
  {
    id: "tpl-001",
    name: "Relance pièces manquantes",
    subject: "Documents nécessaires pour finaliser votre dossier",
    variables: ["{{client.prenom}}", "{{pieces_manquantes}}", "{{conseiller.nom}}"],
  },
  {
    id: "tpl-002",
    name: "Confirmation rendez-vous",
    subject: "Confirmation de votre rendez-vous avec Infini",
    variables: ["{{client.prenom}}", "{{rdv.date}}", "{{rdv.heure}}"],
  },
  {
    id: "tpl-003",
    name: "Transmission devis",
    subject: "Votre proposition personnalisée",
    variables: ["{{client.prenom}}", "{{solution.nom}}", "{{dossier.reference}}"],
  },
];

export const demoVaultAccesses: DemoVaultAccess[] = [
  {
    id: "vault-001",
    platform: "COMPLISOFT",
    username: "conformite@infini.fr",
    status: "connecté",
    lastUsed: "Aujourd’hui · 09:40",
  },
  {
    id: "vault-002",
    platform: "Boîte mail cabinet",
    username: "contact@infini.fr",
    status: "à vérifier",
    lastUsed: "Hier · 17:12",
  },
  {
    id: "vault-003",
    platform: "CRM Infini",
    username: "admin@infini.fr",
    status: "non configuré",
    lastUsed: "Jamais utilisé",
  },
];