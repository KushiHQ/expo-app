import { PROPERTY_BLURHASH } from "@/lib/constants/images";
import { useThemeColors } from "@/lib/hooks/use-theme-color";
import { hexToRgba } from "@/lib/utils/colors";
import { Image } from "expo-image";
import { Pressable, View } from "react-native";
import { VaadinPaintbrush } from "../icons/i-brush";
import ThemedText from "../atoms/a-themed-text";
import { SolarMedalStarBold } from "../icons/i-medal";
import { Fonts } from "@/lib/constants/theme";
import React from "react";
import { getImagePlaceholderUrl } from "@/lib/utils/urls";
import { useUser } from "@/lib/hooks/user";
import { capitalize } from "@/lib/utils/text";
import { UserType } from "@/lib/types/users";

type Props = {
	edit?: boolean;
};

const UserProfileSummary: React.FC<Props> = ({ edit }) => {
	const colors = useThemeColors();
	const { user } = useUser();

	return (
		<View className="items-center gap-3 flex-1">
			<View
				className="h-[78px] relative w-[78px] border-[2px]"
				style={{
					borderRadius: 999,
					borderColor: hexToRgba(colors.text, 0.7),
				}}
			>
				<Image
					source={{
						uri: getImagePlaceholderUrl(user.user?.profile.gender),
					}}
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
				{edit && (
					<Pressable
						className="w-[18px] h-[18px] items-center justify-center rounded-full absolute -bottom-2.5 right-1/2"
						style={{
							backgroundColor: colors.shade,
							transform: [
								{
									translateX: "50%",
								},
							],
						}}
					>
						<VaadinPaintbrush color={colors["shade-content"]} size={9} />
					</Pressable>
				)}
			</View>
			<View className="items-center gap-1">
				<View className="flex-row items-center gap-2">
					<ThemedText style={{ fontFamily: Fonts.medium, fontSize: 12 }}>
						{capitalize(String(user.userType ?? UserType.Guest))}
					</ThemedText>
					<SolarMedalStarBold color={colors.accent} size={16} />
				</View>
				<ThemedText style={{ fontFamily: Fonts.bold, fontSize: 15 }}>
					{user.user?.profile.fullName}
				</ThemedText>
			</View>
		</View>
	);
};

export default UserProfileSummary;
