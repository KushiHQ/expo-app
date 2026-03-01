import Button from "@/components/atoms/a-button";
import Carousel from "@/components/atoms/a-carousel";
import HostingLikeButton from "@/components/atoms/a-hosting-like-button";
import ThemedText from "@/components/atoms/a-themed-text";
import { MynauiStarSolid } from "@/components/icons/i-star";
import DetailsLayout from "@/components/layouts/details";
import HostingFacilities from "@/components/molecules/m-hosting-facilities";
import HostingGalleryComponent from "@/components/molecules/m-hosting-gallery";
import HostingHost from "@/components/molecules/m-hosting-host";
import HostingLocation from "@/components/molecules/m-hosting-location";
import HostingReviews from "@/components/organisms/o-hosting-reviews";
import { FALLBACK_IMAGE, PROPERTY_BLURHASH } from "@/lib/constants/images";
import { Fonts } from "@/lib/constants/theme";
import { useFallbackImages } from "@/lib/hooks/images";
import { useThemeColors } from "@/lib/hooks/use-theme-color";
import { useHostingQuery } from "@/lib/services/graphql/generated";
import { useReservationStore } from "@/lib/stores/reservation";
import { cast } from "@/lib/types/utils";
import { hexToRgba } from "@/lib/utils/colors";
import { handleError } from "@/lib/utils/error";
import { capitalize } from "@/lib/utils/text";
import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import { View } from "react-native";

export default function HostingDetails() {
	const router = useRouter();
	const { id } = useLocalSearchParams();
	const [{ data, error }] = useHostingQuery({
		variables: { hostingId: cast(id) },
	});
	const colors = useThemeColors();
	const { handleImageError, failedImages } = useFallbackImages();
	const { updateInput } = useReservationStore();

	const hosting = data?.hosting;

	React.useEffect(() => {
		if (error) handleError(error);
	}, [error]);

	return (
		<DetailsLayout
			title="Property Details"
			withShare
			footer={
				<View
					className="flex-row items-center p-6"
					style={{ backgroundColor: colors.background }}
				>
					<View className="gap-1">
						<ThemedText
							style={{ fontSize: 15, color: hexToRgba(colors.text, 0.6) }}
						>
							Total Payment
						</ThemedText>
						<View className="flex-row items-center gap-2">
							<ThemedText>
								₦{Number(hosting?.price).toLocaleString()}
							</ThemedText>
							<ThemedText style={{ color: hexToRgba(colors.text, 0.5) }}>
								{capitalize(hosting?.paymentInterval ?? "")}
							</ThemedText>
						</View>
					</View>
					<View className="flex-1 items-end">
						<Button
							onPress={() => {
								updateInput({ hostingId: cast(id) });
								router.push(
									`/hostings/${hosting?.id}/reservation/checkout-summary/`,
								);
							}}
							type="primary"
						>
							<ThemedText content="primary">Reserve Now</ThemedText>
						</Button>
					</View>
				</View>
			}
		>
			<View>
				<View style={{ height: 290 }} className="overflow-hidden rounded-xl">
					<Carousel autoplay style={{ height: "100%", width: "100%" }}>
						{(hosting?.rooms.map((r) => r.images).flat() ?? []).map(
							(img, index) => (
								<Image
									source={{
										uri: failedImages.has(index)
											? FALLBACK_IMAGE
											: img.asset.publicUrl,
									}}
									style={{ height: "100%", width: "100%" }}
									contentFit="cover"
									transition={300}
									placeholder={{ blurhash: PROPERTY_BLURHASH }}
									placeholderContentFit="cover"
									cachePolicy="memory-disk"
									priority="high"
									onError={() => handleImageError(index)}
									key={index}
								/>
							),
						)}
					</Carousel>
				</View>
				<View className="mt-8">
					<View className="gap-1.5">
						<View className="flex-row items-center justify-between">
							<ThemedText
								numberOfLines={1}
								ellipsizeMode="tail"
								type="title"
								className="max-w-[80%]"
								style={{ fontSize: 18 }}
							>
								{hosting?.title}
							</ThemedText>
							{hosting && (
								<HostingLikeButton
									saved={hosting?.saved ?? false}
									id={hosting?.id ?? ""}
								/>
							)}
						</View>
						<ThemedText style={{ fontSize: 14, fontFamily: Fonts.light }}>
							{hosting?.city}, {hosting?.state}
						</ThemedText>
						<View className="flex-row items-center gap-1">
							<MynauiStarSolid size={14} color={colors.accent} />
							<ThemedText style={{ fontSize: 14 }}>
								{hosting?.averageRating?.toFixed(2) ?? "0.0"}
							</ThemedText>
							<ThemedText style={{ fontSize: 12, fontFamily: Fonts.light }}>
								({hosting?.totalRatings ?? 0} Reviews)
							</ThemedText>
						</View>
					</View>
					<View
						className="mt-8 border-b pb-8"
						style={{ borderColor: hexToRgba(colors.text, 0.1) }}
					>
						<ThemedText style={{ fontFamily: Fonts.medium, fontSize: 18 }}>
							Description
						</ThemedText>
						<ThemedText
							className="mt-4"
							style={{
								fontSize: 14,
								fontFamily: Fonts.light,
								color: hexToRgba(colors.text, 0.7),
							}}
						>
							{hosting?.description}
						</ThemedText>
					</View>
				</View>
				<HostingHost hosting={hosting} />
				<HostingFacilities hosting={hosting} />
				<HostingGalleryComponent hosting={hosting} />
				<HostingReviews hosting={hosting} />
				<HostingLocation hosting={hosting} />
			</View>
		</DetailsLayout>
	);
}
