/**
 * Image type by magic bytes (R.7 I9-04) – the third-party `Content-Type` is never trusted.
 * Only JPEG, PNG, WebP, GIF and AVIF; SVG (and everything else) → null.
 */
export type StayImageType = "image/jpeg" | "image/png" | "image/webp" | "image/gif" | "image/avif";

export function sniffImageType(body: Uint8Array): StayImageType | null {
  const at = (offset: number, bytes: number[]) =>
    bytes.every((byte, i) => body[offset + i] === byte);
  const ascii = (offset: number, text: string) =>
    at(
      offset,
      Array.from({ length: text.length }, (_, i) => text.charCodeAt(i)),
    );
  if (body.length < 12) return null;
  if (at(0, [0xff, 0xd8, 0xff])) return "image/jpeg";
  if (at(0, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) return "image/png";
  if (ascii(0, "GIF87a") || ascii(0, "GIF89a")) return "image/gif";
  if (ascii(0, "RIFF") && ascii(8, "WEBP")) return "image/webp";
  if (ascii(4, "ftyp") && (ascii(8, "avif") || ascii(8, "avis"))) return "image/avif";
  return null;
}
