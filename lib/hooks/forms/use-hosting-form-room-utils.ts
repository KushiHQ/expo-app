import { RoomData, useHostingRoomsStore } from '@/lib/stores/hostings';
import { useHostingForm } from '../hosting-form';
import {
  CreateHostingRoomImageMutation,
  CreateHostingRoomImageMutationVariables,
  useCreateOrUpdateHostingRoomMutation,
  useDeleteHostingRoomImageMutation,
  useDeleteHostingRoomMutation,
} from '@/lib/services/graphql/generated';
import React from 'react';
import { useFocusEffect } from 'expo-router';
import { useGalleryStore } from '@/lib/stores/gallery';
import { formMutation } from '@/lib/services/graphql/utils/fetch';
import { CREATE_UPDATE_HOSTING_ROOM_IMAGE } from '@/lib/services/graphql/requests/mutations/hostings';
import { generateRNFile } from '@/lib/utils/file';
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
    updateActiveRoomImage,
  } = useHostingRoomsStore();

  const { hosting, refetch: refetchHosting, fetching: fetchingHosting } = useHostingForm(hostingId);

  const [{ fetching: hostingRoomSaving }, saveHostingRoomMutate] =
    useCreateOrUpdateHostingRoomMutation();
  const [{ fetching: deleteingImage }, deleteImageMutate] = useDeleteHostingRoomImageMutation();
  const [{ fetching: deletingRoom }, deleteRoomMutate] = useDeleteHostingRoomMutation();
  const [addingImagesCount, setAddingImagesCount] = React.useState(0);
  const addingImages = addingImagesCount > 0;

  const loading =
    deleteingImage || deletingRoom || fetchingHosting || hostingRoomSaving || addingImages;

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

  // On returning from the camera, upload any new file:// images and then do a single
  // refetch after all uploads finish so the server state is re-synced cleanly.
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

      const fileEntries = currentGallery
        .map((image, index) => ({ image, index }))
        .filter(({ image }) => image.startsWith('file'));

      if (fileEntries.length === 0) return;

      setAddingImagesCount(fileEntries.length);

      const uploads = fileEntries.map(({ image, index }) =>
        formMutation<CreateHostingRoomImageMutation, CreateHostingRoomImageMutationVariables>(
          CREATE_UPDATE_HOSTING_ROOM_IMAGE,
          { input: { roomId, asset: generateRNFile(image) } },
        )
          .then((res) => {
            setAddingImagesCount((c) => c - 1);
            if (res.error) {
              handleError(res.error);
            }
            if (res.data?.createHostingRoomImage.data) {
              show({
                type: 'success',
                text1: 'Success',
                text2: res.data.createHostingRoomImage.message,
              });
              updateActiveRoomImage(index, res.data.createHostingRoomImage.data.asset.publicUrl);
            }
          })
          .catch(() => {
            setAddingImagesCount((c) => c - 1);
          }),
      );

      // Single refetch after all uploads complete so setRooms() sees the full picture.
      Promise.allSettled(uploads).then(() => {
        refetchHosting();
      });
    }, [activeIndex, clearGallery, refetchHosting, show, updateActiveRoom, updateActiveRoomImage]),
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
    setActiveModalIndex,
    handleDeleteImage,
    handleDeleteActiveRoom,
    handleSaveHostingRoom,
    handleRoomImageEdit,
  };
};
