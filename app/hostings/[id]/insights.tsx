import React from 'react';
import { RefreshControl, View } from 'react-native';
import { SimpleGrid } from 'react-native-super-grid';
import { useLocalSearchParams } from 'expo-router';
import { Eye, Heart, MessageSquare, Share2, Users } from 'lucide-react-native';
import AnalyticsCard from '@/components/atoms/a-analytics-card';
import AreaChart from '@/components/molecules/m-area-chart';
import DetailsLayout from '@/components/layouts/details';
import Skeleton from '@/components/atoms/a-skeleton';
import ThemedText from '@/components/atoms/a-themed-text';
import { useThemeColors } from '@/lib/hooks/use-theme-color';
import { Fonts } from '@/lib/constants/theme';
import { useHostingAnalyticsQuery } from '@/lib/services/graphql/generated';

export default function ListingInsights() {
  const { id } = useLocalSearchParams();
  const colors = useThemeColors();
  const [{ data, fetching }, refetch] = useHostingAnalyticsQuery({
    variables: { hostingId: String(id) },
  });
  const a = data?.hostingAnalytics;

  const [refreshing, setRefreshing] = React.useState(false);
  React.useEffect(() => {
    if (!fetching) setRefreshing(false);
  }, [fetching]);

  const stats = [
    { label: 'Views', value: a?.totalViews ?? 0, icon: Eye, description: 'Times your listing was opened.' },
    { label: 'Unique viewers', value: a?.uniqueViews ?? 0, icon: Users, description: 'Distinct people who viewed it.' },
    { label: 'Saves', value: a?.saves ?? 0, icon: Heart, description: 'Added to a saved list.' },
    { label: 'Messages', value: a?.messages ?? 0, icon: MessageSquare, description: 'Chats started with you.' },
    { label: 'Shares', value: a?.shares ?? 0, icon: Share2, description: 'Times it was shared.' },
  ];

  const chartData = (a?.viewsSeries.dataPoints ?? []).map((dp) => ({
    amount: Number(dp.amount),
    label: dp.label,
  }));

  return (
    <DetailsLayout
      title="Insights"
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => {
            setRefreshing(true);
            refetch({ requestPolicy: 'network-only' });
          }}
        />
      }
    >
      <View style={{ paddingBottom: 24 }}>
        <ThemedText style={{ fontSize: 12, color: colors.text, opacity: 0.5, marginBottom: 8 }}>
          Last 30 days
        </ThemedText>
        {fetching && !a ? (
          <Skeleton style={{ width: '100%', height: 320, borderRadius: 24 }} />
        ) : (
          <SimpleGrid
            spacing={4}
            itemDimension={160}
            listKey="insights-grid"
            data={stats}
            renderItem={({ item, index }) => <AnalyticsCard index={index} {...item} />}
          />
        )}

        <View style={{ marginTop: 16 }}>
          {fetching && !a ? (
            <Skeleton style={{ width: '100%', height: 320, borderRadius: 24 }} />
          ) : (
            <AreaChart data={chartData} title="Views over time" color={colors.primary} />
          )}
        </View>

        <ThemedText
          style={{ fontSize: 12, color: colors.text, opacity: 0.4, marginTop: 16, fontFamily: Fonts.regular }}
        >
          Boost this listing to reach more people — tap Boost on the listing page.
        </ThemedText>
      </View>
    </DetailsLayout>
  );
}
