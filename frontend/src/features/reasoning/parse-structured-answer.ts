export type ParsedReasoningBlock =
  | {
      type: "summary";
      title: string;
      content: string;
    }
  | {
      type: "step";
      title: string;
      content: string;
    }
  | {
      type: "code";
      title: string;
      language?: string;
      content: string;
    }
  | {
      type: "result";
      title: string;
      content: string;
    }
  | {
      type: "text";
      title: string;
      content: string;
    };

type ParsedStructuredAnswer = {
  blocks: ParsedReasoningBlock[];
};

function extractCodeBlocks(input: string) {
  const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
  const codeBlocks: Array<{
    language?: string;
    content: string;
    raw: string;
  }> = [];

  let match: RegExpExecArray | null;
  while ((match = codeBlockRegex.exec(input)) !== null) {
    codeBlocks.push({
      language: match[1] || undefined,
      content: match[2].trim(),
      raw: match[0],
    });
  }

  return codeBlocks;
}

function splitIntoLogicalParagraphs(input: string): string[] {
  return input
    .split(/\n\s*\n/)
    .map((part) => part.trim())
    .filter(Boolean);
}

function looksLikeResult(text: string): boolean {
  const lower = text.toLowerCase();
  return (
    lower.startsWith("résultat") ||
    lower.startsWith("result") ||
    lower.startsWith("conclusion") ||
    lower.startsWith("final answer")
  );
}

function looksLikeStep(text: string): boolean {
  return /^(\d+[\).\s-]|étape\s+\d+|step\s+\d+)/i.test(text);
}

export function parseStructuredAnswer(content: string): ParsedStructuredAnswer {
  const trimmed = content.trim();

  if (!trimmed) {
    return {
      blocks: [],
    };
  }

  const codeBlocks = extractCodeBlocks(trimmed);

  let withoutCode = trimmed;
  for (const block of codeBlocks) {
    withoutCode = withoutCode.replace(block.raw, "").trim();
  }

  const textParts = splitIntoLogicalParagraphs(withoutCode);
  const blocks: ParsedReasoningBlock[] = [];

  if (textParts.length > 0) {
    blocks.push({
      type: "summary",
      title: "Résumé",
      content: textParts[0],
    });
  }

  for (const part of textParts.slice(1)) {
    if (looksLikeResult(part)) {
      blocks.push({
        type: "result",
        title: "Résultat",
        content: part,
      });
      continue;
    }

    if (looksLikeStep(part)) {
      blocks.push({
        type: "step",
        title: "Étape",
        content: part,
      });
      continue;
    }

    blocks.push({
      type: "text",
      title: "Analyse",
      content: part,
    });
  }

  for (const block of codeBlocks) {
    blocks.push({
      type: "code",
      title: "Code",
      language: block.language,
      content: block.content,
    });
  }

  if (blocks.length === 1 && blocks[0].type === "summary") {
    const only = blocks[0];
    if (looksLikeResult(only.content)) {
      blocks[0] = {
        type: "result",
        title: "Résultat",
        content: only.content,
      };
    }
  }

  return { blocks };
}