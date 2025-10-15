import ExpoMap from "@/components/atoms/a-map";
import { PhCompassRoseDuotone } from "@/components/icons/i-map";
import { useThemeColors } from "@/lib/hooks/use-theme-color";
import { hostingsAtom } from "@/lib/stores/hostings";
import { openGoogleMaps } from "@/lib/utils/urls";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useAtomValue } from "jotai";
import { Share2, X } from "lucide-react-native";
import { Pressable, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function HostingFullscreenMap() {
	const { id } = useLocalSearchParams();
	const hostings = useAtomValue(hostingsAtom);
	const hosting = hostings.find((hosting) => hosting.id === id);
	const insets = useSafeAreaInsets();
	const colors = useThemeColors();
	const router = useRouter();

	return (
		<View style={{ flex: 1 }}>
			<ExpoMap
				title={hosting?.title}
				coordinates={hosting?.location}
				zoom={6}
			/>
			<View
				className="p-4 px-8 flex-row items-center gap-4"
				style={{ position: "absolute", top: insets.top, right: insets.right }}
			>
				<Pressable
					className="h-8 w-8 items-center justify-center rounded-full"
					style={{ backgroundColor: colors.text }}
				>
					<Share2 color={colors.background} size={20} />
				</Pressable>
				{hosting?.location && (
					<Pressable
						onPress={() => openGoogleMaps(hosting.location)}
						className="w-8 h-8 rounded-full items-center justify-center"
						style={{ backgroundColor: colors.text }}
					>
						<PhCompassRoseDuotone size={24} color={colors.background} />
					</Pressable>
				)}
				<Pressable
					onPress={() => router.back()}
					className="h-8 w-8 items-center justify-center rounded-full"
					style={{ backgroundColor: colors.text }}
				>
					<X color={colors.background} size={20} />
				</Pressable>
			</View>
		</View>
	);
}
