import ProfileLayout from '@/components/layouts/profile';
import EmptyList from '@/components/molecules/m-empty-list';
import React from 'react';
import HostingCard, { HostingCardSkeleton } from '@/components/molecules/m-hosting-card';
import { HotingVariantFilter } from '@/components/molecules/m-hosting-variant-filter';
import HostingFilterManager from '@/components/organisms/o-hosting-filter-manager';
import { PublishStatus, useHostingsQuery } from '@/lib/services/graphql/generated';
import { useHostingFilterStore } from '@/lib/stores/hostings';
import { useInfiniteQuery } from '@/lib/hooks/use-infinite-query';
import { View, FlatList } from 'react-native';
import { RefreshControl } from 'react-native-gesture-handler';
import { useBreakpoint } from '@/lib/hooks/use-breakpoint';

export default function GuestHome() {
  const { filter, updateFilter } = useHostingFilterStore();
  const { isTablet } = useBreakpoint();
  const numColumns = isTablet ? 2 : 1;

  const handleCategoryChange = React.useCallback(
    (v: string) => {
      updateFilter({ propertyType: v === 'All' ? undefined : v });
    },
    [updateFilter],
  );

  const {
    items: hostings,
    fetching,
    loadMore,
    hasNextPage,
    refresh,
    showInitialSkeleton,
    showEmpty,
  } = useInfiniteQuery(useHostingsQuery, {
    queryKey: 'hostings',
    initialVariables: {
      filters: { ...filter, publishStatus: PublishStatus.Live, onSale: true },
    },
  });

  const [refreshing, setRefreshing] = React.useState(false);

  React.useEffect(() => {
    if (!fetching) setRefreshing(false);
  }, [fetching]);

  // Skeletons only on the very first load — never while filtering/searching.
  const showSkeleton = showInitialSkeleton && !refreshing;

  const handleRefresh = () => {
    setRefreshing(true);
    refresh();
  };

  return (
    <ProfileLayout scrollable={false}>
      <FlatList
        key={numColumns}
        showsVerticalScrollIndicator={false}
        data={hostings}
        keyExtractor={(item) => item.id}
        numColumns={numColumns}
        contentContainerStyle={{ padding: 24, paddingTop: 12 }}
        ListHeaderComponentStyle={{ zIndex: 10 }}
        columnWrapperStyle={numColumns > 1 ? { gap: 16 } : undefined}
        renderItem={({ item, index }) => (
          <View style={{ flex: 1, marginBottom: 32 }}>
            <HostingCard index={index} hosting={item} />
          </View>
        )}
        ListHeaderComponent={
          <View className="mb-10">
            <View className="gap-6">
              <HostingFilterManager />
              <HotingVariantFilter
                value={filter.propertyType?.valueOf()}
                onSelect={handleCategoryChange}
              />
            </View>
            {showSkeleton && (
              <View
                style={{
                  flexDirection: numColumns > 1 ? 'row' : 'column',
                  flexWrap: numColumns > 1 ? 'wrap' : 'nowrap',
                  // In a single column `flex: 1` collapses the rows (no bounded
                  // height) — give each skeleton full width and real spacing so
                  // they fill the screen like the actual cards do.
                  gap: numColumns > 1 ? 16 : 32,
                  marginTop: 24,
                }}
              >
                {Array.from({ length: 6 }).map((_, index) => (
                  <View
                    key={index}
                    style={numColumns > 1 ? { flexBasis: '47%', flexGrow: 1 } : { width: '100%' }}
                  >
                    <HostingCardSkeleton />
                  </View>
                ))}
              </View>
            )}
          </View>
        }
        ListEmptyComponent={showEmpty ? <EmptyList message="No hostings yet" /> : null}
        onEndReached={() => {
          if (hasNextPage) loadMore();
        }}
        onEndReachedThreshold={0.5}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
      />
    </ProfileLayout>
  );
}
