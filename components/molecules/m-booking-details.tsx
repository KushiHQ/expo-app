import React from "react";
import ViewShot from "react-native-view-shot";
import BottomSheet from "../atoms/a-bottom-sheet";
import { TextStyle, View } from "react-native";
import { hexToRgba } from "@/lib/utils/colors";
import { useThemeColors } from "@/lib/hooks/use-theme-color";
import ThemedBarcode from "../atoms/a-barcode";
import LogoLarge from "@/assets/vectors/logo-large.svg";
import ThemedText from "../atoms/a-themed-text";
import { Fonts } from "@/lib/constants/theme";
import CopyButton from "../atoms/a-copy-button";
import Button from "../atoms/a-button";
import { HugeiconsInboxDownload } from "../icons/i-download";
import ThemedModal from "./m-modal";
import { shareViewAsImage, shareViewAsSinglePagePdf } from "@/lib/utils/files";
import { BookingQuery, BookingsQuery } from "@/lib/services/graphql/generated";
import { calculateBookingDuration } from "@/lib/utils/time";
import { getBookingStatus } from "@/lib/utils/bookings";
import { capitalize } from "@/lib/utils/text";

type Props = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	booking: BookingsQuery["bookings"][number];
};

type SubProps = {
	booking: BookingsQuery["bookings"][number];
	printing?: boolean;
};

type PrintableProps = {
	printing?: boolean;
	children?: React.ReactNode;
	style?: TextStyle;
};

const PrintableLabel: React.FC<PrintableProps> = ({
	printing,
	children,
	style,
}) => {
	const colors = useThemeColors();
	return (
		<ThemedText
			style={[
				{
					fontSize: 14,
					color: hexToRgba(printing ? "#000000" : colors.text, 0.6),
				},
				style ? style : {},
			]}
		>
			{children}
		</ThemedText>
	);
};

const PrintableText: React.FC<PrintableProps> = ({ printing, children }) => {
	const colors = useThemeColors();

	return (
		<ThemedText
			style={{
				fontSize: 14,
				fontFamily: Fonts.medium,
				color: printing ? "#000000" : colors.text,
			}}
		>
			{children}
		</ThemedText>
	);
};

const BarcodeSection: React.FC<SubProps> = ({ booking, printing }) => {
	const colors = useThemeColors();
	return (
		<View
			className="border-b pb-4"
			style={{ borderColor: hexToRgba(colors.text, 0.2) }}
		>
			<View
				className="border p-2 rounded-[14px] overflow-hidden"
				style={{ borderColor: printing ? "#000000" : colors.text }}
			>
				<ThemedBarcode
					width={400}
					height={100}
					format="CODE128"
					value={booking.transaction?.id ?? ""}
				/>
				<View className="flex-row items-center justify-between p-2">
					<PrintableLabel printing={printing}>Transaction ID</PrintableLabel>
					<View className="flex-row items-center gap-2">
						<PrintableText printing={printing} style={{ fontSize: 16 }}>
							{booking.transaction?.id ?? ""}
						</PrintableText>
						{!printing && (
							<CopyButton
								text={booking.transaction?.id ?? ""}
								size={18}
								color={colors.primary}
							/>
						)}
					</View>
				</View>
			</View>
		</View>
	);
};

const DateAndDurationSection: React.FC<SubProps> = ({ booking, printing }) => {
	const colors = useThemeColors();

	return (
		<View
			style={{
				borderColor: hexToRgba(printing ? "#000000" : colors.text, 0.2),
			}}
			className="border p-4 gap-4 mt-4 rounded-xl"
		>
			<View className="flex-row items-center justify-between">
				<PrintableLabel printing={printing}>Date</PrintableLabel>
				<PrintableText printing={printing}>
					{new Date(booking.createdAt).toLocaleDateString()}
				</PrintableText>
			</View>
			<View className="flex-row items-center justify-between">
				<PrintableLabel printing={printing}>Duration</PrintableLabel>
				<PrintableText printing={printing}>
					{new Date(booking.checkInDate ?? "").toLocaleDateString()} -{" "}
					{new Date(booking.checkOutDate ?? "").toLocaleDateString()}
				</PrintableText>
				<ThemedText
					className="border px-2 rounded"
					style={{
						borderColor: hexToRgba(printing ? "#000000" : colors.text, 0.2),
						fontSize: 13,
						color: hexToRgba(printing ? "#000000" : colors.text, 0.6),
					}}
				>
					{calculateBookingDuration(
						booking.checkInDate ?? "",
						booking.checkOutDate ?? "",
					)}
				</ThemedText>
			</View>
		</View>
	);
};

const FeesSection: React.FC<SubProps> = ({ booking, printing }) => {
	const colors = useThemeColors();
	return (
		<View
			style={{
				borderColor: hexToRgba(printing ? "#000000" : colors.text, 0.2),
			}}
			className="border p-4 gap-4 mt-4 rounded-xl"
		>
			<View className="flex-row items-center justify-between">
				<PrintableLabel printing={printing}>Amount</PrintableLabel>
				<PrintableText printing={printing}>
					₦{Number(booking.amount ?? "0").toLocaleString()}
				</PrintableText>
			</View>
			<View
				className="flex-row items-center border-b justify-between pb-4"
				style={{ borderColor: hexToRgba(colors.text, 0.1) }}
			>
				<PrintableLabel printing={printing}>Service Fee</PrintableLabel>
				<PrintableText printing={printing}>
					₦{Number(booking.guestServiceCharge ?? "0").toLocaleString()}
				</PrintableText>
			</View>
			<View className="flex-row items-center justify-between">
				<PrintableLabel printing={printing} style={{ fontSize: 16 }}>
					Total
				</PrintableLabel>
				<ThemedText
					style={{
						fontSize: 20,
						fontFamily: Fonts.bold,
						color: colors.primary,
					}}
				>
					₦
					{(
						Number(booking.amount ?? "0") +
						Number(booking.guestServiceCharge ?? "0")
					).toLocaleString()}
				</ThemedText>
			</View>
		</View>
	);
};

