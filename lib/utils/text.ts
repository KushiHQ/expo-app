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

export function toTitleCase(str: string): string {
  return str.toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase());
}

export const slugify = (text: string) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-") // Replace spaces with -
    .replace(/[^\w-]+/g, "") // Remove all non-word chars
    .replace(/--+/g, "-"); // Replace multiple - with single -
};
