export function keyOf<T extends Record<string, unknown>>(
  obj: T,
  value: T[keyof T],
): keyof T | undefined {
  return (Object.keys(obj) as Array<keyof T>).find((k) => obj[k] === value);
}
