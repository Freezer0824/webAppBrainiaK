import { askBrainiakBusiness } from "./brainiak-business.service";

export type ComplisoftContext = {
  clientName?: string;
  availableData?: string[];
  missingData?: string[];
  availableDocuments?: string[];
  missingDocuments?: string[];
};

export async function prepareComplisoftData(context: ComplisoftContext) {
  return askBrainiakBusiness({
    instruction:
      "Prépare les données à contrôler avant alimentation COMPLISOFT. Structure la réponse en : données disponibles, données manquantes, documents requis, points de contrôle et recommandation avant synchronisation.",
    context,
  });
}

export async function checkComplianceReadiness(context: ComplisoftContext) {
  return askBrainiakBusiness({
    instruction:
      "Évalue si le dossier est prêt pour COMPLISOFT. Indique ce qui est complet, ce qui manque, les risques et les vérifications humaines nécessaires.",
    context,
  });
}