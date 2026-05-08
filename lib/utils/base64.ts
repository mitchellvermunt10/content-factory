// Unicode-safe base64 helpers. Plain btoa/atob werken alleen voor Latin-1
// (0-255). Onze prefill payloads bevatten €, à, é, emoji's en allerlei
// non-ASCII via gescraped menu's — daar struikelt btoa over.

/**
 * Encode een string naar base64. UTF-8 input is veilig.
 */
export function safeBase64Encode(str: string): string {
  const utf8 = new TextEncoder().encode(str);
  let binary = "";
  for (let i = 0; i < utf8.length; i++) {
    binary += String.fromCharCode(utf8[i]);
  }
  return btoa(binary);
}

/**
 * Decode een base64-string terug naar UTF-8.
 */
export function safeBase64Decode(b64: string): string {
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new TextDecoder().decode(bytes);
}
