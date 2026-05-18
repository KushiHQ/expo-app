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
      updateFilter({ category: v === 'All' ? undefined : v });
    },
    [updateFilter],
  );

  const {
    items: hostings,
    fetching,
    loadMore,
    hasNextPage,
    refresh,
  } = useInfiniteQuery(useHostingsQuery, {
    queryKey: 'hostings',
    initialVariables: {
      filters: { ...filter, publishStatus: PublishStatus.Live, onSale: true },
    },
  });

  return (
    <ProfileLayout scrollable={false}>
      <FlatList
        key={numColumns}
        showsVerticalScrollIndicator={false}
        data={hostings}
        keyExtractor={(item) => item.id}
        numColumns={numColumns}
        contentContainerStyle={{ padding: 24, paddingTop: 12 }}
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
                value={filter.category?.valueOf()}
                onSelect={handleCategoryChange}
              />
            </View>
            {fetching && !hostings.length && (
              <View
                style={{
                  flexDirection: numColumns > 1 ? 'row' : 'column',
                  flexWrap: 'wrap',
                  gap: 16,
                  marginTop: 40,
                }}
              >
                {Array.from({ length: 6 }).map((_, index) => (
                  <View
                    key={index}
                    style={{ flex: 1, minWidth: numColumns > 1 ? '45%' : undefined }}
                  >
                    <HostingCardSkeleton />
                  </View>
                ))}
              </View>
            )}
          </View>
        }
        ListEmptyComponent={
          !fetching && !hostings.length ? <EmptyList message="No hostings yet" /> : null
        }
        onEndReached={() => {
          if (hasNextPage) loadMore();
        }}
        onEndReachedThreshold={0.5}
        refreshControl={<RefreshControl refreshing={fetching} onRefresh={() => refresh()} />}
      />
    </ProfileLayout>
  );
}
