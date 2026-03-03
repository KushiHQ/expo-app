import { useThemeColors } from "@/lib/hooks/use-theme-color";
import {
	BookingQuery,
	useCalculateHostingFeesQuery,
} from "@/lib/services/graphql/generated";
import React from "react";
import DetailsLayout from "../layouts/details";
import { View } from "react-native";
import Skeleton from "../atoms/a-skeleton";
import { hexToRgba } from "@/lib/utils/colors";
import CheckoutSummaryItem from "../molecules/m-checkout-summary-item";
import { formatNaira } from "@/lib/utils/currency";
import { hostingDuration } from "@/lib/utils/hosting/tenancyAgreement";
import { toTitleCase } from "@/lib/utils/text";

type Props = {
	booking?: BookingQuery["booking"];
	title?: string;
	footer?: React.ReactNode;
	header?: React.ReactNode;
	children?: React.ReactNode;
};

const CheckoutSummaryScreen: React.FC<Props> = ({
	title,
	booking,
	footer,
	header,
	children,
}) => {
	const colors = useThemeColors();
	const [{ data, fetching }] = useCalculateHostingFeesQuery({
		variables: {
			hostingId: booking?.hosting.id ?? "",
			multiplier: booking?.bookingApplication.intervalMultiplier ?? 1,
		},
		pause: !booking || !booking.bookingApplication.intervalMultiplier,
	});

	const duration = React.useMemo(() => {
		const checkinDate = booking?.checkInDate;
		return hostingDuration(
			booking?.hosting.paymentInterval,
			booking?.bookingApplication.intervalMultiplier,
			checkinDate ? new Date(checkinDate) : undefined,
		);
	}, [booking]);

	const calculated = data?.calculateHostingFees;

	return (
		<DetailsLayout title={title} footer={footer}>
			<View className="mt-4 gap-6">
				{header}
				{fetching ? (
					<Skeleton style={{ height: 500, borderRadius: 18 }} />
				) : (
					<View
						className="px-4 pb-4"
						style={{
							backgroundColor: hexToRgba(colors.text, 0.03),
							borderRadius: 16,
						}}
					>
						<CheckoutSummaryItem
							label="Duration"
							description="The core rental cost for the property for your selected duration. This money is held securely in Kushi's escrow until you move in."
							value={toTitleCase(duration.metric)}
						/>
						<CheckoutSummaryItem
							label="Base Rent"
							description="The core rental cost for the property for your selected duration. This money is held securely in Kushi's escrow until you move in."
							value={formatNaira(calculated?.baseRent ?? 0).formated}
						/>
						{calculated?.cautionFee && (
							<CheckoutSummaryItem
								label="Caution Fee"
								description="A refundable security deposit held against potential property damage or unpaid bills. This will be refunded to you at the end of your tenancy if the property is kept in good condition."
								value={formatNaira(calculated?.cautionFee ?? 0).formated}
							/>
						)}
						{calculated?.serviceCharge && (
							<CheckoutSummaryItem
								label="Service Charge"
								description="A mandatory fee set by the landlord or estate management to cover shared amenities like security, cleaning, waste disposal, or common area maintenance."
								value={formatNaira(calculated?.serviceCharge ?? 0).formated}
							/>
						)}
						{calculated?.legalFee && (
							<CheckoutSummaryItem
								label="Legal Fee"
								description="Covers the preparation, execution, and digital stamping of your legally binding Tenancy Agreement. This ensures your rights as a tenant are fully protected under the law."
								value={formatNaira(calculated?.legalFee ?? 0).formated}
							/>
						)}
						{calculated?.guestServiceCharge && (
							<CheckoutSummaryItem
								label="Platform Fee"
								description="Replaces traditional real estate agency fees. This covers 24/7 customer support, secure escrow payment protection, and platform maintenance to ensure a scam-free rental experience."
								value={
									formatNaira(calculated?.guestServiceCharge ?? 0).formated
								}
							/>
						)}
						<CheckoutSummaryItem
							extraLarge
							bordered={false}
							label="Total Amount"
							value={formatNaira(calculated?.totalPayableAmount ?? 0).formated}
						/>
					</View>
				)}
				{children}
			</View>
		</DetailsLayout>
	);
};

export default CheckoutSummaryScreen;
