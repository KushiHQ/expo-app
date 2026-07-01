import BankLogo from '@/components/atoms/a-bank-logo';
import { useThemeColors } from '@/lib/hooks/use-theme-color';
import { HostPaymentDetailsQuery } from '@/lib/services/graphql/generated';
import { View } from 'react-native';
import ThemedText from '../atoms/a-themed-text';
import { hexToRgba } from '@/lib/utils/colors';
import { SURFACE } from '@/lib/constants/surface';
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
      className="flex-row items-center gap-4 rounded-2xl p-4"
      style={{
        backgroundColor: hexToRgba(colors.text, 0.05),
        boxShadow: SURFACE.shadow,
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
