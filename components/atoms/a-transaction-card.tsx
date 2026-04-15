import React from "react";
import { Pressable, View } from "react-native";
import { Transaction, TransactionStatus, TransactionType } from "@/lib/services/graphql/generated";
import ThemedText from "./a-themed-text";
import { useThemeColors } from "@/lib/hooks/use-theme-color";
import { Fonts } from "@/lib/constants/theme";
import { hexToRgba } from "@/lib/utils/colors";
import { TablerCurrencyNaira } from "../icons/i-currency";
import { router } from "expo-router";

type Props = {
	transaction: Transaction;
};

const getStatusColor = (status: TransactionStatus) => {
	switch (status) {
		case TransactionStatus.Success:
			return "#4CAF50";
		case TransactionStatus.Pending:
		case TransactionStatus.Processing:
			return "#FF9800";
		case TransactionStatus.Failed:
		case TransactionStatus.Cancelled:
			return "#F44336";
		case TransactionStatus.Refunded:
			return "#2196F3";
		default:
			return "#757575";
	}
};

const TransactionCard: React.FC<Props> = ({ transaction }) => {
	const colors = useThemeColors();

	const handlePress = () => {
		switch (transaction.type) {
			case TransactionType.BookingPayment:
			case TransactionType.HostBookingPayment:
				if (transaction.booking?.id) {
					router.push(`/bookings/${transaction.booking.id}`);
				}
				break;
			default:
				break;
		}
	};

	const date = new Date(transaction.createdAt).toLocaleDateString("en-US", {
		month: "short",
		day: "numeric",
		year: "numeric",
	});

	return (
		<Pressable
			onPress={handlePress}
			className="p-4 mb-3 flex-row items-center justify-between"
			style={{
				backgroundColor: hexToRgba(colors.text, 0.05),
				borderRadius: 12,
			}}
		>
			<View className="flex-1 mr-4">
				<ThemedText style={{ fontFamily: Fonts.semibold, fontSize: 16 }}>
					{transaction.booking?.hosting?.title || "Transaction"}
				</ThemedText>
				<ThemedText style={{ fontSize: 12, opacity: 0.6 }}>
					{transaction.type.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())} • {date}
				</ThemedText>
			</View>

			<View className="items-end">
				<View className="flex-row items-center">
					<TablerCurrencyNaira size={16} color={colors.text} />
					<ThemedText style={{ fontFamily: Fonts.bold, fontSize: 16 }}>
						{Number(transaction.amount).toLocaleString()}
					</ThemedText>
				</View>
				<View
					className="px-2 py-0.5 rounded-full mt-1"
					style={{ backgroundColor: hexToRgba(getStatusColor(transaction.status), 0.1) }}
				>
					<ThemedText
						style={{
							fontSize: 10,
							fontFamily: Fonts.semibold,
							color: getStatusColor(transaction.status),
						}}
					>
						{transaction.status}
					</ThemedText>
				</View>
			</View>
		</Pressable>
	);
};

export default TransactionCard;
