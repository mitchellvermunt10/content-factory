export const BUSINESS_TYPES = [
  { value: "salon", label: "Beautysalon", emoji: "✦", keywords: ["huidverzorging", "behandelingen", "wellness", "luxe"] },
  { value: "restaurant", label: "Restaurant", emoji: "◍", keywords: ["keuken", "menu", "reserveren", "ervaring"] },
  { value: "dentist", label: "Tandarts", emoji: "◎", keywords: ["mondzorg", "behandeling", "praktijk", "zorg"] },
  { value: "gym", label: "Gym / Sportschool", emoji: "△", keywords: ["training", "lidmaatschap", "personal coaching", "kracht"] },
  { value: "tattoo", label: "Tattoo Shop", emoji: "✕", keywords: ["artist", "ontwerp", "studio", "design"] },
  { value: "barber", label: "Barbershop", emoji: "▲", keywords: ["knippen", "shave", "stijl", "klassiek"] },
  { value: "hotel", label: "Hotel / B&B", emoji: "◇", keywords: ["overnachting", "boeken", "comfort", "verblijf"] },
  { value: "coffeeshop", label: "Coffeeshop / Café", emoji: "○", keywords: ["koffie", "specialty", "ambacht", "ochtend"] },
  { value: "autobedrijf", label: "Autobedrijf", emoji: "◈", keywords: ["occasions", "garage", "proefrit", "onderhoud", "specialist"] },
] as const;

export type BusinessTypeValue = (typeof BUSINESS_TYPES)[number]["value"];

export const TONE_PRESETS = [
  {
    value: "luxueus",
    label: "Luxueus",
    description: "Fluweelzacht, premium, exclusief — voor high-end merken.",
    voice: "warm, statig, met bedachtzame ritmiek; sensorische beschrijvingen; gebruikt 'u' bij twijfel.",
  },
  {
    value: "speels",
    label: "Speels",
    description: "Knipogend, energiek, modern — voor lifestyle en hospitality.",
    voice: "luchtig en uitnodigend; korte zinnen; 'je' vorm; gebruikt af en toe ironie.",
  },
  {
    value: "klinisch",
    label: "Klinisch",
    description: "Helder, betrouwbaar, professioneel — voor zorg en medisch.",
    voice: "feitelijk, geruststellend, geen jargon, kort en duidelijk; 'u' vorm.",
  },
  {
    value: "stoer",
    label: "Stoer",
    description: "Direct, zelfverzekerd, ruig — voor barbers, gyms, tattoo.",
    voice: "kort en krachtig; werkwoord vooraan; geen poespas; 'je' vorm.",
  },
  {
    value: "warm",
    label: "Warm",
    description: "Persoonlijk, gastvrij, oprecht — voor familiebedrijven.",
    voice: "menselijk, persoonlijke voornaamwoorden; verhalend; 'je' vorm.",
  },
  {
    value: "minimal",
    label: "Minimal",
    description: "Strak, minimalistisch, design-driven — voor moderne merken.",
    voice: "ultrakort, ritmisch, witregels werken hard; geen overbodige bijvoeglijke naamwoorden.",
  },
] as const;

export type ToneValue = (typeof TONE_PRESETS)[number]["value"];

export const DELIVERABLES = [
  { id: "landing", label: "Premium Landing Page", desc: "Volledig gegenereerde, cinematic landingspagina." },
  { id: "seo", label: "SEO Copy", desc: "Meta, headers, alt teksten, keywords, FAQ schema." },
  { id: "meta-ads", label: "Meta Ads", desc: "Facebook & Instagram advertentievarianten." },
  { id: "google-ads", label: "Google Ads", desc: "Search & Performance Max varianten." },
  { id: "instagram", label: "Instagram Content", desc: "Posts, captions, hashtags, contentkalender." },
  { id: "reels", label: "Reels Ideeën", desc: "Concepten, hooks en scripts voor short video." },
  { id: "storyboard", label: "Cinematic Storyboard", desc: "Shot-by-shot concept voor merkvideo." },
  { id: "image-prompts", label: "AI Image Prompts", desc: "Premium prompts voor Midjourney / Firefly." },
  { id: "video-prompts", label: "AI Video Prompts", desc: "Prompts voor Runway, Kling, Veo." },
  { id: "chatbot", label: "Chatbot Flows", desc: "Klantgesprekken, intent-flows, fallback." },
  { id: "whatsapp", label: "WhatsApp Automation", desc: "Welkomsequences, broadcasts, no-shows." },
  { id: "email", label: "Email Campagnes", desc: "Welkom, nurture, win-back en aanbiedingen." },
  { id: "proposal", label: "Voorstellen", desc: "Klantvoorstellen, offerteteksten, pakketten." },
  { id: "pricing", label: "Pricing Pages", desc: "Premium prijstabellen met framing." },
  { id: "crm", label: "CRM Concepten", desc: "Segmenten, levenscyclus, journey-blueprints." },
  { id: "booking", label: "Booking Flows", desc: "Conversiegerichte boekingsschermen." },
] as const;

export const MVP_GENERATORS = [
  "landing",
  "seo",
  "meta-ads",
  "instagram",
  "cinematic",
  "social-shorts",
  "prompt-packs",
] as const;
export type MvpGeneratorId = (typeof MVP_GENERATORS)[number];

export const CAMERA_MOVEMENTS = [
  "static",
  "pan",
  "tilt",
  "dolly-in",
  "dolly-out",
  "truck",
  "zoom-in",
  "zoom-out",
  "whip-pan",
  "crane",
  "handheld",
  "tracking",
  "orbit",
] as const;
export type CameraMovement = (typeof CAMERA_MOVEMENTS)[number];

