import { useThemeColors } from '@/lib/hooks/use-theme-color';
import { hexToRgba } from '@/lib/utils/colors';
import React from 'react';
import { View } from 'react-native';
import ThemedText from '../atoms/a-themed-text';
import { Fonts } from '@/lib/constants/theme';
import { MynauiStarSolid } from '../icons/i-star';
import ReviewItem from '../molecules/m-review-item';
import { REVIEW_METRICS } from '@/lib/constants/reviews';
import Carousel from '../atoms/a-carousel';
import HostingReviewCard from '../molecules/m-hosting-review-card';
import { HostingQuery } from '@/lib/services/graphql/generated';

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
    <View className="mb-4 mt-8">
      <ThemedText style={{ fontFamily: Fonts.medium, fontSize: 18 }}>Reviews</ThemedText>
      <View>
        {(hosting?.reviews ?? []).length === 0 ? (
          <View
            className="mt-4 items-center gap-2 rounded-xl p-4"
            style={{ backgroundColor: hexToRgba(colors.text, 0.1) }}
          >
            <ThemedText style={{ fontFamily: Fonts.medium, fontSize: 18 }}>
              No Reviews Yet
            </ThemedText>
            <View className="flex-row">
              {Array.from({ length: 5 }).map((_, index) => (
                <MynauiStarSolid size={16} color={hexToRgba(colors.text, 0.4)} key={index} />
              ))}
            </View>
          </View>
        ) : (
          <View>
            <View
              className="mt-4 gap-3 rounded-xl p-4"
              style={{ backgroundColor: hexToRgba(colors.text, 0.1) }}
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
