import { RoomData, useHostingRoomsStore } from '@/lib/stores/hostings';
import { useUploadStore } from '@/lib/stores/uploads';
import { useHostingForm } from '../hosting-form';
import {
  useCreateOrUpdateHostingRoomMutation,
  useDeleteHostingRoomImageMutation,
  useDeleteHostingRoomMutation,
  useReorderHostingRoomImagesMutation,
  useReorderHostingRoomsMutation,
  useSetHostingCoverImageMutation,
} from '@/lib/services/graphql/generated';
import React from 'react';
import { useFocusEffect } from 'expo-router';
import { useGalleryStore } from '@/lib/stores/gallery';
import { handleError } from '@/lib/utils/error';
import { useToast } from '@/lib/hooks/use-toast';
import { cast } from '@/lib/types/utils';
import { useCameraScreen } from '../camera';

export const useHostingFormRoomUtils = (hostingId: string) => {
  const { redirect } = useCameraScreen();
  const { show } = useToast();

  const clearGallery = useGalleryStore((state) => state.clearGallery);

  const [activeModalIndex, setActiveModalIndex] = React.useState<number>();
  const [deleteModalIndex, setDeleteModalIndex] = React.useState<number>();
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
  } = useHostingRoomsStore();

  const { hosting, refetch: refetchHosting, fetching: fetchingHosting } = useHostingForm(hostingId);

  const [{ fetching: hostingRoomSaving }, saveHostingRoomMutate] =
    useCreateOrUpdateHostingRoomMutation();
  const [{ fetching: deleteingImage }, deleteImageMutate] = useDeleteHostingRoomImageMutation();
  const [{ fetching: deletingRoom }, deleteRoomMutate] = useDeleteHostingRoomMutation();
  const [{ fetching: settingCover }, setCoverMutate] = useSetHostingCoverImageMutation();
  const [{ fetching: reorderingRooms }, reorderRoomsMutate] = useReorderHostingRoomsMutation();
  const [{ fetching: reorderingImages }, reorderImagesMutate] =
    useReorderHostingRoomImagesMutation();

  // Image uploads run in a background queue (see useUploadStore) and no longer
  // block the wizard — so `addingImages` is intentionally NOT part of `loading`.
  const loading = deleteingImage || deletingRoom || hostingRoomSaving || settingCover;

  // The hosting's current cover is its highest-sequence image; match displayed
  // thumbnails against this URL to badge the active cover.
  const coverImageUrl = hosting?.coverImage?.asset?.publicUrl;

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

      // Immediately reflect the gallery images in local state (mix of existing
      // https:// URLs and new file:// URIs).
      updateActiveRoom({ images: currentGallery });
      clearGallery();

      const roomId = useHostingRoomsStore.getState().rooms[activeIndex]?.id;
      if (!roomId) return;

      const fileUris = currentGallery.filter((image) => image.startsWith('file'));
      if (fileUris.length === 0) return;

      useUploadStore.getState().enqueue(roomId, fileUris);
    }, [activeIndex, clearGallery, updateActiveRoom]),
  );

  // When the upload queue is fully clear (nothing uploading AND no failures left),
  // refetch once so hosting.rooms picks up the new images' server ids (needed for
  // delete / set-cover / reorder). We wait for a truly empty queue — not just the
  // end of in-flight uploads — so a failed thumbnail (and its retry control) isn't
  // wiped by the server re-sync before the host can retry it.
  const pendingUploads = useUploadStore((s) => Object.keys(s.tasks).length);
  const prevPendingUploads = React.useRef(0);
  React.useEffect(() => {
    if (prevPendingUploads.current > 0 && pendingUploads === 0) {
      refetchHosting();
    }
    prevPendingUploads.current = pendingUploads;
  }, [pendingUploads, refetchHosting]);

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
    const roomId = rooms[activeIndex].id;
    if (roomId) {
      deleteRoomMutate({ hostingRoomId: roomId }).then((res) => {
        if (res.error) {
          handleError(res.error);
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
    }
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
    handleSetCoverImage,
    coverImageUrl,
    handleReorderRooms,
    handleReorderRoomImages,
    reorderingRooms,
    reorderingImages,
  };
};
