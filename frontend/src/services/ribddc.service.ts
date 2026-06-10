import { askBrainiakBusiness } from "./brainiak-business.service";

export type RibddcContext = {
  clientName?: string;
  clientProfile?: string;
  appointmentContext?: string;
  objectives?: string[];
  constraints?: string[];
  selectedSolutions?: string[];
};

export async function generateRibddcDraft(context: RibddcContext) {
  return askBrainiakBusiness({
    instruction:
      "Génère un brouillon RIBDDC structuré avec : client, contexte, objectifs, contraintes, solutions retenues, tableau comparatif des trois meilleures solutions, synthèse et points à vérifier avant validation humaine.",
    context,
  });
}

export async function generateSolutionComparison(context: RibddcContext) {
  return askBrainiakBusiness({
    instruction:
      "Prépare un tableau comparatif clair des solutions retenues : avantages, limites, adéquation au profil client, niveau de risque et points de vigilance.",
    context,
  });
}