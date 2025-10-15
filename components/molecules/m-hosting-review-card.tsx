import { Review } from "@/lib/constants/mocks/hostings";
import { Image } from "expo-image";
import React from "react";
import { View } from "react-native";
import ThemedText from "../atoms/a-themed-text";
import { formatDateToMonthYear } from "@/lib/utils/time";
import { MynauiStarSolid } from "../icons/i-star";
import { Fonts } from "@/lib/constants/theme";
import { hexToRgba } from "@/lib/utils/colors";
import { useThemeColors } from "@/lib/hooks/use-theme-color";

type Props = {
  review: Review;
};

const HostingReviewCard: React.FC<Props> = ({ review }) => {
  const colors = useThemeColors();

  return (
    <View className="p-6 max-w-[90%] gap-4">
      <View className="flex-row items-end justify-between">
        <View className="flex-row items-center gap-3">
          <Image
            style={{
              width: 40,
              height: 40,
              objectFit: "cover",
              borderRadius: 999,
            }}
            source={{ uri: review.user.avatar }}
          />
          <View>
            <ThemedText style={{ fontFamily: Fonts.medium }}>
              {review.user.name}
            </ThemedText>
            <ThemedText
              style={{ fontSize: 14, color: hexToRgba(colors.text, 0.6) }}
            >
              {formatDateToMonthYear(review.date)}
            </ThemedText>
          </View>
        </View>
        <View className="flex-row items-center gap-1">
          <MynauiStarSolid color={colors.accent} size={16} />
          <ThemedText style={{ fontSize: 14 }}>{review.rating}</ThemedText>
        </View>
      </View>
      <ThemedText style={{ fontSize: 14, color: hexToRgba(colors.text, 0.7) }}>
        {review.comment}
      </ThemedText>
    </View>
  );
};

export default HostingReviewCard;
