import { useState } from "react";
import { FileText, Loader2, MailPlus, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  demoMailTemplates,
  type DemoMailTemplate,
} from "@/features/infini/infini-mock-data";
import {
  generateMailFromTemplate,
  improveMailTemplate,
  listRequiredTemplateVariables,
} from "@/services/mail-templates.service";

type TemplateAction = "generate" | "improve" | "variables";

type TemplateActionState = {
  templateId: string;
  action: TemplateAction;
  result: string;
} | null;

function getActionLabel(action: TemplateAction) {
  switch (action) {
    case "generate":
      return "Mail généré";
    case "improve":
      return "Modèle amélioré";
    case "variables":
      return "Variables nécessaires";
    default:
      return "Résultat BrainiaK";
  }
}

function buildTemplateContext(template: DemoMailTemplate) {
  return {
    name: template.name,
    subject: template.subject,
    variables: template.variables,
    clientExample: {
      firstName: "Claire",
      lastName: "Martin",
      missingItems: ["Pièce d’identité", "Justificatif de domicile"],
      appointmentDate: "vendredi à 10h30",
      solutionName: "proposition personnalisée",
    },
  };
}

export function MailTemplatesDashboard() {
  const [activeResult, setActiveResult] = useState<TemplateActionState>(null);
  const [loadingAction, setLoadingAction] = useState<{
    templateId: string;
    action: TemplateAction;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function runTemplateAction(
    template: DemoMailTemplate,
    action: TemplateAction,
  ) {
    setError(null);
    setLoadingAction({ templateId: template.id, action });

    const context = buildTemplateContext(template);

    try {
      const result =
        action === "generate"
          ? await generateMailFromTemplate(context)
          : action === "improve"
            ? await improveMailTemplate(context)
            : await listRequiredTemplateVariables(context);

      setActiveResult({
        templateId: template.id,
        action,
        result,
      });
    } catch (err) {
      console.error("Action modèle mail BrainiaK échouée :", err);
      setError(
        "BrainiaK n’a pas pu traiter ce modèle de mail pour le moment. Vous pouvez réessayer.",
      );
    } finally {
      setLoadingAction(null);
    }
  }

  function isLoading(templateId: string, action: TemplateAction) {
    return (
      loadingAction?.templateId === templateId &&
      loadingAction.action === action
    );
  }

  return (
    <section className="min-h-full bg-[var(--surface-0)] px-8 py-6">
      <div className="mx-auto grid w-full max-w-[1500px] gap-6 xl:grid-cols-[minmax(0,1fr)_460px]">
        <div className="space-y-6">
          <header className="rounded-3xl border border-[var(--border)] bg-[var(--surface-1)] p-6">
            <p className="text-xs font-medium uppercase tracking-[0.22em] text-cyan-300">
              Mails modèles
            </p>

            <h1 className="mt-2 text-2xl font-semibold text-[var(--text-primary)]">
              Templates disponibles
            </h1>

            <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--text-secondary)]">
              BrainiaK peut générer un brouillon depuis un modèle, améliorer un
              template ou lister les variables nécessaires avant envoi.
            </p>
          </header>

          {error ? (
            <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-100">
              {error}
            </div>
          ) : null}

          <div className="grid gap-4 lg:grid-cols-2">
            {demoMailTemplates.map((template) => (
              <article
                key={template.id}
                className="rounded-3xl border border-[var(--border)] bg-[var(--surface-1)] p-5"
              >
                <h2 className="text-lg font-semibold text-[var(--text-primary)]">
                  {template.name}
                </h2>

                <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
                  Objet : {template.subject}
                </p>

                <div className="mt-5">
                  <p className="text-xs font-medium uppercase tracking-[0.18em] text-cyan-300">
                    Variables
                  </p>

                  <div className="mt-3 flex flex-wrap gap-2">
                    {template.variables.map((variable) => (
                      <span
                        key={variable}
                        className="rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-xs text-cyan-200"
                      >
                        {variable}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-5 flex flex-wrap gap-2">
                  <Button
                    type="button"
                    onClick={() => void runTemplateAction(template, "generate")}
                    disabled={Boolean(loadingAction)}
                    className="bg-[var(--surface-3)] text-[var(--text-primary)] hover:bg-cyan-500/10 hover:text-cyan-200"
                  >
                    {isLoading(template.id, "generate") ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <MailPlus className="mr-2 h-4 w-4" />
                    )}
                    Générer un mail
                  </Button>

                  <Button
                    type="button"
                    onClick={() => void runTemplateAction(template, "improve")}
                    disabled={Boolean(loadingAction)}
                    className="bg-[var(--surface-3)] text-[var(--text-primary)] hover:bg-cyan-500/10 hover:text-cyan-200"
                  >
                    {isLoading(template.id, "improve") ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Sparkles className="mr-2 h-4 w-4" />
                    )}
                    Améliorer le modèle
                  </Button>

                  <Button
                    type="button"
                    onClick={() =>
                      void runTemplateAction(template, "variables")
                    }
                    disabled={Boolean(loadingAction)}
                    className="bg-[var(--surface-3)] text-[var(--text-primary)] hover:bg-cyan-500/10 hover:text-cyan-200"
                  >
                    {isLoading(template.id, "variables") ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <FileText className="mr-2 h-4 w-4" />
                    )}
                    Lister les variables
                  </Button>
                </div>
              </article>
            ))}
          </div>
        </div>

        <aside className="h-fit rounded-3xl border border-[var(--border)] bg-[var(--surface-1)] p-5 xl:sticky xl:top-20">
          <p className="text-xs font-medium uppercase tracking-[0.22em] text-cyan-300">
            Résultat BrainiaK
          </p>

          {activeResult ? (
            <>
              <h2 className="mt-3 text-lg font-semibold text-[var(--text-primary)]">
                {getActionLabel(activeResult.action)}
              </h2>

              <div className="mt-4 whitespace-pre-wrap rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] p-4 text-sm leading-7 text-[var(--text-primary)]">
                {activeResult.result}
              </div>

              <div className="mt-4 rounded-2xl border border-amber-500/20 bg-amber-500/10 p-4 text-sm text-amber-100">
                Tout mail généré doit être relu et validé avant envoi.
              </div>
            </>
          ) : (
            <div className="mt-4 rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] p-4 text-sm leading-6 text-[var(--text-secondary)]">
              Sélectionnez une action pour générer, améliorer ou vérifier un
              modèle de mail avec BrainiaK.
            </div>
          )}
        </aside>
      </div>
    </section>
  );
}