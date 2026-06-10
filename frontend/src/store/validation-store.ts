import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { MailActionType } from "@/components/infini/mail/mail-types";

export type ValidationStatus = "en attente" | "validé" | "refusé";
export type ValidationRiskLevel = "faible" | "moyen" | "élevé";

export type ValidationType =
  | "mail"
  | "complisoft"
  | "ribddc"
  | "coffre-fort"
  | "dossier-client"
  | "template"
  | "paramètres"
  | "autre";

export type ValidationMetadata = {
  mailAction?: MailActionType;
};

export type ValidationItem = {
  id: string;
  type: ValidationType;
  title: string;
  description: string;
  proposedAction: string;
  result: string;
  riskLevel: ValidationRiskLevel;
  status: ValidationStatus;
  sourceId?: string;
  sourceType?: ValidationType;
  metadata?: ValidationMetadata;
  createdAt: string;
  updatedAt?: string;
  decidedAt?: string;
};

type ValidationState = {
  validations: ValidationItem[];

  addValidation: (
    item: Omit<
      ValidationItem,
      "id" | "status" | "createdAt" | "updatedAt" | "decidedAt"
    >,
  ) => string;

  updateValidationStatus: (id: string, status: ValidationStatus) => void;
  approveValidation: (id: string) => void;
  rejectValidation: (id: string) => void;
  removeValidation: (id: string) => void;
  clearValidations: () => void;
};

function nowIso() {
  return new Date().toISOString();
}

export const useValidationStore = create<ValidationState>()(
  persist(
    (set) => ({
      validations: [],

      addValidation: (item) => {
        const id = crypto.randomUUID();
        const createdAt = nowIso();

        set((state) => ({
          validations: [
            {
              ...item,
              id,
              status: "en attente",
              createdAt,
              updatedAt: createdAt,
            },
            ...state.validations,
          ],
        }));

        return id;
      },

      updateValidationStatus: (id, status) =>
        set((state) => {
          const now = nowIso();

          return {
            validations: state.validations.map((item) =>
              item.id === id
                ? {
                    ...item,
                    status,
                    updatedAt: now,
                    decidedAt:
                      status === "validé" || status === "refusé"
                        ? now
                        : item.decidedAt,
                  }
                : item,
            ),
          };
        }),

      approveValidation: (id) =>
        set((state) => {
          const now = nowIso();

          return {
            validations: state.validations.map((item) =>
              item.id === id
                ? {
                    ...item,
                    status: "validé",
                    updatedAt: now,
                    decidedAt: now,
                  }
                : item,
            ),
          };
        }),

      rejectValidation: (id) =>
        set((state) => {
          const now = nowIso();

          return {
            validations: state.validations.map((item) =>
              item.id === id
                ? {
                    ...item,
                    status: "refusé",
                    updatedAt: now,
                    decidedAt: now,
                  }
                : item,
            ),
          };
        }),

      removeValidation: (id) =>
        set((state) => ({
          validations: state.validations.filter((item) => item.id !== id),
        })),

      clearValidations: () =>
        set({
          validations: [],
        }),
    }),
    {
      name: "brainiak-validations",
      version: 4,
      migrate: (persistedState) => {
        const state = persistedState as Partial<ValidationState>;

        if (!state?.validations) {
          return {
            validations: [],
          };
        }

        return {
          ...state,
          validations: state.validations.map((item) => ({
            ...item,
            sourceId: item.sourceId ?? undefined,
            sourceType: item.sourceType ?? item.type ?? "autre",
            metadata: item.metadata ?? {},
            updatedAt: item.updatedAt ?? item.createdAt,
            decidedAt: item.decidedAt ?? undefined,
          })),
        };
      },
    },
  ),
);