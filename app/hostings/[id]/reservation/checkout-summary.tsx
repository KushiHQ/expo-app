import Button from "@/components/atoms/a-button";
import Skeleton from "@/components/atoms/a-skeleton";
import ThemedText from "@/components/atoms/a-themed-text";
import Tooltip from "@/components/atoms/a-tooltip";
import DetailsLayout from "@/components/layouts/details";
import { useThemeColors } from "@/lib/hooks/use-theme-color";
import {
	PaymentInterval,
	useCalculateHostingFeesQuery,
	useHostingQuery,
} from "@/lib/services/graphql/generated";
import { hexToRgba } from "@/lib/utils/colors";
import { formatNaira } from "@/lib/utils/currency";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
	ChevronLeftIcon,
	ChevronRightIcon,
	CircleQuestionMark,
} from "lucide-react-native";
import React from "react";
import { Pressable, View } from "react-native";
import { twMerge } from "tailwind-merge";

export default function CheckoutSummary() {
	const router = useRouter();
	const colors = useThemeColors();
	const { id } = useLocalSearchParams();
	const [multiplier, setMultiplier] = React.useState(1);
	const [{ data: hostingData, fetching: hostingFetching }] = useHostingQuery({
		variables: { hostingId: String(id) },
	});
	const [{ data }] = useCalculateHostingFeesQuery({
		variables: {
			hostingId: String(id),
			multiplier,
		},
	});

	const calculated = data?.calculateHostingFees;

	const duration = React.useMemo(() => {
		let label = "Years";
		switch (hostingData?.hosting.paymentInterval) {
			case PaymentInterval.Weekly:
				label = "Weeks";
			case PaymentInterval.Nightly:
				label = "Nigths";
			case PaymentInterval.Monthly:
				label = "Months";
			default:
				label = "Years";
		}

		return label;
	}, [hostingData]);
	return (
		<DetailsLayout
			title="Checkout Summary"
			footer={
				<View
					className="px-6 pb-4 gap-4"
					style={{ backgroundColor: colors.background }}
				>
					<Button
						onPress={() => router.push(`/hostings/${id}/reservation/step-1/`)}
						type="primary"
					>
						<ThemedText content="primary">Continue</ThemedText>
					</Button>
				</View>
			}
		>
			<View className="mt-4 gap-6">
				{hostingFetching ? (
					<Skeleton style={{ height: 50, borderRadius: 14 }} />
				) : (
					<View
						className="flex-row items-center justify-between p-2 px-6 rounded-2xl"
						style={{ backgroundColor: hexToRgba(colors.text, 0.03) }}
					>
						<ThemedText style={{ fontSize: 18 }}>{duration}</ThemedText>
						<View className="flex-row items-center gap-6">
							<Pressable
								className="p-2"
								disabled={multiplier <= 1}
								onPress={() => setMultiplier((c) => c - 1)}
							>
								<ChevronLeftIcon color={colors.text} />
							</Pressable>
							<ThemedText type="semibold">{multiplier}</ThemedText>
							<Pressable
								className="p-2"
								onPress={() => setMultiplier((c) => c + 1)}
							>
								<ChevronRightIcon color={colors.text} />
							</Pressable>
						</View>
					</View>
				)}
				{hostingFetching ? (
					<Skeleton style={{ height: 500, borderRadius: 18 }} />
				) : (
					<View
						className="px-4 pb-4"
						style={{
							backgroundColor: hexToRgba(colors.text, 0.03),
							borderRadius: 16,
						}}
					>
						<SummaryItem
							label="Base Rent"
							description="The core rental cost for the property for your selected duration. This money is held securely in Kushi's escrow until you move in."
							value={formatNaira(calculated?.baseRent ?? 0).formated}
						/>
						{calculated?.cautionFee && (
							<SummaryItem
								label="Caution Fee"
								description="A refundable security deposit held against potential property damage or unpaid bills. This will be refunded to you at the end of your tenancy if the property is kept in good condition."
								value={formatNaira(calculated?.cautionFee ?? 0).formated}
							/>
						)}
						{calculated?.serviceCharge && (
							<SummaryItem
								label="Service Charge"
								description="A mandatory fee set by the landlord or estate management to cover shared amenities like security, cleaning, waste disposal, or common area maintenance."
								value={formatNaira(calculated?.serviceCharge ?? 0).formated}
							/>
						)}
						{calculated?.legalFee && (
							<SummaryItem
								label="Legal Fee"
								description="Covers the preparation, execution, and digital stamping of your legally binding Tenancy Agreement. This ensures your rights as a tenant are fully protected under the law."
								value={formatNaira(calculated?.legalFee ?? 0).formated}
							/>
						)}
						{calculated?.guestServiceCharge && (
							<SummaryItem
								label="Platform Fee"
								description="Replaces traditional real estate agency fees. This covers 24/7 customer support, secure escrow payment protection, and platform maintenance to ensure a scam-free rental experience."
								value={
									formatNaira(calculated?.guestServiceCharge ?? 0).formated
								}
							/>
						)}
						<SummaryItem
							extraLarge
							bordered={false}
							label="Total Amount"
							value={formatNaira(calculated?.totalPayableAmount ?? 0).formated}
						/>
					</View>
				)}
			</View>
		</DetailsLayout>
	);
}

type SummaryItemProps = {
	label: string;
	value: string;
	bordered?: boolean;
	description?: string;
	extraLarge?: boolean;
};

const SummaryItem: React.FC<SummaryItemProps> = ({
	label,
	value,
	bordered = true,
	description,
	extraLarge,
}) => {
	const colors = useThemeColors();
	return (
		<View
			className={twMerge(
				"flex-row justify-between items-center p-2 py-5 border-b",
				bordered === false && "pb-2",
			)}
			style={{
				borderColor: bordered ? hexToRgba(colors.text, 0.05) : "transparent",
			}}
		>
			<View className="flex-row items-center gap-2">
				<ThemedText
					type={extraLarge ? "title" : "semibold"}
					style={{ fontSize: extraLarge ? 20 : 16 }}
				>
					{label}
				</ThemedText>
				{description && (
					<Tooltip title={label} description={description}>
						<CircleQuestionMark color={hexToRgba(colors.text, 0.7)} size={14} />
					</Tooltip>
				)}
			</View>
			<ThemedText style={{ fontSize: extraLarge ? 20 : 16 }}>
				{value}
			</ThemedText>
		</View>
	);
};
