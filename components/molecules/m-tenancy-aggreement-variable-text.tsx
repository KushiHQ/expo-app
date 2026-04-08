import { useThemeColors } from "@/lib/hooks/use-theme-color";
import {
	SubClauseValueInput,
	HostingQuery,
	BookingApplicationQuery,
} from "@/lib/services/graphql/generated";
import { formatNaira } from "@/lib/utils/currency";
import { capitalize, splitVariables } from "@/lib/utils/text";
import React from "react";
import ThemedText from "../atoms/a-themed-text";
import { hostingDuration } from "@/lib/utils/hosting/tenancyAgreement";

interface Props {
	text: string;
	replace?: boolean;
	providedValues?: SubClauseValueInput[];
	hosting?: HostingQuery["hosting"];
	application?: BookingApplicationQuery["bookingApplication"];
}

const TenancyAgreementVariableText: React.FC<Props> = React.memo(
	({ text, providedValues, replace = true, hosting, application }) => {
		const colors = useThemeColors();

		const hostingAddress = React.useMemo(() => {
			if (!hosting) return "";
			return [
				hosting.landmarks ?? "",
				hosting.city ?? "",
				hosting.state ?? "",
				hosting.country ?? "",
			]
				.filter((v) => v.length > 0)
				.join(" ");
		}, [hosting]);

		const replacedText = React.useMemo(() => {
			if (!replace) return text;

			const formated = formatNaira(hosting?.price ?? 0);

			let newText = text
				.replaceAll(
					"{{PROPERTY_DESCRIPTION}}",
					`{{<<${capitalize(hosting?.title ?? "", true)}>>}}`,
				)
				.replaceAll(
					"{{PROPERTY_ADDRESS}}",
					`{{<<${capitalize(hostingAddress, true)}>>}}`,
				)
				.replaceAll("{{PRICE}}", `{{<<${formated.formated}>>}}`)
				.replaceAll("{{PRICE_IN_WORDS}}", `{{<<${formated.amountInWords}>>}}`);

			if (hosting?.cautionFee) {
				newText = newText.replace(
					"{{CAUTION_FEE}}",
					`{{<<${formatNaira(hosting.cautionFee).formated}>>}}`,
				);
			}
			if (hosting?.serviceCharge) {
				newText = newText.replace(
					"{{SERVICE_CHARGE}}",
					`{{<<${formatNaira(hosting.serviceCharge).formated}>>}}`,
				);
			}

			if (hosting?.verification) {
				newText = newText.replaceAll(
					"{{LANDLORD_FULL_NAME}}",
					`{{<<${capitalize(hosting.verification.landlordFullName, true)}>>}}`,
				);
				newText = newText.replaceAll(
					"{{LANDLORD_ADDRESS}}",
					`{{<<${capitalize(hosting.verification.landlordFullName, true)}>>}}`,
				); // Note: you might want to change this to landlordAddress!
			}

			if (application) {
				newText = newText.replaceAll(
					"{{TENANT_FULL_NAME}}",
					`{{<<${capitalize(application.fullName ?? "")}>>}}`,
				);
				newText = newText.replaceAll(
					"{{TENANT_ADDRESS}}",
					`{{<<${capitalize(application.correspondenceAddress ?? "")}>>}}`,
				);

				const duration = hostingDuration(
					hosting?.paymentInterval,
					application.intervalMultiplier ?? 1,
					application.checkInDate
						? new Date(application.checkInDate)
						: undefined,
				);

				newText = newText.replaceAll(
					"{{DURATION_LENGTH}}",
					`{{<<${duration.metric}>>}}`,
				);
				newText = newText.replaceAll(
					"{{START_DATE}}",
					`{{<<${duration.startDateFormatted}>>}}`,
				);
				newText = newText.replaceAll(
					"{{END_DATE}}",
					`{{<<${duration.endDateFormatted}>>}}`,
				);
				newText = newText.replaceAll(
					"{{TENANT_EMAIL}}",
					`{{<<${application.email ?? ""}>>}}`,
				);
			}

			if (providedValues && providedValues.length > 0) {
				providedValues.forEach((val) => {
					if (val.value && val.value.trim() !== "") {
						const cleanValue = val.value.replaceAll(",", "");
						const isNumeric = !Number.isNaN(Number(cleanValue));

						newText = newText.replaceAll(
							`{{${val.key}}}`,
							`{{<<${isNumeric ? Number(cleanValue).toLocaleString("en-US") : val.value}>>}}`,
						);
					}
				});
			}

			return newText;
		}, [text, replace, hosting, hostingAddress, providedValues, application]);

		return (
			<ThemedText>
				{splitVariables(replacedText).map((part, index) => {
					if (part.startsWith("{{") && part.endsWith("}}")) {
						const rawVariable = part.slice(2, -2);
						const cleanVariable = rawVariable.replace(/_/g, " ");
						const isValue = cleanVariable.startsWith("<<");
						return (
							<ThemedText
								key={index}
								type="semibold"
								style={{ color: colors.accent }}
							>
								{isValue
									? cleanVariable.replaceAll("<<", "").replaceAll(">>", "")
									: `[${cleanVariable}]`}
							</ThemedText>
						);
					}
					return part;
				})}
			</ThemedText>
		);
	},
);
TenancyAgreementVariableText.displayName = "VariableText";

export default TenancyAgreementVariableText;
