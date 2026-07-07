import { InteractionManager } from 'react-native';
import { useShallow } from 'zustand/react/shallow';

import { RoomData, useHostingRoomsStore } from '@/lib/stores/hostings';
import { getUploadedAsset, useUploadStore } from '@/lib/stores/uploads';
import { useHostingForm } from '../hosting-form';
import {
  useCreateOrUpdateHostingRoomMutation,
  useDeleteHostingRoomImageMutation,
  useDeleteHostingRoomMutation,
  useReorderHostingRoomImagesMutation,
  useReorderHostingRoomsMutation,
  useSetHostingCoverImageMutation,
} from '@/lib/services/graphql/generated';
import { useMutation } from 'urql';
import { MOVE_HOSTING_ROOM_IMAGES } from '@/lib/services/graphql/requests/mutations/hostings';
import React from 'react';
import { useFocusEffect, usePathname } from 'expo-router';
import { useGalleryStore } from '@/lib/stores/gallery';
import { handleError } from '@/lib/utils/error';
import { useToast } from '@/lib/hooks/use-toast';
import { cast } from '@/lib/types/utils';
import { useCameraScreen, usePhotoGalleryScreen } from '../camera';
import { getAssetResizeUrl } from '@/lib/utils/urls';

export const useHostingFormRoomUtils = (hostingId: string) => {
  const { redirect } = useCameraScreen();
  const { redirect: openGallery } = usePhotoGalleryScreen();
  const pathname = usePathname();
  const { show } = useToast();

  const clearGallery = useGalleryStore((state) => state.clearGallery);

  const [activeModalIndex, setActiveModalIndex] = React.useState<number>();
  const [deleteModalIndex, setDeleteModalIndex] = React.useState<number>();
  // useShallow: a selector-less subscription re-rendered the whole photo wizard
  // on EVERY rooms-store write (one per completed upload — the freeze storm).
  // Actions are stable refs, so shallow-compare only fails when rooms/activeIndex
  // actually change.
  const {
    rooms,
    activeIndex,
    setRooms,
    saveRoom,
    deleteRoom,
    setActiveIndex,
    updateActiveRoom,
    updateRoom,
    deleteRoomImage,
    moveRoom,
    moveRoomImage,
  } = useHostingRoomsStore(
    useShallow((s) => ({
      rooms: s.rooms,
      activeIndex: s.activeIndex,
      setRooms: s.setRooms,
      saveRoom: s.saveRoom,
      deleteRoom: s.deleteRoom,
      setActiveIndex: s.setActiveIndex,
      updateActiveRoom: s.updateActiveRoom,
      updateRoom: s.updateRoom,
      deleteRoomImage: s.deleteRoomImage,
      moveRoom: s.moveRoom,
      moveRoomImage: s.moveRoomImage,
    })),
  );

  const { hosting, refetch: refetchHosting, fetching: fetchingHosting } = useHostingForm(hostingId);

  const [{ fetching: hostingRoomSaving }, saveHostingRoomMutate] =
    useCreateOrUpdateHostingRoomMutation();
  const [{ fetching: deleteingImage }, deleteImageMutate] = useDeleteHostingRoomImageMutation();
  const [{ fetching: deletingRoom }, deleteRoomMutate] = useDeleteHostingRoomMutation();
  const [{ fetching: settingCover }, setCoverMutate] = useSetHostingCoverImageMutation();
  const [{ fetching: reorderingRooms }, reorderRoomsMutate] = useReorderHostingRoomsMutation();
  const [{ fetching: reorderingImages }, reorderImagesMutate] =
    useReorderHostingRoomImagesMutation();
  // Raw urql mutation (not a generated hook) so it works before/after codegen.
  const [{ fetching: movingImages }, moveImagesMutate] = useMutation(MOVE_HOSTING_ROOM_IMAGES);

  // Image uploads run in a background queue (see useUploadStore) and no longer
  // block the wizard — so `addingImages` is intentionally NOT part of `loading`.
  const loading = deleteingImage || deletingRoom || hostingRoomSaving || settingCover;

  // The hosting's current cover is its highest-sequence image; match displayed
  // thumbnails against this URL to badge the active cover.
  const coverImageUrl = hosting?.coverImage?.asset?.publicUrl;

  // publicUrl -> { asset id, version } so room thumbnails render through the
  // resize proxy instead of decoding full-resolution originals into 88px boxes
  // (the dominant cause of lag/memory growth on photo-heavy units). The room
  // store only holds url strings — publicUrl stays the identity key used by the
  // delete/move/reorder lookups — while `version` (asset.lastUpdated) cache-busts
  // the DISPLAY url so an in-place image edit shows the new photo, not the cached
  // one. See RC2 in sprints/expo-state-freshness-plan.md.
  const imageAssets = React.useMemo(() => {
    const map: Record<string, { id: string; version?: string | null }> = {};
    hosting?.rooms?.forEach((r) =>
      r.images?.forEach((img) => {
        if (img.asset?.publicUrl && img.asset?.id)
          map[img.asset.publicUrl] = { id: img.asset.id, version: img.asset.lastUpdated };
      }),
    );
    return map;
  }, [hosting]);

  // Resolve a room-image url to a small, version-stamped proxied thumbnail. Local
  // file:// uris (still uploading) and unmapped urls pass through unchanged.
  const resolveThumb = React.useCallback(
    (url: string) => {
      if (!url || url.startsWith('file')) return url;
      // Fall back to the upload queue's just-uploaded registry: a fresh upload's
      // publicUrl isn't in imageAssets until the next refetch, and without the
      // fallback each completed photo decoded its FULL-RESOLUTION original into
      // an 88px thumb (the batch-completion memory/GC freeze), then reloaded
      // again post-refetch. The registry uses the same asset id + lastUpdated
      // version, so this proxy URL is identical to the post-refetch one.
      // Registry first: an edited photo replaced in place keeps the SAME
      // publicUrl, so the stale imageAssets entry (old cache-bust version)
      // would show the pre-edit image until the next refetch.
      const asset = getUploadedAsset(url) ?? imageAssets[url];
      return asset ? getAssetResizeUrl(asset.id, 240, 240, 80, asset.version) : url;
    },
    [imageAssets],
  );

  // Sync rooms from server data whenever hosting updates (data-driven, not focus-driven).
  // hosting is kept fresh by useHostingForm which calls refreshHosting() on every refetch,
  // so this always reflects the true server state.
  React.useEffect(() => {
    if (hosting?.rooms) {
      setRooms(
        hosting.rooms.map(({ images, ...room }) => ({
          id: cast(room.id),
          name: cast(room.name),
          count: cast(room.count),
          description: cast(room.description),
          images: images?.map((img) => img.asset.publicUrl) ?? [],
        })),
      );
    }
  }, [hosting]); // eslint-disable-line react-hooks/exhaustive-deps

  // On returning from the camera, reflect the picked photos immediately, then hand
  // the new file:// images to the background upload queue. The wizard is NOT blocked
  // while they upload — thumbnails show their own per-image status and the URL is
  // swapped to the uploaded one in place as each finishes.
  useFocusEffect(
    React.useCallback(() => {
      const currentGallery = useGalleryStore.getState().gallery;
      if (currentGallery.length === 0) return;

      // Map of edited copy → the already-uploaded URL it replaces (read before clear).
      const replacements = useGalleryStore.getState().replacements;

      // Immediately reflect the gallery images in local state (mix of existing
      // https:// URLs and new file:// URIs).
      updateActiveRoom({ images: currentGallery });
      clearGallery();

      const roomId = useHostingRoomsStore.getState().rooms[activeIndex]?.id;
      if (!roomId) return;

      const fileUris = currentGallery.filter((image) => image.startsWith('file'));
      if (fileUris.length === 0) return;

      // For an edited copy of an already-uploaded photo, resolve the server image id
      // so the upload replaces it in place instead of adding a duplicate.
      const serverImages = hosting?.rooms.find((r) => r.id === roomId)?.images ?? [];
      const items = fileUris.map((uri) => {
        const originalUrl = replacements[uri];
        const replaceImageId = originalUrl
          ? serverImages.find((i) => i.asset.publicUrl === originalUrl)?.id
          : undefined;
        return { uri, replaceImageId };
      });

      useUploadStore.getState().enqueue(roomId, items);
    }, [activeIndex, clearGallery, updateActiveRoom, hosting]),
  );

  // When the upload queue is fully clear (nothing uploading AND no failures left),
  // refetch once so hosting.rooms picks up the new images' server ids (needed for
  // delete / set-cover / reorder). We wait for a truly empty queue — not just the
  // end of in-flight uploads — so a failed thumbnail (and its retry control) isn't
  // wiped by the server re-sync before the host can retry it.
  // Boolean selector: the previous count selector re-rendered this hook's whole
  // screen on EVERY task tick; now only the empty↔non-empty transitions notify.
  const queueEmpty = useUploadStore((s) => Object.keys(s.tasks).length === 0);
  const prevQueueEmpty = React.useRef(true);
  // The refetch is read through a ref and the drain is tracked with a pending
  // flag: refetchHosting has a fresh identity every render, so making it an
  // effect dep re-ran the effect on ANY re-render — the cleanup would cancel
  // the scheduled refetch and the re-run couldn't reschedule it (the one-shot
  // transition was already consumed), silently losing the post-upload id
  // re-sync (delete/set-cover on new photos would then no-op).
  const refetchHostingRef = React.useRef(refetchHosting);
  refetchHostingRef.current = refetchHosting;
  const drainRefetchPending = React.useRef(false);
  React.useEffect(() => {
    const wasEmpty = prevQueueEmpty.current;
    prevQueueEmpty.current = queueEmpty;
    if (!queueEmpty) {
      // New batch started — its own drain will re-sync; drop any pending one.
      drainRefetchPending.current = false;
      return;
    }
    if (!wasEmpty) drainRefetchPending.current = true;
    if (!drainRefetchPending.current) return;

    // Drained: defer the heavy network-only refetch (JSON parse + normalize +
    // cross-screen re-render) OFF the completion burst's frames.
    let timer: ReturnType<typeof setTimeout> | undefined;
    const interaction = InteractionManager.runAfterInteractions(() => {
      timer = setTimeout(() => {
        drainRefetchPending.current = false;
        refetchHostingRef.current();
      }, 500);
    });
    return () => {
      interaction.cancel();
      if (timer) clearTimeout(timer);
    };
  }, [queueEmpty]);

  // If the screen unmounts while a drain refetch is still pending, fire it
  // immediately — other mounted wizard screens share the urql operation and
  // must not be left holding rooms without their server ids.
  React.useEffect(
    () => () => {
      if (drainRefetchPending.current) {
        drainRefetchPending.current = false;
        refetchHostingRef.current();
      }
    },
    [],
  );

  const handleDeleteImage = (roomIndex: number, imageIndex: number) => {
    const room = rooms[roomIndex];
    const image = room.images[imageIndex];
    if (image.startsWith('file')) {
      deleteRoomImage(roomIndex, imageIndex);
    } else {
      const imageId = hosting?.rooms
        .find((r) => r.id === room.id)
        ?.images.find((i) => i.asset.publicUrl === image)?.id;
      if (imageId) {
        deleteImageMutate({ hostingRoomImageId: imageId }).then((res) => {
          if (res.error) {
            handleError(res.error);
          }
          if (res.data?.deleteHostingRoomImage.message) {
            show({
              type: 'success',
              text2: res.data.deleteHostingRoomImage.message,
            });
            deleteRoomImage(roomIndex, imageIndex);
            refetchHosting();
          }
        });
      }
    }
  };

  const handleSetCoverImage = (roomIndex: number, imageIndex: number) => {
    const room = rooms[roomIndex];
    const image = room.images[imageIndex];
    // Only saved (uploaded) images have a server id to promote.
    if (image.startsWith('file')) return;

    const imageId = hosting?.rooms
      .find((r) => r.id === room.id)
      ?.images.find((i) => i.asset.publicUrl === image)?.id;
    if (!imageId) return;

    setCoverMutate({ hostingRoomImageId: imageId }).then((res) => {
      if (res.error) {
        handleError(res.error);
      }
      if (res.data?.setHostingCoverImage.message) {
        show({
          type: 'success',
          text2: res.data.setHostingCoverImage.message,
        });
        refetchHosting();
      }
    });
  };

  // Resolve saved image URLs -> server image ids (unsaved file:// images have
  // none and are skipped). Used by the multi-select move/delete actions.
  const resolveImageIds = (imageUrls: string[]): string[] =>
    imageUrls
      .map(
        (url) => hosting?.rooms.flatMap((r) => r.images).find((i) => i.asset.publicUrl === url)?.id,
      )
      .filter((id): id is string => !!id);

  // Move selected photos to another space of this listing, then refetch so both
  // spaces reconcile from the server (URLs -> ids, sequences).
  const handleMoveImages = (targetRoomId: string, imageUrls: string[]) => {
    const imageIds = resolveImageIds(imageUrls);
    if (imageIds.length === 0) return;
    moveImagesMutate({ targetRoomId, imageIds }).then((res) => {
      if (res.error) handleError(res.error);
      if (res.data?.moveHostingRoomImages.message) {
        show({ type: 'success', text2: res.data.moveHostingRoomImages.message });
        refetchHosting();
      }
    });
  };

  // Delete selected saved photos, then refetch to re-sync the room's images.
  const handleDeleteImages = async (_roomIndex: number, imageUrls: string[]) => {
    const imageIds = resolveImageIds(imageUrls);
    if (imageIds.length === 0) return;
    for (const id of imageIds) {
      const res = await deleteImageMutate({ hostingRoomImageId: id });
      if (res.error) handleError(res.error);
    }
    show({
      type: 'success',
      text2: `${imageIds.length} photo${imageIds.length === 1 ? '' : 's'} deleted`,
    });
    refetchHosting();
  };

  // Drag-to-reorder rooms: reflect the move locally (optimistic), persist the
  // new id order, then refetch to reconcile sequences (and revert on error).
  const handleReorderRooms = (from: number, to: number) => {
    if (from === to) return;
    moveRoom(from, to);
    if (!hosting?.id) return;

    const orderedRoomIds = useHostingRoomsStore
      .getState()
      .rooms.map((r) => r.id)
      .filter((id): id is string => !!id);
    if (orderedRoomIds.length < 2) return;

    reorderRoomsMutate({ hostingId: hosting.id, orderedRoomIds }).then((res) => {
      if (res.error) handleError(res.error);
      refetchHosting();
    });
  };

  // Drag-to-reorder images within a room. The store holds image URLs, so map
  // the new URL order back to server image ids (saved images only) to persist.
  const handleReorderRoomImages = (roomIndex: number, from: number, to: number) => {
    if (from === to) return;
    const roomId = rooms[roomIndex]?.id;
    moveRoomImage(roomIndex, from, to);
    if (!roomId) return;

    const serverImages = hosting?.rooms.find((r) => r.id === roomId)?.images ?? [];
    const orderedImageIds = (useHostingRoomsStore.getState().rooms[roomIndex]?.images ?? [])
      .map((url) => serverImages.find((i) => i.asset.publicUrl === url)?.id)
      .filter((id): id is string => !!id);
    if (orderedImageIds.length < 2) return;

    reorderImagesMutate({ roomId, orderedImageIds }).then((res) => {
      if (res.error) handleError(res.error);
      refetchHosting();
    });
  };

  const handleDeleteActiveRoom = () => {
    const room = rooms[activeIndex];
    if (!room) {
      // Stale index — just dismiss so the UI can't wedge.
      setDeleteModalIndex(undefined);
      return;
    }

    // A draft room that was never saved to the server has no id — there's
    // nothing to delete remotely, so remove it locally. (Previously this case
    // silently did NOTHING: no deletion, and the modal stayed open, which read
    // as a freeze.)
    if (!room.id) {
      setActiveModalIndex(undefined);
      setDeleteModalIndex(undefined);
      deleteRoom(activeIndex);
      setActiveIndex(0);
      return;
    }

    deleteRoomMutate({ hostingRoomId: room.id }).then((res) => {
      if (res.error) {
        handleError(res.error);
        // Dismiss the confirm modal so the screen stays usable after a failure.
        setDeleteModalIndex(undefined);
        return;
      }
      if (res.data?.deleteHostingRoom.message) {
        show({
          type: 'success',
          text2: res.data.deleteHostingRoom.message,
        });
        setActiveModalIndex(undefined);
        setDeleteModalIndex(undefined);
        deleteRoom(activeIndex);
        setActiveIndex(0);
        refetchHosting();
      }
    });
  };

  const handleSaveHostingRoom = (index: number, { images, ...rest }: RoomData) => {
    if (!hosting?.id) return;
    saveRoom(rest.name, index);
    saveHostingRoomMutate({ input: { ...rest, hostingId: hosting.id } }).then((res) => {
      if (res.error) {
        handleError(res.error);
      }
      if (res.data) {
        show({
          type: 'success',
          text1: 'Success',
          text2: res.data.createOrUpdateHostingRoom.message,
        });
        const created = res.data.createOrUpdateHostingRoom.data;
        updateRoom(index, {
          id: created?.id,
          name: cast(created?.name),
          count: created?.count ?? 1,
          description: cast(created?.description),
        });
        // Refetch so hosting.rooms reflects the new/updated room (including server-assigned ID).
        refetchHosting();
      }
    });
  };

  const handleRoomImageEdit = (index: number) => {
    const images = rooms.at(index)?.images ?? [];
    setActiveIndex(index);
    redirect({
      clear: true,
      images,
    });
  };

  // Tapping a photo on a room card jumps straight into the fullscreen gallery at
  // that image — swipe to browse, edit in place. Returning to this screen runs
  // the focus effect above, which uploads any edits. `redirect: pathname` points
  // the gallery's "Use Photos" back here so that effect fires.
  const handleOpenRoomImage = (roomIndex: number, imageIndex: number) => {
    const images = rooms.at(roomIndex)?.images ?? [];
    if (images.length === 0) return;
    setActiveIndex(roomIndex);
    openGallery({
      images,
      activeIndex: imageIndex,
      redirect: cast(pathname),
      push: true,
    });
  };

  // Opening a room's details modal must also point activeIndex at that room.
  // The modal's count/description inputs, updateActiveRoom, and the save call
  // all key off activeIndex — without this they'd read/write/save whatever room
  // activeIndex last pointed at (index 0 by default), so edits to any other
  // room landed on the wrong room. Closing (undefined) leaves activeIndex be.
  const openRoomModal = (index?: number) => {
    if (typeof index === 'number') setActiveIndex(index);
    setActiveModalIndex(index);
  };

  return {
    activeModalIndex,
    deleteModalIndex,
    loading,
    rooms,
    hosting,
    hostingRoomSaving,
    activeIndex,
    fetchingHosting,
    refetchHosting,
    updateActiveRoom,
    setDeleteModalIndex,
    deleteRoomImage,
    setActiveModalIndex: openRoomModal,
    handleDeleteImage,
    handleDeleteActiveRoom,
    handleSaveHostingRoom,
    handleRoomImageEdit,
    handleOpenRoomImage,
    handleSetCoverImage,
    coverImageUrl,
    resolveThumb,
    handleReorderRooms,
    handleReorderRoomImages,
    handleMoveImages,
    handleDeleteImages,
    movingImages,
    reorderingRooms,
    reorderingImages,
  };
};
