import type { RibdcCase, RibdcWorkResult, RibdcWorkType } from "./ribdc-types";

export const mockRibdcCases: RibdcCase[] = [
  {
    id: "ribdc-001",
    clientName: "Julien Moreau",
    description:
      "Formulaire d’assurance-vie à compléter avec les données client disponibles.",
    status: "à préparer",
    uploadedFiles: [
      {
        id: "file-001",
        name: "Formulaire_assurance_vie.pdf",
        sizeLabel: "1.4 Mo",
        type: "pdf",
      },
    ],
    detectedFields: [
      {
        id: "field-001",
        label: "Nom",
        value: "Moreau",
        confidence: "haute",
      },
      {
        id: "field-002",
        label: "Prénom",
        value: "Julien",
        confidence: "haute",
      },
      {
        id: "field-003",
        label: "Objectif d’investissement",
        value: "Investissement progressif",
        confidence: "moyenne",
      },
    ],
    missingFields: ["Numéro fiscal", "Signature client"],
    updatedAt: "Aujourd’hui · 10:42",
  },
  {
    id: "ribdc-002",
    clientName: "Claire Martin",
    description:
      "Formulaire de souscription à préremplir avant contrôle humain.",
    status: "brouillon",
    uploadedFiles: [
      {
        id: "file-002",
        name: "Souscription_client.pdf",
        sizeLabel: "980 Ko",
        type: "pdf",
      },
    ],
    detectedFields: [
      {
        id: "field-004",
        label: "Nom",
        value: "Martin",
        confidence: "haute",
      },
      {
        id: "field-005",
        label: "Adresse",
        value: "Donnée disponible dans le dossier client",
        confidence: "moyenne",
      },
    ],
    missingFields: ["Pièce d’identité vérifiée"],
    updatedAt: "Hier · 16:20",
  },
];

export function createRibdcWorkResult(params: {
  caseId: string;
  type: RibdcWorkType;
  clientName: string;
}): RibdcWorkResult {
  const title =
    params.type === "filled_form"
      ? `Formulaire prérempli — ${params.clientName}`
      : params.type === "missing_fields"
        ? `Champs manquants — ${params.clientName}`
        : `Rapport de contrôle — ${params.clientName}`;

  const content =
    params.type === "filled_form"
      ? [
          `Client : ${params.clientName}`,
          "",
          "BrainiaK a préparé un formulaire prérempli à partir des données disponibles.",
          "",
          "Champs complétés :",
          "- Identité client",
          "- Coordonnées",
          "- Objectif du dossier",
          "- Informations patrimoniales connues",
          "",
          "Points à vérifier avant validation :",
          "- Cohérence des données",
          "- Champs obligatoires restants",
          "- Signature client",
        ].join("\n")
      : params.type === "missing_fields"
        ? [
            `Client : ${params.clientName}`,
            "",
            "Champs ou pièces à compléter :",
            "- Numéro fiscal",
            "- Signature client",
            "- Pièce d’identité vérifiée",
            "",
            "Action recommandée : demander les éléments manquants avant validation finale.",
          ].join("\n")
        : [
            `Client : ${params.clientName}`,
            "",
            "Contrôle BrainiaK :",
            "- Données principales détectées",
            "- Certaines informations nécessitent une validation humaine",
            "- Aucun envoi automatique n’est effectué",
          ].join("\n");

  return {
    id: `${params.caseId}-${params.type}-${Date.now()}`,
    caseId: params.caseId,
    type: params.type,
    title,
    content,
    status: "generated",
    createdAt: new Date().toISOString(),
  };
}