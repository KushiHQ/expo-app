import Button from "@/components/atoms/a-button";
import ThemedText from "@/components/atoms/a-themed-text";
import { HeroiconsCamera } from "@/components/icons/i-camera";
import DetailsLayout from "@/components/layouts/details";
import HostingStepper from "@/components/molecules/m-hosting-stepper";
import SelectInput, {
	SelectOption,
} from "@/components/molecules/m-select-input";
import { FALLBACK_IMAGE, PROPERTY_BLURHASH } from "@/lib/constants/images";
import { useFallbackImages } from "@/lib/hooks/images";
import { useThemeColors } from "@/lib/hooks/use-theme-color";
import { galleryAtom } from "@/lib/stores/gallery";
import { hostingRoomsEditAtom } from "@/lib/stores/hostings";
import { Room, ROOM_KEYS } from "@/lib/types/enums/hostings";
import { hexToRgba } from "@/lib/utils/colors";
import { Image } from "expo-image";
import { useFocusEffect, useRouter } from "expo-router";
import { useAtom } from "jotai";
import { X } from "lucide-react-native";
import React from "react";
import { Pressable, View } from "react-native";

export default function NewHostingStep2() {
	const router = useRouter();
	const colors = useThemeColors();
	const [hostingEdit, setHostingEdit] = useAtom(hostingRoomsEditAtom);
	const [gallery, setGallery] = useAtom(galleryAtom);
	const { failedImages, handleImageError } = useFallbackImages();

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
		setHostingEdit((c) => ({ ...c, activeIndex: index }));
		setGallery(hostingEdit.rooms.at(index)?.images ?? []);
		router.push("/camera?redirect=/hostings/new/step-2");
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
		<DetailsLayout title="Hosting Photos" footer={<HostingStepper step={2} />}>
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
									options={ROOM_KEYS.map((v) => ({ label: Room[v], value: v }))}
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
							{hostingEdit.rooms[index] &&
								!(hostingEdit.rooms[index].images.length > 0) && (
									<View
										className="p-4 items-center rounded-xl"
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
								<View className="flex-row gap-2">
									{hostingEdit.rooms[index].images
										.slice(0, 4)
										.map((img, id) => (
											<View key={id} className="w-20 h-16 relative">
												<Image
													source={{
														uri: failedImages.has(id) ? FALLBACK_IMAGE : img,
													}}
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
													onError={() => handleImageError(id)}
												/>
												<Pressable
													onPress={() => handleDeleteRoomImage(index, id)}
													className="w-6 h-6 items-center justify-center bg-white rounded absolute top-0 right-0"
												>
													<X color="#000000" size={12} />
												</Pressable>
											</View>
										))}
								</View>
							)}
						</View>
					),
				)}
			</View>
		</DetailsLayout>
	);
}
