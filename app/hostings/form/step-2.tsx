import Button from "@/components/atoms/a-button";
import FloatingLabelInput from "@/components/atoms/a-floating-label-input";
import HostingRoomImage from "@/components/atoms/a-hosting-room-image";
import LoadingModal from "@/components/atoms/a-loading-modal";
import ThemedText from "@/components/atoms/a-themed-text";
import { HeroiconsCamera } from "@/components/icons/i-camera";
import { FluentContentViewGallery28Regular } from "@/components/icons/i-gallery";
import DetailsLayout from "@/components/layouts/details";
import HostingStepper from "@/components/molecules/m-hosting-stepper";
import ThemedModal from "@/components/molecules/m-modal";
import SelectInput, {
	SelectOption,
} from "@/components/molecules/m-select-input";
import { FALLBACK_IMAGE, PROPERTY_BLURHASH } from "@/lib/constants/images";
import { Fonts } from "@/lib/constants/theme";
import { useCameraScreen } from "@/lib/hooks/camera";
import { useHostingForm } from "@/lib/hooks/hosting-form";
import { useFallbackImages } from "@/lib/hooks/images";
import { useThemeColors } from "@/lib/hooks/use-theme-color";
import {
	CreateHostingRoomImageMutation,
	CreateHostingRoomImageMutationVariables,
	useCreateOrUpdateHostingRoomMutation,
	useDeleteHostingRoomImageMutation,
	useDeleteHostingRoomMutation,
} from "@/lib/services/graphql/generated";
import { CREATE_UPDATE_HOSTING_ROOM_IMAGE } from "@/lib/services/graphql/requests/mutations/hostings";
import { formMutation } from "@/lib/services/graphql/utils/fetch";
import { useGalleryStore } from "@/lib/stores/gallery";
import { RoomData, useHostingRoomsStore } from "@/lib/stores/hostings";
import { Room, ROOM_KEYS } from "@/lib/types/enums/hostings";
import { cast } from "@/lib/types/utils";
import { hexToRgba } from "@/lib/utils/colors";
import { handleError } from "@/lib/utils/error";
import { generateRNFile } from "@/lib/utils/file";
import { Image } from "expo-image";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { CircleQuestionMark } from "lucide-react-native";
import React from "react";
import { View } from "react-native";
import Toast from "react-native-toast-message";

