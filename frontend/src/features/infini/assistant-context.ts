import type { AppView } from "./infini-types";

export type AssistantSuggestion = {
  id: string;
  label: string;
  prompt: string;
  view?: AppView;
};

export function getAssistantContextLabel(activeView?: AppView) {
  switch (activeView) {
    case "mailbox":
      return "Contexte : boîte mail";
    case "clients":
      return "Contexte : dossiers clients";
    case "complisoft":
      return "Contexte : COMPLISOFT";
    case "ribddc":
      return "Contexte : RIBDDC";
    case "templates":
      return "Contexte : mails modèles";
    case "vault":
      return "Contexte : coffre-fort";
    case "validations":
      return "Contexte : validations";
    default:
      return "Contexte : espace Infini";
  }
}

export const assistantSuggestions: AssistantSuggestion[] = [
  {
    id: "follow-up",
    label: "Préparer une relance",
    prompt:
      "Prépare une relance professionnelle pour un client dont le dossier est incomplet. Indique les éléments à vérifier avant envoi.",
  },
  {
    id: "summarize-mail",
    label: "Résumer ce mail",
    prompt:
      "Résume le mail sélectionné, identifie l’intention du client et propose la prochaine action.",
  },
  {
    id: "complisoft",
    label: "Préparer COMPLISOFT",
    prompt:
      "Prépare les données à vérifier avant alimentation de COMPLISOFT. Liste les champs nécessaires, les documents attendus et les points de contrôle humain.",
  },
  {
    id: "ribddc",
    label: "Générer un RIBDDC",
    prompt:
      "Aide-moi à préparer un RIBDDC après rendez-vous client : coordonnées, contexte client, solutions retenues, tableau comparatif et points à valider.",
  },
  {
    id: "missing-docs",
    label: "Lister les documents manquants",
    prompt:
      "Analyse le dossier client et liste les documents manquants pour la conformité. Prépare aussi une demande de pièces claire et professionnelle.",
  },
];