import BankLogo from '@/components/atoms/a-bank-logo';
import { useThemeColors } from '@/lib/hooks/use-theme-color';
import { HostPaymentDetailsQuery } from '@/lib/services/graphql/generated';
import { Platform, View } from 'react-native';
import ThemedText from '../atoms/a-themed-text';
import { hexToRgba } from '@/lib/utils/colors';
import { Fonts } from '@/lib/constants/theme';
import { getBankLogoUrl } from '@/lib/utils/bank-logos';

type Props = {
  details: HostPaymentDetailsQuery['hostPaymentDetails'][number];
};

const SelectedPaymentDetails: React.FC<Props> = ({ details }) => {
  const colors = useThemeColors();
  const logoUrl = getBankLogoUrl({
    imageUrl: details.bankDetails?.image,
    slug: details.bankDetails?.slug,
  });

  return (
    <View
      className="flex-row items-center gap-4 rounded-2xl border p-4"
      style={{
        borderColor: hexToRgba(colors.primary, 0.2),
        backgroundColor: colors.background,
        ...Platform.select({
          ios: {
            shadowColor: colors.primary,
            shadowOffset: { width: 0, height: -2 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
          },
          android: {
            elevation: 8,
            shadowColor: hexToRgba(colors.primary, 0.3),
          },
        }),
      }}
    >
      <BankLogo name={details.bankDetails?.name} uri={logoUrl} />
      <View>
        <ThemedText style={{ fontFamily: Fonts.medium }}>
          {details.accountName ?? 'Account Name'}
        </ThemedText>
        <ThemedText>
          {details.accountNumber} {details.bankDetails?.name}
        </ThemedText>
      </View>
    </View>
  );
};

export default SelectedPaymentDetails;
