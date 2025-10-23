import Button from "@/components/atoms/a-button";
import FloatingLabelInput from "@/components/atoms/a-floating-label-input";
import HostingRoomImage from "@/components/atoms/a-hosting-room-image";
import ThemedText from "@/components/atoms/a-themed-text";
import { HeroiconsCamera } from "@/components/icons/i-camera";
import { FluentContentViewGallery28Regular } from "@/components/icons/i-gallery";
import DetailsLayout from "@/components/layouts/details";
import HostingStepper from "@/components/molecules/m-hosting-stepper";
import ThemedModal from "@/components/molecules/m-modal";
import SelectInput, {
	SelectOption,
} from "@/components/molecules/m-select-input";
import { Fonts } from "@/lib/constants/theme";
import { useThemeColors } from "@/lib/hooks/use-theme-color";
import { galleryAtom } from "@/lib/stores/gallery";
import { hostingRoomsEditAtom } from "@/lib/stores/hostings";
import { Room, ROOM_KEYS } from "@/lib/types/enums/hostings";
import { hexToRgba } from "@/lib/utils/colors";
import { useFocusEffect, useRouter } from "expo-router";
import { useAtom } from "jotai";
import React from "react";
import { View } from "react-native";

export default function NewHostingStep2() {
	const router = useRouter();
	const colors = useThemeColors();
	const [hostingEdit, setHostingEdit] = useAtom(hostingRoomsEditAtom);
	const [gallery, setGallery] = useAtom(galleryAtom);
	const [activeModalIndex, setActiveModalIndex] = React.useState<number>();

	useFocusEffect(
		React.useCallback(() => {
			if (gallery.length > 0) {
				setHostingEdit((c) => {
					const newRooms = c.rooms.map((room, index) => {
						if (index === c.activeIndex) {
							return { ...room, images: gallery };
						}
						return room;
					});

					return {
						...c,
						rooms: newRooms,
					};
				});

				setGallery([]);
			}
		}, [gallery]),
	);

	const handleSelect = (value: keyof typeof Room, index: number) => {
		setHostingEdit((c) => {
			const current = [...c.rooms];
			if (current[index]) {
				current[index].room = value;
			} else {
				current[index] = { room: value, images: [] };
			}

			return {
				...c,
				rooms: current,
			};
		});
	};

	const handleRoomImageEdit = (index: number) => {
		const images = hostingEdit.rooms.at(index)?.images ?? [];
		setGallery(images);
		setHostingEdit((c) => ({ ...c, activeIndex: index }));
		router.push("/camera?redirect=/hostings/form/step-2");
	};

	const handleDeleteRoomImage = (roomIndex: number, imageIndex: number) => {
		setHostingEdit((c) => {
			const newRooms = c.rooms.map((room, rIndex) => {
				if (rIndex !== roomIndex) {
					return room;
				}

				const newImages = room.images.filter(
					(_, iIndex) => iIndex !== imageIndex,
				);

				return { ...room, images: newImages };
			});

			return {
				...c,
				rooms: newRooms,
			};
		});
	};

	return (
		<>
			<DetailsLayout title="Hosting" footer={<HostingStepper step={2} />}>
				<View className="mt-8 gap-4">
					{Array.from({ length: hostingEdit.rooms.length + 1 }).map(
						(_, index) => (
							<View key={index} className="gap-2">
								<View className="flex-row items-center gap-2">
									<SelectInput
										focused
										value={
											hostingEdit.rooms[index]
												? Room[hostingEdit.rooms[index].room]
												: undefined
										}
										label="Room"
										placeholder="Select room or exterior to add image"
										onSelect={(v) => handleSelect(v.value, index)}
										options={ROOM_KEYS.map((v) => ({
											label: Room[v],
											value: v,
										}))}
										renderItem={SelectOption}
									/>
									<Button
										onPress={() => handleRoomImageEdit(index)}
										disabled={!hostingEdit.rooms[index]}
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
									{hostingEdit.rooms[index] &&
										!(hostingEdit.rooms[index].images.length > 0) && (
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
									{hostingEdit.rooms[index]?.images.length > 0 && (
										<View className="flex-row flex-1 gap-2">
											{hostingEdit.rooms[index].images
												.slice(0, 4)
												.map((img, id) => (
													<HostingRoomImage
														src={img}
														key={id}
														imageIndex={id}
														roomIndex={index}
														onDeleteRoomImage={handleDeleteRoomImage}
													/>
												))}
										</View>
									)}
									{hostingEdit.rooms[index] && (
										<Button
											variant="outline"
											type="shade"
											className="py-3 px-3"
											onPress={() => setActiveModalIndex(index)}
										>
											<View className="items-center justify-center">
												<FluentContentViewGallery28Regular
													color={colors.text}
													size={12}
												/>
												<ThemedText style={{ fontSize: 12 }}>
													Details
												</ThemedText>
											</View>
										</Button>
									)}
								</View>
							</View>
						),
					)}
				</View>
			</DetailsLayout>
			<ThemedModal
				visible={activeModalIndex !== undefined}
				onClose={() => setActiveModalIndex(undefined)}
			>
				<View className="gap-4">
					<ThemedText style={{ fontFamily: Fonts.medium }}>
						Living Room
					</ThemedText>
					{activeModalIndex !== undefined && (
						<View>
							{hostingEdit.rooms[activeModalIndex] &&
								!(hostingEdit.rooms[activeModalIndex].images.length > 0) && (
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
							{hostingEdit.rooms[activeModalIndex]?.images.length > 0 && (
								<View className="flex-row flex-1 gap-2">
									{hostingEdit.rooms[activeModalIndex].images
										.slice(0, 4)
										.map((img, id) => (
											<HostingRoomImage
												src={img}
												key={id}
												imageIndex={id}
												roomIndex={activeModalIndex}
												onDeleteRoomImage={handleDeleteRoomImage}
											/>
										))}
								</View>
							)}
							<View className="mt-8">
								<View className="flex-row gap-4 mb-4">
									<View className="flex-1">
										<FloatingLabelInput
											focused
											label="Count"
											inputMode="numeric"
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
									label="Description (Optional)"
									placeholder="Provide brief description of these images"
									containerStyle={{ minHeight: 80 }}
									numberOfLines={6}
								/>
							</View>
						</View>
					)}
				</View>
			</ThemedModal>
		</>
	);
}
