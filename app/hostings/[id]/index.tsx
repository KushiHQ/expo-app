import Button from "@/components/atoms/a-button";
import Carousel from "@/components/atoms/a-carousel";
import { HostingDetailsSkeleton } from "@/components/molecules/m-hosting-card";
import { PROPERTY_BLURHASH } from "@/lib/constants/images";
import { Fonts } from "@/lib/constants/theme";
import { useThemeColors } from "@/lib/hooks/use-theme-color";
import {
	HostingKind,
	ListingType,
	PaymentInterval,
	useHostingQuery,
	useInitiateHostingChatMutation,
} from "@/lib/services/graphql/generated";
import HostingUnits from "@/components/organisms/o-hosting-units";
import { cast } from "@/lib/types/utils";
import { hexToRgba } from "@/lib/utils/colors";
import { handleError } from "@/lib/utils/error";
import { capitalize, slugify } from "@/lib/utils/text";
import { Image } from "expo-image";
import { useLocalSearchParams } from "expo-router";
import { useRouter } from "@/lib/hooks/use-router";
import { MessageSquare } from "lucide-react-native";
import React from "react";
import { Pressable, Share, View } from "react-native";
import { useBreakpoint } from "@/lib/hooks/use-breakpoint";
import { useUser } from "@/lib/hooks/user";
import Skeleton from "@/components/atoms/a-skeleton";
import DetailsLayout from "@/components/layouts/details";
import HostingLikeButton from "@/components/atoms/a-hosting-like-button";
import ThemedText from "@/components/atoms/a-themed-text";
import TruncatedText from "@/components/atoms/a-truncated-text";
import { MynauiStarSolid } from "@/components/icons/i-star";
import HostingHost from "@/components/molecules/m-hosting-host";
import HostingFacilities from "@/components/molecules/m-hosting-facilities";
import HostingGalleryComponent from "@/components/molecules/m-hosting-gallery";
import { getAssetResizeUrl } from "@/lib/utils/urls";
import HostingReviews from "@/components/organisms/o-hosting-reviews";
import HostingLocation from "@/components/molecules/m-hosting-location";
import AVerificationTierBadge from "@/components/atoms/a-verification-tier-badge";
import ListingTypeBadge from "@/components/atoms/a-listing-type-badge";

