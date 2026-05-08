import type { BusinessTypeValue } from "@/lib/constants";

export interface VerticalPack {
  id: BusinessTypeValue;
  label: string;
  customerLanguage: string[];
  treatments: string[]; // bij dienst-merken: behandelingen, gerechten, dienstcategorieën
  brandReferences: string[];
  avoidPhrases: string[];
  preferredPhrases: string[];
  regulatory: string[];
  photoDirection: string[];
  bookingCulture: string[];
  painPoints: string[];
  currentTrends: string[];
  toneModifiers: string[];
}
