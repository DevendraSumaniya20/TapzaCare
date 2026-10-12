type Json = Record<string, unknown>;

export const isText = (value: unknown): value is string =>
  typeof value === 'string' && value.length > 0;

/**
 * Section items arrive as unknown[]. Each section supplies a parser for its own item shape;
 * items the parser rejects are dropped so one bad entry cannot break the section.
 */
export function parseItems<T>(
  items: unknown[],
  parse: (item: Json) => T | null,
): T[] {
  return items.flatMap(item => {
    if (typeof item !== 'object' || item === null) return [];
    const parsed = parse(item as Json);
    return parsed ? [parsed] : [];
  });
}
