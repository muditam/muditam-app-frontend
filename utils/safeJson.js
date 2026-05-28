export function parseJsonSafely(value, fallback = null) {
  if (typeof value !== 'string' || !value.trim()) return fallback;

  try {
    return JSON.parse(value);
  } catch (_error) {
    return fallback;
  }
}
