import { useMemo, useState } from "react";
import { useValidationStore } from "@/store/validation-store";
import { useActivityStore } from "@/store/activity-store";
import { RibdcUploadZone } from "@/components/infini/ribdc/ribdc-upload-zone";
import { RibdcCaseCard } from "@/components/infini/ribdc/ribdc-case-card";
import { RibdcWorkPanel } from "@/components/infini/ribdc/ribdc-work-panel";
import {
  createRibdcWorkResult,
  mockRibdcCases,
} from "@/components/infini/ribdc/ribdc-mocks";
import type {
  RibdcCase,
  RibdcUploadedFile,
  RibdcWorkResult,
  RibdcWorkType,
} from "@/components/infini/ribdc/ribdc-types";

export function RibddcDashboard() {
  const addValidation = useValidationStore((state) => state.addValidation);
  const addActivity = useActivityStore((state) => state.addActivity);

  const [cases, setCases] = useState<RibdcCase[]>(mockRibdcCases);
  const [results, setResults] = useState<RibdcWorkResult[]>([]);
  const [selectedResultId, setSelectedResultId] = useState<string | null>(null);

  const visibleResults = useMemo(
    () => results.filter((result) => result.status !== "pending_validation"),
    [results],
  );

  function handleMockUpload() {
    const uploadedFile: RibdcUploadedFile = {
      id: `file-${Date.now()}`,
      name: `Formulaire_upload_${cases.length + 1}.pdf`,
      sizeLabel: "1.1 Mo",
      type: "pdf",
    };

    const nextCase: RibdcCase = {
      id: `ribdc-${Date.now()}`,
      clientName: "Nouveau client",
      description:
        "Formulaire ajouté en démo. BrainiaK pourra détecter les champs et proposer un préremplissage.",
      status: "à préparer",
      uploadedFiles: [uploadedFile],
      detectedFields: [
        {
          id: `field-${Date.now()}`,
          label: "Client",
          value: "À rapprocher du dossier client",
          confidence: "moyenne",
        },
      ],
      missingFields: ["Sélection du dossier client", "Signature"],
      updatedAt: "À l’instant",
    };

    setCases((current) => [nextCase, ...current]);

    addActivity({
      title: "Formulaire RIBDC ajouté",
      description: uploadedFile.name,
      level: "info",
      relatedEntityId: nextCase.id,
      relatedEntityType: "ribdc",
    });
  }

  function handleGenerate(item: RibdcCase, type: RibdcWorkType) {
    const result = createRibdcWorkResult({
      caseId: item.id,
      type,
      clientName: item.clientName,
    });

    setResults((current) => [result, ...current]);
    setSelectedResultId(result.id);

    setCases((current) =>
      current.map((caseItem) =>
        caseItem.id === item.id
          ? {
              ...caseItem,
              status: "brouillon",
              updatedAt: "À l’instant",
            }
          : caseItem,
      ),
    );

    addActivity({
      title: "Travail RIBDC généré",
      description: result.title,
      level: "info",
      relatedEntityId: item.id,
      relatedEntityType: "ribdc",
    });
  }

  function handleAddToValidation(result: RibdcWorkResult) {
    const validationId = addValidation({
      type: "ribddc",
      sourceId: result.caseId,
      sourceType: "ribddc",
      title: result.title,
      description:
        "Résultat RIBDC généré à partir d’un formulaire uploadé dans BrainiaK.",
      proposedAction:
        "Contrôler les champs remplis automatiquement avant utilisation finale.",
      result: result.content,
      riskLevel: result.type === "filled_form" ? "moyen" : "faible",
    });

    setResults((current) =>
      current.map((item) =>
        item.id === result.id
          ? {
              ...item,
              status: "pending_validation",
            }
          : item,
      ),
    );

    setCases((current) =>
      current.map((caseItem) =>
        caseItem.id === result.caseId
          ? {
              ...caseItem,
              status: "en validation",
              updatedAt: "À l’instant",
            }
          : caseItem,
      ),
    );

    setSelectedResultId(null);

    addActivity({
      title: "RIBDC ajouté aux validations",
      description: result.title,
      level: "success",
      relatedEntityId: validationId,
      relatedEntityType: "validation",
    });
  }

  return (
    <section className="min-h-full bg-[var(--surface-0)] px-8 py-6">
      <div className="mx-auto grid w-full max-w-[1500px] gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
        <div className="space-y-6">
          <header className="rounded-3xl border border-[var(--border)] bg-[var(--surface-1)] p-6">
            <p className="text-xs font-medium uppercase tracking-[0.22em] text-cyan-300">
              RIBDC
            </p>

            <h1 className="mt-2 text-2xl font-semibold text-[var(--text-primary)]">
              Remplissage automatique de formulaires
            </h1>

            <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--text-secondary)]">
              BrainiaK prépare le remplissage des formulaires uploadés à partir
              des données disponibles. Le résultat reste soumis à validation
              humaine.
            </p>
          </header>

          <RibdcUploadZone onMockUpload={handleMockUpload} />

          <div className="grid gap-4">
            {cases.map((item) => (
              <RibdcCaseCard
                key={item.id}
                item={item}
                onGenerate={handleGenerate}
              />
            ))}
          </div>
        </div>

        <RibdcWorkPanel
          results={visibleResults}
          selectedResultId={selectedResultId}
          onSelect={setSelectedResultId}
          onAddToValidation={handleAddToValidation}
        />
      </div>
    </section>
  );
}