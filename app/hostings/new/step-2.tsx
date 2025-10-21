import Button from "@/components/atoms/a-button";
import ThemedText from "@/components/atoms/a-themed-text";
import { HeroiconsCamera } from "@/components/icons/i-camera";
import DetailsLayout from "@/components/layouts/details";
import HostingStepper from "@/components/molecules/m-hosting-stepper";
import SelectInput, {
	SelectOption,
} from "@/components/molecules/m-select-input";
import { useThemeColors } from "@/lib/hooks/use-theme-color";
import { Room, ROOM_KEYS } from "@/lib/types/enums/hostings";
import { hexToRgba } from "@/lib/utils/colors";
import { useRouter } from "expo-router";
import React from "react";
import { View } from "react-native";

type RoomData = {
	room: keyof typeof Room;
	images: string[];
};

export default function NewHostingStep2() {
	const router = useRouter();
	const colors = useThemeColors();
	const [rooms, setRooms] = React.useState<RoomData[]>([]);

	const handleSelect = (value: keyof typeof Room, index: number) => {
		setRooms((c) => {
			const current = [...c];
			if (current[index]) {
				current[index].room = value;
			} else {
				current[index] = { room: value, images: [] };
			}

			return current;
		});
	};

	return (
		<DetailsLayout title="Hosting Photos" footer={<HostingStepper step={2} />}>
			<View className="mt-8 gap-4">
				{Array.from({ length: rooms.length + 1 }).map((_, index) => (
					<View key={index} className="gap-2">
						<View className="flex-row items-center gap-2">
							<SelectInput
								focused
								value={rooms[index] ? Room[rooms[index].room] : undefined}
								label="Room"
								placeholder="Select room or exterior to add image"
								onSelect={(v) => handleSelect(v.value, index)}
								options={ROOM_KEYS.map((v) => ({ label: Room[v], value: v }))}
								renderItem={SelectOption}
							/>
							<Button
								onPress={() => router.push("/camera")}
								disabled={!rooms[index]}
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
						{rooms[index] && !rooms[index].images.length && (
							<View
								className="p-4 items-center rounded-xl"
								style={{ backgroundColor: hexToRgba(colors.text, 0.1) }}
							>
								<ThemedText
									style={{ color: hexToRgba(colors.text, 0.8), fontSize: 12 }}
								>
									No Images Yet
								</ThemedText>
							</View>
						)}
					</View>
				))}
			</View>
		</DetailsLayout>
	);
}
