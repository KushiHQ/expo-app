import { REVIEW_METRICS } from '@/lib/constants/reviews';
import { useThemeColors } from '@/lib/hooks/use-theme-color';
import { hexToRgba } from '@/lib/utils/colors';
import { CircleQuestionMark } from 'lucide-react-native';
import React from 'react';
import { Pressable, View } from 'react-native';
import ThemedModal from './m-modal';
import ThemedText from '../atoms/a-themed-text';

type Info = {
  title: string;
  description: string;
};

type Props = {
  metric: keyof typeof REVIEW_METRICS;
};

const ReviewMetricsInfoButton: React.FC<Props> = ({ metric }) => {
  const colors = useThemeColors();
  const [info, setInfo] = React.useState<Info>();

  const meticInfo = REVIEW_METRICS[metric];

  return (
    <>
      <Pressable
        aria-label="Info"
        onPress={() =>
          setInfo({
            title: meticInfo.label,
            description: meticInfo.desc,
          })
        }
      >
        <CircleQuestionMark color={hexToRgba(colors.text, 0.7)} size={14} />
      </Pressable>
      <ThemedModal visible={!!info} onClose={() => setInfo(undefined)}>
        <View className="gap-4">
          <ThemedText type="semibold">{info?.title}</ThemedText>
          <ThemedText style={{ color: hexToRgba(colors.text, 0.6) }}>
            {info?.description}
          </ThemedText>
        </View>
      </ThemedModal>
    </>
  );
};

export default ReviewMetricsInfoButton;
