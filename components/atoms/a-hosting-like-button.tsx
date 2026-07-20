import {
  ListingEventKind,
  useCreateUpdateSavedHostingMutation,
  useDeleteSavedHostingMutation,
  useRecordListingEventMutation,
} from '@/lib/services/graphql/generated';
import { handleError } from '@/lib/utils/error';
import * as Haptics from 'expo-haptics';
import React from 'react';
import { Pressable, View } from 'react-native';
import { usePathname } from 'expo-router';
import { useRouter } from '@/lib/hooks/use-router';
import { useUser } from '@/lib/hooks/user';
import { toast } from '@/lib/hooks/use-toast';
import { PhHeart, PhHeartFill } from '../icons/i-heart';
import { useThemeColors } from '@/lib/hooks/use-theme-color';

type Props = {
  id: string;
  saved: boolean;
  className?: string;
  onUpdate?: (saved: boolean) => void;
};

const HostingLikeButton: React.FC<Props> = ({ saved: defSaved, className, id, onUpdate }) => {
  const colors = useThemeColors();
  const router = useRouter();
  const pathname = usePathname();
  const { user, setReturnUrl } = useUser();
  const [saved, setSaved] = React.useState(defSaved ?? false);
  // Re-sync when the prop changes (refetch, or FlatList recycling this instance
  // for a different hosting) — otherwise the heart shows a stale saved state.
  React.useEffect(() => {
    setSaved(defSaved ?? false);
  }, [defSaved]);
  const [{ fetching: savingHosting }, saveHosting] = useCreateUpdateSavedHostingMutation();
  const [{ fetching: deletingSaved }, deleteSaved] = useDeleteSavedHostingMutation();
  const [, recordListingEvent] = useRecordListingEventMutation();

  function toggleSaved() {
    // Guests can browse (and see the heart) without an account. Saving needs
    // one, so send them to sign in and bring them back to where they were.
    if (!user.user?.id) {
      setReturnUrl(pathname);
      router.push('/auth/sign-in');
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const previousSaved = saved;
    setSaved(!previousSaved);

    if (previousSaved) {
      deleteSaved({ hostingId: id }).then((res) => {
        if (res.error) {
          setSaved(true);
          handleError(res.error);
        }
        if (res.data) {
          onUpdate?.(false);
          toast.show({
            type: 'success',
            text2: res.data.deleteSavedHosting.message,
          });
        }
      });
    } else {
      saveHosting({ input: { hostingId: id } }).then((res) => {
        if (res.error) {
          setSaved(false);
          handleError(res.error);
        }
        if (res.data) {
          onUpdate?.(true);
          // Fire-and-forget analytics: a genuine save is a strong intent signal
          // for the host (esp. agent-managed listings).
          recordListingEvent({ hostingId: id, kind: ListingEventKind.Save });
          toast.show({
            type: 'success',
            text2: res.data.createUpdateSavedHosting.message,
          });
        }
      });
    }
  }

  return (
    <Pressable onPress={toggleSaved} className={className}>
      <View className="absolute right-0 top-0">
        <PhHeartFill color={saved ? '#de4b71' : 'white'} />
      </View>
      <View className="absolute right-0 top-0">
        <PhHeart color={colors.text} />
      </View>
    </Pressable>
  );
};

export default HostingLikeButton;
