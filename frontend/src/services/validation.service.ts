import { askBrainiakBusiness } from "./brainiak-business.service";
import type {
  ValidationRiskLevel,
  ValidationType,
} from "@/store/validation-store";

export type ValidationContext = {
  type: ValidationType;
  title: string;
  description: string;
  proposedAction: string;
  riskLevel?: ValidationRiskLevel;
};

export async function reviewBeforeValidation(context: ValidationContext) {
  return askBrainiakBusiness({
    instruction:
      "Analyse cette action avant validation humaine. Résume ce qui sera fait, les risques, les données concernées et les points à vérifier avant accord.",
    context,
  });
}

export async function explainValidationRisk(context: ValidationContext) {
  return askBrainiakBusiness({
    instruction:
      "Explique simplement le niveau de risque de cette action et pourquoi une validation humaine est nécessaire.",
    context,
  });
}