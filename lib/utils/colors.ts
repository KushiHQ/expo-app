/**
 * Converts a 6-digit hex color to an RGBA string with the given opacity.
 * @param hex 6-digit hex color string (e.g., '#E6F4FE')
 * @param alpha Opacity value between 0 (fully transparent) and 1 (fully opaque)
 * @returns An rgba() string (e.g., 'rgba(230, 244, 254, 0.5)')
 */
export const hexToRgba = (hex: string, alpha: number): string => {
  let cleanHex = hex.replace("#", "").toUpperCase();

  if (cleanHex.length === 3) {
    cleanHex = cleanHex
      .split("")
      .map((char) => char + char)
      .join("");
  }

  if (cleanHex.length !== 6) {
    console.error(`Invalid hex color format: ${hex}`);
    return `rgba(0, 0, 0, ${alpha})`; // Return black with specified alpha as fallback
  }

  try {
    const r = parseInt(cleanHex.substring(0, 2), 16);
    const g = parseInt(cleanHex.substring(2, 4), 16);
    const b = parseInt(cleanHex.substring(4, 6), 16);

    if (isNaN(r) || isNaN(g) || isNaN(b)) {
      throw new Error("Parsing resulted in NaN");
    }

    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  } catch (e) {
    console.error(`Error parsing hex: ${hex}. Fallback used.`, e);
    return `rgba(0, 0, 0, ${alpha})`;
  }
};
