/**
 * Capitalizes the first letter of a string.
 * @param str The string to capitalize.
 * @returns The capitalized string.
 */
export const capitalize = (str: string, words: boolean = false): string => {
  if (!str) {
    return "";
  }
  if (words) {
    return str.replace(/\b\w/g, (char) => char.toUpperCase());
  }
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

export function splitVariables(text: string) {
  return text.split(/(\{\{.*?\}\})/g);
}
