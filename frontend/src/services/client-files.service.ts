import { askBrainiakBusiness } from "./brainiak-business.service";

export type ClientFileContext = {
  clientName: string;
  profile?: string;
  status?: "complet" | "incomplet" | "à vérifier";
  missingDocuments?: string[];
  nextAction?: string;
};

export async function analyzeClientFile(context: ClientFileContext) {
  return askBrainiakBusiness({
    instruction:
      "Analyse ce dossier client. Résume le profil, l'état du dossier, les points importants, les risques éventuels et les contrôles humains nécessaires.",
    context,
  });
}

export async function listMissingDocuments(context: ClientFileContext) {
  return askBrainiakBusiness({
    instruction:
      "Liste les documents ou informations manquants dans ce dossier client. Classe-les par priorité et propose une formulation claire pour les demander au client.",
    context,
  });
}

export async function prepareNextClientAction(context: ClientFileContext) {
  return askBrainiakBusiness({
    instruction:
      "Prépare la prochaine action à réaliser sur ce dossier client. Indique l'objectif, les étapes, les informations à vérifier et si une validation humaine est nécessaire.",
    context,
  });
}