import React, { FC, ReactNode, useState, useRef, useEffect } from "react";
import {
	ScrollView,
	Dimensions,
	StyleSheet,
	NativeSyntheticEvent,
	NativeScrollEvent,
	View,
	StyleProp,
	ViewStyle,
} from "react-native";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

interface CarouselProps {
	children: ReactNode[];
	autoplay?: boolean;
	interval?: number;
	style?: StyleProp<ViewStyle>;
	itemWidth?: number;
}

const Carousel: FC<CarouselProps> = ({
	children,
	autoplay = false,
	interval = 3000,
	style,
	itemWidth,
}) => {
	const [activeSlide, setActiveSlide] = useState(0);
	const scrollViewRef = useRef<ScrollView>(null);
	const intervalRef = useRef<number | null>(null);

	const totalSlides = React.Children.count(children);
	const carouselWidth = itemWidth || SCREEN_WIDTH;

	const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
		const slide = Math.round(event.nativeEvent.contentOffset.x / carouselWidth);
		if (slide !== activeSlide) {
			setActiveSlide(slide);
		}
	};

	const startAutoplay = () => {
		if (totalSlides <= 1) return;

		if (intervalRef.current) {
			clearInterval(intervalRef.current);
		}

		intervalRef.current = setInterval(() => {
			setActiveSlide((prevSlide) => {
				const nextSlide = (prevSlide + 1) % totalSlides;
				scrollViewRef.current?.scrollTo({
					x: nextSlide * carouselWidth,
					animated: true,
				});
				return nextSlide;
			});
		}, interval);
	};

	const stopAutoplay = () => {
		if (intervalRef.current) {
			clearInterval(intervalRef.current);
		}
	};

	useEffect(() => {
		if (autoplay) {
			startAutoplay();
		} else {
			stopAutoplay();
		}
		return () => stopAutoplay();
	}, [autoplay, totalSlides, interval]);

	return (
		<View style={style}>
			<ScrollView
				ref={scrollViewRef}
				horizontal
				pagingEnabled
				showsHorizontalScrollIndicator={false}
				onScroll={handleScroll}
				scrollEventThrottle={16}
				onMomentumScrollBegin={stopAutoplay}
				onMomentumScrollEnd={startAutoplay}
				style={styles.carouselContainer}
				contentContainerStyle={styles.contentContainer}
				snapToAlignment="start"
				decelerationRate="fast"
			>
				{React.Children.map(children, (child) => (
					<View style={{ width: carouselWidth, height: "100%" }}>{child}</View>
				))}
			</ScrollView>
		</View>
	);
};

const styles = StyleSheet.create({
	carouselContainer: {},
	contentContainer: {
		justifyContent: "flex-start",
		alignItems: "center", // optional, helps with vertical alignment
		// This can be used to add some padding on the left if needed
		// paddingLeft: 10,
	},
});

export default Carousel;
