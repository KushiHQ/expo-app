import { ScrollView, View } from "react-native";
import TextPill from "./m-text-pill-pill";
import { HOSTING_VARIANTS } from "@/lib/types/enums/hostings";
import React from "react";
import { HOSTING_VARIANT_ICONS } from "@/lib/types/enums/hosting-icons";
import { Home } from "lucide-react-native";
import { cast } from "@/lib/types/utils";

type Props = {
	onSelect?: (variant: string) => void;
};

export const HotingVariantFilter: React.FC<Props> = ({ onSelect }) => {
	const [variant, setVariant] = React.useState("All");

	const handleSelect = (variant: string) => {
		setVariant(variant);
		onSelect?.(variant);
	};

	return (
		<ScrollView horizontal showsHorizontalScrollIndicator={false}>
			<View className="flex-row my-1 gap-2">
				{["All", ...HOSTING_VARIANTS].map((item, index) => {
					const Icon =
						HOSTING_VARIANT_ICONS[
						cast<keyof typeof HOSTING_VARIANT_ICONS>(item)
						] ?? Home;
					return (
						<TextPill
							icon={Icon}
							selected={variant === item}
							onSelect={handleSelect}
							key={index}
						>
							{item}
						</TextPill>
					);
				})}
			</View>
		</ScrollView>
	);
};
