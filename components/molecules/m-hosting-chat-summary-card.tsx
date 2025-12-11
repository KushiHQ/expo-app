import { PROPERTY_BLURHASH } from "@/lib/constants/images";
import { useThemeColors } from "@/lib/hooks/use-theme-color";
import { Image } from "expo-image";
import React from "react";
import { Pressable, View } from "react-native";
import ThemedText from "../atoms/a-themed-text";
import { hexToRgba } from "@/lib/utils/colors";
import { Fonts } from "@/lib/constants/theme";
import { useRouter } from "expo-router";
import { HostingChatQuery } from "@/lib/services/graphql/generated";
import { capitalize } from "@/lib/utils/text";

type Props = {
	hosting?: HostingChatQuery["hostingChat"]["hosting"];
};

const HostingChatSummaryCard: React.FC<Props> = ({ hosting }) => {
	const router = useRouter();
	const colors = useThemeColors();

	return (
		<Pressable
			onPress={() => router.push(`/hostings/${hosting?.id}`)}
			className="flex-row justify-center gap-4 items-center p-6 rounded-xl"
			style={{ backgroundColor: hexToRgba(colors.text, 0.1) }}
		>
			<View
				className="max-w-[120px] border rounded-xl h-[90px] flex-1"
				style={{ borderColor: hexToRgba(colors.text, 0.6) }}
			>
				<Image
					source={{
						uri: hosting?.coverImage?.asset.publicUrl,
					}}
					style={{ height: "100%", width: "100%", borderRadius: 12 }}
					contentFit="cover"
					transition={300}
					placeholder={{ blurhash: PROPERTY_BLURHASH }}
					placeholderContentFit="cover"
					cachePolicy="memory-disk"
					priority="high"
				/>
			</View>
			<View
				className="flex-[1.5] max-w-[160px] rounded-xl border p-2 h-[90px] justify-between"
				style={{ borderColor: hexToRgba(colors.text, 0.6) }}
			>
				<ThemedText
					ellipsizeMode="tail"
					numberOfLines={1}
					style={{ fontSize: 14, fontFamily: Fonts.medium }}
				>
					{hosting?.title}
				</ThemedText>
				<ThemedText
					ellipsizeMode="tail"
					numberOfLines={1}
					style={{ color: hexToRgba(colors.text, 0.6), fontSize: 12 }}
				>
					{hosting?.landmarks ? `${hosting.landmarks}, ` : ""}
					{hosting?.street}, {hosting?.city}, {hosting?.state}
				</ThemedText>
				<ThemedText style={{ fontSize: 14, fontFamily: Fonts.medium }}>
					₦{Number(hosting?.price ?? "0").toLocaleString()}{" "}
					{capitalize(hosting?.paymentInterval ?? "")}
				</ThemedText>
			</View>
		</Pressable>
	);
};

export default HostingChatSummaryCard;
