import { View } from 'react-native';
import BottomSheet from '../atoms/a-bottom-sheet';
import React from 'react';
import { Image } from 'expo-image';
import { PROPERTY_BLURHASH } from '@/lib/constants/images';
import ThemedText from '../atoms/a-themed-text';
import { useThemeColors } from '@/lib/hooks/use-theme-color';
import { hexToRgba } from '@/lib/utils/colors';
import { Fonts } from '@/lib/constants/theme';
import Button from '../atoms/a-button';
import { useRouter } from '@/lib/hooks/use-router';
import ThemedModal from './m-modal';
import {
  useDeleteHostingMutation,
  useDuplicateHostingMutation,
  HostListingsQuery,
} from '@/lib/services/graphql/generated';
import LoadingModal from '../atoms/a-loading-modal';
import { toast } from '@/lib/hooks/use-toast';
import { handleError } from '@/lib/utils/error';

type Props = {
  open: boolean;
  onClose: () => void;
  hosting: HostListingsQuery['hostings'][number];
  /** Called after a successful delete so the list can refresh — the deleteHosting
   *  mutation returns only `{ message }`, so the urql document cache can't
   *  auto-invalidate the listings query. */
  onDelete?: () => void;
  /** Called after a successful duplicate so the list can refresh — the new draft
   *  listing isn't in the cached listings query, so urql can't auto-add it. */
  onDuplicate?: () => void;
};

const ListingOptions: React.FC<Props> = ({ open, onClose, hosting, onDelete, onDuplicate }) => {
  const router = useRouter();
  const colors = useThemeColors();
  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const [{ fetching: deleting }, deleteHosting] = useDeleteHostingMutation();
  const [{ fetching: duplicating }, duplicateHosting] = useDuplicateHostingMutation();

  const handleDuplicate = () => {
    duplicateHosting({ sourceHostingId: hosting.id }).then((res) => {
      if (res.error) {
        handleError(res.error);
        return;
      }
      if (res.data?.duplicateHosting?.data) {
        toast.show({
          type: 'success',
          text1: 'Duplicated',
          text2: 'A draft copy was added to your listings.',
        });
        onClose();
        onDuplicate?.();
      }
    });
  };

  const handleDelete = () => {
    deleteHosting({ hostingId: hosting.id }).then((res) => {
      // Previously errors were silently swallowed — surface them so a failed
      // delete doesn't look like nothing happened.
      if (res.error) {
        handleError(res.error);
        return;
      }
      if (res.data?.deleteHosting) {
        // Always read as "deleted" to the host (the server may archive a booked
        // listing under the hood) — see decision #4.
        toast.show({
          type: 'success',
          text1: 'Deleted',
          text2: 'Your listing was deleted.',
        });
        setDeleteOpen(false);
        onClose();
        onDelete?.();
      }
    });
  };

  return (
    <>
      <BottomSheet isVisible={open} onClose={onClose}>
        <View className="items-center gap-8 py-8">
          <View className="h-[100px] w-[120px]">
            <Image
              source={{
                uri: hosting.coverImage?.asset.publicUrl,
              }}
              style={{
                height: '100%',
                width: '100%',
                borderRadius: 12,
              }}
              contentFit="cover"
              transition={300}
              placeholder={{ blurhash: PROPERTY_BLURHASH }}
              placeholderContentFit="cover"
              cachePolicy="memory-disk"
              priority="high"
            />
          </View>
          <View className="items-center gap-2">
            <ThemedText
              className="max-w-[300px] text-center"
              style={{
                color: hexToRgba(colors.text, 0.8),
                fontFamily: Fonts.medium,
              }}
            >
              {hosting.title}
            </ThemedText>
            <ThemedText style={{ fontSize: 14, color: hexToRgba(colors.text, 0.6) }}>
              {hosting.city}
            </ThemedText>
          </View>
          <View className="w-full gap-4">
            <Button
              type="primary"
              onPress={() => {
                onClose?.();
                router.push(`/hostings/${hosting.id}`);
              }}
            >
              <ThemedText content="primary">View Listing</ThemedText>
            </Button>
            <Button type="tinted" onPress={handleDuplicate}>
              <ThemedText content="tinted">Duplicate Listing</ThemedText>
            </Button>
            <Button
              style={{ backgroundColor: hexToRgba(colors.error, 0.15) }}
              onPress={() => setDeleteOpen(true)}
            >
              <ThemedText style={{ color: colors.error }}>Delete Listing</ThemedText>
            </Button>
          </View>
        </View>
      </BottomSheet>
      <ThemedModal visible={deleteOpen} onClose={() => setDeleteOpen(false)}>
        <View className="mt-8 items-center gap-2">
          <ThemedText style={{ fontFamily: Fonts.medium }}>
            Are you certain you want to delete this listing?
          </ThemedText>
          <ThemedText style={{ color: hexToRgba(colors.text, 0.6), fontSize: 14 }}>
            Once deleted, this action cannot be reversed.
          </ThemedText>
          <View className="mt-8 w-full flex-row gap-4">
            <Button type="tinted" className="flex-1" onPress={() => setDeleteOpen(false)}>
              <ThemedText content="tinted">Cancel</ThemedText>
            </Button>
            <Button type="error" className="flex-1" onPress={handleDelete}>
              <ThemedText content="error">Delete</ThemedText>
            </Button>
          </View>
        </View>
      </ThemedModal>
      <LoadingModal visible={deleting || duplicating} />
    </>
  );
};

export default ListingOptions;
