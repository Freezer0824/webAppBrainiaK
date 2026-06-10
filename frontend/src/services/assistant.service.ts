import { askBrainiakBusiness } from "./brainiak-business.service";

export async function askAssistant(userInput: string) {
  return askBrainiakBusiness({
    instruction:
      "Réponds comme assistant BrainiaK pour Infini. Aide l'utilisateur à clarifier son besoin et propose une prochaine action concrète.",
    userInput,
  });
}