import React from 'react';
import { View, Pressable } from 'react-native';
import { Image } from 'expo-image';
import { Building2, ChevronRight } from 'lucide-react-native';
import ThemedText from '../atoms/a-themed-text';
import SectionHeader from '@/components/atoms/a-section-header';
import { Fonts } from '@/lib/constants/theme';
import { useThemeColors } from '@/lib/hooks/use-theme-color';
import { hexToRgba } from '@/lib/utils/colors';
import { PROPERTY_BLURHASH } from '@/lib/constants/images';
import { useRouter } from '@/lib/hooks/use-router';
import { capitalize } from '@/lib/utils/text';
import { SURFACE } from '@/lib/constants/surface';
import {
  HostingKind,
  HostingQuery,
  PaymentInterval,
  PublishStatus,
} from '@/lib/services/graphql/generated';

type Props = {
  hosting?: HostingQuery['hosting'];
  isHost?: boolean;
};

/**
 * "Available units" list shown on a parent property's detail page. Guests see only
 * published units; the owner sees all of them (drafts included).
 */
const HostingUnits: React.FC<Props> = ({ hosting, isHost }) => {
  const colors = useThemeColors();
  const router = useRouter();

  if (!hosting || hosting.kind !== HostingKind.Parent) return null;

  const units = (hosting.children ?? []).filter(
    (u) => isHost || u.publishStatus === PublishStatus.Live,
  );

  return (
    <View
      className="mt-8 gap-4 rounded-3xl p-5"
      style={{ backgroundColor: hexToRgba(colors.text, 0.05), boxShadow: SURFACE.shadow }}
    >
      <SectionHeader
        icon={Building2}
        title="Available units"
        action={
          <ThemedText
            style={{
              fontSize: 13,
              color: hexToRgba(colors.text, 0.5),
              fontFamily: Fonts.semibold,
            }}
          >
            {units.length}
          </ThemedText>
        }
      />
      {units.length === 0 ? (
        <ThemedText
          style={{
            marginTop: 12,
            fontSize: 13,
            color: hexToRgba(colors.text, 0.5),
          }}
        >
          No units are available yet.
        </ThemedText>
      ) : (
        <View>
          {units.map((unit, index) => (
            <React.Fragment key={unit.id}>
              {index > 0 ? (
                <View style={{ height: 1, backgroundColor: hexToRgba(colors.text, 0.06) }} />
              ) : null}
              <Pressable
                onPress={() => router.push(`/hostings/${unit.id}`)}
                className="flex-row items-center gap-3 py-3"
              >
                <Image
                  source={{ uri: unit.coverImage?.asset?.publicUrl }}
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: 12,
                    backgroundColor: hexToRgba(colors.text, 0.05),
                  }}
                  contentFit="cover"
                  transition={300}
                  placeholder={{ blurhash: PROPERTY_BLURHASH }}
                  cachePolicy="memory-disk"
                />
                <View className="flex-1">
                  <ThemedText
                    numberOfLines={1}
                    style={{ fontFamily: Fonts.semibold, fontSize: 15 }}
                  >
                    {unit.title ?? 'Untitled unit'}
                  </ThemedText>
                  <ThemedText
                    style={{
                      fontSize: 13,
                      color: colors.primary,
                      fontFamily: Fonts.semibold,
                    }}
                  >
                    ₦{Number(unit.price ?? 0).toLocaleString()}
                    {unit.paymentInterval && unit.paymentInterval !== PaymentInterval.OneTimePayment
                      ? ` · ${capitalize(unit.paymentInterval)}`
                      : ''}
                  </ThemedText>
                  {isHost && unit.publishStatus !== PublishStatus.Live ? (
                    <ThemedText style={{ fontSize: 11, color: hexToRgba(colors.text, 0.45) }}>
                      {capitalize(String(unit.publishStatus ?? 'draft'))}
                    </ThemedText>
                  ) : null}
                </View>
                <ChevronRight size={18} color={hexToRgba(colors.text, 0.4)} />
              </Pressable>
            </React.Fragment>
          ))}
        </View>
      )}
    </View>
  );
};

export default HostingUnits;
