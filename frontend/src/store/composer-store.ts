import { create } from "zustand";

export type AttachedFile = {
  id: string;
  name: string;
  size: number;
  type: string;
  file?: File;
  uploadedId?: string;
  uploaded?: boolean;
};

export type ToolOption = "web_search" | "code" | "analysis";

type ComposerState = {
  value: string;
  attachedFiles: AttachedFile[];
  selectedTools: ToolOption[];
  reasoningEnabled: boolean;

  setValue: (value: string) => void;
  clearValue: () => void;

  addLocalFiles: (files: File[]) => void;
  markUploadedFiles: (
    payload: Array<{ localName: string; uploadedId: string }>,
  ) => void;
  removeFile: (id: string) => void;
  clearFiles: () => void;

  toggleTool: (tool: ToolOption) => void;
  clearTools: () => void;

  toggleReasoning: () => void;
  setReasoningEnabled: (value: boolean) => void;
};

export const useComposerStore = create<ComposerState>((set) => ({
  value: "",
  attachedFiles: [],
  selectedTools: [],
  reasoningEnabled: true,

  setValue: (value) => {
    set({ value });
  },

  clearValue: () => {
    set({ value: "" });
  },

  addLocalFiles: (files) =>
    set((state) => ({
      attachedFiles: [
        ...state.attachedFiles,
        ...files.map((file) => ({
          id: crypto.randomUUID(),
          name: file.name,
          size: file.size,
          type: file.type,
          file,
          uploaded: false,
        })),
      ],
    })),

  markUploadedFiles: (payload) =>
    set((state) => ({
      attachedFiles: state.attachedFiles.map((file) => {
        const match = payload.find((item) => item.localName === file.name);

        if (!match) {
          return file;
        }

        return {
          ...file,
          uploadedId: match.uploadedId,
          uploaded: true,
        };
      }),
    })),

  removeFile: (id) =>
    set((state) => ({
      attachedFiles: state.attachedFiles.filter((file) => file.id !== id),
    })),

  clearFiles: () => {
    set({ attachedFiles: [] });
  },

  toggleTool: (tool) =>
    set((state) => ({
      selectedTools: state.selectedTools.includes(tool)
        ? state.selectedTools.filter((item) => item !== tool)
        : [...state.selectedTools, tool],
    })),

  clearTools: () => {
    set({ selectedTools: [] });
  },

  toggleReasoning: () =>
    set((state) => ({
      reasoningEnabled: !state.reasoningEnabled,
    })),

  setReasoningEnabled: (reasoningEnabled) => {
    set({ reasoningEnabled });
  },
}));