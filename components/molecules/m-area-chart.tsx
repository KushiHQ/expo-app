import { Fonts } from '@/lib/constants/theme';
import { useThemeColors } from '@/lib/hooks/use-theme-color';
import { hexToRgba } from '@/lib/utils/colors';
import React from 'react';
import { View, Dimensions } from 'react-native';
import { LineChart } from 'react-native-gifted-charts';
import ThemedText from '../atoms/a-themed-text';

type DataPoint = {
  amount: number;
  label: string;
};

type Props = {
  data: DataPoint[];
  title: string;
  color?: string;
};

const AreaChart: React.FC<Props> = ({ data = [], title, color }) => {
  const colors = useThemeColors();
  const chartColor = color || colors.primary;
  const screenWidth = Dimensions.get('window').width;

  const chartData = data.map((item) => ({
    value: item.amount,
    label: item.label,
  }));

  // If no data, show a placeholder or empty state
  if (data.length === 0) {
    return (
      <View
        style={{
          height: 350,
          backgroundColor: colors.surface,
          borderRadius: 24,
          justifyContent: 'center',
          alignItems: 'center',
          borderWidth: 1,
          borderColor: hexToRgba(colors.text, 0.05),
        }}
      >
        <ThemedText style={{ color: hexToRgba(colors.text, 0.4) }}>
          No data available for {title}
        </ThemedText>
      </View>
    );
  }

  return (
    <View
      style={{
        padding: 20,
        borderRadius: 24,
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: hexToRgba(colors.text, 0.05),
        shadowColor: colors.text,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
      }}
    >
      <ThemedText
        style={{
          fontFamily: Fonts.bold,
          fontSize: 18,
          marginBottom: 20,
        }}
      >
        {title}
      </ThemedText>

      <View
        style={{
          overflow: 'hidden',
          borderRadius: 12,
          marginHorizontal: -5,
        }}
      >
        <LineChart
          areaChart
          curved
          data={chartData}
          height={220}
          width={screenWidth - 100}
          initialSpacing={20}
          spacing={85}
          color={chartColor}
          thickness={3}
          startFillColor={chartColor}
          endFillColor={colors.surface}
          startOpacity={0.2}
          endOpacity={0.01}
          noOfSections={4}
          yAxisColor="transparent"
          xAxisColor="transparent"
          yAxisThickness={0}
          xAxisThickness={0}
          rulesColor={hexToRgba(colors.text, 0.05)}
          rulesType="dashed"
          dashGap={5}
          yAxisLabelWidth={40}
          yAxisTextStyle={{
            color: hexToRgba(colors.text, 0.4),
            fontSize: 10,
            fontFamily: Fonts.medium,
          }}
          hideDataPoints
        />
      </View>
    </View>
  );
};

export default AreaChart;
