import { View } from "react-native";
import { SelectionDetails } from "./m-select-input";
import React from "react";
import { Image } from "expo-image";
import { useFallbackImages } from "@/lib/hooks/images";
import { useThemeColors } from "@/lib/hooks/use-theme-color";
import { PROPERTY_BLURHASH } from "@/lib/constants/images";
import ThemedText from "../atoms/a-themed-text";
import { HostPaymentDetailsQuery } from "@/lib/services/graphql/generated";
import { hexToRgba } from "@/lib/utils/colors";
import Checkbox from "../atoms/a-checkbox";

type Props = HostPaymentDetailsQuery["hostPaymentDetails"][number] &
	SelectionDetails;

const PaymentDetailsSelectOption: React.FC<Props> = ({
	selected,
	...details
}) => {
	const colors = useThemeColors();
	const { failedImages, handleImageError } = useFallbackImages();
	const image = details.bankDetails?.image
		? details.bankDetails.image
		: "https://png.pngtree.com/png-clipart/20190619/original/pngtree-concept-banking-logo-png-image_4017929.jpg";

	return (
		<View className="flex-row items-center justify-between">
			<View className="flex-row items-center gap-4">
				<View
					className="h-[36px] w-[36px] border"
					style={{
						borderRadius: 999,
						borderColor: hexToRgba(colors.primary, 0.5),
					}}
				>
					<Image
						source={{
							uri: failedImages.has(0)
								? "https://png.pngtree.com/png-clipart/20190619/original/pngtree-concept-banking-logo-png-image_4017929.jpg"
								: image,
						}}
						style={{
							height: "100%",
							width: "100%",
							borderRadius: 999,
						}}
						contentFit="contain"
						transition={300}
						placeholder={{ blurhash: PROPERTY_BLURHASH }}
						placeholderContentFit="cover"
						cachePolicy="memory-disk"
						priority="high"
						onError={() => handleImageError(0)}
					/>
				</View>
				<View>
					<ThemedText style={{ fontSize: 14 }}>
						{details.accountName ?? "Account Name"}
					</ThemedText>
					<ThemedText style={{ fontSize: 12 }}>
						{details.accountNumber} {details.bankDetails?.name}
					</ThemedText>
				</View>
			</View>
			<Checkbox
				color={selected ? colors.primary : hexToRgba(colors.text, 0.6)}
				checked={selected}
			/>
		</View>
	);
};

export default PaymentDetailsSelectOption;
