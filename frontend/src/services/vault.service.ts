import { askBrainiakBusiness } from "./brainiak-business.service";

export type VaultContext = {
  platform: string;
  username?: string;
  status?: "connecté" | "à vérifier" | "non configuré";
  lastUsed?: string;
};

export async function explainVaultAccess(context: VaultContext) {
  return askBrainiakBusiness({
    instruction:
      "Explique comment BrainiaK utilisera cet accès de manière sécurisée. Ne jamais demander ni afficher le mot de passe en clair.",
    context,
  });
}

export async function prepareVaultChecklist(context: VaultContext) {
  return askBrainiakBusiness({
    instruction:
      "Prépare une checklist de sécurité avant utilisation de cet accès : plateforme, identifiant, permissions, validation humaine et traçabilité.",
    context,
  });
}