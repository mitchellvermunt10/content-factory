import { runJSON } from "@/lib/ai/runJSON";
import { describeBrief } from "@/lib/ai/briefContext";
import {
  ReceptionistConfigSchema,
  type ReceptionistConfig,
} from "@/lib/schemas/artifacts/receptionist";
import type { BusinessBrief } from "@/lib/schemas/brief";

const SCHEMA_HINT = `{
  "meta": {
    "name": string,
    "role": string,
    "persona": string (40-700)
  },
  "voice": {
    "provider": "elevenlabs"|"openai"|"deepgram"|"playht",
    "voiceId": string,
    "language": "nl-NL",
    "stability": number 0-1,
    "similarity": number 0-1,
    "style": string
  },
  "greeting": string (20-300),
  "systemPrompt": string (200-3500),
  "faqs": [{ "question": string, "answer": string, "category": "booking"|"pricing"|"treatments"|"policies"|"location"|"other" }] (10-15),
  "bookingFlow": {
    "trigger": string,
    "steps": [{ "say": string, "listenFor": string, "capture": string|null }] (4-8),
    "confirmation": string (40-300)
  },
  "escalations": [{ "scenario": string, "action": "transfer_to_owner"|"send_sms_summary"|"callback_request", "message": string }] (2-4),
  "hours": {
    "timezone": "Europe/Amsterdam",
    "schedule": [{ "day": "ma"|"di"|"wo"|"do"|"vr"|"za"|"zo", "open": "HH:MM"|null, "close": "HH:MM"|null }] x7,
    "afterHoursMessage": string
  },
  "guardrails": [string] (4-7)
}`;

export async function generateReceptionist(
  brief: BusinessBrief
): Promise<ReceptionistConfig> {
  const user = `${describeBrief(brief)}

OPDRACHT
Schrijf de complete configuratie voor een Nederlandstalige AI-telefonist voor dit bedrijf. De configuratie moet direct bruikbaar zijn in Vapi.ai of Retell AI.

EISEN
- meta.name: bedrijfs-passende naam (NIET "Assistant" of "Bot"). Bijvoorbeeld voor een salon: "Sophie", voor een garage: "Kees".
- meta.role: rol binnen het bedrijf (bijv. "afspraak-coördinator").
- meta.persona: 3-5 zinnen — karakter, toon, achtergrond. Klinkt menselijk, niet robotachtig.
- voice.provider: "elevenlabs" als default, voiceId leeg laten of 'pNInz6obpgDQGcFmaJgB' voor mannelijk Nederlands, 'XB0fDUnXU5powFXDhCwa' voor vrouwelijk Nederlands.
- voice.style: "rustig en helder" / "warm en bedachtzaam" / "stoer en direct" — passend bij toon van het bedrijf.
- greeting: eerste zin — Nederlands, 1-2 zinnen, eindigt met een uitnodiging. NIET "U spreekt met..." (oudbollig). Wel: "Goedemorgen, met [naam] van [bedrijf]. Waar kan ik je mee helpen?"
- systemPrompt: lange, gedetailleerde prompt voor de LLM. Bevat:
  · Persona (3 zinnen)
  · Bedrijfs-context (naam, locatie, USPs)
  · Wat de receptionist WEL doet (afspraken inplannen, info geven, doorzetten)
  · Wat de receptionist NIET doet (geen prijzen verzinnen, geen medische adviezen, geen kortingen verzinnen, niet liegen)
  · Conversatie-stijl (kort, vriendelijk, geduldig met oudere bellers)
  · Wat te doen bij onduidelijkheid (vragen om verduidelijking, NIET gokken)
  · Wat te doen bij klacht (rustig laten praten, dan doorzetten naar eigenaar)
- faqs: 10-15 vraag-antwoord-paren over deze branche. Specifiek voor dit bedrijf op basis van de brief.
- bookingFlow: stap-voor-stap dialoog: vragen wat klant wil, datum/tijd, naam, telefoon, evt. bijzonderheden, bevestigen.
- escalations: 2-4 scenarios (klacht, urgentie, taal-issue) met passende actie.
- hours: redelijk schema voor deze branche (salons typisch di-za 09:00-18:00, restaurants di-zo 17:00-22:00, autobedrijven ma-vr 08:00-17:30 + za ochtend).
- guardrails: 5-7 regels. Bijv: "Vraag NOOIT om creditcard-info", "Beloof geen behandelingen die we niet bieden", "Geef geen medisch advies".

TAAL: Alles Nederlands. Gebruikt "u" of "je" gebaseerd op tone of voice van het bedrijf.`;

  return runJSON({
    schema: ReceptionistConfigSchema,
    user,
    schemaHint: SCHEMA_HINT,
    maxTokens: 6000,
  });
}
