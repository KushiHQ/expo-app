import React from "react";
import { View, ScrollView, RefreshControl, Pressable } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useTransactionByReferenceQuery } from "@/lib/services/graphql/generated";
import DetailsLayout from "@/components/layouts/details";
import ThemedText from "@/components/atoms/a-themed-text";
import Skeleton from "@/components/atoms/a-skeleton";
import { useThemeColors } from "@/lib/hooks/use-theme-color";
import { hexToRgba } from "@/lib/utils/colors";
import { Fonts } from "@/lib/constants/theme";
import { TablerCurrencyNaira } from "@/components/icons/i-currency";
import { CheckCircle2, XCircle, Clock, ArrowLeft, ExternalLink } from "lucide-react-native";

export default function TransactionDetails() {
	const { transactionId } = useLocalSearchParams();
	const router = useRouter();
	const colors = useThemeColors();

	const [{ data, fetching, error }, refetch] = useTransactionByReferenceQuery({
		variables: { reference: transactionId as string },
	});

	const transaction = data?.transactionByReference;

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
						{error ? "Failed to load transaction details" : "Transaction not found"}
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
						style={{ backgroundColor: hexToRgba(getStatusColor(transaction.status), 0.1) }}
					>
						{getStatusIcon(transaction.status)}
					</View>
					<ThemedText style={{ opacity: 0.6, fontSize: 14 }}>Amount Paid</ThemedText>
					<View className="flex-row items-center mt-1">
						<TablerCurrencyNaira size={32} color={colors.text} />
						<ThemedText style={{ fontSize: 36, fontFamily: Fonts.bold }}>
							{Number(transaction.amount).toLocaleString()}
						</ThemedText>
					</View>
					<View
						className="mt-4 px-4 py-1.5 rounded-full"
						style={{ backgroundColor: hexToRgba(getStatusColor(transaction.status), 0.1) }}
					>
						<ThemedText
							style={{
								color: getStatusColor(transaction.status),
								fontFamily: Fonts.semibold,
								fontSize: 12,
							}}
						>
							{transaction.status}
						</ThemedText>
					</View>
				</View>

				{/* Property Details */}
				{transaction.booking?.hosting && (
					<Pressable
						onPress={() => router.push(`/hostings/${transaction.booking?.hosting?.id}`)}
						className="mt-8 p-4 rounded-2xl border flex-row items-center justify-between"
						style={{ borderColor: hexToRgba(colors.text, 0.1) }}
					>
						<View className="flex-1 mr-4">
							<ThemedText style={{ fontSize: 12, opacity: 0.6 }}>Payment for</ThemedText>
							<ThemedText style={{ fontFamily: Fonts.semibold, fontSize: 16 }}>
								{transaction.booking.hosting.title}
							</ThemedText>
						</View>
						<ExternalLink size={18} color={colors.primary} />
					</Pressable>
				)}

				{/* Payment Details */}
				<View className="mt-8 gap-4">
					<ThemedText style={{ fontFamily: Fonts.bold, fontSize: 18 }}>
						Transaction Details
					</ThemedText>

					<View className="gap-6 p-6 rounded-3xl border" style={{ borderColor: hexToRgba(colors.text, 0.05) }}>
						<View className="flex-row justify-between">
							<ThemedText style={{ opacity: 0.6 }}>Reference</ThemedText>
							<ThemedText
								selectable
								style={{ fontSize: 13, opacity: 0.7 }}
							>
								{transaction.reference}
							</ThemedText>
						</View>

						<View className="flex-row justify-between">
							<ThemedText style={{ opacity: 0.6 }}>Date</ThemedText>
							<ThemedText style={{ fontSize: 14 }}>
								{new Date(transaction.createdAt).toLocaleString()}
							</ThemedText>
						</View>

						<View className="flex-row justify-between">
							<ThemedText style={{ opacity: 0.6 }}>Payment Type</ThemedText>
							<ThemedText style={{ fontSize: 14 }}>
								{transaction.type.replace(/_/g, " ")}
							</ThemedText>
						</View>

						<View className="h-[1px] w-full" style={{ backgroundColor: hexToRgba(colors.text, 0.05) }} />

						<View className="flex-row justify-between">
							<ThemedText style={{ opacity: 0.6 }}>Amount</ThemedText>
							<ThemedText style={{ fontFamily: Fonts.semibold }}>
								₦{Number(transaction.amount).toLocaleString()}
							</ThemedText>
						</View>

						{transaction.booking && (
							<Pressable
								onPress={() => router.push(`/users/bookings/${transaction.booking?.id}`)}
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

				{/* Help Section */}
				<View className="mt-10 mb-20 p-6 rounded-2xl bg-gray-50 items-center border border-gray-100">
					<ThemedText className="text-center" style={{ fontSize: 14, opacity: 0.7 }}>
						Having issues with this transaction?
					</ThemedText>
					<Pressable className="mt-2">
						<ThemedText style={{ color: colors.primary, fontFamily: Fonts.semibold }}>
							Contact Support
						</ThemedText>
					</Pressable>
				</View>
			</ScrollView>
		</DetailsLayout>
	);
}
