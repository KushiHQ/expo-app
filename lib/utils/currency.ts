import { ToWords } from "to-words";

export function formatNaira(amount: number) {
	const toWords = new ToWords({ localeCode: "en-NG" });

	const formated = new Intl.NumberFormat("en-NG", {
		style: "currency",
		currency: "NGN",
	}).format(amount);
	const amountInWords = toWords.convert(amount, { currency: true });

	return { formated, amountInWords };
}
