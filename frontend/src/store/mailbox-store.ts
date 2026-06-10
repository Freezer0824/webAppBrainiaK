import { create } from "zustand";
import { persist } from "zustand/middleware";
import { demoMails, type DemoMail } from "@/features/infini/infini-mock-data";

export type MailboxStatus =
  | "a-traiter"
  | "prepare"
  | "en-validation"
  | "valide"
  | "refuse"
  | "envoye"
  | "archive";

export type MailboxItem = DemoMail & {
  workflowStatus: MailboxStatus;
  updatedAt?: string;
};

type MailboxStore = {
  mails: MailboxItem[];

  setMailStatus: (
    mailId: string,
    workflowStatus: MailboxStatus,
  ) => void;

  markMailToProcess: (mailId: string) => void;
  markMailPrepared: (mailId: string) => void;
  markMailInValidation: (mailId: string) => void;
  markMailValidated: (mailId: string) => void;
  markMailRefused: (mailId: string) => void;
  markMailSent: (mailId: string) => void;

  archiveMail: (mailId: string) => void;

  resetMailbox: () => void;
};

function nowIso() {
  return new Date().toISOString();
}

function normalizeDemoMails(): MailboxItem[] {
  return demoMails.map((mail) => ({
    ...mail,
    workflowStatus: "a-traiter",
    updatedAt: nowIso(),
  }));
}

const initialMails = normalizeDemoMails();

function updateMailStatus(
  mails: MailboxItem[],
  mailId: string,
  workflowStatus: MailboxStatus,
): MailboxItem[] {
  return mails.map((mail) =>
    mail.id === mailId
      ? {
          ...mail,
          workflowStatus,
          updatedAt: nowIso(),
        }
      : mail,
  );
}

export const useMailboxStore = create<MailboxStore>()(
  persist(
    (set) => ({
      mails: initialMails,

      setMailStatus: (mailId, workflowStatus) =>
        set((state) => ({
          mails: updateMailStatus(
            state.mails,
            mailId,
            workflowStatus,
          ),
        })),

      markMailToProcess: (mailId) =>
        set((state) => ({
          mails: updateMailStatus(
            state.mails,
            mailId,
            "a-traiter",
          ),
        })),

      markMailPrepared: (mailId) =>
        set((state) => ({
          mails: updateMailStatus(
            state.mails,
            mailId,
            "prepare",
          ),
        })),

      markMailInValidation: (mailId) =>
        set((state) => ({
          mails: updateMailStatus(
            state.mails,
            mailId,
            "en-validation",
          ),
        })),

      markMailValidated: (mailId) =>
        set((state) => ({
          mails: updateMailStatus(
            state.mails,
            mailId,
            "valide",
          ),
        })),

      markMailRefused: (mailId) =>
        set((state) => ({
          mails: updateMailStatus(
            state.mails,
            mailId,
            "refuse",
          ),
        })),

      markMailSent: (mailId) =>
        set((state) => ({
          mails: updateMailStatus(
            state.mails,
            mailId,
            "envoye",
          ),
        })),

      archiveMail: (mailId) =>
        set((state) => ({
          mails: updateMailStatus(
            state.mails,
            mailId,
            "archive",
          ),
        })),

      resetMailbox: () =>
        set({
          mails: normalizeDemoMails(),
        }),
    }),
    {
      name: "brainiak-mailbox",
      version: 2,

      migrate: (persistedState) => {
        const state = persistedState as Partial<MailboxStore>;

        if (!state?.mails) {
          return {
            mails: initialMails,
          };
        }

        return {
          ...state,
          mails: state.mails.map((mail) => ({
            ...mail,
            workflowStatus:
              mail.workflowStatus ?? "a-traiter",
            updatedAt: mail.updatedAt ?? nowIso(),
          })),
        };
      },
    },
  ),
);