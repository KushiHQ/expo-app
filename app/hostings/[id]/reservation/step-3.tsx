import Button from "@/components/atoms/a-button";
import LoadingModal from "@/components/atoms/a-loading-modal";
import ThemedText from "@/components/atoms/a-themed-text";
import DetailsLayout from "@/components/layouts/details";
import Collapsible from "@/components/molecules/m-collapsible";
import TenancyAgreementVariableText from "@/components/molecules/m-tenancy-aggreement-variable-text";
import PINModal from "@/components/organisms/o-pin-modal";
import { useThemeColors } from "@/lib/hooks/use-theme-color";
import { useUser } from "@/lib/hooks/user";
import {
	BookingApplicationUpdateInput,
	useCompleteBookingApplicationSubmissionMutation,
	useHostingQuery,
	useInitiateBookingApplicationMutation,
	useInitiateBookingApplicationSubmissionMutation,
	useUpdateBookingApplicationMutation,
} from "@/lib/services/graphql/generated";
import { hexToRgba } from "@/lib/utils/colors";
import { handleError } from "@/lib/utils/error";
import { removeTypenames } from "@/lib/utils/graphql/cleanup";
import { useLocalSearchParams, useRouter } from "expo-router";
import { CircleQuestionMark } from "lucide-react-native";
import React from "react";
import { RefreshControl, View } from "react-native";
import Toast from "react-native-toast-message";

import SuccessModal from "@/components/organisms/o-success-modal";

export default function BookingApplicationStep2() {
	const user = useUser();
	const router = useRouter();
	const colors = useThemeColors();
	const [otpOpen, setOtpOpen] = React.useState(false);
	const [success, setSuccess] = React.useState(false);
	const { id } = useLocalSearchParams();
	const [
		{ fetching: initiatingApplicaiton, data: initiateData },
		initiateApplication,
	] = useInitiateBookingApplicationMutation();
	const [{ fetching: updatingBookingApplication, error: updateError }, mutate] =
		useUpdateBookingApplicationMutation();
	const [input, setInput] = React.useState({} as BookingApplicationUpdateInput);
	const [{ data: hostingData }] = useHostingQuery({
		variables: { hostingId: String(id) },
	});
	const [
		{ fetching: initiatingSubmission, error: initiateSubmissionError },
		initiateSubmission,
	] = useInitiateBookingApplicationSubmissionMutation();
	const [
		{ fetching: completingSubmission, error: completionError },
		completeSubmission,
	] = useCompleteBookingApplicationSubmissionMutation();

	React.useEffect(() => {
		initiateApplication({
			hostingId: String(id),
		});
	}, []);

	React.useEffect(() => {
		if (initiateSubmissionError) {
			handleError(initiateSubmissionError);
		} else if (updateError) {
			handleError(updateError);
		} else if (completionError) {
			handleError(completionError);
		}
	}, [initiateSubmissionError, completionError, updateError]);

	React.useEffect(() => {
		if (initiateData?.initiateBookingApplication.data) {
			const cleanedUp = removeTypenames(
				initiateData.initiateBookingApplication.data,
			);
			const { status, statusDetails, createdAt, lastUpdated, ...rest } =
				cleanedUp;
			setInput({
				...rest,
				bookingAggrement: removeTypenames(
					hostingData?.hosting.tenancyAgreementTemplate,
				),
			});
		}
	}, [initiateData]);

	function handleCompletion(otp: string) {
		if (initiateData?.initiateBookingApplication.data?.id)
			completeSubmission({
				input: {
					applicationId: initiateData.initiateBookingApplication.data.id,
					otp,
				},
			}).then((res) => {
				if (res.data?.completeBookingApplicationSubmission) {
					Toast.show({
						type: "success",
						text1: "Success",
						text2: res.data.completeBookingApplicationSubmission.message,
					});
					setOtpOpen(false);
					setSuccess(true);
				}
			});
	}

	const handleClose = () => {
		setSuccess(false);
		router.replace("/users/booking-applications");
	};

	const handleMutate = () => {
		mutate({
			input: {
				...input,
				bookingAggrement: removeTypenames(input.bookingAggrement),
			},
		}).then((res) => {
			if (res.data?.updateBookingApplication.data) {
				initiateSubmission({
					applicationId: res.data.updateBookingApplication.data?.id,
				}).then((res) => {
					if (res.data?.initiateBookingApplicationSubmission) {
						Toast.show({
							type: "success",
							text1: "Success",
							text2: res.data.initiateBookingApplicationSubmission.message,
						});
						setOtpOpen(true);
					}
				});
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
						className="px-6 pb-4 gap-4 flex-row"
						style={{ backgroundColor: colors.background }}
					>
						<Button
							onPress={() => router.back()}
							className="flex-1"
							variant="outline"
							type="primary"
						>
							<ThemedText content="tinted">Go Back</ThemedText>
						</Button>
						<Button onPress={handleMutate} type="primary" className="flex-1">
							<ThemedText content="primary">Submit</ThemedText>
						</Button>
					</View>
				}
			>
				<View className="mt-2">
					<ThemedText>{"Tenancy Terms & Conditions"}</ThemedText>
					<ThemedText
						style={{ fontSize: 12, color: hexToRgba(colors.text, 0.6) }}
					>
						<CircleQuestionMark color={hexToRgba(colors.text, 0.7)} size={12} />
						{
							"  Please review the landlord's rules and lease terms below. By submitting this application, you agree to these conditions. If you have questions or wish to discuss a specific clause, please contact the host before submitting."
						}
					</ThemedText>
					<View className="mt-8 gap-4 min-h-[500px]">
						<View>
							{hostingData &&
								(
									hostingData?.hosting.tenancyAgreementTemplate?.sections ?? []
								).map((section) => (
									<Collapsible
										title={section.title}
										description={section.description}
										key={section.id}
									>
										<View className="mt-4">
											{section?.preamble && (
												<TenancyAgreementVariableText
													hosting={hostingData.hosting}
													text={section.preamble}
												/>
											)}
										</View>
										<View className="mt-4">
											{section?.subClauses.map((clause) => (
												<Collapsible
													title={clause.title}
													description={clause.description}
													key={clause.id}
												>
													<View className="mt-4">
														{clause.content && (
															<TenancyAgreementVariableText
																hosting={hostingData.hosting}
																providedValues={clause.providedValues}
																text={clause.content}
															/>
														)}
													</View>
												</Collapsible>
											))}
										</View>
									</Collapsible>
								))}
						</View>
					</View>
				</View>
			</DetailsLayout>
			<LoadingModal
				visible={
					initiatingApplicaiton ||
					updatingBookingApplication ||
					initiatingSubmission ||
					completingSubmission
				}
			/>
			<PINModal
				label="Enter OTP"
				description={`An OTP has been sent to ${user.user.email}`}
				length={6}
				onSubmit={handleCompletion}
				open={otpOpen}
				onClose={() => setOtpOpen(false)}
			/>
			<SuccessModal
				open={success}
				onClose={handleClose}
				title="Application Submitted"
				description="Your booking application has been successfully submitted! The landlord will review your application and you will be contacted regarding the next steps within the next 3 business days."
				action={
					<Button onPress={handleClose} type="primary" className="w-60">
						<ThemedText content="primary">View My Applications</ThemedText>
					</Button>
				}
			/>
		</>
	);
}
