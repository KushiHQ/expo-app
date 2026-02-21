import FloatingLabelInput from "@/components/atoms/a-floating-label-input";
import LoadingModal from "@/components/atoms/a-loading-modal";
import ThemedText from "@/components/atoms/a-themed-text";
import DetailsLayout from "@/components/layouts/details";
import CheckboxInput from "@/components/molecules/m-checkbox-input";
import HostingStepper from "@/components/molecules/m-hosting-stepper";
import SelectInput, {
	SelectOption,
} from "@/components/molecules/m-select-input";
import { HOSTING_VERIFICATION_OPTIONS } from "@/lib/constants/hosting/verification";
import { Fonts } from "@/lib/constants/theme";
import { useHostingForm } from "@/lib/hooks/hosting-form";
import { useThemeColors } from "@/lib/hooks/use-theme-color";
import { cast } from "@/lib/types/utils";
import { hexToRgba } from "@/lib/utils/colors";
import { handleError } from "@/lib/utils/error";
import { useLocalSearchParams, useRouter } from "expo-router";
import { CircleQuestionMark } from "lucide-react-native";
import React from "react";
import { View } from "react-native";
import Toast from "react-native-toast-message";

export default function NewHostingStep6() {
	const router = useRouter();
	const colors = useThemeColors();
	const { id } = useLocalSearchParams();
	const {
		verificationMutate,
		verificationMutating,
		verificationInput,
		updateVerificationInput,
		hosting,
		fetching: fetchingHosting,
	} = useHostingForm(id);

	const handleMutate = () => {
		verificationMutate({ input: cast(verificationInput) }).then((res) => {
			if (res.error) {
				handleError(res.error);
			}
			if (res.data?.initiateHostingVerification) {
				router.push(`/hostings/form/step-7?id=${hosting?.id}`);
				Toast.show({
					type: "success",
					text1: "Success",
					text2: res.data.initiateHostingVerification.message,
				});
			}
		});
	};

	const loading = verificationMutating || fetchingHosting;

	return (
		<>
			<DetailsLayout
				title="Hosting"
				footer={
					<HostingStepper
						onPress={handleMutate}
						loading={verificationMutating}
						disabled={
							!verificationInput.declIndemnity ||
							!verificationInput.declOwnership ||
							!verificationInput.declLitigation ||
							!verificationInput.landlordAddress ||
							!verificationInput.landlordFullName ||
							!verificationInput.propertyRelationship ||
							!verificationInput.hostingId
						}
						step={6}
					/>
				}
			>
				<View className="min-h-[600px]">
					<View className="mt-2 gap-4">
						<ThemedText
							style={{ fontSize: 12, color: hexToRgba(colors.text, 0.6) }}
						>
							<CircleQuestionMark
								color={hexToRgba(colors.text, 0.7)}
								size={12}
							/>
							{"  "}
							Confirm your legal right to list this space. Please provide the
							landlord&apos;s official details and complete the mandatory legal
							declarations regarding ownership, litigation, and indemnity.
						</ThemedText>
						<ThemedText style={{ fontFamily: Fonts.medium }}>
							{"Landlord Mandate"}
						</ThemedText>
						<View className="gap-4">
							<FloatingLabelInput
								focused
								label="Landlord Full Name"
								placeholder="Thomas Shelby"
								value={verificationInput.landlordFullName}
								onChangeText={(v) => {
									updateVerificationInput({ landlordFullName: v });
								}}
							/>
							<FloatingLabelInput
								focused
								label="Landlord Address"
								placeholder="Arley Hall & Gardens, Northwich, Cheshire"
								value={verificationInput.landlordAddress}
								onChangeText={(v) => {
									updateVerificationInput({ landlordAddress: v });
								}}
							/>
							<SelectInput
								focused
								description="Select your role in managing this property. Are you the legal owner (Landlord), an appointed representative (Agent), or a current tenant with permission to rent it out (Subletter)?"
								label="Property Relationship"
								placeholder="Landlord"
								defaultValue={
									verificationInput.propertyRelationship
										? {
												label: verificationInput.propertyRelationship,
												value: verificationInput.propertyRelationship,
											}
										: undefined
								}
								onSelect={(v) =>
									updateVerificationInput({
										propertyRelationship: cast(v.value),
									})
								}
								options={HOSTING_VERIFICATION_OPTIONS}
								renderItem={SelectOption}
							/>
						</View>
						<View className="gap-4 mt-4">
							<CheckboxInput
								checked={verificationInput.declOwnership}
								onCheckChange={(v) =>
									updateVerificationInput({ declOwnership: v })
								}
								description="I hereby declare that I am the legal owner of this property, or I possess explicit, documented authorization (such as a mandate, power of attorney, or landlord's consent to sublease) to rent out this space"
							/>
							<CheckboxInput
								checked={verificationInput.declLitigation}
								onCheckChange={(v) =>
									updateVerificationInput({ declLitigation: v })
								}
								description="I confirm that there are no ongoing court cases, legal disputes, or foreclosures involving this property that would prevent a tenant from living here peacefully."
							/>
							<CheckboxInput
								checked={verificationInput.declIndemnity}
								onCheckChange={(v) =>
									updateVerificationInput({ declIndemnity: v })
								}
								description="I agree to take full legal and financial responsibility, protecting Kushi from any claims or lawsuits, if the ownership or litigation information I have provided is false."
							/>
						</View>
					</View>
				</View>
			</DetailsLayout>
			<LoadingModal visible={loading} />
		</>
	);
}
