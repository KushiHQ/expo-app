import SearchInput from '@/components/atoms/a-search-input';
import Skeleton from '@/components/atoms/a-skeleton';
import ThemedText from '@/components/atoms/a-themed-text';
import { CircumGrid2H, CircumGrid41 } from '@/components/icons/i-grid';
import { MultiList } from '@/components/icons/i-list';
import DetailsLayout from '@/components/layouts/details';
import EmptyList from '@/components/molecules/m-empty-list';
import ListingCard from '@/components/organisms/o-listing-card';
import ListingListItem from '@/components/organisms/o-listing-list-item';
import { Fonts } from '@/lib/constants/theme';
import { useDebounce } from '@/lib/hooks/use-debounce';
import { useThemeColors } from '@/lib/hooks/use-theme-color';
import { useUser } from '@/lib/hooks/user';
import { useHostListingsQuery } from '@/lib/services/graphql/generated';
import { useRouter } from '@/lib/hooks/use-router';
import { useInfiniteQuery } from '@/lib/hooks/use-infinite-query';
import React from 'react';
import { FlatList, Pressable, RefreshControl, View } from 'react-native';
import { FlatGrid } from 'react-native-super-grid';
import { Plus } from 'lucide-react-native';

export default function HostListings() {
  const router = useRouter();
  const { user, updateUser } = useUser();
  const [title, setTitle] = React.useState('');
  const debouncedTitle = useDebounce(title, 500);

  const {
    items: hostings,
    fetching,
    loadMore,
    hasNextPage,
    refresh,
    showInitialSkeleton,
    showEmpty,
  } = useInfiniteQuery(useHostListingsQuery, {
    queryKey: 'hostings',
    initialVariables: {
      filters: {
        creatorId: user.user?.id,
        title: debouncedTitle || undefined,
      },
    },
  });

  const colors = useThemeColors();

  const [refreshing, setRefreshing] = React.useState(false);

  React.useEffect(() => {
    if (!fetching) setRefreshing(false);
  }, [fetching]);

  // Skeletons only on the very first load — never while typing a search.
  const showSkeleton = showInitialSkeleton && !refreshing;

  const handleRefresh = () => {
    setRefreshing(true);
    refresh();
  };

  const handleView = () => {
    if (user.hostListingsView === 'list') {
      updateUser({ hostListingsView: 'grid' });
    } else if (user.hostListingsView === 'grid') {
      updateUser({ hostListingsView: 'block' });
    } else {
      updateUser({ hostListingsView: 'list' });
    }
  };

  const renderHeader = () => (
    <View className="mb-4 gap-4">
      <View className="flex-row items-center justify-between px-1 pr-2">
        <ThemedText style={{ fontFamily: Fonts.medium }}>My Listings</ThemedText>
        <Pressable onPress={handleView}>
          {user.hostListingsView === 'list' ? (
            <MultiList color={colors.text} size={20} />
          ) : user.hostListingsView === 'block' ? (
            <CircumGrid2H color={colors.text} size={20} />
          ) : (
            <CircumGrid41 color={colors.text} size={20} />
          )}
        </Pressable>
      </View>
      {showEmpty && (
        <EmptyList
          message="No listings yet"
          buttonTitle="Create Listing"
          onButtonPress={() => router.push('/hostings/form')}
        />
      )}

      {/* Loading States */}
      {showSkeleton &&
        (user.hostListingsView === 'list' ? (
          <View className="gap-4">
            {Array.from({ length: 10 }).map((_, index) => (
              <Skeleton style={{ height: 100, width: '100%', borderRadius: 10 }} key={index} />
            ))}
          </View>
        ) : (
          <FlatGrid
            itemDimension={user.hostListingsView === 'block' ? 350 : 170}
            spacing={1}
            data={Array.from({ length: 10 }).fill(0)}
            renderItem={() => (
              <Skeleton
                style={{
                  width: user.hostListingsView === 'block' ? '100%' : '96%',
                  aspectRatio: '1/0.75',
                  marginRight: 8,
                  marginBottom: 8,
                  borderRadius: 10,
                }}
              />
            )}
          />
        ))}
    </View>
  );

  return (
    <DetailsLayout
      title="Listings"
      variant="host"
      withNotifications
      withProfile
      scrollable={false}
      footer={
        <Pressable
          aria-label="New Listing"
          onPress={() => router.push('/hostings/form')}
          className="absolute bottom-4 right-4 items-center justify-center rounded-full shadow-lg"
          style={{
            backgroundColor: colors.primary,
            width: 56,
            height: 56,
            shadowColor: colors.primary,
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 5,
          }}
        >
          <Plus color="white" size={32} />
        </Pressable>
      }
    >
      <View className="flex-1">
        <View style={{ paddingHorizontal: 20, paddingBottom: 16 }}>
          <SearchInput value={title} onChangeText={setTitle} placeholder="Search..." />
        </View>
        {user.hostListingsView === 'list' ? (
          <FlatList
            style={{ flex: 1 }}
            data={hostings}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 20 }}
            ListHeaderComponent={renderHeader}
            keyboardShouldPersistTaps="handled"
            renderItem={({ item }) => (
              <View className="mb-4">
                <ListingListItem hosting={item} onDelete={refresh} />
              </View>
            )}
            onEndReached={() => hasNextPage && loadMore()}
            onEndReachedThreshold={0.5}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
          />
        ) : (
          <FlatGrid
            style={{ flex: 1 }}
            itemDimension={user.hostListingsView === 'block' ? 350 : 160}
            spacing={16}
            data={hostings}
            renderItem={({ item }) => (
              <View className="mb-2 mr-2">
                <ListingCard hosting={item} onDelete={refresh} />
              </View>
            )}
            ListHeaderComponent={renderHeader}
            contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 20 }}
            keyboardShouldPersistTaps="handled"
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
            onEndReached={() => hasNextPage && loadMore()}
            onEndReachedThreshold={0.5}
          />
        )}
      </View>
    </DetailsLayout>
  );
}
