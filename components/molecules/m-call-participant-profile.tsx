import { useActiveCall } from "@/lib/hooks/call";
import { useThemeColors } from "@/lib/hooks/use-theme-color";
import { Image } from "expo-image";
import React from "react";
import { View } from "react-native";
import ThemedText from "../atoms/a-themed-text";
import { getDefaultProfileImageUrl } from "@/lib/utils/urls";
import { PROPERTY_BLURHASH } from "@/lib/constants/images";
import { Fonts } from "@/lib/constants/theme";
import { hexToRgba } from "@/lib/utils/colors";

type Props = {
	withDuration?: boolean;
	callData?: ReturnType<typeof useActiveCall>;
};

const CallParticipantProfile: React.FC<Props> = ({
	callData,
	withDuration,
}) => {
	const colors = useThemeColors();

	return (
		<View className="flex-1 items-center gap-4 pb-28 justify-center">
			<View
				className="h-[160px] w-[160px] border-[6px]"
				style={{
					borderRadius: 999,
					borderColor: colors.primary,
				}}
			>
				<Image
					source={getDefaultProfileImageUrl(
						callData?.recipient?.profile.fullName ?? "",
					)}
					style={{
						height: "100%",
						width: "100%",
						borderRadius: 999,
					}}
					contentFit="cover"
					transition={300}
					placeholder={{ blurhash: PROPERTY_BLURHASH }}
					placeholderContentFit="cover"
					cachePolicy="memory-disk"
					priority="high"
				/>
			</View>
			<View className="items-center gap-1">
				<ThemedText
					style={{
						fontSize: 18,
						color: "white",
						fontFamily: Fonts.medium,
					}}
				>
					{callData?.isRinging || !callData
						? !callData || callData.isCaller
							? "Calling..."
							: "Incoming Call"
						: withDuration
							? callData?.callDuration
							: ""}
				</ThemedText>
				<ThemedText
					style={{
						fontSize: 14,
						color: hexToRgba("#ffffff", 0.6),
					}}
				>
					{callData?.recipient?.profile.fullName}
				</ThemedText>
			</View>
		</View>
	);
};

export default CallParticipantProfile;
