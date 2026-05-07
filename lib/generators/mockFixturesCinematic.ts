import type { CinematicCampaign } from "@/lib/schemas/artifacts/cinematic";
import type { SocialShorts } from "@/lib/schemas/artifacts/socialShorts";
import type { PromptPacks } from "@/lib/schemas/artifacts/promptPacks";
import type { BusinessBrief } from "@/lib/schemas/brief";
import { BUSINESS_TYPES } from "@/lib/constants";

/**
 * SHOWCASE-grade mock fixtures.
 *
 * Geschreven in luxe, cinematic register — bedoeld om aan klanten / investeerders
 * te tonen wat het platform produceert. Behoudt scene-IDs (s01..s04) en
 * shot-IDs (s01-a, s01-b, s02-a, s02-b, s03-a, s03-b, s03-c, s04-a) zodat
 * bestaande Playwright + assembly pipeline tests groen blijven.
 *
 * Tone reference: Aesop × Wong Kar-wai × Apple iPhone-launch × Hermès editorial.
 */

export function mockCinematic(brief: BusinessBrief): CinematicCampaign {
  const type = BUSINESS_TYPES.find((t) => t.value === brief.businessType);
  const label = type?.label ?? "merk";

  return {
    concept: {
      logline: `Een ritueel van licht, stilte en vakmanschap. ${brief.name} maakt ruimte voor wat haast verdrijft.`,
      brandPillar: "Op afspraak. Voor één persoon. Voor één moment.",
      mood: "Bedachtzaam, sensueel, statig — Aesop ontmoet Wong Kar-wai.",
      referenceFilm: "Wong Kar-wai · Sofia Coppola · Hermès campaigns",
      totalDurationSec: 30,
      primaryAspectRatio: "9:16",
      musicDirection:
        "Slow ambient piano in C-mineur. Geen drum tot 0:18 — daarna één diepe sub-bass swell die uitsterft op 0:24. Stilte is een instrument.",
    },
    scenes: [
      {
        id: "s01",
        title: "Het stadsritme",
        intent: "hook",
        durationSec: 4,
        voiceOver: {
          text: "Iedereen rent. De stad rent.",
          deliveryDirection:
            "Vrouwelijk timbre, fluisterzacht. Drie woorden per ademteug. Geen urgentie, geen boodschap — observatie.",
        },
        onScreenText: "",
        cameraTreatment:
          "Whip-pans, micro-handheld, 1/24s shutter voor zachte motion blur.",
        lighting: "Hard mid-day licht, harde slagschaduwen, koele weerkaatsingen.",
        colorPalette: "Asfaltgrijs · neon-blauw · beton-beige · onthouden contrast.",
        soundDesign:
          "Stadsachtergrond: tram, voetstappen, een notificatie. Niets wordt benadrukt.",
        transitionIn: "cut",
        transitionOut: "speed-ramp",
        shots: [
          {
            id: "s01-a",
            framing: "wide",
            subject: "Trambaan in Amsterdam-Zuid, voorbijgangers in beweging",
            action:
              "Een parade van geblurde silhouetten schuift door het frame. Eén figuur staat doodstil in het midden, scherp.",
            durationSec: 2,
            cameraMovement: "tracking",
            lens: "24mm wide, anamorphic 1.33×",
            lighting: "Direct middaglicht, harde schaduwen op asfalt.",
            colorNote: "Ontkleurd, contrast gespreid, neon-glint.",
            imagePrompt: `Cinematic 24mm anamorphic wide shot of a busy Amsterdam-Zuid tram street at midday: blurred passers-by streak past, one stationary woman in tailored coat stands sharp in the centre, harsh shadows on asphalt, hint of cool neon glint, cool desaturated palette, fine 35mm film grain, anamorphic lens flare, shot on Arri Alexa Mini LF, mood reminiscent of Wong Kar-wai's Chungking Express, --ar 9:16 --style raw --v 6`,
            videoPrompt: `9:16 cinematic 24mm anamorphic wide shot, busy Amsterdam tram street at midday, motion blur on background pedestrians, one stationary woman in tailored coat remains sharp in centre frame. Slow horizontal tracking right-to-left. Anamorphic flares, harsh midday light, desaturated palette with cool neon highlights. Subtle organic camera shake. 24fps, naturalistic motion. 2 seconds.`,
          },
          {
            id: "s01-b",
            framing: "extreme-close-up",
            subject: "Drie notificaties verschijnen achter elkaar op een telefoon",
            action:
              "Drie pings, drie banners. De hand kantelt het scherm weg. Black to silence.",
            durationSec: 2,
            cameraMovement: "whip-pan",
            lens: "50mm",
            lighting:
              "Praktisch licht van scherm op huid. Voor de rest pikdonker.",
            colorNote: "Koel scherm-blauw op warm-getinte huid, sterk contrast.",
            imagePrompt: `Extreme macro close-up of a smartphone screen with three rapid push notifications cascading downward, hand tilting the device away, screen glow casting cool blue light on warm-toned skin, dark surroundings, shallow depth of field, 50mm lens, cinematic film grain, premium editorial mood, --ar 9:16 --style raw --v 6`,
            videoPrompt: `9:16 close-up macro of a smartphone screen, three notifications popping in rapid succession, hand tilts the device away as the screen fades to black. Whip pan to next scene. 50mm lens, shallow depth, screen glow on skin, cool blue colour cast against warm tones. 24fps. 2 seconds.`,
          },
        ],
      },
      {
        id: "s02",
        title: "De drempel",
        intent: "tension",
        durationSec: 5,
        voiceOver: {
          text: "Tot er één deur opent.",
          deliveryDirection:
            "Iets stiller dan de eerste regel. Pauze ervoor, langere ademteug erna. Bijna intern gesproken.",
        },
        onScreenText: "",
        cameraTreatment:
          "Statische frames, lange takes, één bewuste push-in. Geen handheld meer.",
        lighting:
          "Schemerlicht buiten, één enkele praktische lamp binnen — warm tungsten.",
        colorPalette: "Schaduwgrijs buiten · diep amber binnen · zachte halation.",
        soundDesign:
          "Stadsgeluid valt weg. Een zachte deurbel. Een ademteug. Hartslag op subwoofer-niveau.",
        transitionIn: "speed-ramp",
        transitionOut: "match-cut",
        shots: [
          {
            id: "s02-a",
            framing: "medium-wide",
            subject:
              "Voordeur van de salon vanaf straatkant — de wereld stopt op de drempel",
            action:
              "Een hand verschijnt in het frame, raakt de deurkruk, duwt zacht open. De bel klinkt één toon.",
            durationSec: 2.5,
            cameraMovement: "static",
            lens: "35mm prime",
            lighting:
              "Hard koud daglicht buiten, warm amber binnen — extreem contrast op drempel.",
            colorNote: "Sterke warm/koud-split exact op de overgang.",
            imagePrompt: `Cinematic 35mm static medium-wide shot of a discreet boutique salon entrance in Amsterdam-Zuid at dusk, hand reaching for the brass door handle, dramatic warm/cool contrast between the cold dusk outside and the deep amber tungsten interior light spilling onto the threshold, anamorphic flare on the brass, fine grain, premium quiet luxury aesthetic, mood reminiscent of Aesop x Hermès editorial, --ar 9:16 --style raw --v 6`,
            videoPrompt: `9:16 static 35mm medium-wide shot of a boutique salon door, a hand enters frame and gently pushes the brass handle, the door swings open with a single soft chime, cold dusk light outside contrasting against warm amber tungsten light spilling from within, anamorphic flare catches the brass. Camera does not move. 24fps, 2.5 seconds.`,
          },
          {
            id: "s02-b",
            framing: "close-up",
            subject: "Profielportret — vrouw ademt diep in",
            action:
              "Schouders zakken zichtbaar, ogen sluiten een halve seconde, mondhoek ontspant.",
            durationSec: 2.5,
            cameraMovement: "dolly-in",
            lens: "85mm prime, T1.4",
            lighting: "Zacht raamlicht van rechts. Achterkant in diep schaduw.",
            colorNote: "Warme huidstinten, achtergrond defocused naar abstract amber.",
            imagePrompt: `Tight 85mm cinematic close-up profile portrait of a woman in her late 30s taking a deep breath, shoulders softening, eyes briefly closed, soft window light from the right rim-lighting her cheek, completely defocused warm amber background, T1.4 shallow depth of field, fine 35mm grain, premium editorial mood, --ar 9:16 --style raw --v 6`,
            videoPrompt: `9:16 cinematic 85mm close-up profile portrait, slow dolly-in over 2.5 seconds, woman exhales deeply, shoulders soften, eyes briefly close, soft window light from the right, completely defocused warm amber background, T1.4 shallow focus. Naturalistic micro-movement only. 24fps.`,
          },
        ],
      },
      {
        id: "s03",
        title: "Het ritueel",
        intent: "build",
        durationSec: 12,
        voiceOver: {
          text: "Ruim de tijd voor één persoon. Voor één moment. Voor één ritueel.",
          deliveryDirection:
            "Pauze tussen elke regel — laat de stilte werken. Langere ademteug op het derde 'voor één'. Op niveau van fluisteren tegen iemand naast je.",
        },
        onScreenText: "",
        cameraTreatment:
          "Reeks bedachtzame macros. Eén lichte handheld voor het portret. Verder volledig statisch.",
        lighting:
          "Gestapeld praktisch: één kaars, één raamlicht, één kleine lamp. Geen flatlight.",
        colorPalette: "Diep amber · ambachtelijk goud · donkergroen materiaal.",
        soundDesign:
          "ASMR-laag: water dat plenst, materiaal dat raakt, ademen, glas dat tikt. Eerste piano-noten 0:14.",
        transitionIn: "match-cut",
        transitionOut: "dissolve",
        shots: [
          {
            id: "s03-a",
            framing: "extreme-close-up",
            subject: "Een hand schenkt water op een gladde rivierkei",
            action:
              "Het water raakt de steen, breekt zacht open, druipt langs de rand. 96fps slow-mo.",
            durationSec: 3,
            cameraMovement: "static",
            lens: "100mm macro",
            lighting:
              "Eén kaarslamp van rechts, rim-light op water. Volledig duister achter.",
            colorNote: "Kodak 2383, warm halation, donker met heldere highlights.",
            imagePrompt: `Cinematic extreme macro close-up: a hand pours crystal-clear water onto a smooth black river stone, droplets cascading along the edges in slow motion, single candle rim-light from the right, completely dark background, Kodak 2383 emulation, warm amber halation, fine grain, 100mm macro lens shot at T2.8, mood reminiscent of Aesop x Wong Kar-wai's In The Mood For Love, --ar 9:16 --style raw --v 6`,
            videoPrompt: `9:16 static extreme macro shot, hand pours crystal-clear water onto a smooth black river stone, the water breaks softly and cascades along the edges. 100mm macro lens, single candle rim-light from the right, completely dark background. 96fps slow-motion interpreted at 24fps for cinematic slow effect. Kodak 2383 warm amber halation, fine grain. 3 seconds, naturalistic motion only.`,
          },
          {
            id: "s03-b",
            framing: "medium-close",
            subject: "Vakvrouw legt gereedschap af op een houten werkblad",
            action:
              "Drie objecten worden bedachtzaam neergelegd in volgorde. Geen haast.",
            durationSec: 4,
            cameraMovement: "dolly-in",
            lens: "50mm prime",
            lighting: "Zacht side-light van links, warm tungsten.",
            colorNote: "Amber, fluwelig, lichte halation op messing.",
            imagePrompt: `Cinematic 50mm medium-close shot of a skilled woman's hands deliberately placing three small precision tools onto a dark walnut work surface in a warm boutique salon interior, soft side-light from the left, brass tool catches a subtle highlight, deep amber tungsten ambience, fine grain, mood reminiscent of premium quiet luxury editorial, --ar 9:16 --style raw --v 6`,
            videoPrompt: `9:16 cinematic 50mm medium-close shot, slow dolly-in over 4 seconds, hands deliberately place three small precision tools one by one onto a dark walnut work surface, soft tungsten side-light from the left, brass catches a subtle highlight, warm amber ambience. Naturalistic motion, no synthetic smoothness. 24fps.`,
          },
          {
            id: "s03-c",
            framing: "close-up",
            subject: "Profielportret van klant — moment van overgave",
            action:
              "Een halve glimlach verschijnt, ogen blijven gesloten. De wereld is buitengesloten.",
            durationSec: 5,
            cameraMovement: "handheld",
            lens: "85mm prime, T1.4",
            lighting: "Zacht raamlicht van links. Geen vulling rechts.",
            colorNote: "Warme huid, donkere achtergrond, zacht maar contrastrijk.",
            imagePrompt: `Cinematic 85mm tight close-up profile portrait of a woman in her late 30s with eyes closed, a barely-there half-smile forming, soft window light from the left rim-lighting her cheekbone, dark and unlit on the right, completely defocused background, T1.4 shallow depth of field, premium editorial mood, fine 35mm grain, mood reminiscent of Sofia Coppola's Lost In Translation, --ar 9:16 --style raw --v 6`,
            videoPrompt: `9:16 cinematic 85mm close-up profile portrait, subtle handheld feel, woman with eyes closed slowly forms a barely-there half-smile, soft window light from the left, completely defocused background, T1.4 shallow focus. Organic micro-movement only — no AI smoothness. 24fps. 5 seconds.`,
          },
        ],
      },
      {
        id: "s04",
        title: "Het bestendige",
        intent: "payoff",
        durationSec: 6,
        voiceOver: {
          text: "Wat blijft hangen, lang nadat je weer buiten bent.",
          deliveryDirection:
            "Stilte ervoor van twee seconden. Spreek dichter bij de microfoon. Laat de muziek-swell de zin afmaken.",
        },
        onScreenText: "Maison Lumière",
        cameraTreatment: "Eén lange take. Slow dolly-out. Stille observatie.",
        lighting: "Schemerlicht. Praktische lampen binnen gloeien als een baken.",
        colorPalette: "Twilight blauw · interior gold · cinemascope letterbox.",
        soundDesign:
          "Muziek-swell vol opent. Sub-bass diep onderin. Voetstappen op natte stenen.",
        transitionIn: "dissolve",
        transitionOut: "fade-to-black",
        shots: [
          {
            id: "s04-a",
            framing: "wide",
            subject: "De salon in schemer — een silhouet stapt naar buiten",
            action:
              "Camera trekt langzaam terug. Het etablissement gloeit warm in een koude blauwe stad. De vrouw stapt met rustige tred weg.",
            durationSec: 6,
            cameraMovement: "dolly-out",
            lens: "35mm anamorphic",
            lighting: "Mixed: warm interieur, koel twilight buiten, één straatlamp.",
            colorNote: "Goud-blauw split. Cinematic teal-and-orange.",
            imagePrompt: `Cinematic 35mm anamorphic wide exterior shot of a discreet luxury beauty salon glowing warmly at twilight in Amsterdam-Zuid, a single silhouetted woman in a tailored coat stepping out onto the cobblestone street, deep blue dusk sky overhead, golden interior light spilling onto the wet stones, anamorphic lens flares from a single street lamp, fine grain, mood reminiscent of Apple iPhone launch commercials meets Hermès campaign, --ar 9:16 --style raw --v 6`,
            videoPrompt: `9:16 cinematic 35mm anamorphic wide exterior, slow dolly-out over 6 seconds, away from a luxury salon glowing warmly at twilight in Amsterdam, a silhouetted woman in a tailored coat steps out and walks calmly into the cool blue dusk, golden interior light spills onto wet cobblestones, anamorphic flares from a street lamp. 24fps, naturalistic motion. Final shot before end card.`,
          },
        ],
      },
    ],
    endCard: {
      headline: brief.name,
      subline: `${label} · ${brief.city}`,
      logoTreatment:
        "Wordmark verschijnt in soft-glow over fade-to-black. Opacity 0→100 over 1.4s, lichte chromatic aberration.",
      callToAction: "Op afspraak",
    },
    deliverables: {
      masterCut: { durationSec: 30, aspectRatio: "9:16" },
      cutdowns: [
        {
          name: "Hero 30s",
          durationSec: 30,
          aspectRatio: "16:9",
          note: "Letterboxed master voor brand-film en hero-sectie van de site.",
        },
        {
          name: "Reel 15s",
          durationSec: 15,
          aspectRatio: "9:16",
          note: "Scenes 02 + 03 + 04. Hooks 0:00 met 'Tot er één deur opent.'",
        },
        {
          name: "Square 10s",
          durationSec: 10,
          aspectRatio: "1:1",
          note: "Feed-versie. Scene 03 + 04. End card direct.",
        },
        {
          name: "Bumper 6s",
          durationSec: 6,
          aspectRatio: "16:9",
          note: "YouTube non-skip. Alleen scene 04 + harde CTA.",
        },
      ],
    },
  };
}

