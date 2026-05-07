/**
 * Mapping van interne voice-id's (uit lib/constants.ts) naar echte ElevenLabs
 * voice-id's. Wordt enkel server-side gebruikt door /api/voice-over.
 *
 * IDs zijn publieke library-stemmen van ElevenLabs (stabiel sinds jaren).
 * Wil je een eigen custom voice gebruiken? Vervang dan de waarde door
 * jouw eigen voice-id (te vinden in app.elevenlabs.io → Voice Library).
 */
export const ELEVENLABS_VOICE_ID_MAP: Record<string, string> = {
  charlotte: "XB0fDUnXU5powFXDhCwa",
  antoni: "ErXwobaYiN019PkySvjV",
  bella: "EXAVITQu4vr4xnSDxMaL",
  // "Sjoerd" en "Anouk" zijn lokale labels — gebruik krachtige library-stemmen
  // die goed Nederlands kunnen lezen via eleven_multilingual_v2.
  sjoerd: "pNInz6obpgDQGcFmaJgB",
  anouk: "ThT5KcBeYPX3keUQqHPh",
};

export const ELEVENLABS_DEFAULT_VOICE_ID = "EXAVITQu4vr4xnSDxMaL";

export function resolveVoiceId(localId: string): string {
  return ELEVENLABS_VOICE_ID_MAP[localId] ?? ELEVENLABS_DEFAULT_VOICE_ID;
}
