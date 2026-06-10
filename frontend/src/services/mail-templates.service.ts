import { askBrainiakBusiness } from "./brainiak-business.service";

export type MailTemplateContext = {
  name: string;
  subject: string;
  variables: string[];
  clientExample?: {
    firstName?: string;
    lastName?: string;
    missingItems?: string[];
    appointmentDate?: string;
    solutionName?: string;
  };
};

export async function generateMailFromTemplate(context: MailTemplateContext) {
  return askBrainiakBusiness({
    instruction:
      "Génère un brouillon de mail professionnel à partir de ce modèle. Remplace les variables avec les informations disponibles. Indique les variables encore manquantes et rappelle qu'une validation humaine est nécessaire avant envoi.",
    context,
  });
}

export async function improveMailTemplate(context: MailTemplateContext) {
  return askBrainiakBusiness({
    instruction:
      "Améliore ce modèle de mail pour le rendre plus clair, professionnel, rassurant et adapté à un cabinet de courtage en assurance et investissement. Conserve les variables utiles.",
    context,
  });
}

export async function listRequiredTemplateVariables(context: MailTemplateContext) {
  return askBrainiakBusiness({
    instruction:
      "Liste les variables nécessaires pour utiliser correctement ce modèle de mail. Explique leur rôle et indique les informations manquantes à compléter avant génération.",
    context,
  });
}