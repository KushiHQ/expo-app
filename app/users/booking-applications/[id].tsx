import Skeleton from "@/components/atoms/a-skeleton";
import SummarySection from "@/components/atoms/a-summary-section";
import ThemedText from "@/components/atoms/a-themed-text";
import DetailsLayout from "@/components/layouts/details";
import ItemSummary from "@/components/molecules/m-item-summary";
import {
	BOOKING_APPLICATION_INCOME_RANGES,
	BOOKING_APPLICATION_STATUS_COLORS,
} from "@/lib/constants/booking/application";
import { Fonts } from "@/lib/constants/theme";
import { useThemeColors } from "@/lib/hooks/use-theme-color";
import {
	useBookingApplicationQuery,
} from "@/lib/services/graphql/generated";
import { hexToRgba } from "@/lib/utils/colors";
import { toTitleCase } from "@/lib/utils/text";
import { useLocalSearchParams } from "expo-router";
import { CircleQuestionMark } from "lucide-react-native";
import React from "react";
import { View } from "react-native";

export default function BookingApplicationDetails() {
	const colors = useThemeColors();
	const { id } = useLocalSearchParams();
	const [{ data, fetching }] = useBookingApplicationQuery({
		variables: {
			bookingApplicationId: String(id),
		},
	});

	const app = data?.bookingApplication;

	return (
		<>
			<DetailsLayout title="Application Details">
				<View>
					<ThemedText
						className="mb-4"
						style={{ fontSize: 12, color: hexToRgba(colors.text, 0.6) }}
					>
						<CircleQuestionMark color={hexToRgba(colors.text, 0.7)} size={12} />
						{"  "}
						Review your submitted application details below. You will be notified of any status updates from the landlord.
					</ThemedText>
					<View className="gap-4 mt-4">
						{fetching ? (
							<View className="gap-4">
								<Skeleton style={{ height: 150, borderRadius: 14 }} />
								<Skeleton style={{ height: 150, borderRadius: 14 }} />
								<Skeleton style={{ height: 150, borderRadius: 14 }} />
							</View>
						) : (
							<>
								<SummarySection>
									<ThemedText type="semibold" className="mb-2" style={{ fontSize: 16 }}>
										Personal Information
									</ThemedText>
									<ItemSummary
										label="Full Name"
										summary={app?.fullName ?? ""}
									/>
									<ItemSummary label="Email" summary={app?.email ?? ""} />
									<ItemSummary
										label="Phone Number"
										summary={app?.phoneNumber ?? ""}
									/>
									<ItemSummary
										label="Address"
										summary={app?.correspondenceAddress ?? ""}
									/>
								</SummarySection>

								<SummarySection>
									<ThemedText type="semibold" className="mb-2" style={{ fontSize: 16 }}>
										Application Status
									</ThemedText>
									{app?.status && (
										<View className="flex-row flex-wrap items-center gap-2 mb-2">
											<ThemedText
												style={{ fontFamily: Fonts.medium, fontSize: 14 }}
											>
												Status:
											</ThemedText>
											<ThemedText
												className="p-0.5 rounded px-3"
												style={{
													fontSize: 12,
													backgroundColor: hexToRgba(
														BOOKING_APPLICATION_STATUS_COLORS[app.status],
														0.2,
													),
													color: BOOKING_APPLICATION_STATUS_COLORS[app.status],
												}}
											>
												{toTitleCase(app.status.replaceAll("_", " "))}
											</ThemedText>
										</View>
									)}
									<ItemSummary
										label="Status Details"
										summary={app?.statusDetails ?? "No additional details provided."}
									/>
									<ItemSummary
										label="Submitted On"
										summary={app?.createdAt ? new Date(app.createdAt).toLocaleDateString() : ""}
									/>
								</SummarySection>

								<SummarySection>
									<ThemedText type="semibold" className="mb-2" style={{ fontSize: 16 }}>
										Profile Information
									</ThemedText>
									{app?.guestFormData?.occupancyTypes && (
										<ItemSummary
											label="Occupancy Type"
											summary={toTitleCase(
												app?.guestFormData?.occupancyTypes ?? "",
											)}
										/>
									)}
									<ItemSummary
										label="Employment Status"
										summary={toTitleCase(
											app?.guestFormData?.employmentStatus ?? "",
										)}
									/>
									{app?.guestFormData?.incomeRanges && (
										<ItemSummary
											label="Income Range"
											summary={toTitleCase(
												BOOKING_APPLICATION_INCOME_RANGES.find(
													(v) => v.value === app.guestFormData?.incomeRanges,
												)?.label ?? "",
											)}
										/>
									)}
									{app?.guestFormData?.guarantorRelationships && (
										<ItemSummary
											label="Guarantor"
											summary={toTitleCase(
												app?.guestFormData?.guarantorRelationships ?? "",
											)}
										/>
									)}
								</SummarySection>
							</>
						)}
					</View>
				</View>
			</DetailsLayout>
		</>
	);
}
