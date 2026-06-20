import { Fonts } from '@/lib/constants/theme';
import { useThemeColors } from '@/lib/hooks/use-theme-color';
import { hexToRgba } from '@/lib/utils/colors';
import React from 'react';
import { View, Dimensions } from 'react-native';
import { LineChart } from 'react-native-gifted-charts';
import { TrendingUp, TrendingDown } from 'lucide-react-native';
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

const money = (n: number) =>
  new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    maximumFractionDigits: 0,
  }).format(Math.round(n));

// Compact ₦ for the y-axis (₦850k, ₦1.2M).
const abbreviate = (n: number) => {
  if (n >= 1_000_000) return `₦${(n / 1_000_000).toFixed(n % 1_000_000 ? 1 : 0)}M`;
  if (n >= 1_000) return `₦${Math.round(n / 1_000)}k`;
  return `₦${Math.round(n)}`;
};

// Round a max value up to a clean axis ceiling (e.g. 1.27M -> 2M).
const niceCeil = (n: number) => {
  if (n <= 0) return 1000;
  const magnitude = Math.pow(10, Math.floor(Math.log10(n)));
  return Math.ceil(n / magnitude) * magnitude;
};

const AreaChart: React.FC<Props> = ({ data = [], title, color }) => {
  const colors = useThemeColors();
  const chartColor = color || colors.primary;
  const screenWidth = Dimensions.get('window').width;

  const values = data.map((item) => item.amount);
  const hasData = data.length > 1 && values.some((v) => v > 0);

  // Headline + growth: latest value vs the first non-zero point in the series.
  const latest = values[values.length - 1] ?? 0;
  const baseline = values.find((v) => v > 0) ?? 0;
  const changePct = baseline > 0 ? ((latest - baseline) / baseline) * 100 : null;
  const isUp = (changePct ?? 0) >= 0;

  // x-axis labels are styled per-point in this chart lib (no global prop), so
  // attach the themed style to each item — otherwise they default to black and
  // vanish on dark mode.
  const labelTextStyle = {
    color: hexToRgba(colors.text, 0.4),
    fontSize: 10,
    fontFamily: Fonts.medium,
  };
  const chartData = data.map((item) => ({
    value: item.amount,
    label: item.label,
    labelTextStyle,
  }));

  // Abbreviated, evenly-spaced y-axis labels with a clean ceiling.
  const sections = 4;
  const niceMax = niceCeil(Math.max(...values, 0));
  const yAxisLabelTexts = Array.from({ length: sections + 1 }, (_, i) =>
    abbreviate((niceMax / sections) * i),
  );

  // Size to the MEASURED container width (the card sits inside the screen's own
  // padding, and gifted-charts adds the y-axis label column on top of `width`),
  // then spread points to fill it regardless of how many there are.
  const yLabelWidth = 44;
  const initialSpacing = 12;
  const [containerWidth, setContainerWidth] = React.useState(screenWidth - 100);
  const chartWidth = Math.max(containerWidth - yLabelWidth - 8, 120);
  const spacing =
    data.length > 1 ? (chartWidth - initialSpacing) / (data.length - 1) : chartWidth;

  return (
    <View
      style={{
        padding: 20,
        borderRadius: 24,
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: hexToRgba(colors.text, 0.06),
      }}
    >
      {/* Header — title eyebrow, headline revenue, growth pill */}
      <ThemedText
        style={{
          fontSize: 10,
          letterSpacing: 1.4,
          textTransform: 'uppercase',
          color: hexToRgba(colors.text, 0.45),
          fontFamily: Fonts.medium,
        }}
      >
        {title}
      </ThemedText>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'flex-end',
          gap: 10,
          marginTop: 6,
          marginBottom: 18,
        }}
      >
        <ThemedText style={{ fontFamily: Fonts.bold, fontSize: 26 }}>{money(latest)}</ThemedText>
        {changePct !== null && (
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 3,
              paddingHorizontal: 8,
              paddingVertical: 3,
              borderRadius: 8,
              marginBottom: 4,
              backgroundColor: hexToRgba(isUp ? colors.success : colors.error, 0.14),
            }}
          >
            {isUp ? (
              <TrendingUp size={12} color={colors.success} />
            ) : (
              <TrendingDown size={12} color={colors.error} />
            )}
            <ThemedText
              style={{
                fontSize: 11,
                fontFamily: Fonts.semibold,
                color: isUp ? colors.success : colors.error,
              }}
            >
              {Math.abs(changePct).toFixed(0)}%
            </ThemedText>
          </View>
        )}
      </View>

      {hasData ? (
        <View onLayout={(e) => setContainerWidth(e.nativeEvent.layout.width)}>
          <LineChart
            areaChart
            curved
            data={chartData}
            height={160}
            width={chartWidth}
            initialSpacing={initialSpacing}
            spacing={spacing}
            color={chartColor}
            thickness={3}
            startFillColor={chartColor}
            endFillColor={colors.surface}
            startOpacity={0.22}
            endOpacity={0.01}
            maxValue={niceMax}
            noOfSections={sections}
            yAxisLabelTexts={yAxisLabelTexts}
            yAxisColor="transparent"
            xAxisColor="transparent"
            yAxisThickness={0}
            xAxisThickness={0}
            rulesColor={hexToRgba(colors.text, 0.06)}
            rulesType="dashed"
            dashGap={6}
            yAxisLabelWidth={yLabelWidth}
            yAxisTextStyle={{
              color: hexToRgba(colors.text, 0.4),
              fontSize: 10,
              fontFamily: Fonts.medium,
            }}
            hideDataPoints
          />
        </View>
      ) : (
        <View style={{ height: 160, alignItems: 'center', justifyContent: 'center', gap: 10 }}>
          <TrendingUp size={26} color={hexToRgba(colors.text, 0.18)} />
          <ThemedText
            style={{
              fontSize: 13,
              lineHeight: 19,
              color: hexToRgba(colors.text, 0.4),
              textAlign: 'center',
              maxWidth: 230,
              fontFamily: Fonts.regular,
            }}
          >
            Your revenue growth will appear here as bookings are completed.
          </ThemedText>
        </View>
      )}
    </View>
  );
};

export default AreaChart;