const UserInfoSection: React.FC<SubProps> = ({ booking, printing }) => {
	const colors = useThemeColors();

	const bookingStatus = getBookingStatus(booking);
	return (
		<View
			className="mt-4 p-2.5 rounded-xl"
			style={{
				backgroundColor: hexToRgba(printing ? "#000000" : colors.text, 0.08),
			}}
		>
			<View
				className="gap-2 p-3 rounded-xl px-4"
				style={{ backgroundColor: printing ? "#ffffff" : colors.background }}
			>
				<View className="flex-row items-center justify-between">
					<ThemedText
						style={{
							fontSize: 14,
							color: hexToRgba(printing ? "#000000" : colors.text, 0.6),
						}}
					>
						Name
					</ThemedText>
					<ThemedText
						style={{
							fontSize: 14,
							fontFamily: Fonts.medium,
							color: printing ? "#000000" : colors.text,
						}}
					>
						{booking.hosting.title}
					</ThemedText>
				</View>
				<View className="flex-row items-center justify-between">
					<ThemedText
						style={{
							fontSize: 14,
							color: hexToRgba(printing ? "#000000" : colors.text, 0.6),
						}}
					>
						Phone Number
					</ThemedText>
					<ThemedText
						style={{
							fontSize: 14,
							fontFamily: Fonts.medium,
							color: printing ? "#000000" : colors.text,
						}}
					>
						+234 {booking.phoneNumber}
					</ThemedText>
				</View>
				<View className="flex-row items-center justify-between">
					<ThemedText
						style={{
							fontSize: 14,
							color: hexToRgba(printing ? "#000000" : colors.text, 0.6),
						}}
					>
						Status
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
		</View>
	);
};

export const BookingDetails: React.FC<{
	booking: BookingsQuery["bookings"][number] | BookingQuery["booking"];
	showUserInfo?: boolean;
}> = ({ booking, showUserInfo = true }) => {
	const colors = useThemeColors();
	const [downloadType, setDownloadType] = React.useState<"pdf" | "image">();
	const ref = React.useRef<ViewShot>(null);

	React.useEffect(() => {
		let timeout: number | undefined = undefined;
		if (downloadType !== undefined) {
			const func =
				downloadType === "pdf" ? shareViewAsSinglePagePdf : shareViewAsImage;
			timeout = setTimeout(
				() => func(ref).then(() => setDownloadType(undefined)),
				1000,
			);
		}

		return () => clearTimeout(timeout);
	}, [downloadType]);

	return (
		<>
			<View className="pb-8">
				<BarcodeSection booking={booking} />
				<DateAndDurationSection booking={booking} />
				<FeesSection booking={booking} />
				<View className="mt-4 flex-row items-center gap-4">
					<Button
						variant="outline"
						type="primary"
						className="py-2 flex-1"
						onPress={() => setDownloadType("pdf")}
					>
						<View className="flex-row items-center gap-2">
							<HugeiconsInboxDownload color={colors.primary} size={16} />
							<ThemedText content="tinted" style={{ fontSize: 14 }}>
								PDF
							</ThemedText>
						</View>
					</Button>
					<Button
						variant="outline"
						type="primary"
						className="py-2 flex-1"
						onPress={() => setDownloadType("image")}
					>
						<View className="flex-row items-center gap-2">
							<HugeiconsInboxDownload color={colors.primary} size={16} />
							<ThemedText content="tinted" style={{ fontSize: 14 }}>
								Image
							</ThemedText>
						</View>
					</Button>
				</View>
				{showUserInfo && <UserInfoSection booking={booking} />}
			</View>
			<ThemedModal
				visible={!!downloadType}
				onClose={() => setDownloadType(undefined)}
			>
				<ViewShot
					ref={ref}
					options={{
						format: "png",
						quality: 1.0,
						result: downloadType === "pdf" ? "base64" : "tmpfile",
					}}
				>
					<View className="bg-white p-2 border border-black/10 px-4">
						<View className="flex-row items-center justify-between py-4">
							<LogoLarge />
							<PrintableText style={{ fontFamily: Fonts.bold }} printing>
								Transaction Reciept
							</PrintableText>
						</View>
						<UserInfoSection printing booking={booking} />
						<DateAndDurationSection printing booking={booking} />
						<FeesSection printing booking={booking} />
						<View className="mt-4">
							<BarcodeSection printing booking={booking} />
						</View>
					</View>
				</ViewShot>
			</ThemedModal>
		</>
	);
};

const BookingDetailsSheet: React.FC<Props> = ({
	open,
	onOpenChange,
	booking,
}) => {
	return (
		<BottomSheet isVisible={open} onClose={() => onOpenChange(false)}>
			<BookingDetails booking={booking} />
		</BottomSheet>
	);
};

export default BookingDetailsSheet;
