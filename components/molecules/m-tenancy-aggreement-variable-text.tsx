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
import { hostingDuration } from '@/lib/utils/hosting/tenancyAgreement';

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
        const formated = formatNaira(hosting.price ?? 0);
        variablesMap['PROPERTY_DESCRIPTION'] = capitalize(hosting.title ?? '', true);
        variablesMap['PROPERTY_ADDRESS'] = capitalize(hostingAddress, true);
        variablesMap['PRICE'] = formated.formated;
        variablesMap['PRICE_IN_WORDS'] = formated.amountInWords;

        if (hosting.cautionFee) {
          variablesMap['CAUTION_FEE'] = formatNaira(hosting.cautionFee).formated;
        }
        if (hosting.serviceCharge) {
          variablesMap['SERVICE_CHARGE'] = formatNaira(hosting.serviceCharge).formated;
        }
        if (hosting.verification) {
          variablesMap['LANDLORD_FULL_NAME'] = capitalize(
            hosting.verification.landlordFullName ?? '',
            true,
          );
          variablesMap['LANDLORD_NAME'] = capitalize(
            hosting.verification.landlordFullName ?? '',
            true,
          );
          variablesMap['LANDLORD_ADDRESS'] = capitalize(
            hosting.verification.landlordAddress ?? '',
            true,
          );
        }
      }

      if (application) {
        variablesMap['TENANT_FULL_NAME'] = capitalize(application.fullName ?? '', true);
        variablesMap['TENANT_ADDRESS'] = capitalize(application.correspondenceAddress ?? '', true);

        const duration = hostingDuration(
          hosting?.paymentInterval,
          application.intervalMultiplier ?? 1,
          application.commencementDate ? new Date(application.commencementDate) : undefined,
        );

        variablesMap['DURATION_LENGTH'] = duration.metric;
        variablesMap['TENANCY_DURATION'] = duration.metric;
        variablesMap['COMMENCEMENT_DATE'] = duration.startDateFormatted;
        variablesMap['EXPIRY_DATE'] = duration.endDateFormatted;
        variablesMap['TENANT_EMAIL'] = application.email ?? '';
        variablesMap['AGREEMENT_DAY'] = 'unset';
        variablesMap['AGREEMENT_MONTH'] = 'unset';
        variablesMap['AGREEMENT_YEAR'] = 'unset';
        variablesMap['AGREEMENT_DAY'] = 'unset';
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
