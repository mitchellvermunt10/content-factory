import { z } from "zod";

const Voice = z.object({
  provider: z.enum(["elevenlabs", "openai", "deepgram", "playht"]),
  voiceId: z.string().max(80).describe("Provider voice ID — bijv. ElevenLabs 'Rachel'"),
  language: z.literal("nl-NL"),
  stability: z.number().min(0).max(1),
  similarity: z.number().min(0).max(1),
  style: z.string().max(140).describe("Stilistische korte aanduiding (rustig, warm, helder)"),
});

const FAQ = z.object({
  question: z.string().min(4).max(200),
  answer: z.string().min(10).max(600),
  category: z.enum([
    "booking",
    "pricing",
    "treatments",
    "policies",
    "location",
    "other",
  ]),
});

const BookingFlow = z.object({
  trigger: z
    .string()
    .max(220)
    .describe("Wanneer deze flow start — bijv. 'klant zegt afspraak/inplannen/maken'"),
  steps: z
    .array(
      z.object({
        say: z.string().min(4).max(280).describe("Wat de receptionist zegt"),
        listenFor: z
          .string()
          .max(220)
          .describe("Wat we van de beller verwachten"),
        capture: z
          .string()
          .max(80)
          .nullable()
          .optional()
          .or(z.literal(""))
          .describe("Variabele om op te slaan, bijv. 'naam', 'datum'"),
      })
    )
    .min(3)
    .max(10),
  confirmation: z
    .string()
    .min(20)
    .max(400)
    .describe("Bevestigingsboodschap aan einde booking"),
});

const Escalation = z.object({
  scenario: z.string().min(4).max(220),
  action: z.enum(["transfer_to_owner", "send_sms_summary", "callback_request"]),
  message: z.string().min(10).max(280),
});

export const ReceptionistConfigSchema = z.object({
  meta: z.object({
    name: z.string().min(2).max(60).describe("Naam van de AI-receptionist"),
    role: z.string().min(4).max(140).describe("Rol/positie binnen het bedrijf"),
    persona: z
      .string()
      .min(40)
      .max(800)
      .describe("Karakter, toon, achtergrond — 3-5 zinnen"),
  }),
  voice: Voice,
  greeting: z
    .string()
    .min(20)
    .max(400)
    .describe("Eerste zin bij oppakken — Nederlands, 1-2 zinnen max"),
  systemPrompt: z
    .string()
    .min(200)
    .max(4000)
    .describe("Volledige system prompt voor de LLM (Vapi/Retell-compatible)"),
  faqs: z.array(FAQ).min(8).max(20),
  bookingFlow: BookingFlow,
  escalations: z.array(Escalation).min(2).max(6),
  hours: z.object({
    timezone: z.literal("Europe/Amsterdam"),
    schedule: z
      .array(
        z.object({
          day: z.enum([
            "ma",
            "di",
            "wo",
            "do",
            "vr",
            "za",
            "zo",
          ]),
          open: z.string().regex(/^\d{2}:\d{2}$/).nullable(),
          close: z.string().regex(/^\d{2}:\d{2}$/).nullable(),
        })
      )
      .length(7),
    afterHoursMessage: z.string().min(10).max(400),
  }),
  guardrails: z
    .array(z.string().min(4).max(200))
    .min(3)
    .max(10)
    .describe("Regels: wat de receptionist NIET mag zeggen of doen"),
});

export type ReceptionistConfig = z.infer<typeof ReceptionistConfigSchema>;
