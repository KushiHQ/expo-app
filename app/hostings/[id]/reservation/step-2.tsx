import Button from "@/components/atoms/a-button";
import LoadingModal from "@/components/atoms/a-loading-modal";
import ThemedSwitch from "@/components/atoms/a-themed-switch";
import ThemedText from "@/components/atoms/a-themed-text";
import Tooltip from "@/components/atoms/a-tooltip";
import DetailsLayout from "@/components/layouts/details";
import SelectInput, {
	SelectOption,
} from "@/components/molecules/m-select-input";
import {
	BOOKING_APPLICATION_EMPLOYMENT_STATUS,
	BOOKING_APPLICATION_GUARANTOR_RELATIONSHIPS,
	BOOKING_APPLICATION_INCOME_RANGES,
	BOOKING_APPLICATION_OCCUPANCY_TYPES,
} from "@/lib/constants/booking/application";
import { useThemeColors } from "@/lib/hooks/use-theme-color";
import {
	BookingApplicationUpdateInput,
	GuestFormDataInput,
	GuestFormEmploymentStatus,
	useInitiateBookingApplicationMutation,
	useUpdateBookingApplicationMutation,
} from "@/lib/services/graphql/generated";
import { cast } from "@/lib/types/utils";
import { hexToRgba } from "@/lib/utils/colors";
import { handleError } from "@/lib/utils/error";
import { removeTypenames } from "@/lib/utils/graphql/cleanup";
import { useLocalSearchParams, useRouter } from "expo-router";
import { CircleQuestionMark } from "lucide-react-native";
import React from "react";
import { RefreshControl, View } from "react-native";
import Toast from "react-native-toast-message";

