import React from "react";
import { View, ScrollView, RefreshControl, Pressable } from "react-native";
import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import { useTransactionByReferenceQuery } from "@/lib/services/graphql/generated";
import DetailsLayout from "@/components/layouts/details";
import ThemedText from "@/components/atoms/a-themed-text";
import Skeleton from "@/components/atoms/a-skeleton";
import { useThemeColors } from "@/lib/hooks/use-theme-color";
import { hexToRgba } from "@/lib/utils/colors";
import { Fonts } from "@/lib/constants/theme";
import { TablerCurrencyNaira } from "@/components/icons/i-currency";
import {
	CheckCircle2,
	XCircle,
	Clock,
	ExternalLink,
} from "lucide-react-native";
import ThemedBarcode from "@/components/atoms/a-barcode";
import CopyButton from "@/components/atoms/a-copy-button";
import ViewShot from "react-native-view-shot";
import { shareViewAsImage, shareViewAsSinglePagePdf } from "@/lib/utils/files";
import ThemedModal from "@/components/molecules/m-modal";
import Button from "@/components/atoms/a-button";
import { HugeiconsInboxDownload } from "@/components/icons/i-download";
import LogoLarge from "@/assets/vectors/logo-large.svg";

export default function TransactionDetails() {
	const { transactionId } = useLocalSearchParams();
	const router = useRouter();
	const colors = useThemeColors();
	const [downloadType, setDownloadType] = React.useState<"pdf" | "image">();
	const ref = React.useRef<ViewShot>(null);

	const [{ data, fetching, error }, refetch] = useTransactionByReferenceQuery({
		variables: { reference: transactionId as string },
	});

	const transaction = data?.transactionByReference;

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

	const getStatusColor = (status: string) => {
		switch (status) {
			case "SUCCESS":
				return colors.success;
			case "FAILED":
			case "CANCELLED":
				return colors.error;
			case "PENDING":
			case "PROCESSING":
				return colors.warning;
			default:
				return hexToRgba(colors.text, 0.5);
		}
	};

	const getStatusIcon = (status: string) => {
		const size = 20;
		switch (status) {
			case "SUCCESS":
				return <CheckCircle2 color={colors.success} size={size} />;
			case "FAILED":
			case "CANCELLED":
				return <XCircle color={colors.error} size={size} />;
			case "PENDING":
			case "PROCESSING":
				return <Clock color={colors.warning} size={size} />;
			default:
				return null;
		}
	};

	if (fetching) {
		return (
			<DetailsLayout title="Transaction Details">
				<View className="p-6 gap-6">
					<Skeleton style={{ height: 150, borderRadius: 16 }} />
					<Skeleton style={{ height: 300, borderRadius: 16 }} />
				</View>
			</DetailsLayout>
		);
	}

	if (error || !transaction) {
		return (
			<DetailsLayout title="Transaction Details">
				<View className="p-6 items-center justify-center mt-20">
					<XCircle color={colors.error} size={48} />
					<ThemedText className="mt-4 text-center">
						{error
							? "Failed to load transaction details"
							: "Transaction not found"}
					</ThemedText>
					<Pressable
						onPress={() => router.back()}
						className="mt-6 px-6 py-2 rounded-full border"
						style={{ borderColor: colors.primary }}
					>
						<ThemedText style={{ color: colors.primary }}>Go Back</ThemedText>
					</Pressable>
				</View>
			</DetailsLayout>
		);
	}

	return (
		<>
			<Stack.Screen options={{ headerShown: false }} />
			<DetailsLayout
				title="Transaction Receipt"
				refreshControl={
					<RefreshControl refreshing={fetching} onRefresh={refetch} />
				}
			>
				<ScrollView className="flex-1 px-6 pt-4 pb-10">
					{/* Receipt Header */}
					<View
						className="items-center p-8 rounded-3xl border"
						style={{
							backgroundColor: hexToRgba(colors.text, 0.03),
							borderColor: hexToRgba(colors.text, 0.05),
						}}
					>
						<View
							className="p-4 rounded-full mb-4"
							style={{
								backgroundColor: hexToRgba(
									getStatusColor(transaction.status),
									0.1,
								),
							}}
						>
							{getStatusIcon(transaction.status)}
						</View>
						<ThemedText style={{ opacity: 0.6, fontSize: 14 }}>
							Amount Paid
						</ThemedText>
						<View
							className="flex-row items-center mt-1"
							style={{ alignSelf: "stretch", justifyContent: "center" }}
						>
							<TablerCurrencyNaira size={32} color={colors.text} style={{ flexShrink: 0 }} />
							<ThemedText
								numberOfLines={1}
								adjustsFontSizeToFit
								minimumFontScale={0.5}
								style={{ fontSize: 36, lineHeight: 46, fontFamily: Fonts.bold, flexShrink: 1 }}
							>
								{Number(transaction.amount).toLocaleString()}
							</ThemedText>
						</View>
						<View
							className="mt-4 px-4 py-1.5 rounded-full"
							style={{
								backgroundColor: hexToRgba(
									getStatusColor(transaction.status),
									0.1,
								),
							}}
						>
							<ThemedText
								style={{
									color: getStatusColor(transaction.status),
									fontFamily: Fonts.semibold,
									fontSize: 12,
									textTransform: "capitalize",
								}}
							>
								{transaction.status.toLowerCase()}
							</ThemedText>
						</View>
					</View>

					{/* Barcode Section */}
					<View
						className="mt-6 border-b pb-4"
						style={{ borderColor: hexToRgba(colors.text, 0.1) }}
					>
						<View
							className="border p-2 rounded-[14px] overflow-hidden bg-white"
							style={{ borderColor: hexToRgba(colors.text, 0.1) }}
						>
							<ThemedBarcode
								width={400}
								height={80}
								format="CODE128"
								value={transaction.reference ?? ""}
							/>
						</View>
					</View>

					{/* Property Details */}
					{transaction.booking?.hosting && (
						<Pressable
							onPress={() =>
								router.push(`/hostings/${transaction.booking?.hosting?.id}`)
							}
							className="mt-6 p-4 rounded-2xl border flex-row items-center justify-between"
							style={{ borderColor: hexToRgba(colors.text, 0.1) }}
						>
							<View className="flex-1 mr-4">
								<ThemedText style={{ fontSize: 12, opacity: 0.6 }}>
									Payment for
								</ThemedText>
								<ThemedText
									style={{ fontFamily: Fonts.semibold, fontSize: 16 }}
								>
									{transaction.booking.hosting.title}
								</ThemedText>
							</View>
							<ExternalLink size={18} color={colors.primary} />
						</Pressable>
					)}

					{/* Payment Details */}
					<View className="mt-6 gap-4">
						<ThemedText style={{ fontFamily: Fonts.bold, fontSize: 18 }}>
							Transaction Details
						</ThemedText>

						<View
							className="gap-6 p-6 rounded-3xl border"
							style={{ borderColor: hexToRgba(colors.text, 0.05) }}
						>
							<View className="flex-row justify-between items-center">
								<ThemedText style={{ opacity: 0.6, flex: 1 }}>Reference</ThemedText>
								<View className="flex-row items-center gap-2" style={{ flexShrink: 1 }}>
									<ThemedText style={{ fontSize: 13, opacity: 0.7 }}>
										{(transaction.reference ?? "").slice(0, 18)}...
									</ThemedText>
									<CopyButton
										text={transaction.reference ?? ""}
										size={16}
										color={colors.primary}
									/>
								</View>
							</View>

							<View className="flex-row justify-between gap-4">
								<ThemedText style={{ opacity: 0.6, flex: 1 }}>Date</ThemedText>
								<ThemedText style={{ fontSize: 14, flex: 1, textAlign: "right" }}>
									{new Date(transaction.createdAt).toLocaleString()}
								</ThemedText>
							</View>

							<View className="flex-row justify-between gap-4">
								<ThemedText style={{ opacity: 0.6, flex: 1 }}>Payment Type</ThemedText>
								<ThemedText style={{ fontSize: 14, flex: 1, textAlign: "right", textTransform: "capitalize" }}>
									{transaction.type.replace(/_/g, " ")}
								</ThemedText>
							</View>

							<View
								className="h-[1px] w-full"
								style={{ backgroundColor: hexToRgba(colors.text, 0.05) }}
							/>

							<View className="flex-row justify-between gap-4">
								<ThemedText style={{ opacity: 0.6, flex: 1 }}>Amount</ThemedText>
								<ThemedText style={{ fontFamily: Fonts.semibold, flex: 1, textAlign: "right" }}>
									₦{Number(transaction.amount).toLocaleString()}
								</ThemedText>
							</View>

							{transaction.booking && (
								<Pressable
									onPress={() =>
										router.push(`/bookings/${transaction.booking?.id}`)
									}
									className="flex-row justify-between items-center"
								>
									<ThemedText style={{ opacity: 0.6 }}>Booking ID</ThemedText>
									<View className="flex-row items-center gap-1">
										<ThemedText style={{ color: colors.primary, fontSize: 14 }}>
											#{transaction.booking.id.slice(-8).toUpperCase()}
										</ThemedText>
										<ExternalLink size={14} color={colors.primary} />
									</View>
								</Pressable>
							)}
						</View>
					</View>

					{/* Share Buttons */}
					<View className="mt-6 flex-row items-center gap-4">
						<Button
							variant="outline"
							type="primary"
							className="py-2.5 flex-1 rounded-xl"
							onPress={() => setDownloadType("pdf")}
						>
							<View className="flex-row items-center justify-center gap-2">
								<HugeiconsInboxDownload color={colors.primary} size={16} />
								<ThemedText
									content="tinted"
									style={{ fontSize: 14, fontFamily: Fonts.semibold }}
								>
									Share PDF
								</ThemedText>
							</View>
						</Button>
						<Button
							variant="outline"
							type="primary"
							className="py-2.5 flex-1 rounded-xl"
							onPress={() => setDownloadType("image")}
						>
							<View className="flex-row items-center justify-center gap-2">
								<HugeiconsInboxDownload color={colors.primary} size={16} />
								<ThemedText
									content="tinted"
									style={{ fontSize: 14, fontFamily: Fonts.semibold }}
								>
									Share Image
								</ThemedText>
							</View>
						</Button>
					</View>

					{/* Help Section */}
					<View
						className="mt-8 mb-10 p-6 rounded-2xl items-center border"
						style={{ borderColor: hexToRgba(colors.text, 0.05) }}
					>
						<ThemedText
							className="text-center"
							style={{ fontSize: 14, opacity: 0.7 }}
						>
							Having issues with this transaction?
						</ThemedText>
						<Pressable className="mt-2">
							<ThemedText
								style={{ color: colors.primary, fontFamily: Fonts.semibold }}
							>
								Contact Support
							</ThemedText>
						</Pressable>
					</View>
				</ScrollView>
			</DetailsLayout>

			{/* Printable Modal for Sharing */}
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
					<View className="bg-white p-6 border border-black/10">
						<View className="flex-row items-center justify-between py-4 border-b border-gray-100">
							<LogoLarge />
							<ThemedText
								style={{
									fontFamily: Fonts.bold,
									color: "#000000",
									fontSize: 18,
								}}
							>
								Transaction Receipt
							</ThemedText>
						</View>

						<View className="py-6 items-center">
							<ThemedText style={{ color: "#888888", fontSize: 14 }}>
								Amount Paid
							</ThemedText>
							<ThemedText
								className="mt-2"
								style={{
									fontSize: 32,
									fontFamily: Fonts.bold,
									color: "#000000",
								}}
							>
								₦{Number(transaction.amount).toLocaleString()}
							</ThemedText>
							<ThemedText
								className="mt-1"
								style={{
									color: getStatusColor(transaction.status),
									fontFamily: Fonts.semibold,
								}}
							>
								{transaction.status}
							</ThemedText>
						</View>

						<View className="py-4 border-t border-b border-gray-100 gap-4">
							<View className="flex-row justify-between">
								<ThemedText style={{ color: "#888888" }}>Reference</ThemedText>
								<ThemedText
									style={{ color: "#000000", fontFamily: Fonts.medium }}
								>
									{transaction.reference}
								</ThemedText>
							</View>
							<View className="flex-row justify-between">
								<ThemedText style={{ color: "#888888" }}>Date</ThemedText>
								<ThemedText
									style={{ color: "#000000", fontFamily: Fonts.medium }}
								>
									{new Date(transaction.createdAt).toLocaleString()}
								</ThemedText>
							</View>
							<View className="flex-row justify-between">
								<ThemedText style={{ color: "#888888" }}>
									Payment Type
								</ThemedText>
								<ThemedText
									style={{ color: "#000000", fontFamily: Fonts.medium }}
								>
									{transaction.type.replace(/_/g, " ")}
								</ThemedText>
							</View>
						</View>

						<View className="mt-6 items-center">
							<View
								className="border p-2 rounded-lg bg-white"
								style={{ borderColor: "#cccccc" }}
							>
								<ThemedBarcode
									width={300}
									height={60}
									format="CODE128"
									value={transaction.reference ?? ""}
								/>
							</View>
							<ThemedText
								className="mt-2"
								style={{ color: "#888888", fontSize: 12 }}
							>
								Scannable Transaction Reference
							</ThemedText>
						</View>
					</View>
				</ViewShot>
			</ThemedModal>
		</>
	);
}
