import { ScrollView, View } from "react-native";
import TextPill from "./m-text-pill-pill";
import { PROPERTY_TYPE } from "@/lib/types/enums/hostings";
import React from "react";
import { PROPERTY_TYPE_ICONS } from "@/lib/types/enums/hosting-icons";
import { Home } from "lucide-react-native";
import { cast } from "@/lib/types/utils";

type Props = {
	value?: string;
	onSelect?: (variant: string) => void;
};

export const HotingVariantFilter: React.FC<Props> = ({
	onSelect,
	value = "All",
}) => {
	const handleSelect = (variant: string) => {
		onSelect?.(variant);
	};

	return (
		<ScrollView horizontal showsHorizontalScrollIndicator={false}>
			<View className="flex-row my-1 gap-2">
				{["All", ...PROPERTY_TYPE].map((item, index) => {
					const Icon =
						PROPERTY_TYPE_ICONS[cast<keyof typeof PROPERTY_TYPE_ICONS>(item)] ??
						Home;
					return (
						<TextPill
							icon={Icon}
							selected={value === item}
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
