import { askBrainiakBusiness } from "./brainiak-business.service";

export type SettingsContext = {
  modules: Array<{
    label: string;
    status: string;
  }>;
  environment?: {
    apiBaseUrl?: string;
    demoMode?: boolean;
    tenantId?: string;
  };
};

export async function checkSettingsConfiguration(context: SettingsContext) {
  return askBrainiakBusiness({
    instruction:
      "Vérifie cette configuration BrainiaK pour Infini. Indique ce qui est prêt, ce qui doit être vérifié, les risques éventuels et les contrôles recommandés avant utilisation client.",
    context,
  });
}

export async function recommendSettingsNextSteps(context: SettingsContext) {
  return askBrainiakBusiness({
    instruction:
      "Recommande les prochaines étapes de configuration pour rendre l'espace Infini plus fiable : connexions, sécurité, validation humaine, COMPLISOFT, boîte mail et coffre-fort.",
    context,
  });
}