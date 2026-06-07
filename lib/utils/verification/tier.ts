/**
 * `admin_verification_tier.document_requirements` is stored as `json` on
 * the server. The admin may have entered it as:
 *   1. A JSON array of strings, e.g. `["Government ID", "Utility bill"]`
 *   2. A JSON array of objects with `{name, ...}`
 *   3. A JSON-encoded string of either of the above
 *   4. A single string the admin typed into the textbox
 *
 * This helper normalises every shape to `string[]` so the mobile UI can
 * render a simple checklist without having to know about the server's
 * storage quirks.
 */
export function parseDocumentRequirements(input: unknown): string[] {
  if (input == null) return [];
  if (typeof input === 'string') {
    const trimmed = input.trim();
    if (trimmed.length === 0) return [];
    if (trimmed.startsWith('[') || trimmed.startsWith('{')) {
      try {
        return parseDocumentRequirements(JSON.parse(trimmed));
      } catch {
        return [trimmed];
      }
    }
    return [trimmed];
  }
  if (Array.isArray(input)) {
    return input
      .map((entry) => {
        if (typeof entry === 'string') return entry;
        if (entry && typeof entry === 'object' && 'name' in entry && typeof (entry as { name: unknown }).name === 'string') {
          return (entry as { name: string }).name;
        }
        return null;
      })
      .filter((value): value is string => typeof value === 'string' && value.trim().length > 0);
  }
  if (typeof input === 'object') {
    const obj = input as Record<string, unknown>;
    if (typeof obj.name === 'string') return [obj.name];
  }
  return [];
}
