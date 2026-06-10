import { sendDevChatMessage } from "@/lib/api/dev-chat-api";

export type BrainiakBusinessRequest = {
  instruction: string;
  userInput?: string;
  context?: Record<string, unknown>;
  timeoutMs?: number;
};

function formatContext(context?: Record<string, unknown>) {
  if (!context) return "";

  return `

Contexte fourni :
${JSON.stringify(context, null, 2)}`;
}

export async function askBrainiakBusiness({
  instruction,
  userInput,
  context,
  timeoutMs = 180_000,
}: BrainiakBusinessRequest): Promise<string> {
  const content = `
Tu es BrainiaK, assistant du cabinet Infini.

Ta mission principale est d'aider le cabinet sur :
- les mails ;
- les relances ;
- les dossiers clients ;
- COMPLISOFT ;
- les RIBDDC ;
- la conformité ;
- les modèles de mails ;
- les validations humaines.

Réponds de manière claire, professionnelle et exploitable.
Ne parle pas de ton architecture interne.
Ne mentionne pas Qwen, Gamma, GPU, pipeline, outils internes ou détails techniques.
Pour toute action sensible, rappelle qu'une validation humaine est nécessaire.

Mission :
${instruction}
${formatContext(context)}

Demande :
${userInput ?? "Prépare une réponse structurée et directement exploitable."}
`.trim();

  return sendDevChatMessage(
    {
      messages: [
        {
          role: "user",
          content,
        },
      ],
    },
    timeoutMs,
  );
}