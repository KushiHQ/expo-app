import { Pressable, View } from "react-native";
import ThemedText from "../atoms/a-themed-text";
import React from "react";
import { CircleQuestionMark } from "lucide-react-native";
import { hexToRgba } from "@/lib/utils/colors";
import RatingRange from "../atoms/a-rating-range";
import { useThemeColors } from "@/lib/hooks/use-theme-color";
import BottomSheet from "../atoms/a-bottom-sheet";

type Info = {
  title: string;
  description: string;
};

type Props = Info & {
  value: number;
};

const ReviewItem: React.FC<Props> = ({ value, title, description }) => {
  const [info, setInfo] = React.useState<Info>();
  const colors = useThemeColors();

  return (
    <>
      <View className="flex-1 flex-row items-center justify-between">
        <View className="flex-[0.5] flex-row items-center gap-2">
          <ThemedText>{title}</ThemedText>
          <Pressable
            aria-label="Info"
            onPress={() =>
              setInfo({
                title,
                description,
              })
            }
          >
            <CircleQuestionMark color={hexToRgba(colors.text, 0.7)} size={14} />
          </Pressable>
        </View>
        <View className=" flex-row items-center gap-2">
          <RatingRange color={colors.accent} max={5} value={value} />
          <ThemedText style={{ fontSize: 12, color: colors.accent }}>
            {value.toFixed(1)}
          </ThemedText>
        </View>
      </View>
      <BottomSheet isVisible={!!info} onClose={() => setInfo(undefined)}>
        <View className="gap-4">
          <ThemedText type="semibold">{info?.title}</ThemedText>
          <ThemedText style={{ color: hexToRgba(colors.text, 0.6) }}>
            {info?.description}
          </ThemedText>
        </View>
      </BottomSheet>
    </>
  );
};

export default ReviewItem;