export const FRAMINGS = [
  "extreme-wide",
  "wide",
  "medium-wide",
  "medium",
  "medium-close",
  "close-up",
  "extreme-close-up",
  "top-down",
  "low-angle",
  "high-angle",
  "over-shoulder",
] as const;
export type Framing = (typeof FRAMINGS)[number];

export const TRANSITIONS = [
  "cut",
  "match-cut",
  "whip-pan",
  "dissolve",
  "fade-to-black",
  "morph",
  "speed-ramp",
  "j-cut",
  "l-cut",
  "smash-cut",
] as const;
export type Transition = (typeof TRANSITIONS)[number];

export const SHORT_PLATFORMS = ["reel", "tiktok", "youtube-short"] as const;
export type ShortPlatform = (typeof SHORT_PLATFORMS)[number];

export const HOOK_CATEGORIES = [
  "curiosity",
  "benefit",
  "contrarian",
  "story",
  "urgency",
] as const;
export type HookCategory = (typeof HOOK_CATEGORIES)[number];

export const PIPELINE_PHASES = [
  { id: "script", label: "Script", description: "Voice-over, hooks en on-screen tekst geschreven." },
  { id: "prompts", label: "Prompts", description: "Image- en video-prompts klaar voor render." },
  { id: "assets", label: "Assets", description: "Stills en clips uit Midjourney / Runway / Kling / Veo." },
  { id: "voiceover", label: "Voice-over", description: "ElevenLabs voice synthese, mastering, ducking." },
  { id: "edit", label: "Edit", description: "Concatenatie, transities, color grade in NLE." },
  { id: "export", label: "Export", description: "Encode in alle aspect ratios + delivery." },
] as const;
export type PipelinePhaseId = (typeof PIPELINE_PHASES)[number]["id"];

export const PHASE_STATUSES = [
  "pending",
  "in-progress",
  "review",
  "done",
  "blocked",
] as const;
export type PhaseStatus = (typeof PHASE_STATUSES)[number];

export const VIDEO_PROVIDERS = ["runway", "kling", "veo"] as const;
export type VideoProvider = (typeof VIDEO_PROVIDERS)[number];

export const IMAGE_PROVIDERS = ["midjourney", "firefly"] as const;
export type ImageProvider = (typeof IMAGE_PROVIDERS)[number];

export const RENDER_STATUSES = [
  "queued",
  "rendering",
  "ready",
  "failed",
] as const;
export type RenderStatus = (typeof RENDER_STATUSES)[number];

export const ASSET_STATUSES = [
  "missing",
  "uploaded",
  "verified",
  "ready",
] as const;
export type AssetStatus = (typeof ASSET_STATUSES)[number];

export const ASSET_STATUS_LABEL: Record<AssetStatus, string> = {
  missing: "Ontbreekt",
  uploaded: "Geüpload",
  verified: "Gecontroleerd",
  ready: "Klaar voor montage",
};

export const ACCEPTED_VIDEO_TYPES = [
  "video/mp4",
  "video/webm",
  "video/quicktime",
] as const;
export const ACCEPTED_IMAGE_TYPES = ["image/png", "image/jpeg"] as const;
export const ACCEPTED_VIDEO_ACCEPT = ACCEPTED_VIDEO_TYPES.join(",");
export const ACCEPTED_IMAGE_ACCEPT = ACCEPTED_IMAGE_TYPES.join(",");

export const EXPORT_PRESETS = [
  {
    id: "reel-9x16",
    label: "Instagram Reel · 9:16",
    ratio: "9:16",
    width: 1080,
    height: 1920,
    fps: 30,
    bitrate: "8M",
    audioBitrate: "192k",
    container: "mp4",
    codec: "libx264",
  },
  {
    id: "square-1x1",
    label: "Square Feed · 1:1",
    ratio: "1:1",
    width: 1080,
    height: 1080,
    fps: 30,
    bitrate: "8M",
    audioBitrate: "192k",
    container: "mp4",
    codec: "libx264",
  },
  {
    id: "youtube-16x9",
    label: "YouTube · 16:9",
    ratio: "16:9",
    width: 1920,
    height: 1080,
    fps: 24,
    bitrate: "12M",
    audioBitrate: "320k",
    container: "mp4",
    codec: "libx264",
  },
  {
    id: "feed-4x5",
    label: "Feed Portrait · 4:5",
    ratio: "4:5",
    width: 1080,
    height: 1350,
    fps: 30,
    bitrate: "8M",
    audioBitrate: "192k",
    container: "mp4",
    codec: "libx264",
  },
] as const;
export type ExportPresetId = (typeof EXPORT_PRESETS)[number]["id"];

export const ELEVENLABS_VOICES = [
  { id: "charlotte", name: "Charlotte", gender: "vrouw", accent: "Brits-Engels", suggestedFor: "luxueus, warm" },
  { id: "antoni", name: "Antoni", gender: "man", accent: "Neutraal Engels", suggestedFor: "klinisch, minimal" },
  { id: "bella", name: "Bella", gender: "vrouw", accent: "Amerikaans", suggestedFor: "speels" },
  { id: "sjoerd", name: "Sjoerd (NL)", gender: "man", accent: "Nederlands", suggestedFor: "stoer, warm" },
  { id: "anouk", name: "Anouk (NL)", gender: "vrouw", accent: "Nederlands", suggestedFor: "luxueus, klinisch" },
] as const;

export const ELEVENLABS_MODELS = [
  { id: "eleven_multilingual_v2", label: "Multilingual v2 (NL ondersteund)" },
  { id: "eleven_turbo_v2_5", label: "Turbo v2.5 (snel)" },
] as const;
