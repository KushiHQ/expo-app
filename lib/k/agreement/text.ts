import { ToWords } from 'to-words';

export function formatNaira(amount: number) {
	const toWords = new ToWords({ localeCode: 'en-NG' });

	const formated = new Intl.NumberFormat('en-NG', {
		style: 'currency',
		currency: 'NGN'
	}).format(amount);
	const amountInWords = toWords.convert(amount, { currency: true });

	return { formated, amountInWords };
}

/**
 * Capitalizes the first letter of a string.
 * @param str The string to capitalize.
 * @returns The capitalized string.
 */
export const capitalize = (str: string, words: boolean = false): string => {
	if (!str) {
		return '';
	}
	if (words) {
		return str.toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase());
	}
	return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

export function toTitleCase(str: string): string {
	return str.toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase());
}

/**
 * Turns a PascalCase / camelCase identifier into spaced words
 * ("LivingRoom" → "Living Room", "ITInfrastructure" → "IT Infrastructure").
 * Already-spaced values are left as-is.
 */
export function humanize(str: string): string {
	if (!str) return '';
	return str
		.replace(/([a-z0-9])([A-Z])/g, '$1 $2') // camel/Pascal boundary
		.replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2') // acronym → word boundary
		.trim();
}
