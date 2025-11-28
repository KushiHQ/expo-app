import { FALLBACK_IMAGE, PROPERTY_BLURHASH } from "@/lib/constants/images";
import { useFallbackImages } from "@/lib/hooks/images";
import { useThemeColors } from "@/lib/hooks/use-theme-color";
import { Image } from "expo-image";
import React from "react";
import { Pressable, View } from "react-native";
import ThemedText from "../atoms/a-themed-text";
import { Fonts } from "@/lib/constants/theme";
import { hexToRgba } from "@/lib/utils/colors";
import Button from "../atoms/a-button";
import { ChevronDown } from "lucide-react-native";
import BookingDetails from "./m-booking-details";
import { BookingsQuery } from "@/lib/services/graphql/generated";
import { capitalize } from "@/lib/utils/text";
import { getBookingStatus } from "@/lib/utils/bookings";

type Props = {
	booking: BookingsQuery["bookings"][number];
};

const BookingCard: React.FC<Props> = ({ booking }) => {
	const colors = useThemeColors();
	const [open, setOpen] = React.useState(false);
	const { failedImages, handleImageError } = useFallbackImages();

	const bookingStatus = getBookingStatus(booking);

	return (
		<>
			<View
				className="gap-4 border-b pb-4"
				style={{ borderColor: hexToRgba(colors.text, 0.1) }}
			>
				<Pressable
					className="flex-row gap-4 items-center border p-2 rounded-xl"
					style={{ borderColor: hexToRgba(colors.text, 0.1) }}
				>
					<View
						className="w-[107px] h-[90px] rounded-xl border overflow-hidden"
						style={{ borderColor: colors.text }}
					>
						<Image
							source={{
								uri: failedImages.has(0)
									? FALLBACK_IMAGE
									: booking.hosting.coverImage?.asset.publicUrl,
							}}
							style={{ height: "100%", width: "100%" }}
							contentFit="cover"
							transition={300}
							placeholder={{ blurhash: PROPERTY_BLURHASH }}
							placeholderContentFit="cover"
							cachePolicy="memory-disk"
							priority="high"
							onError={() => handleImageError(0)}
						/>
					</View>
					<View className="flex-1 justify-between gap-2">
						<ThemedText
							style={{ fontSize: 18, fontFamily: Fonts.bold }}
							ellipsizeMode="tail"
							numberOfLines={2}
						>
							{booking.hosting.title}
						</ThemedText>
						<ThemedText
							style={{ fontSize: 14, color: hexToRgba(colors.text, 0.6) }}
						>
							{booking.hosting.city}, {booking.hosting.state}
						</ThemedText>
						<View className="flex-row items-center justify-between">
							<ThemedText style={{ fontFamily: Fonts.medium, fontSize: 14 }}>
								₦{Number(booking.amount ?? "0").toLocaleString()}{" "}
								{capitalize(booking.hosting.paymentInterval ?? "")}
							</ThemedText>
							<View
								className="p-1 px-2 flex-1 items-center justify-center max-w-[74px] rounded-lg"
								style={{
									backgroundColor: hexToRgba(
										bookingStatus === "pending"
											? colors.accent
											: bookingStatus === "active"
												? colors.success
												: colors.error,
										0.3,
									),
								}}
							>
								<ThemedText
									style={{
										fontSize: 12,
										color:
											bookingStatus === "pending"
												? colors.accent
												: bookingStatus === "active"
													? colors.success
													: colors.error,
									}}
								>
									{capitalize(bookingStatus)}
								</ThemedText>
							</View>
						</View>
					</View>
				</Pressable>
				<Button
					onPress={() => setOpen(true)}
					type="tinted"
					style={{ paddingBlock: 4 }}
				>
					<View className="flex-row items-center gap-2">
						<ThemedText content="tinted">View Reciept</ThemedText>
						<ChevronDown color={colors.primary} />
					</View>
				</Button>
			</View>
			<BookingDetails open={open} onOpenChange={setOpen} booking={booking} />
		</>
	);
};

export default BookingCard;
