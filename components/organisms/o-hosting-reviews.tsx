import { useThemeColors } from '@/lib/hooks/use-theme-color';
import { hexToRgba } from '@/lib/utils/colors';
import React from 'react';
import { View } from 'react-native';
import ThemedText from '../atoms/a-themed-text';
import SectionHeader from '@/components/atoms/a-section-header';
import { Star } from 'lucide-react-native';
import { Fonts } from '@/lib/constants/theme';
import { MynauiStarSolid } from '../icons/i-star';
import ReviewItem from '../molecules/m-review-item';
import { REVIEW_METRICS } from '@/lib/constants/reviews';
import Carousel from '../atoms/a-carousel';
import HostingReviewCard from '../molecules/m-hosting-review-card';
import { HostingQuery } from '@/lib/services/graphql/generated';
import { SURFACE } from '@/lib/constants/surface';

type Props = {
  hosting?: HostingQuery['hosting'];
};

const HostingReviews: React.FC<Props> = ({ hosting }) => {
  const colors = useThemeColors();

  const metrics = {
    [REVIEW_METRICS.accuracy.label]: hosting?.reviewAverage.accuracy ?? 0,
    [REVIEW_METRICS.value.label]: hosting?.reviewAverage.value ?? 0,
    [REVIEW_METRICS.checkIn.label]: hosting?.reviewAverage.checkIn ?? 0,
    [REVIEW_METRICS.location.label]: hosting?.reviewAverage.location ?? 0,
    [REVIEW_METRICS.communication.label]: hosting?.reviewAverage.communication ?? 0,
    [REVIEW_METRICS.cleanliness.label]: hosting?.reviewAverage.cleanliness ?? 0,
  };

  return (
    <View
      className="mb-4 mt-8 gap-4 rounded-3xl p-5"
      style={{ backgroundColor: hexToRgba(colors.text, 0.05), boxShadow: SURFACE.shadow }}
    >
      <SectionHeader icon={Star} title="Reviews" />
      <View>
        {(hosting?.reviews ?? []).length === 0 ? (
          <View className="items-center gap-3 py-4">
            <View
              className="h-14 w-14 items-center justify-center rounded-full"
              style={{ backgroundColor: hexToRgba(colors.primary, 0.1) }}
            >
              <Star size={24} color={colors.primary} />
            </View>
            <View className="items-center gap-1">
              <ThemedText style={{ fontFamily: Fonts.bold, fontSize: 15 }}>
                No reviews yet
              </ThemedText>
              <ThemedText
                style={{
                  fontSize: 12.5,
                  color: hexToRgba(colors.text, 0.55),
                  textAlign: 'center',
                  lineHeight: 18,
                  maxWidth: 250,
                }}
              >
                Guest reviews show up here once someone completes a stay at this property.
              </ThemedText>
            </View>
            <View className="mt-1 flex-row gap-1">
              {Array.from({ length: 5 }).map((_, index) => (
                <MynauiStarSolid size={14} color={hexToRgba(colors.text, 0.2)} key={index} />
              ))}
            </View>
          </View>
        ) : (
          <View>
            <View
              className="gap-3 rounded-xl p-4"
              style={{ backgroundColor: hexToRgba(colors.text, 0.08) }}
            >
              <ReviewItem
                value={metrics[REVIEW_METRICS.cleanliness.label]}
                title={REVIEW_METRICS.cleanliness.label}
                description={REVIEW_METRICS.cleanliness.desc}
              />
              <ReviewItem
                value={metrics[REVIEW_METRICS.accuracy.label]}
                title={REVIEW_METRICS.accuracy.label}
                description={REVIEW_METRICS.accuracy.desc}
              />
              <ReviewItem
                value={metrics[REVIEW_METRICS.communication.label]}
                title={REVIEW_METRICS.communication.label}
                description={REVIEW_METRICS.communication.desc}
              />
              <ReviewItem
                value={metrics[REVIEW_METRICS.location.label]}
                title={REVIEW_METRICS.location.label}
                description={REVIEW_METRICS.location.desc}
              />
              <ReviewItem
                value={metrics[REVIEW_METRICS.checkIn.label]}
                title={REVIEW_METRICS.checkIn.label}
                description={REVIEW_METRICS.checkIn.desc}
              />
              <ReviewItem
                value={metrics[REVIEW_METRICS.value.label]}
                title={REVIEW_METRICS.value.label}
                description={REVIEW_METRICS.value.desc}
              />
            </View>
            <View className="mt-4 h-36">
              <Carousel interval={5000} autoplay style={{ height: '100%', width: '100%' }}>
                {(hosting?.reviews ?? []).map((review, index) => (
                  <HostingReviewCard review={review} key={index} />
                ))}
              </Carousel>
            </View>
          </View>
        )}
      </View>
    </View>
  );
};

export default HostingReviews;
