import { generateMockReviews } from "@/lib/constants/mocks/hostings";
import { useThemeColors } from "@/lib/hooks/use-theme-color";
import { hexToRgba } from "@/lib/utils/colors";
import React from "react";
import { View } from "react-native";
import ThemedText from "../atoms/a-themed-text";
import { Fonts } from "@/lib/constants/theme";
import { MynauiStarSolid } from "../icons/i-star";
import ReviewItem from "../molecules/m-review-item";
import { REVIEW_METRICS } from "@/lib/constants/reviews";
import { average } from "@/lib/utils/math";
import Carousel from "../atoms/a-carousel";
import HostingReviewCard from "../molecules/m-hosting-review-card";

const HostingReviews: React.FC = () => {
  const colors = useThemeColors();
  const reviews = generateMockReviews(20);

  const metrics = {
    [REVIEW_METRICS.accuracy.label]: average(
      reviews.map((i) => i.metrics.accuracy),
    ),
    [REVIEW_METRICS.value.label]: average(reviews.map((i) => i.metrics.value)),
    [REVIEW_METRICS.checkIn.label]: average(
      reviews.map((i) => i.metrics.checkIn),
    ),
    [REVIEW_METRICS.location.label]: average(
      reviews.map((v) => v.metrics.location),
    ),
    [REVIEW_METRICS.communication.label]: average(
      reviews.map((i) => i.metrics.communication),
    ),
    [REVIEW_METRICS.cleanliness.label]: average(
      reviews.map((i) => i.metrics.cleanliness),
    ),
  };

  return (
    <View className="mt-8 mb-4">
      <ThemedText style={{ fontFamily: Fonts.medium, fontSize: 18 }}>
        Reviews
      </ThemedText>
      <View>
        {reviews.length === 0 ? (
          <View
            className="p-4 gap-2 items-center mt-4 rounded-xl"
            style={{ backgroundColor: hexToRgba(colors.text, 0.1) }}
          >
            <ThemedText style={{ fontFamily: Fonts.medium, fontSize: 18 }}>
              No Reviews Yet
            </ThemedText>
            <View className="flex-row">
              {Array.from({ length: 5 }).map((_, index) => (
                <MynauiStarSolid
                  size={16}
                  color={hexToRgba(colors.text, 0.4)}
                  key={index}
                />
              ))}
            </View>
          </View>
        ) : (
          <View>
            <View
              className="mt-4 gap-3 p-4 rounded-xl"
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
            <View className="h-36 mt-4">
              <Carousel
                interval={5000}
                autoplay
                style={{ height: "100%", width: "100%" }}
              >
                {reviews.map((review, index) => (
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
