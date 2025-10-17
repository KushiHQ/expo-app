/**
 * Formats seconds to MM:SS format
 * @param seconds - Number of seconds to format
 * @returns Formatted string in MM:SS format (e.g., "01:20")
 */
export const formatSeconds = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  const formattedMinutes = minutes.toString().padStart(2, "0");
  const formattedSeconds = remainingSeconds.toString().padStart(2, "0");

  return `${formattedMinutes}:${formattedSeconds}`;
};

/**
 * Formats an ISO date-time string to "Month Day, Year".
 * @param {string} datetimeString The date-time string to format.
 * @returns {string} The formatted date string.
 */
export function formatDate(datetimeString: string): string {
  const date = new Date(datetimeString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/**
 * Formats a date string to "Month Year" format.
 * @param {string} dateString The date string to format (e.g., "2025-01-15T12:00:00Z").
 * @returns {string} The formatted date string (e.g., "January 2025").
 */
export function formatDateToMonthYear(dateString: string): string {
  const date = new Date(dateString);

  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
  });
}

export function formatToShortTime(datetimeString: string) {
  const date = new Date(datetimeString);

  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}
