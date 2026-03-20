/**
 * Validates an image URL, blocking private/reserved IP ranges to prevent SSRF.
 * Returns an error string if invalid, or null if valid.
 */
export function validateImageUrl(imageUrl: string): string | null {
  try {
    const parsed = new URL(imageUrl);
    if (!["http:", "https:"].includes(parsed.protocol)) {
      return "Invalid image URL protocol";
    }

    // Block private/reserved IP ranges
    const hostname = parsed.hostname;
    if (isPrivateHostname(hostname)) {
      return "Invalid image URL: private addresses are not allowed";
    }

    return null;
  } catch {
    return "Invalid image URL";
  }
}

function isPrivateHostname(hostname: string): boolean {
  // Block localhost
  if (hostname === "localhost" || hostname === "127.0.0.1" || hostname === "::1") {
    return true;
  }

  // Block private IP ranges
  const parts = hostname.split(".");
  if (parts.length === 4 && parts.every((p) => /^\d+$/.test(p))) {
    const octets = parts.map(Number);
    // 10.0.0.0/8
    if (octets[0] === 10) return true;
    // 172.16.0.0/12
    if (octets[0] === 172 && octets[1] >= 16 && octets[1] <= 31) return true;
    // 192.168.0.0/16
    if (octets[0] === 192 && octets[1] === 168) return true;
    // 169.254.0.0/16 (link-local)
    if (octets[0] === 169 && octets[1] === 254) return true;
    // 0.0.0.0
    if (octets.every((o) => o === 0)) return true;
  }

  return false;
}

/**
 * Maps a validated MIME type to a safe file extension.
 */
const MIME_TO_EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/gif": "gif",
  "image/webp": "webp",
};

export function getExtensionFromMime(mimeType: string): string {
  return MIME_TO_EXT[mimeType] || "jpg";
}
