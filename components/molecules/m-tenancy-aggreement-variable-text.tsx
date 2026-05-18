import { useThemeColors } from '@/lib/hooks/use-theme-color';
import {
  SubClauseValueInput,
  HostingQuery,
  BookingApplicationQuery,
} from '@/lib/services/graphql/generated';
import { formatNaira } from '@/lib/utils/currency';
import { capitalize, splitVariables } from '@/lib/utils/text';
import React from 'react';
import ThemedText from '../atoms/a-themed-text';
import {
  courtJurisdictionPhrase,
  employmentStatusLabel,
  guarantorRelationshipLabel,
  hostingDuration,
  intervalVars,
  landlordTypeLabel,
  mediationInstitutionLabel,
  verificationTierLabel,
} from '@/lib/utils/hosting/tenancyAgreement';

interface Props {
  text: string;
  replace?: boolean;
  providedValues?: SubClauseValueInput[];
  hosting?: HostingQuery['hosting'];
  application?: BookingApplicationQuery['bookingApplication'];
}

const TenancyAgreementVariableText: React.FC<Props> = React.memo(
  ({ text, providedValues, replace = true, hosting, application }) => {
    const colors = useThemeColors();

    const hostingAddress = React.useMemo(() => {
      if (!hosting) return '';
      return [
        hosting.landmarks ?? '',
        hosting.city ?? '',
        hosting.state ?? '',
        hosting.country ?? '',
      ]
        .filter((v) => v.length > 0)
        .join(' ');
    }, [hosting]);

    const replacedText = React.useMemo(() => {
      if (!replace) return text;

      const variablesMap: Record<string, string> = {};

      if (hosting) {
        const price = hosting.price ?? 0;
        const periodic = formatNaira(price);
        const iv = intervalVars(hosting.paymentInterval);
        const annualPrice = price * iv.annualMultiplier;
        const annual = formatNaira(annualPrice);

        // Property
        variablesMap['PROPERTY_DESCRIPTION'] = capitalize(hosting.title ?? '', true);
        variablesMap['PROPERTY_ADDRESS'] = capitalize(hostingAddress, true);
        variablesMap['PROPERTY_TYPE'] = hosting.propertyType ?? 'Property';
        variablesMap['STATE'] = hosting.state ?? '';
        variablesMap['GOVERNING_LAW_STATE'] = hosting.state ?? '';
        variablesMap['COURT_STATE'] = hosting.state ?? '';
        variablesMap['LOCAL_GOVERNMENT_AREA'] = hosting.city ?? '';
        variablesMap['ARBITRATION_SEAT'] = hosting.city ?? '';
        variablesMap['PERMITTED_USE'] = 'private residential dwelling';
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
        variablesMap['MAXIMUM_OCCUPANTS'] = hosting.maxOccupants != null ? String(hosting.maxOccupants) : '—';

        // Rent / financials
        variablesMap['PRICE'] = periodic.formated;
        variablesMap['PRICE_IN_WORDS'] = periodic.amountInWords;
        variablesMap['PERIODIC_RENT_AMOUNT'] = periodic.formated;
        variablesMap['PERIODIC_RENT_IN_WORDS'] = periodic.amountInWords;
        variablesMap['ANNUAL_RENT'] = annual.formated;
        variablesMap['ANNUAL_RENT_AMOUNT'] = annual.formated;
        variablesMap['ANNUAL_RENT_IN_WORDS'] = annual.amountInWords;

        if (hosting.cautionFee) {
          const cautionFormatted = formatNaira(hosting.cautionFee).formated;
          variablesMap['CAUTION_FEE'] = cautionFormatted;
          variablesMap['CAUTION_FEE_AMOUNT'] = cautionFormatted;
        }
        if (hosting.serviceCharge) {
          const serviceFormatted = formatNaira(hosting.serviceCharge).formated;
          variablesMap['SERVICE_CHARGE'] = serviceFormatted;
          variablesMap['SERVICE_CHARGE_AMOUNT'] = serviceFormatted;
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

        // Host email
        if (hosting.host?.user?.email) {
          variablesMap['LANDLORD_EMAIL'] = hosting.host.user.email;
        }
      }

      if (application) {
        const tenantName = capitalize(application.fullName ?? '', true);
        variablesMap['TENANT_FULL_NAME'] = tenantName;
        variablesMap['TENANT_NAME'] = tenantName;
        variablesMap['TENANT_ADDRESS'] = capitalize(application.correspondenceAddress ?? '', true);
        variablesMap['TENANT_EMAIL'] = application.email ?? '';
        variablesMap['TENANT_PHONE'] = application.phoneNumber ?? '';
        variablesMap['TENANT_TYPE'] = 'individual of full age and capacity';

        const duration = hostingDuration(
          hosting?.paymentInterval,
          application.intervalMultiplier ?? 1,
          application.commencementDate ? new Date(application.commencementDate) : undefined,
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
            application.guestFormData.employmentStatus,
          );
          variablesMap['GUARANTOR_RELATIONSHIP'] = guarantorRelationshipLabel(
            application.guestFormData.guarantorRelationships,
          );
        }
      }

      if (providedValues && providedValues.length > 0) {
        providedValues.forEach((val) => {
          if (val.value && val.value.trim() !== '') {
            const cleanValue = val.value.replaceAll(',', '');
            const isNumeric = !Number.isNaN(Number(cleanValue));
            variablesMap[val.key] = isNumeric
              ? Number(cleanValue).toLocaleString('en-US')
              : val.value;
          }
        });
      }

      return text.replace(/\{\{([^{}]+)\}\}/g, (match, key) => {
        if (variablesMap[key] !== undefined && variablesMap[key] !== '') {
          return `{{<<${variablesMap[key]}>>}}`;
        }
        return match;
      });
    }, [text, replace, hosting, hostingAddress, providedValues, application]);

    return (
      <ThemedText>
        {splitVariables(replacedText).map((part, index) => {
          if (part.startsWith('{{') && part.endsWith('}}')) {
            const rawVariable = part.slice(2, -2);
            const cleanVariable = rawVariable.replace(/_/g, ' ');
            const isValue = cleanVariable.startsWith('<<');
            return (
              <ThemedText key={index} type="semibold" style={{ color: colors.accent }}>
                {isValue
                  ? cleanVariable.replaceAll('<<', '').replaceAll('>>', '')
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
TenancyAgreementVariableText.displayName = 'VariableText';

export default TenancyAgreementVariableText;
