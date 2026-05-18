import Skeleton from '@/components/atoms/a-skeleton';
import ThemedText from '@/components/atoms/a-themed-text';
import DetailsLayout from '@/components/layouts/details';
import EmptyList from '@/components/molecules/m-empty-list';
import SavedHostingCard, {
  SavedHostingCardSkeleton,
} from '@/components/molecules/m-saved-hosting-card';
import { Fonts } from '@/lib/constants/theme';
import {
  useSavedHostingFolderQuery,
  useSavedHostingsQuery,
} from '@/lib/services/graphql/generated';
import { cast } from '@/lib/types/utils';
import { useLocalSearchParams } from 'expo-router';
import { View } from 'react-native';
import { SimpleGrid } from 'react-native-super-grid';

export default function HostingFolder() {
  const { id } = useLocalSearchParams();
  const [{ data, fetching }] = useSavedHostingFolderQuery({
    variables: { savedHostingFolderId: cast(id) },
  });
  const [{ fetching: savedFetching, data: savedData }] = useSavedHostingsQuery({
    variables: {
      filters: {
        folderId: cast(id),
      },
    },
  });

  return (
    <DetailsLayout title={data?.savedHostingFolder.folderName} withProfile>
      <View className="mt-6 gap-8">
        {(fetching || savedFetching) && (
          <View className="gap-2">
            <View className="px-2">
              <Skeleton
                style={{
                  width: '100%',
                  height: 22,
                  borderRadius: 12,
                  maxWidth: 230,
                }}
              />
            </View>
            <SimpleGrid
              listKey={undefined}
              itemDimension={160}
              data={Array.from({ length: 5 }).map((_, index) => index + 1)}
              renderItem={() => <SavedHostingCardSkeleton />}
            />
          </View>
        )}

        {!savedFetching && savedData?.savedHostings && savedData?.savedHostings.length < 1 && (
          <EmptyList message="No hostings in this folder" />
        )}

        {savedData?.savedHostings.length && (
          <View className="gap-2">
            <ThemedText className="px-2" style={{ fontFamily: Fonts.bold, fontSize: 18 }}>
              Saved
            </ThemedText>
            <SimpleGrid
              listKey="id"
              itemDimension={160}
              data={savedData?.savedHostings ?? []}
              renderItem={({ item }) => <SavedHostingCard hosting={item} />}
            />
          </View>
        )}
      </View>
    </DetailsLayout>
  );
}
