import type { BrainiakMailResult, MailActionType } from "./mail-types";

export type MailGeneratedResults = Record<
  string,
  Partial<Record<MailActionType, BrainiakMailResult>>
>;

const STORAGE_KEY = "brainiak.infini.mail.generated-results.v1";

export function loadMailGeneratedResults(): MailGeneratedResults {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};

    return JSON.parse(raw) as MailGeneratedResults;
  } catch {
    return {};
  }
}

export function saveMailGeneratedResults(results: MailGeneratedResults) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(results));
}

export function clearMailGeneratedResults() {
  window.localStorage.removeItem(STORAGE_KEY);
}

export function removeMailGeneratedResult(params: {
  mailId: string;
  action: MailActionType;
}) {
  const results = loadMailGeneratedResults();
  const mailResults = results[params.mailId];

  if (!mailResults) return results;

  const nextMailResults = { ...mailResults };
  delete nextMailResults[params.action];

  const nextResults: MailGeneratedResults = {
    ...results,
    [params.mailId]: nextMailResults,
  };

  saveMailGeneratedResults(nextResults);

  return nextResults;
}

export function countMailPendingValidations(mailId: string) {
  const results = loadMailGeneratedResults();
  const mailResults = results[mailId];

  if (!mailResults) return 0;

  return Object.values(mailResults).filter(
    (result) => result?.status === "pending_validation",
  ).length;
}