export default function NewHostingStep2() {
	const router = useRouter();
	const colors = useThemeColors();
	const { id } = useLocalSearchParams();
	const { gallery, clearGallery } = useGalleryStore();
	const [activeModalIndex, setActiveModalIndex] = React.useState<number>();
	const [deleteModalIndex, setDeleteModalIndex] = React.useState<number>();
	const { redirect } = useCameraScreen();
	const { failedImages, handleImageError } = useFallbackImages();
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
	} = useHostingForm(id);

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
		}, [gallery]),
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
		}, [hosting]),
	);

	const handleDeleteImage = (roomIndex: number, imageIndex: number) => {
		const room = rooms[roomIndex];
		const image = room.images[imageIndex];
		if (image.startsWith("file")) {
			deleteRoomImage(roomIndex, imageIndex);
		} else {
			const imageId = hosting?.rooms
				.find((r) => r.id == room.id)
				?.images.find((i) => i.asset.publicUrl == image)?.id;
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

	return (
		<>
			<DetailsLayout
				title="Hosting"
				footer={
					<HostingStepper
						disabled={!rooms.length}
						step={2}
						onPress={() => {
							router.push(`/hostings/form/step-3?id=${hosting?.id}`);
						}}
					/>
				}
			>
				<View className="mt-2 flex-1 gap-4">
					<ThemedText
						style={{ fontSize: 12, color: hexToRgba(colors.text, 0.6) }}
					>
						<CircleQuestionMark color={hexToRgba(colors.text, 0.7)} size={12} />
						{"  "}
						Show off your property! 📸 Select a Room (like 'Bedroom' or
						'Kitchen'), then tap the camera icon to upload all the Photos for
						that specific space. Add as many room categories as you need, and
						tap 'Details' to specify the Count of each room.
					</ThemedText>
					{Array.from({ length: rooms.length + 1 }).map((_, index) => (
						<View key={index} className="gap-2">
							<View className="flex-row items-center gap-2">
								<SelectInput
									focused
									value={rooms[index] ? Room[rooms[index].name] : undefined}
									label="Room"
									placeholder="Select room or exterior to add image"
									onSelect={(v) =>
										handleSaveHostingRoom(index, {
											name: v.value,
											images: [],
											count: 1,
										})
									}
									options={ROOM_KEYS.map((v) => ({
										label: Room[v],
										value: v,
									}))}
									renderItem={SelectOption}
								/>
								<Button
									onPress={() => handleRoomImageEdit(index)}
									disabled={!rooms[index] || hostingRoomSaving}
									variant="outline"
									className="p-6"
									style={{
										borderColor: hexToRgba(colors.text, 0.25),
										borderRadius: 12,
									}}
								>
									<HeroiconsCamera color={colors.text} size={20} />
								</Button>
							</View>
							<View className="flex-row gap-2">
								{rooms[index] && !(rooms[index].images.length > 0) && (
									<View
										className="p-4 items-center justify-center flex-1 rounded-xl"
										style={{ backgroundColor: hexToRgba(colors.text, 0.1) }}
									>
										<ThemedText
											style={{
												color: hexToRgba(colors.text, 0.8),
												fontSize: 12,
											}}
										>
											No Images Yet
										</ThemedText>
									</View>
								)}
								{rooms[index]?.images.length > 0 && (
									<View className="flex-row flex-1 gap-2">
										{rooms[index].images.slice(0, 4).map((img, id) => (
											<HostingRoomImage
												src={img}
												key={id}
												imageIndex={id}
												roomIndex={index}
												onDeleteRoomImage={handleDeleteImage}
											/>
										))}
									</View>
								)}
								{rooms[index] && (
									<>
										<Button
											variant="outline"
											disabled={hostingRoomSaving}
											loading={hostingRoomSaving}
											type="shade"
											className="py-0.5 pt-2.5 px-3"
											onPress={() => setActiveModalIndex(index)}
										>
											<View className="items-center justify-center">
												<FluentContentViewGallery28Regular
													color={colors.text}
													size={14}
												/>
												<ThemedText style={{ fontSize: 10 }}>
													Details
												</ThemedText>
											</View>
										</Button>
									</>
								)}
							</View>
						</View>
					))}
				</View>
			</DetailsLayout>
			<ThemedModal
				visible={activeModalIndex !== undefined}
				onClose={() => setActiveModalIndex(undefined)}
			>
				<View className="gap-4">
					{activeModalIndex !== undefined && rooms[activeModalIndex] && (
						<>
							<ThemedText style={{ fontFamily: Fonts.medium }}>
								{rooms[activeModalIndex].name}
							</ThemedText>
							<View>
								{rooms[activeModalIndex] &&
									!(rooms[activeModalIndex].images.length > 0) && (
										<View
											className="p-4 items-center justify-center flex-1 rounded-xl"
											style={{ backgroundColor: hexToRgba(colors.text, 0.1) }}
										>
											<ThemedText
												style={{
													color: hexToRgba(colors.text, 0.8),
													fontSize: 12,
												}}
											>
												No Images Yet
											</ThemedText>
										</View>
									)}
								{rooms[activeModalIndex]?.images.length > 0 && (
									<View className="flex-row flex-1 gap-2">
										{rooms[activeModalIndex].images
											.slice(0, 4)
											.map((img, id) => (
												<HostingRoomImage
													src={img}
													key={id}
													imageIndex={id}
													roomIndex={activeModalIndex}
													onDeleteRoomImage={deleteRoomImage}
												/>
											))}
									</View>
								)}
								<View className="mt-8">
									<View className="flex-row gap-4 mb-4">
										<View className="flex-1">
											<FloatingLabelInput
												focused
												value={rooms.at(activeIndex)?.count?.toString()}
												label="Count"
												inputMode="numeric"
												onChangeText={(v) =>
													updateActiveRoom({ count: Number(v) })
												}
												placeholder="How many of this room are there"
											/>
										</View>
										<Button
											onPress={() => handleRoomImageEdit(activeModalIndex)}
											style={{ backgroundColor: colors.text, borderRadius: 10 }}
											className="py-3"
										>
											<ThemedText style={{ color: colors.background }}>
												Add More Photos
											</ThemedText>
										</Button>
									</View>
									<FloatingLabelInput
										focused
										multiline
										value={rooms.at(activeIndex)?.description}
										label="Description (Optional)"
										placeholder="Provide brief description of these images"
										containerStyle={{ minHeight: 80 }}
										numberOfLines={6}
										onChangeText={(description) =>
											updateActiveRoom({ description })
										}
									/>
								</View>
								<View className="flex-row gap-2 mt-4">
									<Button
										className="flex-1"
										type="error"
										disabled={hostingRoomSaving}
										onPress={() => setDeleteModalIndex(activeIndex)}
									>
										<ThemedText content="error">Delete</ThemedText>
									</Button>
									<Button
										disabled={hostingRoomSaving}
										loading={hostingRoomSaving}
										className="flex-1"
										type="text"
										onPress={() => {
											handleSaveHostingRoom(activeIndex, rooms[activeIndex]);
											setActiveModalIndex(undefined);
										}}
									>
										<ThemedText content="text">Save</ThemedText>
									</Button>
								</View>
							</View>
						</>
					)}
				</View>
			</ThemedModal>
			<ThemedModal
				visible={deleteModalIndex !== undefined}
				onClose={() => setDeleteModalIndex(undefined)}
			>
				<View>
					{deleteModalIndex !== undefined && (
						<View className="gap-8">
							<ThemedText>
								Are you want to delete this room
								{rooms[deleteModalIndex].images.length
									? "and all it's images"
									: ""}
								?
							</ThemedText>
							<View className="items-center gap-4">
								<View className="w-32 h-28">
									<Image
										source={
											rooms[deleteModalIndex].images.length
												? {
													uri: failedImages.has(0)
														? FALLBACK_IMAGE
														: rooms[deleteModalIndex].images[0],
												}
												: require("@/assets/images/room-image.jpg")
										}
										style={{
											height: "100%",
											width: "100%",
											borderRadius: 8,
										}}
										contentFit="cover"
										transition={300}
										placeholder={{ blurhash: PROPERTY_BLURHASH }}
										placeholderContentFit="cover"
										cachePolicy="memory-disk"
										priority="high"
										onError={() => handleImageError(0)}
									/>
								</View>
								<ThemedText
									style={{ fontFamily: Fonts.semibold, fontSize: 20 }}
								>
									{rooms[deleteModalIndex].name}
								</ThemedText>
							</View>
							<View className="flex-row items-center gap-2">
								<Button
									type="shade"
									className="flex-1"
									onPress={() => setDeleteModalIndex(undefined)}
								>
									<ThemedText content="shade">Cancel</ThemedText>
								</Button>
								<Button
									type="error"
									className="flex-1"
									onPress={handleDeleteActiveRoom}
								>
									<ThemedText content="error">Delete</ThemedText>
								</Button>
							</View>
						</View>
					)}
				</View>
			</ThemedModal>
			<LoadingModal visible={loading} />
		</>
	);
}
