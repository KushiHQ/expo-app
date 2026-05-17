import ThemedText from "@/components/atoms/a-themed-text";
import { FluentFormMultiple24Regular } from "@/components/icons/i-document";
import DetailsLayout from "@/components/layouts/details";
import HostingFormOnboardingAction from "@/components/molecules/m-hosting-form-onboarding-action";
import TopListingCard from "@/components/molecules/m-top-listing-card";
import { ONBOARDING_STEPS } from "@/lib/constants/hosting/onboarding";
import { Fonts } from "@/lib/constants/theme";
import { useHostingForm } from "@/lib/hooks/hosting-form";
import { useThemeColors } from "@/lib/hooks/use-theme-color";
import {
	PublishStatus,
	useBookingApplicationsCountQuery,
} from "@/lib/services/graphql/generated";
import { hexToRgba } from "@/lib/utils/colors";
import { Href, useLocalSearchParams, useRouter } from "expo-router";
import { CircleQuestionMark } from "lucide-react-native";
import React from "react";
import { RefreshControl, View } from "react-native";

type Action = {
	filled: boolean;
	disabled: boolean;
	link: Href;
};

export default function HostingOnboarding() {
	const router = useRouter();
	const colors = useThemeColors();
	const { id } = useLocalSearchParams();
	const { hosting, refetch, fetching } = useHostingForm(id);
	const [{ data: countData }] = useBookingApplicationsCountQuery({
		variables: {
			filter: {
				hostingId: hosting?.id,
				authGuest: true,
			},
		},
	});

	const actions = React.useMemo(() => {
		const actions: Record<number, Action> = {};
		ONBOARDING_STEPS.forEach((_, index) => {
			actions[index] = {
				filled: false,
				disabled: true,
				link: `/hostings/form/step-${index + 1}?id=${hosting?.id}`,
			};
		});

		if (hosting) {
			actions[0].filled =
				!!hosting.title && !!hosting.propertyType && !!hosting.listingType;
			actions[0].disabled = false;

			// Step 1: Photos
			actions[1].filled = !!hosting.rooms?.some(
				(room) => room?.images && room.images.length > 0,
			);

			// Step 2: Location
			actions[2].filled = !!(
				hosting.longitude &&
				hosting.latitude &&
				hosting.state &&
				hosting.country &&
				hosting.city &&
				hosting.postalCode &&
				hosting.contact
			);

			// Step 3: Amenities
			actions[3].filled = !!hosting.facilities?.length;

			// Step 4: Pricing
			actions[4].filled = !!(
				hosting.paymentInterval &&
				hosting.price &&
				hosting.paymentDetails
			);

			// Step 5: Mandate
			const v = hosting.verification;
			actions[5].filled = !!(
				v?.landlordFullName &&
				v?.landlordAddress &&
				v?.propertyRelationship &&
				v?.declOwnership &&
				v?.declLitigation &&
				v?.declIndemnity
			);

			// Step 6: Tenancy Terms
			actions[6].filled = !!(
				hosting.tenancyAgreementTemplate?.sections &&
				hosting.tenancyAgreementTemplate.sections?.length > 0 &&
				hosting.host?.signature?.publicUrl
			);

			// Step 7: Review & Publish
			actions[7].filled =
				hosting.publishStatus === PublishStatus.Inreview ||
				hosting.publishStatus === PublishStatus.Live;

			// Step 8: Get Verified
			actions[8].filled = hosting.publishStatus === PublishStatus.Live;
		}

		ONBOARDING_STEPS.forEach((_, index) => {
			if (index !== 0) {
				actions[index]["disabled"] =
					actions[index - 1].disabled || !actions[index - 1].filled;
			}
		});

		return actions;
	}, [hosting]);

	return (
		<DetailsLayout
			title="Hosting"
			refreshControl={
				<RefreshControl refreshing={fetching} onRefresh={refetch} />
			}
		>
			<View>
				<ThemedText
					className="mb-4"
					style={{ fontSize: 12, color: hexToRgba(colors.text, 0.6) }}
				>
					<CircleQuestionMark color={hexToRgba(colors.text, 0.7)} size={12} />
					{"  "}
					Resume your setup, edit your property details, or preview your listing
					before it reaches future tenants.
				</ThemedText>
				<TopListingCard hosting={hosting} />
				<View
					className="border-b py-4"
					style={{ borderColor: hexToRgba(colors.text, 0.15) }}
				>
					<HostingFormOnboardingAction
						icon={FluentFormMultiple24Regular}
						color="accent"
						onPress={() =>
							router.push(`/hostings/${hosting?.id}/booking-applications/`)
						}
					>
						<View className="flex-1">
							<ThemedText style={{ fontFamily: Fonts.bold }}>
								Booking Applications (
								{Number(
									countData?.bookingApplicationsCount ?? "0",
								).toLocaleString()}
								)
							</ThemedText>
							<ThemedText
								style={{
									fontSize: 12,
									color: hexToRgba(colors.text, 0.6),
								}}
							>
								Review and manage pending tenant applications for this property.
							</ThemedText>
						</View>
					</HostingFormOnboardingAction>
				</View>
				<View className="gap-4 mt-8">
					{ONBOARDING_STEPS.map((step, index) => {
						return (
							<HostingFormOnboardingAction
								key={index}
								onPress={() => {
									if (actions[index]?.link) {
										router.push(actions[index]!.link);
									}
								}}
								disabled={!actions[index]?.link || actions[index]?.disabled}
								color={actions[index]?.filled ? "primary" : "default"}
								icon={step.icon}
							>
								<View className="flex-1">
									<ThemedText style={{ fontFamily: Fonts.bold }}>
										{step.title}
									</ThemedText>
									<ThemedText
										style={{
											fontSize: 12,
											color: hexToRgba(colors.text, 0.6),
										}}
									>
										{step.description}
									</ThemedText>
								</View>
							</HostingFormOnboardingAction>
						);
					})}
				</View>
			</View>
		</DetailsLayout>
	);
}
