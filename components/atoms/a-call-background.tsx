import { hexToRgba } from "@/lib/utils/colors";
import { ImageBackground } from "expo-image";
import React from "react";
import { Dimensions, StyleSheet, View } from "react-native";
import WaveRectangle from "../vectors/v-wave-rectangle";

type Props = {
	children?: React.ReactNode;
};

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const CallBackground: React.FC<Props> = ({ children }) => {
	return (
		<ImageBackground
			source={require("@/assets/images/house-bg.png")}
			style={styles.fullScreen}
			contentFit="cover"
		>
			<View
				className="flex-1"
				style={{ backgroundColor: hexToRgba("#003c9b", 0.9) }}
			>
				<View
					className="flex-1 relative z-0"
					style={{ backgroundColor: hexToRgba("#ffffff", 0.15) }}
				>
					<View className="absolute bottom-0 opacity-[0.55] right-0 justify-end items-center left-0">
						<WaveRectangle
							width={SCREEN_WIDTH + 100}
							height={500}
							color="#003793"
						/>
					</View>
					{children}
				</View>
			</View>
		</ImageBackground>
	);
};

export default CallBackground;

const styles = StyleSheet.create({
	fullScreen: {
		flex: 1,
		width: "100%",
		height: "100%",
	},
});
