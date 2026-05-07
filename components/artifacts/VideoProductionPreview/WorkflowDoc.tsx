"use client";

import { motion } from "framer-motion";
import {
  ScrollText,
  Wand2,
  ImagePlay,
  Mic,
  Music2,
  Palette,
  Layers,
  Send,
  Search,
} from "lucide-react";

const STEPS = [
  {
    n: "01",
    icon: ScrollText,
    title: "Script & shot list",
    estimate: "30 min",
    body: "Cinematic tab levert het volledige script en alle shot-frames. Print de shot list CSV als checklist op set / in de render pipeline. Lock de duration per shot — alle ratios en muziek hangen ervan af.",
  },
  {
    n: "02",
    icon: Wand2,
    title: "Prompts vergrendelen",
    estimate: "20 min",
    body: "Loop de Prompt Packs door in volgorde. Pas Midjourney/Firefly prompts aan per merk-kleur. Per shot moet de Runway/Kling/Veo prompt EXACT dezelfde framing en camera-move benoemen als de shot card.",
  },
  {
    n: "03",
    icon: ImagePlay,
    title: "Stills genereren",
    estimate: "1-2 uur",
    body: "Genereer eerst de still frames in Midjourney v6 of Firefly. Selecteer per shot 1 winner. Houd ze in een mapje per scene. De stills dienen als referentie voor de video-modellen (ze laten zich beter sturen vanaf een first-frame).",
  },
  {
    n: "04",
    icon: ImagePlay,
    title: "Video clips renderen",
    estimate: "2-4 uur",
    body: "Upload elke still als first-frame in Runway / Kling / Veo en plak de video-prompt. Match exact de duration. Render meerdere variants per shot — meestal heb je #2 of #3 nodig voordat het écht klopt. Markeer 'klaar' in de pipeline tabel zodra je 1 keuze hebt.",
  },
  {
    n: "05",
    icon: Mic,
    title: "Voice-over",
    estimate: "10 min",
    body: "Plak het volledige script in ElevenLabs met de voorgestelde stem. Check stability/similarity totdat de delivery overeenkomt met de delivery direction per scene. Download als WAV (192k+).",
  },
  {
    n: "06",
    icon: Music2,
    title: "Muziek & sound design",
    estimate: "30 min",
    body: "Kies één muziekspoor (Artlist / Musicbed / eigen library). Volg de music direction van de Cinematic concept. Voeg ambient sound design toe per scene volgens de soundDesign omschrijving.",
  },
  {
    n: "07",
    icon: Layers,
    title: "Edit in NLE",
    estimate: "1-2 uur",
    body: "Importeer alle clips + VO + muziek in Premiere / Resolve / Final Cut. Volg de timeline JSON export — clips zitten al in volgorde met timecodes. Pas de transitionIn / transitionOut van elke scene toe.",
  },
  {
    n: "08",
    icon: Palette,
    title: "Color grade & finishing",
    estimate: "30-45 min",
    body: "Pas de globalStyle grading toe (LUT). Check huidstinten per close-up. Voeg subtle grain en halation toe als finishing. Bouw de end-card animation volgens logoTreatment in After Effects.",
  },
  {
    n: "09",
    icon: Send,
    title: "Encode in alle ratios",
    estimate: "15 min",
    body: "Run het ffmpeg-script of doe het manueel per preset. Check de file size — voor Meta moet de Reel onder 200MB blijven, voor TikTok onder 287MB. Sla alles in /exports/ op.",
  },
  {
    n: "10",
    icon: Search,
    title: "QC & delivery",
    estimate: "20 min",
    body: "ffprobe op elke export voor duur + ratio. Bekijk elke export op een telefoon. Lever met aspect-specifieke thumbnails: 9:16 voor Reels, 1:1 voor feed, 16:9 voor YouTube. Klant ziet één Notion-pagina met alles erop.",
  },
];

export function WorkflowDoc() {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-surface/50">
      <div className="flex items-center justify-between border-b border-border px-6 py-4">
        <h3 className="text-sm font-medium tracking-tight">
          Van prompts naar MP4 — werkstroom
        </h3>
        <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-text-subtle">
          ± 6 uur per cinematic
        </span>
      </div>
      <ol className="grid grid-cols-1 gap-px bg-border md:grid-cols-2">
        {STEPS.map((s, i) => {
          const Icon = s.icon;
          return (
            <motion.li
              key={s.n}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.04 }}
              className="bg-surface p-6"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="grid size-8 shrink-0 place-items-center rounded-lg border border-border bg-elevated text-accent">
                    <Icon className="size-4" />
                  </span>
                  <div>
                    <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-accent">
                      Stap {s.n}
                    </span>
                    <p className="text-base font-medium tracking-tight text-text">
                      {s.title}
                    </p>
                  </div>
                </div>
                <span className="shrink-0 font-mono text-[10px] uppercase tracking-[0.18em] text-text-subtle">
                  {s.estimate}
                </span>
              </div>
              <p className="mt-4 text-sm leading-relaxed text-text-muted pretty">
                {s.body}
              </p>
            </motion.li>
          );
        })}
      </ol>
    </div>
  );
}