export default function HostingDetails() {
	const router = useRouter();
	const { id } = useLocalSearchParams();
	const [_, initiateChat] = useInitiateHostingChatMutation();
	const [{ data, error, fetching }] = useHostingQuery({
		variables: { hostingId: cast(id) },
		requestPolicy: "cache-and-network",
	});
	const colors = useThemeColors();
	const { isTablet } = useBreakpoint();

	const hosting = data?.hosting;
	const { user } = useUser();
	const isHost = !!hosting && hosting.host.user.id === user.user?.id;

	const handleShare = async () => {
		const slug = `${slugify(hosting?.title ?? "")}___${id}`;
		const base =
			process.env.EXPO_PUBLIC_SHARE_PROPERTY_URL ||
			"https://kushicorp.com/guest/<slug>";
		const shareUrl = base.replace("<slug>", slug);
		try {
			await Share.share({
				title: hosting?.title ?? undefined,
				message: `Check out this amazing property on Kushi: ${hosting?.title}\n\n${shareUrl}`,
				url: shareUrl,
			});
		} catch (error: any) {
			handleError(error);
		}
	};

	React.useEffect(() => {
		if (error) handleError(error);
	}, [error]);

	const handleInitiateChat = () => {
		if (hosting)
			initiateChat({ hostingId: hosting?.id }).then((res) => {
				if (res.error) {
					handleError(res.error);
				}
				if (res.data) {
					router.push(`/chats/${res.data.initiateHostingChat.id}`);
				}
			});
	};

	return (
		<DetailsLayout
			title="Property Details"
			withShare
			withSupport
			onShare={handleShare}
			footer={
				fetching ? (
					<View
						className="flex-row items-center gap-4 p-6"
						style={{ backgroundColor: colors.background }}
					>
						<View className="flex-1 gap-1">
							<Skeleton style={{ height: 14, width: 80, borderRadius: 4 }} />
							<Skeleton style={{ height: 20, width: 120, borderRadius: 4 }} />
						</View>
						<Skeleton style={{ height: 50, width: 140, borderRadius: 12 }} />
					</View>
				) : isHost ? (
					<View
						style={{
							backgroundColor: colors.background,
							paddingHorizontal: 16,
							paddingBottom: 32,
							paddingTop: 12,
							borderTopWidth: 1,
							borderTopColor: hexToRgba(colors.text, 0.045),
						}}
					>
						<Button
							type="primary"
							onPress={() =>
								router.push(`/hostings/form/onboarding?id=${hosting?.id}`)
							}
						>
							<ThemedText content="primary">Edit Listing</ThemedText>
						</Button>
					</View>
				) : hosting?.kind === HostingKind.Parent ? (
					<View
						style={{
							backgroundColor: colors.background,
							paddingHorizontal: 16,
							paddingBottom: 32,
							paddingTop: 12,
							borderTopWidth: 1,
							borderTopColor: hexToRgba(colors.text, 0.045),
						}}
					>
						<ThemedText
							style={{
								fontSize: 13,
								color: hexToRgba(colors.text, 0.6),
								textAlign: "center",
							}}
						>
							{hosting.childCount}{" "}
							{hosting.childCount === 1 ? "unit" : "units"} available — choose
							one above to apply.
						</ThemedText>
					</View>
				) : hosting?.listingType === ListingType.Sale ? (
					<View
						style={{
							backgroundColor: colors.background,
							paddingHorizontal: 16,
							paddingBottom: 32,
							paddingTop: 12,
							gap: 10,
							borderTopWidth: 1,
							borderTopColor: hexToRgba(colors.text, 0.045),
						}}
					>
						<View
							style={{
								backgroundColor: hexToRgba(colors.primary, 0.1),
								borderRadius: 14,
								padding: 14,
								gap: 6,
							}}
						>
							<ThemedText style={{ fontFamily: Fonts.semibold, fontSize: 13 }}>
								Sale — Coming Soon
							</ThemedText>
							<ThemedText
								style={{ fontSize: 12, color: hexToRgba(colors.text, 0.55) }}
							>
								Online purchase processing for sale listings isn’t available
								yet. Contact the host directly to arrange the sale.
							</ThemedText>
						</View>
						<View className="mt-4 flex-row justify-between gap-8">
							<View className="flex-1 gap-1">
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
										{hosting?.paymentInterval === PaymentInterval.OneTimePayment
											? ""
											: capitalize(hosting?.paymentInterval ?? "")}
									</ThemedText>
								</View>
							</View>
							<Button
								className="flex-1"
								type="primary"
								onPress={handleInitiateChat}
							>
								<View
									style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
								>
									<MessageSquare size={16} color="#fff" />
									<ThemedText content="primary">Message Host</ThemedText>
								</View>
							</Button>
						</View>
					</View>
				) : (
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
									{hosting?.paymentInterval === PaymentInterval.OneTimePayment
										? ""
										: capitalize(hosting?.paymentInterval ?? "")}
								</ThemedText>
							</View>
						</View>
						<View className="flex-1 items-end">
							<Button
								onPress={() => {
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
				)
			}
		>
			<View>
				{fetching ? (
					<HostingDetailsSkeleton />
				) : (
					<>
						<View
							style={{ height: isTablet ? 420 : 290 }}
							className="overflow-hidden rounded-xl"
						>
							<Carousel autoplay style={{ height: "100%", width: "100%" }}>
								{(hosting?.rooms.map((r) => r.images).flat() ?? []).map(
									(img, index) => (
										<Image
											source={{
												uri: img.asset?.id
													? getAssetResizeUrl(img.asset.id, 1280, 960)
													: img.asset?.publicUrl,
											}}
											style={{ height: "100%", width: "100%" }}
											contentFit="cover"
											transition={300}
											placeholder={{ blurhash: PROPERTY_BLURHASH }}
											placeholderContentFit="cover"
											cachePolicy="memory-disk"
											priority="high"
											recyclingKey={img.id}
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
									{hosting && !isHost && (
										<HostingLikeButton
											saved={hosting?.saved ?? false}
											id={hosting?.id ?? ""}
										/>
									)}
								</View>
								{hosting?.verification?.verificationTier && (
									<View className="mt-2">
										<AVerificationTierBadge
											tier={hosting.verification.verificationTier}
											tooltipDescription={
												hosting.verification.tierTooltip ?? undefined
											}
										/>
									</View>
								)}
								{isHost &&
									hosting &&
									!hosting.verification?.verificationTier && (
										<Pressable
											onPress={() =>
												router.push(
													`/hostings/form/verification/overview?id=${hosting.id}`,
												)
											}
											style={{
												marginTop: 8,
												flexDirection: "row",
												alignItems: "center",
												justifyContent: "space-between",
												gap: 10,
												borderRadius: 12,
												padding: 12,
												backgroundColor: hexToRgba(colors.primary, 0.08),
											}}
										>
											<View style={{ flex: 1 }}>
												<ThemedText
													style={{
														fontSize: 13,
														fontFamily: Fonts.medium,
														color: colors.primary,
													}}
												>
													Get this property verified
												</ThemedText>
												<ThemedText style={{ fontSize: 12, opacity: 0.6 }}>
													It’s already listed — verification adds a trust badge
													guests look for.
												</ThemedText>
											</View>
											<ThemedText
												style={{ fontSize: 18, color: colors.primary }}
											>
												›
											</ThemedText>
										</Pressable>
									)}
								<ThemedText style={{ fontSize: 14, fontFamily: Fonts.light }}>
									{hosting?.city}, {hosting?.state}
								</ThemedText>
								<View className="mt-2 flex-row">
									<ListingTypeBadge listingType={hosting?.listingType} />
								</View>
								{hosting?.parentId ? (
									<Pressable
										onPress={() =>
											router.push(`/hostings/${hosting.parentId}`)
										}
										style={{
											marginTop: 8,
											alignSelf: "flex-start",
											borderRadius: 999,
											paddingVertical: 6,
											paddingHorizontal: 12,
											backgroundColor: hexToRgba(colors.primary, 0.1),
										}}
									>
										<ThemedText
											style={{
												fontSize: 12,
												fontFamily: Fonts.medium,
												color: colors.primary,
											}}
										>
											Part of {hosting.parent?.title ?? "this property"} ›
										</ThemedText>
									</Pressable>
								) : null}
								<View className="flex-row items-center gap-1">
									<MynauiStarSolid size={14} color={colors.accent} />
									<ThemedText style={{ fontSize: 14 }}>
										{Number(hosting?.averageRating ?? "0").toFixed(1)}
									</ThemedText>
									<ThemedText style={{ fontSize: 12, fontFamily: Fonts.light }}>
										({Number(hosting?.totalRatings ?? "0").toFixed(1)} Reviews)
									</ThemedText>
								</View>
							</View>
							<View
								className="mt-8 pb-8"
								style={{ borderColor: hexToRgba(colors.text, 0.1) }}
							>
								<ThemedText style={{ fontFamily: Fonts.medium, fontSize: 18 }}>
									Description
								</ThemedText>
								<TruncatedText
									className="mt-4"
									text={hosting?.description ?? ""}
									style={{
										fontSize: 14,
										fontFamily: Fonts.light,
										color: hexToRgba(colors.text, 0.7),
									}}
								/>
							</View>
						</View>
						<HostingHost hosting={hosting} isHost={isHost} />
						<HostingFacilities hosting={hosting} />
						<HostingUnits hosting={hosting} isHost={isHost} />

						<HostingGalleryComponent hosting={hosting} />
						<HostingReviews hosting={hosting} />
						<HostingLocation hosting={hosting} />
					</>
				)}
			</View>
		</DetailsLayout>
	);
}
