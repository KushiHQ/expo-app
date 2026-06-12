export function enumKeyByValue(enumObject: Record<any, any>, value: string): string | undefined {
  return Object.keys(enumObject).find((v) => enumObject[v] == value);
}
