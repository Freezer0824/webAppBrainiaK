export type RibdcCaseStatus = "à préparer" | "brouillon" | "en validation";

export type RibdcUploadedFile = {
  id: string;
  name: string;
  sizeLabel: string;
  type: "pdf" | "docx" | "xlsx" | "image" | "autre";
};

export type RibdcField = {
  id: string;
  label: string;
  value: string;
  confidence: "haute" | "moyenne" | "basse";
};

export type RibdcCase = {
  id: string;
  clientName: string;
  description: string;
  status: RibdcCaseStatus;
  uploadedFiles: RibdcUploadedFile[];
  detectedFields: RibdcField[];
  missingFields: string[];
  updatedAt: string;
};

export type RibdcWorkType = "filled_form" | "missing_fields" | "control_report";

export type RibdcWorkResult = {
  id: string;
  caseId: string;
  type: RibdcWorkType;
  title: string;
  content: string;
  status: "generated" | "edited" | "pending_validation";
  createdAt: string;
};