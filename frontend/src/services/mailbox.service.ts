export type MailContext = {
  sender?: string;
  subject?: string;
  body?: string;
  receivedAt?: string;
};

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function summarizeMail(mail: MailContext): Promise<string> {
  await wait(800);

  return `
📋 Résumé du mail

Expéditeur : ${mail.sender ?? "Client"}
Sujet : ${mail.subject ?? "Sans objet"}

Le client sollicite une action concernant son dossier.
Des informations complémentaires ou documents peuvent être nécessaires.

Action recommandée :
• Vérifier les pièces reçues
• Identifier les documents manquants
• Préparer une réponse ou une relance

⚠ Validation humaine requise.
`.trim();
}

export async function prepareMailReply(
  mail: MailContext,
): Promise<string> {
  await wait(1200);

  return `
Objet : Re: ${mail.subject ?? "Votre dossier"}

Bonjour,

Nous accusons bonne réception de votre message.

Après analyse de votre dossier, certaines informations complémentaires peuvent être nécessaires afin de poursuivre son traitement.

Nous vous invitons à nous transmettre les documents demandés dans les meilleurs délais.

Dès réception, nous reviendrons vers vous rapidement.

Cordialement,

Cabinet Infini

---
Brouillon généré par BrainiaK.
Validation humaine obligatoire avant envoi.
`.trim();
}

export async function prepareFollowUp(
  mail: MailContext,
): Promise<string> {
  await wait(1200);

  return `
Objet : Relance – ${mail.subject ?? "Documents manquants"}

Bonjour,

Nous revenons vers vous concernant votre dossier actuellement en cours d'étude.

À ce jour, certains documents ou informations semblent encore manquants pour finaliser son traitement.

Nous vous remercions de bien vouloir nous transmettre les éléments demandés dès que possible.

Sans réception de ces éléments, nous ne pourrons pas poursuivre l'instruction de votre dossier.

Nous restons à votre disposition pour toute question.

Cordialement,

Cabinet Infini

---
Relance générée par BrainiaK.
Validation humaine obligatoire avant envoi.
`.trim();
}