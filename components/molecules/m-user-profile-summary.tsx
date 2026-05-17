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
import { getDefaultProfileImageUrl } from "@/lib/utils/urls";
import { useUser } from "@/lib/hooks/user";
import { UserType } from "@/lib/types/users";

type Props = {
	edit?: boolean;
	onPressAvatar?: () => void;
	avatarUri?: string;
};

const UserProfileSummary: React.FC<Props> = ({ edit, onPressAvatar, avatarUri }) => {
	const colors = useThemeColors();
	const { user } = useUser();

	return (
		<View className="items-center gap-3 flex-1 min-w-[40px]">
			<Pressable
				className="h-[78px] relative w-[78px] border-[2px]"
				style={{
					borderRadius: 999,
					borderColor: hexToRgba(colors.text, 0.7),
				}}
				onPress={edit ? onPressAvatar : undefined}
				disabled={!edit}
			>
				<Image
					source={{
						uri: avatarUri ?? user.user?.profile?.image?.publicUrl ?? getDefaultProfileImageUrl(user.user?.profile.fullName ?? ""),
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
					<View
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
					</View>
				)}
			</Pressable>
			<View className="items-center gap-1">
				<View className="flex-row items-center gap-2">
					<ThemedText style={{ fontFamily: Fonts.medium, fontSize: 12 }}>
						{user.userType === UserType.Guest ? "Guest" : "Host"}
					</ThemedText>
					<SolarMedalStarBold color={colors.accent} size={16} />
				</View>
				<ThemedText style={{ fontFamily: Fonts.bold, fontSize: 15 }}>
					{user.user?.profile.fullName}
				</ThemedText>
				<ThemedText style={{ fontSize: 11, color: hexToRgba(colors.text, 0.5) }}>
					ID: {user.user?.kushiId}
				</ThemedText>
			</View>
		</View>
	);
};

export default UserProfileSummary;
