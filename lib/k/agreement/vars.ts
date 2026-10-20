/**
 * Fills a tenancy-agreement template's {{VARIABLES}} from the listing and the
 * guest's application. Ported from the original TenancyAgreementVariableText.
 */
import { capitalize, formatNaira } from './text';
import {
	courtJurisdictionPhrase,
	employmentStatusLabel,
	guarantorRelationshipLabel,
	hostingDuration,
	intervalVars,
	landlordTypeLabel,
	mediationInstitutionLabel,
	verificationTierLabel
} from './reservation';
import type {
	HostingQuery,
	InitiateBookingApplicationMutation,
	SubClauseValueInput
} from '@/lib/services/graphql/generated';

export type AgreementHosting = HostingQuery['hosting'];
export type AgreementApplication =
	| Partial<NonNullable<InitiateBookingApplicationMutation['initiateBookingApplication']['data']>>
	| null
	| undefined;

export function agreementVars(
	hosting: AgreementHosting | null | undefined,
	application: AgreementApplication,
	providedValues?: SubClauseValueInput[] | null
): Record<string, string> {
	const hostingAddress = hosting
		? [hosting.landmarks, hosting.city, hosting.state, hosting.country]
				.filter((v) => v && v.length > 0)
				.join(' ')
		: '';
	const variablesMap: Record<string, string> = {};

	if (hosting) {
		const price = Number(hosting.price ?? 0);
		const { formated: periodicFormated, amountInWords: periodicInWords } = formatNaira(price);
		const iv = intervalVars(hosting.paymentInterval);
		const annualPrice = price * iv.annualMultiplier;
		const { formated: annualFormated, amountInWords: annualInWords } = formatNaira(annualPrice);

		// Property
		variablesMap['PROPERTY_DESCRIPTION'] = capitalize(hosting.title ?? '', true);
		variablesMap['PROPERTY_ADDRESS'] = capitalize(hostingAddress, true);
		variablesMap['PROPERTY_TYPE'] = hosting.propertyType ?? 'Property';
		variablesMap['STATE'] = hosting.state ?? '';
		variablesMap['GOVERNING_LAW_STATE'] = hosting.state ?? '';
		variablesMap['COURT_STATE'] = hosting.state ?? '';
		variablesMap['LOCAL_GOVERNMENT_AREA'] = hosting.city ?? '';
		variablesMap['ARBITRATION_SEAT'] = hosting.city ?? '';
		variablesMap['MEDIATION_INSTITUTION'] = mediationInstitutionLabel(hosting.state);
		variablesMap['COURT_JURISDICTION_PHRASE'] = courtJurisdictionPhrase(hosting.state);

		// Room counts
		const roomCount = (name: string) => {
			const room = hosting.rooms?.find((r) => r.name?.toLowerCase() === name.toLowerCase());
			return room?.count != null ? String(room.count) : '—';
		};
		variablesMap['NUMBER_OF_BEDROOMS'] = roomCount('Bedroom');
		variablesMap['NUMBER_OF_BATHROOMS'] = roomCount('Bathroom');
		variablesMap['NUMBER_OF_LIVING_ROOMS'] = roomCount('Living Room');
		variablesMap['MAXIMUM_OCCUPANTS'] =
			hosting.maxOccupants != null ? String(hosting.maxOccupants) : '—';

		// Rent / financials
		variablesMap['PRICE'] = periodicFormated;
		variablesMap['PRICE_IN_WORDS'] = periodicInWords;
		variablesMap['PERIODIC_RENT_AMOUNT'] = periodicFormated;
		variablesMap['PERIODIC_RENT_IN_WORDS'] = periodicInWords;
		variablesMap['ANNUAL_RENT'] = annualFormated;
		variablesMap['ANNUAL_RENT_AMOUNT'] = annualFormated;
		variablesMap['ANNUAL_RENT_IN_WORDS'] = annualInWords;

		if (hosting.cautionFee) {
			const c = formatNaira(Number(hosting.cautionFee)).formated;
			variablesMap['CAUTION_FEE'] = c;
			variablesMap['CAUTION_FEE_AMOUNT'] = c;
		}
		if (hosting.serviceCharge) {
			const s = formatNaira(Number(hosting.serviceCharge)).formated;
			variablesMap['SERVICE_CHARGE'] = s;
			variablesMap['SERVICE_CHARGE_AMOUNT'] = s;
		}

		// Payment interval
		variablesMap['PAYMENT_INTERVAL_LABEL'] = iv.intervalLabel;
		variablesMap['PAYMENT_FREQUENCY_LABEL'] = iv.frequencyLabel;
		variablesMap['RENT_DUE_DATE_CLAUSE'] = iv.dueDateClause;
		variablesMap['MINIMUM_OCCUPATION_PERIOD'] = iv.minOccupationPeriod;
		variablesMap['BREAK_NOTICE_PERIOD'] = iv.breakNoticePeriod;

		// Bank
		if (hosting.paymentDetails) {
			variablesMap['BANK_ACCOUNT_NAME'] = hosting.paymentDetails.accountName ?? 'N/A';
			variablesMap['BANK_NAME'] =
				hosting.paymentDetails.bankDetails?.name ?? hosting.paymentDetails.bankCode ?? 'N/A';
			variablesMap['BANK_ACCOUNT_NUMBER'] = hosting.paymentDetails.accountNumber ?? 'N/A';
		}

		// Landlord / verification
		if (hosting.verification) {
			const v = hosting.verification;
			const landlordName = capitalize(v.landlordFullName ?? '', true);
			variablesMap['LANDLORD_FULL_NAME'] = landlordName;
			variablesMap['LANDLORD_NAME'] = landlordName;
			variablesMap['LANDLORD_ADDRESS'] = capitalize(v.landlordAddress ?? '', true);
			variablesMap['LANDLORD_TYPE'] = landlordTypeLabel(v.propertyRelationship, v.verificationTier);
			variablesMap['VERIFICATION_TIER'] = verificationTierLabel(v.verificationTier);
			variablesMap['TITLE_TYPE'] = v.titleType ?? 'Certificate of Occupancy';
			variablesMap['TITLE_NUMBER'] = v.titleNumber ?? '—';
		}

		// Host identity
		if (hosting.host?.user) {
			const hu = hosting.host.user;
			if (hu.email) variablesMap['LANDLORD_EMAIL'] = hu.email;
			if (hu.phoneNumber) variablesMap['LANDLORD_PHONE'] = hu.phoneNumber;
			if (hu.kushiId) {
				variablesMap['LANDLORD_KUSHI_ID'] = hu.kushiId;
				variablesMap['LANDLORD_ID_NUMBER'] = hu.kushiId;
			}
			// No BVN or NIN on the agreement (matches the server's compiler):
			// the ID is the Kushi ID and the KYC line only says whether Kushi
			// verified the person.
			variablesMap['LANDLORD_ID_TYPE'] = 'Kushi ID';
			variablesMap['KYC_REFERENCE_ID'] =
				hu.kyc?.bvnVerified || hu.kyc?.ninVerified ? 'Identity verified by Kushi' : 'Identity verification pending';
		}
	}

	if (application) {
		const tenantName = capitalize(application.fullName ?? '', true);
		variablesMap['TENANT_FULL_NAME'] = tenantName;
		variablesMap['TENANT_NAME'] = tenantName;
		variablesMap['TENANT_ADDRESS'] = capitalize(application.correspondenceAddress ?? '', true);
		variablesMap['TENANT_EMAIL'] = application.email ?? '';
		variablesMap['TENANT_TYPE'] = 'individual of full age and capacity';

		const duration = hostingDuration(
			hosting?.paymentInterval,
			application.intervalMultiplier ?? 1,
			application.commencementDate ? new Date(application.commencementDate) : undefined
		);
		variablesMap['DURATION_LENGTH'] = duration.metric;
		variablesMap['TENANCY_DURATION'] = duration.metric;
		variablesMap['COMMENCEMENT_DATE'] = duration.startDateFormatted;
		variablesMap['EXPIRY_DATE'] = duration.endDateFormatted;

		variablesMap['AGREEMENT_DAY'] = 'to be set at signing';
		variablesMap['AGREEMENT_MONTH'] = 'to be set at signing';
		variablesMap['AGREEMENT_YEAR'] = 'to be set at signing';

		if (application.guestFormData) {
			variablesMap['TENANT_OCCUPATION'] = employmentStatusLabel(
				application.guestFormData.employmentStatus
			);
			variablesMap['GUARANTOR_RELATIONSHIP'] = guarantorRelationshipLabel(
				application.guestFormData.guarantorRelationships
			);
		}
	}

	if (providedValues && providedValues.length > 0) {
		providedValues.forEach((val) => {
			if (val.value && val.value.trim() !== '') {
				const cleanValue = val.value.replaceAll(',', '');
				const isNumeric = !Number.isNaN(Number(cleanValue));
				variablesMap[val.key] = isNumeric ? Number(cleanValue).toLocaleString('en-US') : val.value;
			}
		});
	}

	return variablesMap;
}

export type Part = { text: string; kind: 'text' | 'value' | 'blank' };

/** Split a template into plain text, filled values and still-blank variables. */
export function fillTemplate(text: string, vars: Record<string, string>): Part[] {
	return text
		.split(/(\{\{[^{}]+\}\})/g)
		.filter(Boolean)
		.map((p) => {
			const m = p.match(/^\{\{([^{}]+)\}\}$/);
			if (!m) return { text: p, kind: 'text' as const };
			const v = vars[m[1]];
			return v !== undefined && v !== ''
				? { text: v, kind: 'value' as const }
				: { text: m[1].replace(/_/g, ' ').toLowerCase(), kind: 'blank' as const };
		});
}