export function mockSocialShorts(brief: BusinessBrief): SocialShorts {
  return {
    formats: {
      reel: {
        durationSec: 15,
        hook: "Tot er één deur opent.",
        beats: [
          { timecode: "00:00", shot: "Drukke straat, één figuur stilstaand.", vo: "Iedereen rent.", onScreenText: "" },
          { timecode: "00:02", shot: "Hand op messing deurkruk.", vo: "Tot er één deur opent.", onScreenText: "" },
          { timecode: "00:05", shot: "Macro: water op steen.", vo: "", onScreenText: "Eén ritueel." },
          { timecode: "00:08", shot: "Profielportret, halve glimlach.", vo: "Voor één persoon.", onScreenText: "" },
          { timecode: "00:12", shot: "Eindcard met logo over fade-to-black.", vo: "", onScreenText: brief.name },
        ],
        cta: "Op afspraak",
        soundDirection:
          "Ambient piano + sub-bass swell. Volledig stil tot 0:05, dan langzaam opbouwend.",
        captionsStyle:
          "Wit serif (Garamond italic), lower-third, lichte tracking, fade-up 0.4s.",
        loopOpportunity: "Eindshot fade-to-black sluit aan op opening straatshot.",
      },
      tiktok: {
        durationSec: 21,
        hook: "Iedereen heeft pauzes. Bijna niemand neemt ze.",
        beats: [
          { timecode: "00:00", shot: "POV agenda met overvolle dag.", vo: "Iedereen heeft pauzes.", onScreenText: "Pauzes." },
          { timecode: "00:03", shot: "Whip-pan naar straatscène.", vo: "Bijna niemand neemt ze.", onScreenText: "" },
          { timecode: "00:06", shot: "Drempel, deur opent.", vo: "", onScreenText: `${brief.name} · ${brief.city}` },
          { timecode: "00:09", shot: "Macro detail van het werk.", vo: "Geen lopende band.", onScreenText: "" },
          { timecode: "00:12", shot: "Klantglimlach.", vo: "Wel iemand die luistert.", onScreenText: "" },
          { timecode: "00:16", shot: "Twilight wide.", vo: "", onScreenText: "Plan je moment." },
          { timecode: "00:19", shot: "Logo + tap-to-book.", vo: "Tap voor agenda.", onScreenText: "Tap →" },
        ],
        cta: "Tap voor agenda",
        soundDirection:
          "Trending lo-fi met intentionele stilte op 0:08, sub-bass entry op 0:12.",
        captionsStyle:
          "TikTok-stijl: gele accent op kernwoorden, fade-up animaties per zin.",
        loopOpportunity:
          "Sluit met de agenda-shot uit het begin, één blokje 'gereserveerd' nu ingevuld.",
      },
      youtubeShort: {
        durationSec: 45,
        hook: "Drie minuten op deze pagina, twee weken effect.",
        beats: [
          {
            timecode: "00:00",
            shot: "Splitscreen: hectische ochtend ↔ kalme salon.",
            vo: "Drie minuten op deze pagina, twee weken effect.",
            onScreenText: "",
          },
          {
            timecode: "00:05",
            shot: "Drempel, contrast warm/koel.",
            vo: "Een afspraak die voor jou bedoeld is.",
            onScreenText: "",
          },
          {
            timecode: "00:12",
            shot: "Reeks van macro's: water, gereedschap, materiaal.",
            vo: "Geen haast. Wel ritme.",
            onScreenText: "",
          },
          {
            timecode: "00:22",
            shot: "Portret van vakvrouw aan het werk.",
            vo: "Iemand die luistert vóór ze adviseert.",
            onScreenText: "",
          },
          {
            timecode: "00:32",
            shot: "Klant verlaat de salon in schemer.",
            vo: "Wat blijft hangen — lang nadat je weer buiten bent.",
            onScreenText: "",
          },
          {
            timecode: "00:40",
            shot: "Eindcard met logo + agenda QR.",
            vo: "Plan je eerste bezoek.",
            onScreenText: brief.name,
          },
        ],
        cta: "Plan je eerste bezoek",
        soundDirection:
          "Subtiele score, room-tone op high pass, één zachte kick op 0:22, sub-bass swell op 0:32.",
        captionsStyle:
          "YouTube-shorts stijl: groot serif, centraal, mono-mix, fade transitions.",
        loopOpportunity: "Eindshot kan terug naar splitscreen voor herhaling.",
      },
    },
    hookBank: {
      curiosity: [
        { text: "Tot er één deur opent.", type: "voice-over", note: "Werkt als opening + als sluit-CTA." },
        { text: "Iedereen heeft pauzes. Bijna niemand neemt ze.", type: "text-overlay", note: "" },
        { text: "Drie minuten op deze pagina, twee weken effect.", type: "voice-over", note: "" },
      ],
      benefit: [
        { text: "Geen lopende band. Wel iemand die luistert.", type: "voice-over", note: "" },
        { text: "Persoonlijk advies in 90 minuten — niet in 9.", type: "text-overlay", note: "" },
        { text: "Het verschil tussen 'gehaast geholpen' en 'echt gezien'.", type: "voice-over", note: "" },
      ],
      contrarian: [
        { text: "We zijn niet de snelste. Dat is precies het punt.", type: "voice-over", note: "" },
        { text: "Alle anderen verkopen. Wij luisteren eerst.", type: "text-overlay", note: "" },
        { text: "Stop met 5-sterren reviews lezen. Kom voelen.", type: "performative", note: "Performer kijkt in cam, knipoog." },
      ],
      story: [
        { text: "Eva kwam binnen met een idee. Ze liep buiten met iets beters.", type: "voice-over", note: "" },
        { text: "Een uur stilte was alles wat ze nodig had.", type: "text-overlay", note: "" },
        { text: "Op een dinsdag in maart gebeurde er niets. En alles.", type: "voice-over", note: "" },
      ],
      urgency: [
        { text: "Drie open plekken deze week.", type: "text-overlay", note: "" },
        { text: "Boek voor vrijdag, plan voor de zomer.", type: "voice-over", note: "" },
        { text: "Maart-agenda is bijna vol.", type: "text-overlay", note: "Met aftellende sticker." },
      ],
    },
    ctaBank: [
      "Op afspraak",
      "Plan je moment",
      "Boek via link in bio",
      "Tap voor agenda",
      "Reserveer dit weekend",
      "Plan je eerste bezoek",
    ],
    trendingFormats: [
      {
        name: "POV: my Tuesday at Maison Lumière",
        why:
          "Authentiek POV werkt voor lokale luxe-merken — het maakt de plek tastbaar zonder corporate gevoel.",
        adaptation: `21s POV walking shot van klant: stappen, drempel, eerste momenten van de afspraak. ${brief.name} verschijnt alleen als wordmark in laatste frame.`,
      },
      {
        name: "Day in the Life — owner edition",
        why:
          "Het gezicht achter het merk vergroot vertrouwen. Werkt als een ode aan vakmanschap.",
        adaptation:
          "Mini-portret van de eigenaar door de dag heen: openings-ritueel, één klant, sluiting. Geen voice-over, alleen tekst-overlays in serif.",
      },
      {
        name: "Silent Process",
        why:
          "ASMR/silent video heeft hoge retention en sluit perfect aan bij luxe positionering.",
        adaptation:
          "60 seconden van pure handelingen zonder muziek — alleen veld-geluid. Eindigt op één titel: het merk + plan-cta.",
      },
    ],
  };
}

