/**
 * Create a hash of a URL for cache lookup
 */
export function hashUrl(url: string): string {
  // Normalize URL by removing trailing slashes and converting to lowercase
  const normalized = url.toLowerCase().replace(/\/+$/, '');

  // Simple hash function (FNV-1a)
  let hash = 2166136261;
  for (let i = 0; i < normalized.length; i++) {
    hash ^= normalized.charCodeAt(i);
    hash = (hash * 16777619) >>> 0;
  }

  return hash.toString(16);
}

/**
 * Generate a unique ID
 */
export function generateId(): string {
  return crypto.randomUUID();
}
