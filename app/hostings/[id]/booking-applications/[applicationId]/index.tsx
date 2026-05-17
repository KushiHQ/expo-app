import Button from "@/components/atoms/a-button";
import LoadingModal from "@/components/atoms/a-loading-modal";
import Skeleton from "@/components/atoms/a-skeleton";
import SummarySection from "@/components/atoms/a-summary-section";
import ThemedText from "@/components/atoms/a-themed-text";
import DetailsLayout from "@/components/layouts/details";
import ConfirmationSheet from "@/components/molecules/m-confirmation-sheet";
import ItemSummary from "@/components/molecules/m-item-summary";
import {
	BOOKING_APPLICATION_INCOME_RANGES,
	BOOKING_APPLICATION_STATUS_COLORS,
} from "@/lib/constants/booking/application";
import { Fonts } from "@/lib/constants/theme";
import { useThemeColors } from "@/lib/hooks/use-theme-color";
import {
	BookingApplicationStatus,
	useBookingApplicationQuery,
	useHostingQuery,
	useHostUpdateBookingApplicationStatusMutation,
} from "@/lib/services/graphql/generated";
import { hexToRgba } from "@/lib/utils/colors";
import { handleError } from "@/lib/utils/error";
import { hostingDuration } from "@/lib/utils/hosting/tenancyAgreement";
import { capitalize, toTitleCase } from "@/lib/utils/text";
import { useLocalSearchParams, useRouter } from "expo-router";
import { CircleQuestionMark } from "lucide-react-native";
import React from "react";
import { View } from "react-native";
import Toast from "react-native-toast-message";

export default function BookingApplicationDetails() {
	const router = useRouter();
	const colors = useThemeColors();
	const { applicationId, id } = useLocalSearchParams();
	const [action, setAction] = React.useState<"reject" | "accept">();
	const [{ fetching: updating, error }, mutate] =
		useHostUpdateBookingApplicationStatusMutation();
	const [{ data, fetching }] = useBookingApplicationQuery({
		variables: {
			bookingApplicationId: String(applicationId),
		},
	});

	const [{ data: hostingData, fetching: hostingFetching }] = useHostingQuery({
		variables: {
			hostingId: String(id),
		},
	});

	const duration = React.useMemo(() => {
		const checkinDate = data?.bookingApplication.checkInDate;
		return hostingDuration(
			hostingData?.hosting.paymentInterval,
			data?.bookingApplication.intervalMultiplier,
			checkinDate ? new Date(checkinDate) : undefined,
		);
	}, [hostingData, data]);

	React.useEffect(() => {
		if (error) {
			handleError(error);
		}
	}, [error]);

	const app = data?.bookingApplication;

	function handleMutate() {
		if (app?.id && action)
			mutate({
				input: {
					bookingApplicationId: app?.id,
					status:
						action === "reject"
							? BookingApplicationStatus.Rejected
							: BookingApplicationStatus.HostVerified,
				},
			}).then((res) => {
				if (res.data?.hostUpdateBookingApplicationStatus) {
					Toast.show({
						type: "success",
						text1: "Success",
						text2: res.data.hostUpdateBookingApplicationStatus.message,
					});
					router.replace("/host/listings");
				}
			});
	}

	return (
		<>
			<DetailsLayout
				title="Booking Application"
				footer={
					<View
						className="flex-row gap-4 p-4 pb-8"
						style={{ backgroundColor: colors.background }}
					>
						<Button
							className="flex-1"
							variant="outline"
							type="error"
							style={{ borderColor: hexToRgba(colors.error, 0.6) }}
							onPress={() => setAction("reject")}
						>
							<ThemedText style={{ color: hexToRgba(colors.error, 0.9) }}>
								Reject
							</ThemedText>
						</Button>
						<Button
							type="primary"
							className="flex-1"
							onPress={() => setAction("accept")}
						>
							<ThemedText>Accept</ThemedText>
						</Button>
					</View>
				}
			>
				<View>
					<ThemedText
						className="mb-4"
						style={{ fontSize: 12, color: hexToRgba(colors.text, 0.6) }}
					>
						<CircleQuestionMark color={hexToRgba(colors.text, 0.7)} size={12} />
						{"  "}
						See who wants to move in. Review guest profiles, income details, and
						guarantor information before approving a booking.
					</ThemedText>
					<View className="gap-4 mt-4">
						{hostingFetching || fetching ? (
							<View>
								<Skeleton style={{ height: 180, borderRadius: 14 }} />
							</View>
						) : (
							<>
								<SummarySection>
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
									<ItemSummary
										label="Duration"
										summary={toTitleCase(duration.metric)}
									/>
									<ItemSummary
										label="Commencement"
										summary={toTitleCase(duration.startDateFormatted)}
									/>
									<ItemSummary
										label="Expiry"
										summary={toTitleCase(duration.endDateFormatted)}
									/>
									{app?.status && (
										<View className="flex-row flex-wrap items-center gap-2">
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
										summary={app?.statusDetails ?? ""}
									/>
								</SummarySection>
								<SummarySection>
									{app?.guestFormData?.occupancyTypes && (
										<ItemSummary
											label="Occupancy Types"
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
											label="Income Ranges"
											summary={toTitleCase(
												BOOKING_APPLICATION_INCOME_RANGES.find(
													(v) => v.value === app.guestFormData?.incomeRanges,
												)?.label ?? "",
											)}
										/>
									)}
									{app?.guestFormData?.guarantorRelationships && (
										<ItemSummary
											label="Gurantor Relationship"
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
			<ConfirmationSheet
				prompt={`${capitalize(action ?? "")} Application`}
				description={
					action === "reject"
						? "Are you sure you want to reject this application?"
						: "Are you sure you want to accept this application? All other application will be automatically rejected."
				}
				confirmPrompt={action === "reject" ? "Reject" : "Accept"}
				confirmMode={action === "reject" ? "error" : "default"}
				open={!!action}
				onClose={() => setAction(undefined)}
				onConfirm={handleMutate}
			/>
			<LoadingModal visible={updating} />
		</>
	);
}
ng} />
		</>
	);
}
