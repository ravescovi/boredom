import { randomBytes } from "node:crypto";

// Crockford-style alphabet minus I, L, O, U for collision-resistant random ids.
// Curated classic ids may use a broader alphabet, so isShortId() is more permissive.
const GENERATOR_ALPHABET = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";
const SHORT_ID_LENGTH = 6;
const SHORT_ID_PATTERN = /^[A-Z0-9]{6}$/;

export function generateShortId(): string {
  const bytes = randomBytes(SHORT_ID_LENGTH);
  let out = "";
  for (let i = 0; i < SHORT_ID_LENGTH; i++) {
    out += GENERATOR_ALPHABET[bytes[i] % GENERATOR_ALPHABET.length];
  }
  return out;
}

export function isShortId(value: string): boolean {
  return SHORT_ID_PATTERN.test(value);
}
