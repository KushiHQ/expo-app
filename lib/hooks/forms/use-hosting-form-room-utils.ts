import { RoomData, useHostingRoomsStore } from "@/lib/stores/hostings";
import { useHostingForm } from "../hosting-form";
import {
	CreateHostingRoomImageMutation,
	CreateHostingRoomImageMutationVariables,
	useCreateOrUpdateHostingRoomMutation,
	useDeleteHostingRoomImageMutation,
	useDeleteHostingRoomMutation,
} from "@/lib/services/graphql/generated";
import React from "react";
import { useFocusEffect } from "expo-router";
import { useGalleryStore } from "@/lib/stores/gallery";
import { formMutation } from "@/lib/services/graphql/utils/fetch";
import { CREATE_UPDATE_HOSTING_ROOM_IMAGE } from "@/lib/services/graphql/requests/mutations/hostings";
import { generateRNFile } from "@/lib/utils/file";
import { handleError } from "@/lib/utils/error";
import Toast from "react-native-toast-message";
import { cast } from "@/lib/types/utils";
import { useCameraScreen } from "../camera";

export const useHostingFormRoomUtils = (hostingId: string) => {
	const { redirect } = useCameraScreen();
	const { gallery, clearGallery } = useGalleryStore();
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
	const {
		hosting,
		refetch: refetchHosting,
		fetching: fetchingHosting,
	} = useHostingForm(hostingId);

	const [{ fetching: hostingRoomSaving }, saveHostingRoomMutate] =
		useCreateOrUpdateHostingRoomMutation();
	const [{ fetching: deleteingImage }, deleteImageMutate] =
		useDeleteHostingRoomImageMutation();
	const [{ fetching: deletingRoom }, deleteRoomMutate] =
		useDeleteHostingRoomMutation();
	const [addingImages, setAddingImages] = React.useState(false);

	const loading =
		deleteingImage ||
		deletingRoom ||
		fetchingHosting ||
		hostingRoomSaving ||
		addingImages;

	useFocusEffect(
		React.useCallback(() => {
			if (gallery.length > 0) {
				updateActiveRoom({ images: gallery });
				const roomId = rooms[activeIndex]?.id;

				if (roomId) {
					gallery.forEach(async (image, index) => {
						if (image.startsWith("file")) {
							setAddingImages(true);
							formMutation<
								CreateHostingRoomImageMutation,
								CreateHostingRoomImageMutationVariables
							>(CREATE_UPDATE_HOSTING_ROOM_IMAGE, {
								input: {
									roomId,
									asset: generateRNFile(image),
								},
							})
								.then((res) => {
									setAddingImages(false);
									if (res.error) {
										handleError(res.error);
									}
									if (res.data?.createHostingRoomImage.data) {
										Toast.show({
											type: "success",
											text1: "Success",
											text2: res.data.createHostingRoomImage.message,
										});
										updateActiveRoomImage(
											index,
											res.data.createHostingRoomImage.data.asset.publicUrl,
										);
										refetchHosting({ requestPolicy: "network-only" });
									}
								})
								.catch(() => {
									setAddingImages(false);
								});
						}
					});
				}
				clearGallery();
			}
		}, [
			gallery,
			activeIndex,
			clearGallery,
			refetchHosting,
			rooms,
			updateActiveRoom,
			updateActiveRoomImage,
		]),
	);

	useFocusEffect(
		React.useCallback(() => {
			if (hosting) {
				setRooms(
					hosting.rooms?.map(({ images, ...room }) => ({
						id: cast(room.id),
						name: cast(room.name),
						count: cast(room.count),
						description: cast(room.description),
						images: images?.map((img) => img.asset.publicUrl) ?? [],
					})) ?? [],
				);
			}
		}, [hosting, setRooms]),
	);

	const handleDeleteImage = (roomIndex: number, imageIndex: number) => {
		const room = rooms[roomIndex];
		const image = room.images[imageIndex];
		if (image.startsWith("file")) {
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
						Toast.show({
							type: "success",
							text2: res.data.deleteHostingRoomImage.message,
						});
						deleteRoomImage(roomIndex, imageIndex);
						refetchHosting({ requestPolicy: "network-only" });
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
					Toast.show({
						type: "success",
						text2: res.data.deleteHostingRoom.message,
					});
					setActiveModalIndex(undefined);
					setDeleteModalIndex(undefined);
					refetchHosting({ requestPolicy: "network-only" });
					deleteRoom(activeIndex);
					setActiveIndex(0);
				}
			});
		}
	};

	const handleSaveHostingRoom = (
		index: number,
		{ images, ...rest }: RoomData,
	) => {
		if (!hosting?.id) return;
		saveRoom(rest.name, index);
		saveHostingRoomMutate({ input: { ...rest, hostingId: hosting?.id } }).then(
			(res) => {
				if (res.error) {
					handleError(res.error);
				}
				if (res.data) {
					Toast.show({
						type: "success",
						text1: "Success",
						text2: res.data.createOrUpdateHostingRoom.message,
					});
					const created = res.data.createOrUpdateHostingRoom.data;
					updateRoom(index, {
						id: created?.id,
						name: cast(created?.name),
						count: created?.count ?? 1,
						description: cast(created?.description),
					});
				}
			},
		);
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
