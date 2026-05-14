import {
	PaymentInterval,
	SubClause,
	TenancyTemplate,
	TenancyTemplateInput,
} from "@/lib/services/graphql/generated";
import { cast } from "@/lib/types/utils";

export function cleanupAgreementTemplateInput(
	agreement: TenancyTemplate | TenancyTemplateInput,
): TenancyTemplateInput {
	const toUpdate = { sections: [...agreement.sections] };
	const secs = toUpdate.sections.map((sec) => {
		let updated = { ...sec };
		if (cast<TenancyTemplate["sections"][number]>(sec)["__typename"]) {
			const { __typename, ...rest } =
				cast<TenancyTemplate["sections"][number]>(sec);
			updated = rest;
		}
		const refinedSubClauses = updated.subClauses.map((clause) => {
			if (cast<SubClause>(clause)["__typename"]) {
				const { __typename, ...rest } = cast<SubClause>(clause);
				const { requiredVariables, providedValues, ...restVals } = rest;

				return {
					...restVals,
					requiredVariables: requiredVariables.map(({ __typename, ...v }) => v),
					providedValues: providedValues.map(({ __typename, ...v }) => v),
				};
			} else {
				return clause;
			}
		});

		updated["subClauses"] = refinedSubClauses;
		return updated;
	});

	return { sections: secs, totalSections: 'totalSections' in agreement ? agreement.totalSections : secs.length };
}

interface DurationResult {
	metric: string;
	startDateFormatted: string;
	endDateFormatted: string;
	endDate: Date;
}

export function hostingDuration(
	paymentInterval?: PaymentInterval | null,
	multiplier?: number | null,
	startDate: Date = new Date(),
): DurationResult {
	const safeMultiplier = Math.max(1, multiplier ?? 1);
	let label = "Years";

	switch (paymentInterval) {
		case PaymentInterval.Nightly:
			label = "Nights";
			break;
		case PaymentInterval.Weekly:
			label = "Weeks";
			break;
		case PaymentInterval.Monthly:
			label = "Months";
			break;
		case PaymentInterval.Anually:
			label = "Years";
			break;
		default:
			label = "Years";
	}

	const metric =
		safeMultiplier === 1
			? `${safeMultiplier} ${label.slice(0, -1).toUpperCase()}`
			: `${safeMultiplier} ${label.toUpperCase()}`;

	const endDate = new Date(startDate.getTime());

	if (paymentInterval === PaymentInterval.Nightly) {
		endDate.setDate(endDate.getDate() + safeMultiplier);
	} else if (paymentInterval === PaymentInterval.Weekly) {
		endDate.setDate(endDate.getDate() + safeMultiplier * 7);
	} else if (paymentInterval === PaymentInterval.Monthly) {
		endDate.setMonth(endDate.getMonth() + safeMultiplier);
		endDate.setDate(endDate.getDate() - 1);
	} else {
		endDate.setFullYear(endDate.getFullYear() + safeMultiplier);
		endDate.setDate(endDate.getDate() - 1);
	}

	const formatter = new Intl.DateTimeFormat("en-US", {
		month: "long",
		day: "numeric",
		year: "numeric",
	});

	return {
		metric,
		startDateFormatted: formatter.format(startDate),
		endDateFormatted: formatter.format(endDate),
		endDate,
	};
}