export function mockPromptPacks(brief: BusinessBrief): PromptPacks {
  void brief;
  return {
    globalStyle: {
      moodboard:
        "Aesop store interiors × Wong Kar-wai (In the Mood for Love) × Hermès Spring/Summer editorial × Apple iPhone 15 Pro launch.",
      colorScript:
        "Opening koel asfaltgrijs (stadsritme) → drempel warm/koel split (s02) → midden diep amber + Kodak halation (ritueel) → einde twilight blauw + interior gold (afsluiting).",
      grading:
        "Kodak 2383 print emulation, lichte halation, fijne grain (35mm), milde teal-and-orange split-toning op exterior, neutrale skin tones binnen.",
      lensing:
        "Anamorphic mood: 24mm wide voor stad, 35mm prime voor architectuur, 85mm T1.4 voor portretten, 100mm macro voor detail.",
    },
    imagePack: {
      style:
        "Cinematic 9:16 still, fine 35mm grain, anamorphic flares, naturalistic light, premium boutique mood. Default --style raw, --ar 9:16 --v 6.",
      prompts: [
        {
          id: "img-01",
          context: "Hero — exterieur in schemer",
          midjourney: `Cinematic wide exterior of a discreet luxury beauty salon "${brief.name}" in Amsterdam-Zuid at twilight, single silhouetted woman in tailored coat stepping out onto wet cobblestones, deep blue dusk sky, golden interior tungsten light spilling through tall windows, anamorphic lens flares from a single street lamp, fine 35mm grain, mood reminiscent of Apple iPhone launch ads × Hermès editorial, --ar 9:16 --style raw --v 6`,
          firefly: `Wide cinematic exterior of a discreet luxury salon at twilight in Amsterdam, warm interior light contrasted against cool dusk sky, silhouetted woman stepping out, fine grain, photorealistic editorial mood.`,
          negative: "no busy crowds, no harsh hdr, no oversaturation, no obvious AI artifacts",
          aspectRatio: "9:16",
          styleNote: "Hero key art / OG image candidate / poster of the brand-film.",
        },
        {
          id: "img-02",
          context: "Detail — water op steen, kaarslicht",
          midjourney: `Extreme macro close-up of a hand pouring crystal-clear water onto a smooth black river stone, droplets cascading along the edges in slow motion, single candle rim-light from the right, completely dark background, Kodak 2383 emulation, warm amber halation, fine grain, 100mm macro lens shot at T2.8, mood reminiscent of Aesop x Wong Kar-wai, --ar 9:16 --style raw --v 6`,
          firefly: `Extreme macro of water pouring onto a black river stone, candlelight rim, dark background, photorealistic with warm halation.`,
          negative: "no logo, no text, no obvious CGI",
          aspectRatio: "9:16",
          styleNote: "B-roll detail. Goed voor 4s slow-mo loop in IG-feed.",
        },
        {
          id: "img-03",
          context: "Portret — klant in profiel met halve glimlach",
          midjourney: `Tight 85mm cinematic close-up profile portrait of a woman in her late 30s, eyes closed, barely-there half-smile, soft window light from the left rim-lighting her cheekbone, completely defocused warm amber background, T1.4 shallow depth of field, fine 35mm grain, mood reminiscent of Sofia Coppola's Lost In Translation, --ar 9:16 --style raw --v 6`,
          firefly: `Tight 85mm cinematic profile portrait, eyes closed, soft natural smile, warm window light, T1.4 defocused background, premium editorial photorealistic.`,
          negative: "no harsh studio light, no obvious retouching, no digital makeup",
          aspectRatio: "9:16",
          styleNote: "Editorial / website 'About'-sectie hero alt.",
        },
        {
          id: "img-04",
          context: "Stilleven — ambachtelijk werkblad in tungsten",
          midjourney: `Quiet still life of a dark walnut work surface in a luxury salon: three small precision brass tools laid out in deliberate order, a linen cloth, a single stem of dried botanical, single tungsten lamp catching the brass, fine 35mm grain, premium quiet luxury aesthetic, --ar 9:16 --style raw --v 6`,
          firefly: `Quiet still life of brass precision tools on dark walnut, linen cloth, dried botanical, warm tungsten light, premium quiet luxury photorealistic.`,
          negative: "no clutter, no plastic, no synthetic textures",
          aspectRatio: "9:16",
          styleNote: "Sociale feed posts, Pinterest, neutraal.",
        },
        {
          id: "img-05",
          context: "Vakvrouw aan het werk — handen in side-light",
          midjourney: `Cinematic 50mm medium-close of skilled woman's hands working precisely on a client in a warm luxury salon interior, soft tungsten side-light from the left, deep amber ambience, fine grain, mood reminiscent of premium documentary editorial, --ar 9:16 --style raw --v 6`,
          firefly: `Medium-close skilled hands at work in warm boutique salon, soft tungsten side-light, premium documentary photorealistic.`,
          negative: "no stock photo look, no plastic gloves unless contextually correct",
          aspectRatio: "9:16",
          styleNote: "About-pagina hero / Meta ad-still.",
        },
        {
          id: "img-06",
          context: "Eindcard — wordmark plate",
          midjourney: `Minimal end-card visual: deep matte black background with a single subtle vertical light beam, soft smoke haze, premium editorial space for a centred Garamond italic wordmark, fine grain, mood reminiscent of luxury maison closing card, --ar 9:16 --style raw --v 6`,
          firefly: `Minimal end card backdrop, deep matte black, vertical light beam, faint haze, premium space for centered serif wordmark.`,
          negative: "no busy texture, no specific letterforms",
          aspectRatio: "9:16",
          styleNote: "Plate voor logo-overlay in After Effects.",
        },
      ],
    },
    videoPack: {
      style:
        "Cinematic 9:16 24fps, anamorphic mood, naturalistic motion, slow camera movement, no synthetic AI smoothness. Kodak 2383 grading.",
      prompts: [
        {
          id: "vid-01",
          context: "Hero — twilight exterior dolly-out (s04-a)",
          runway: `9:16 cinematic 35mm anamorphic wide exterior, slow dolly-out over 6 seconds, away from a luxury salon glowing warmly at twilight in Amsterdam, single silhouetted woman in tailored coat steps out and walks calmly into cool blue dusk, golden interior light spills onto wet cobblestones, anamorphic flares from a street lamp. 24fps, naturalistic.`,
          kling: `Wide cinematic 35mm exterior, 6 second slow camera dolly backward from a small luxury salon at twilight, golden interior light, cool dusk outside, lone silhouetted woman steps out and walks away, anamorphic lens flares, fine grain. 24fps, 9:16.`,
          veo: `Cinematic 35mm anamorphic wide static-then-dolly-out exterior of a luxury salon at twilight, warm interior light, cool dusk, silhouetted woman steps out and walks into the night, anamorphic flares, fine grain, 6 seconds, 9:16, naturalistic.`,
          durationSec: 6,
          cameraMove: "Slow dolly-out",
          aspectRatio: "9:16",
        },
        {
          id: "vid-02",
          context: "Macro — water op steen (s03-a)",
          runway: `9:16 static extreme macro shot, 100mm macro lens, hand pours crystal-clear water onto a smooth black river stone, water breaks softly and cascades, single candle rim-light from the right, completely dark background, 96fps slow-motion interpreted at 24fps, Kodak 2383 warm amber halation, fine grain. 3 seconds.`,
          kling: `Extreme macro 100mm of hand pouring water onto a black river stone, slow-motion cascade, candle rim-light, dark background, 3s 9:16, Kodak emulation.`,
          veo: `Macro static 9:16 shot of a hand pouring water onto a smooth black river stone, droplets cascading, single candle backlight, dark moody background, 3 seconds, slow-motion feel, designed to loop.`,
          durationSec: 3,
          cameraMove: "Static",
          aspectRatio: "9:16",
        },
        {
          id: "vid-03",
          context: "Drempel — deur opent (s02-a)",
          runway: `9:16 cinematic 35mm static medium-wide of a boutique salon door, hand enters frame and pushes the brass handle, door swings open with a soft chime, dramatic warm/cool contrast on threshold, anamorphic flare on brass. Camera does not move. 24fps, 2.5 seconds, naturalistic.`,
          kling: `Static 35mm medium-wide salon door opening from outside, cool dusk vs warm interior on threshold, anamorphic flare on brass, 2.5s 9:16, naturalistic.`,
          veo: `35mm medium-wide static 9:16 shot of a luxury salon door opening from outside, cool/warm light contrast on threshold, brass handle catches anamorphic flare, 2.5 seconds, premium and quiet.`,
          durationSec: 2.5,
          cameraMove: "Static",
          aspectRatio: "9:16",
        },
        {
          id: "vid-04",
          context: "POV approach — hook variant voor Reel/TikTok",
          runway: `Vertical 9:16 cinematic POV walking shot in Amsterdam-Zuid at dusk, organic handheld motion, approaching the discreet entrance of a luxury salon, warm interior light visible through tall windows, 24fps, 4 seconds, anamorphic flares, fine grain.`,
          kling: `9:16 POV walking towards a luxury salon at dusk in Amsterdam, organic handheld motion, warm window light, 4s, anamorphic flares.`,
          veo: `Vertical 9:16 POV walking up to a luxury salon entrance at dusk, warm interior light, 4 seconds, naturalistic, fine grain.`,
          durationSec: 4,
          cameraMove: "Handheld POV",
          aspectRatio: "9:16",
        },
        {
          id: "vid-05",
          context: "Portret — close-up dolly-in (s02-b)",
          runway: `9:16 cinematic 85mm tight close-up profile portrait, slow dolly-in over 2.5 seconds, woman exhales deeply, shoulders soften, eyes briefly close, soft window light from the right, completely defocused warm amber background, T1.4 shallow focus. Naturalistic micro-movement only. 24fps.`,
          kling: `85mm close-up profile portrait, slow dolly-in, deep exhale, shoulders soften, soft window light, warm defocused background, 2.5s 9:16, T1.4.`,
          veo: `Tight 85mm close-up profile portrait, slow dolly-in, woman exhales deeply, shoulders soften, soft right-side window light, warm tones, 2.5 seconds, 9:16, naturalistic.`,
          durationSec: 2.5,
          cameraMove: "Slow dolly-in",
          aspectRatio: "9:16",
        },
      ],
    },
    bRollPack: {
      style:
        "Detail B-roll voor montage. Korte clips (2-4s), naturalistisch licht, neutrale kleur. Bedoeld als naadloze inserts tussen master shots.",
      items: [
        {
          id: "broll-01",
          topic: "Messing sleutel in slot",
          framing: "extreme close-up",
          durationSec: 3,
          prompt: `Extreme close-up of a hand turning a brass key in an oak salon door at dawn, soft cool daylight, fine grain, 100mm macro, 3 seconds, 9:16, premium quiet luxury.`,
          useCase: "Insert voor 'opening' beat in elke cut.",
        },
        {
          id: "broll-02",
          topic: "Stoom uit kop op werkblad",
          framing: "close-up",
          durationSec: 2,
          prompt: `Close-up of a fine ceramic cup with rising steam on a dark walnut surface, single back-light catching the steam, dark background, 2 seconds, 9:16, naturalistic.`,
          useCase: "ASMR-laag, ritueel-segment.",
        },
        {
          id: "broll-03",
          topic: "Linnen gordijn in zacht daglicht",
          framing: "medium",
          durationSec: 3,
          prompt: `Medium static shot of a linen curtain gently moving in soft cool daylight by a tall salon window, fine grain, naturalistic, 3 seconds, 9:16.`,
          useCase: "Ademruimte tussen scenes — match-cut trigger.",
        },
        {
          id: "broll-04",
          topic: "Hand legt brass tool op werkblad",
          framing: "close-up",
          durationSec: 2,
          prompt: `Close-up of a hand placing a small brass precision tool on a dark walnut surface in warm tungsten light, soft side-light from left, 50mm, 2 seconds, 9:16, deliberate motion.`,
          useCase: "Match-cut trigger naar volgende scene.",
        },
        {
          id: "broll-05",
          topic: "Voetstappen op natte cobblestones",
          framing: "low-angle",
          durationSec: 2,
          prompt: `Low-angle close-up of a woman's heels stepping onto wet cobblestones at dusk, single street lamp catches the wet stone, 2 seconds, 9:16, cinematic.`,
          useCase: "Sensorisch tussen exterior shots.",
        },
        {
          id: "broll-06",
          topic: "Schemerlicht op gevelletters",
          framing: "medium-close",
          durationSec: 3,
          prompt: `Medium-close shot of subtle Garamond italic signage on a salon facade catching the last twilight light, anamorphic flare, 3 seconds, 9:16, premium editorial.`,
          useCase: "Voorlaatste shot voor eindcard.",
        },
      ],
    },
  };
}
