import { Resend } from "resend";

let cached: Resend | null = null;

export function isResendEnabled(): boolean {
  return Boolean(process.env.RESEND_API_KEY);
}

function getClient(): Resend {
  if (cached) return cached;
  const key = (process.env.RESEND_API_KEY ?? "").replace(/\s+/g, "");
  if (!key) {
    throw new Error("RESEND_API_KEY ontbreekt — zet 'm in Vercel env vars.");
  }
  cached = new Resend(key);
  return cached;
}

export interface SendEmailInput {
  to: string;
  subject: string;
  body: string; // plain text, regels gescheiden met \n
  replyTo?: string;
  from?: string;
}

export interface SendEmailResult {
  id: string;
  to: string;
  from: string;
  sentAt: string;
}

const DEFAULT_FROM =
  process.env.RESEND_FROM_EMAIL ?? "Mitchell <mitchell@nextlevelsites.nl>";

/**
 * Verstuur een plain-text email. Converts \n naar <br> voor HTML-versie
 * zodat hij in mail-clients correct rendert (geen monospace blob).
 */
export async function sendEmail(
  input: SendEmailInput
): Promise<SendEmailResult> {
  const client = getClient();
  const from = input.from ?? DEFAULT_FROM;

  // Bouw HTML-versie met paragraaf-styling die natuurlijk leest in Gmail
  const paragraphs = input.body
    .split(/\n\n+/)
    .map((p) => p.trim())
    .filter(Boolean);
  const html = paragraphs
    .map(
      (p) =>
        `<p style="margin:0 0 14px;font-family:-apple-system,Segoe UI,Helvetica,Arial,sans-serif;font-size:15px;line-height:1.55;color:#0f0f0f;">${p
          .replace(/\n/g, "<br>")
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;")}</p>`
    )
    .join("");

  const wrappedHtml = `<!doctype html><html><head><meta charset="utf-8"></head><body style="margin:0;padding:0;background:#fff;">${html}</body></html>`;

  const result = await client.emails.send({
    from,
    to: input.to,
    subject: input.subject,
    text: input.body,
    html: wrappedHtml,
    replyTo: input.replyTo,
  });

  // Resend returnt { data: { id }, error } of throwt
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data = (result as any).data ?? result;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const error = (result as any).error;
  if (error) {
    throw new Error(`Resend faalde: ${error.message ?? JSON.stringify(error)}`);
  }
  if (!data?.id) {
    throw new Error("Resend gaf geen email-ID terug");
  }

  return {
    id: data.id,
    to: input.to,
    from,
    sentAt: new Date().toISOString(),
  };
}