export default function BookingApplicationStep2() {
	const router = useRouter();
	const colors = useThemeColors();
	const { id } = useLocalSearchParams();
	const [
		{ fetching: initiatingApplicaiton, data: initiateData },
		initiateApplication,
	] = useInitiateBookingApplicationMutation();
	const [{ fetching: updatingBookingApplication, error: updateError }, mutate] =
		useUpdateBookingApplicationMutation();
	const [input, setInput] = React.useState({} as BookingApplicationUpdateInput);
	const [hasGurantor, setHasGuarantor] = React.useState(false);

	function updateGuestFormData(input: Partial<GuestFormDataInput>) {
		setInput((c) => {
			const { guestFormData } = c;
			const data = guestFormData ?? ({} as GuestFormDataInput);
			const updated = { ...data, ...input };

			return { ...c, guestFormData: updated };
		});
	}

	React.useEffect(() => {
		initiateApplication({
			hostingId: String(id),
		});
	}, []);

	React.useEffect(() => {
		if (updateError) {
			handleError(updateError);
		}
	}, [updateError]);

	React.useEffect(() => {
		if (initiateData?.initiateBookingApplication.data) {
			const cleanedUp = removeTypenames(
				initiateData.initiateBookingApplication.data,
			);
			const { status, statusDetails, createdAt, lastUpdated, ...rest } =
				cleanedUp;
			setHasGuarantor(!!cleanedUp.guestFormData?.guarantorRelationships);
			setInput({
				...rest,
				intervalMultiplier: cleanedUp.intervalMultiplier ?? 1,
			});
		}
	}, [initiateData]);

	const handleMutate = () => {
		mutate({ input }).then((res) => {
			if (res.data?.updateBookingApplication) {
				Toast.show({
					type: "success",
					text1: "Success",
					text2: res.data.updateBookingApplication.message,
				});
				router.push(`/hostings/${id}/reservation/step-3`);
			}
		});
	};

	return (
		<>
			<DetailsLayout
				title="Booking Application"
				refreshControl={
					<RefreshControl
						refreshing={initiatingApplicaiton}
						onRefresh={() => initiateApplication({ hostingId: String(id) })}
					/>
				}
				footer={
					<View
						className="px-6 pb-4 gap-4"
						style={{ backgroundColor: colors.background }}
					>
						<Button
							onPress={handleMutate}
							type="primary"
							disabled={
								!input.guestFormData?.occupancyTypes ||
								!input.guestFormData.employmentStatus ||
								(input.guestFormData.employmentStatus ===
									GuestFormEmploymentStatus.Employed
									? !input.guestFormData.incomeRanges
									: false) ||
								(hasGurantor &&
									input.guestFormData.employmentStatus !==
									GuestFormEmploymentStatus.Employed &&
									!input.guestFormData.guarantorRelationships)
							}
						>
							<ThemedText content="primary">Continue</ThemedText>
						</Button>
					</View>
				}
			>
				<View className="mt-2">
					<ThemedText
						style={{ fontSize: 12, color: hexToRgba(colors.text, 0.6) }}
					>
						<CircleQuestionMark color={hexToRgba(colors.text, 0.7)} size={12} />
						{
							"  You're almost there! Fill out your guest profile with accurate background and employment details. A complete and honest profile gives you the best chance of getting approved quickly."
						}
					</ThemedText>
					<View className="mt-8 gap-4 min-h-[500px]">
						<View>
							<SelectInput
								focused
								label="Occupancy Type"
								placeholder="Single"
								description="Select the number of people who will be living in this property."
								defaultValue={
									input.guestFormData?.occupancyTypes
										? {
											label:
												BOOKING_APPLICATION_OCCUPANCY_TYPES.find(
													(v) =>
														v.value === input.guestFormData?.occupancyTypes,
												)?.label ?? input.guestFormData.occupancyTypes,
											value: input.guestFormData.occupancyTypes,
										}
										: undefined
								}
								onSelect={(v) =>
									updateGuestFormData({ occupancyTypes: cast(v.value) })
								}
								options={BOOKING_APPLICATION_OCCUPANCY_TYPES}
								renderItem={SelectOption}
							/>
						</View>
						<View>
							<SelectInput
								focused
								label="Employment Status"
								placeholder="Employed"
								description="Your current work status. Landlords use this to verify your source of income."
								defaultValue={
									input.guestFormData?.employmentStatus
										? {
											label:
												BOOKING_APPLICATION_EMPLOYMENT_STATUS.find(
													(v) =>
														v.value === input.guestFormData?.employmentStatus,
												)?.label ?? input.guestFormData.employmentStatus,
											value: input.guestFormData.employmentStatus,
										}
										: undefined
								}
								onSelect={(v) =>
									updateGuestFormData({ employmentStatus: cast(v.value) })
								}
								options={BOOKING_APPLICATION_EMPLOYMENT_STATUS}
								renderItem={SelectOption}
							/>
						</View>
						{input.guestFormData?.employmentStatus ===
							GuestFormEmploymentStatus.Employed ? (
							<View>
								<SelectInput
									focused
									label="Income Range"
									placeholder="₦200,000 – ₦800,000 per month."
									description="Your average monthly income. This is encrypted and kept strictly confidential."
									defaultValue={
										input.guestFormData?.incomeRanges
											? {
												label:
													BOOKING_APPLICATION_INCOME_RANGES.find(
														(v) =>
															v.value === input.guestFormData?.incomeRanges,
													)?.label ?? input.guestFormData.incomeRanges,
												value: input.guestFormData.incomeRanges,
											}
											: undefined
									}
									onSelect={(v) =>
										updateGuestFormData({ incomeRanges: cast(v.value) })
									}
									options={BOOKING_APPLICATION_INCOME_RANGES.sort(
										(a, b) => (a.sequence ?? 1) - (b.sequence ?? 1),
									)}
									renderItem={SelectOption}
								/>
							</View>
						) : (
							<View className="flex-row justify-between px-2 items-center">
								<View className="flex-row items-center gap-2">
									<ThemedText style={{ fontSize: 14 }}>
										I Have a Guarantor
									</ThemedText>
									<Tooltip
										title="Gurantor"
										description="A guarantor is a trusted person (like a parent or employer) who agrees to take responsibility if you cannot pay your rent."
									>
										<CircleQuestionMark
											color={hexToRgba(colors.text, 0.7)}
											size={14}
										/>
									</Tooltip>
								</View>
								<ThemedSwitch
									value={hasGurantor}
									onValueChange={setHasGuarantor}
								/>
							</View>
						)}
						{hasGurantor &&
							input.guestFormData?.employmentStatus !==
							GuestFormEmploymentStatus.Employed && (
								<View>
									<SelectInput
										focused
										label="Guarantor Relationship"
										placeholder="Employer"
										description="How is your guarantor related to you? Landlords prefer close family members or employers."
										defaultValue={
											input.guestFormData?.guarantorRelationships
												? {
													label:
														BOOKING_APPLICATION_GUARANTOR_RELATIONSHIPS.find(
															(v) =>
																v.value ===
																input.guestFormData?.guarantorRelationships,
														)?.label ??
														input.guestFormData.guarantorRelationships,
													value: input.guestFormData.guarantorRelationships,
												}
												: undefined
										}
										onSelect={(v) =>
											updateGuestFormData({
												guarantorRelationships: cast(v.value),
											})
										}
										options={BOOKING_APPLICATION_GUARANTOR_RELATIONSHIPS.sort(
											(a, b) => (a.sequence ?? 1) - (b.sequence ?? 1),
										)}
										renderItem={SelectOption}
									/>
								</View>
							)}
					</View>
				</View>
			</DetailsLayout>
			<LoadingModal
				visible={initiatingApplicaiton || updatingBookingApplication}
			/>
		</>
	);
}
