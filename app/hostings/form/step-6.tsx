import FloatingLabelInput from "@/components/atoms/a-floating-label-input";
import LoadingModal from "@/components/atoms/a-loading-modal";
import ThemedText from "@/components/atoms/a-themed-text";
import DetailsLayout from "@/components/layouts/details";
import CheckboxInput from "@/components/molecules/m-checkbox-input";
import HostingStepper from "@/components/molecules/m-hosting-stepper";
import SectionCard from "@/components/molecules/m-section-card";
import SelectInput, {
	SelectOption,
} from "@/components/molecules/m-select-input";
import { HOSTING_VERIFICATION_OPTIONS } from "@/lib/constants/hosting/verification";
import { useHostingForm } from "@/lib/hooks/hosting-form";
import { useThemeColors } from "@/lib/hooks/use-theme-color";
import { cast } from "@/lib/types/utils";
import { handleError } from "@/lib/utils/error";
import { useLocalSearchParams } from "expo-router";
import { useRouter } from "@/lib/hooks/use-router";
import { ShieldCheck, UserRound } from "lucide-react-native";
import React, { useRef } from "react";
import { TextInput, View } from "react-native";
import { toast } from "@/lib/hooks/use-toast";

export default function NewHostingStep6() {
	const router = useRouter();
	const colors = useThemeColors();
	const { id } = useLocalSearchParams();
	const landlordAddressRef = useRef<TextInput>(null);
	const titleTypeRef = useRef<TextInput>(null);
	const titleNumberRef = useRef<TextInput>(null);
	const {
		verificationMutate,
		verificationMutating,
		verificationInput,
		updateVerificationInput,
		hosting,
	} = useHostingForm(id);

	const handleMutate = () => {
		verificationMutate({ input: cast(verificationInput) }).then((res) => {
			if (res.error) {
				handleError(res.error);
			}
			if (res.data?.initiateHostingVerification) {
				router.push(`/hostings/form/step-7?id=${hosting?.id}`);
				toast.show({
					type: "success",
					text1: "Success",
					text2: res.data.initiateHostingVerification.message,
				});
			}
		});
	};

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
				<View style={{ gap: 20, paddingBottom: 24 }}>
					<SectionCard
						icon={<UserRound size={16} color={colors.primary} />}
						title="Landlord Details"
						subtitle="Official details of the property owner and your role"
					>
						<FloatingLabelInput
							focused
							label="Landlord Full Name"
							placeholder="Thomas Shelby"
							value={verificationInput.landlordFullName}
							onChangeText={(v) =>
								updateVerificationInput({ landlordFullName: v })
							}
							returnKeyType="next"
							onSubmitEditing={() => landlordAddressRef.current?.focus()}
							blurOnSubmit={false}
						/>
						<FloatingLabelInput
							ref={landlordAddressRef}
							focused
							label="Landlord Address"
							placeholder="Arley Hall & Gardens, Northwich, Cheshire"
							value={verificationInput.landlordAddress}
							onChangeText={(v) =>
								updateVerificationInput({ landlordAddress: v })
							}
							returnKeyType="next"
							onSubmitEditing={() => titleTypeRef.current?.focus()}
							blurOnSubmit={false}
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
								updateVerificationInput({ propertyRelationship: cast(v.value) })
							}
							options={HOSTING_VERIFICATION_OPTIONS}
							renderItem={SelectOption}
						/>
					</SectionCard>

					<SectionCard
						icon={<ShieldCheck size={16} color={colors.primary} />}
						title="Legal Declarations"
						subtitle="All three declarations are required to list this property"
					>
						<CheckboxInput
							checked={verificationInput.declOwnership}
							onCheckChange={(v) =>
								updateVerificationInput({ declOwnership: v })
							}
						>
							<ThemedText style={{ fontSize: 13, lineHeight: 20, flex: 1 }}>
								I hereby declare that I am the legal owner of this property, or
								I possess explicit, documented authorization (such as a mandate,
								power of attorney, or landlord's consent to sublease) to rent
								out this space.
							</ThemedText>
						</CheckboxInput>
						<CheckboxInput
							checked={verificationInput.declLitigation}
							onCheckChange={(v) =>
								updateVerificationInput({ declLitigation: v })
							}
						>
							<ThemedText style={{ fontSize: 13, lineHeight: 20, flex: 1 }}>
								I confirm that there are no ongoing court cases, legal disputes,
								or foreclosures involving this property that would prevent a
								tenant from living here peacefully.
							</ThemedText>
						</CheckboxInput>
						<CheckboxInput
							checked={verificationInput.declIndemnity}
							onCheckChange={(v) =>
								updateVerificationInput({ declIndemnity: v })
							}
						>
							<ThemedText style={{ fontSize: 13, lineHeight: 20, flex: 1 }}>
								I agree to take full legal and financial responsibility,
								protecting Kushi from any claims or lawsuits, if the ownership
								or litigation information I have provided is false.
							</ThemedText>
						</CheckboxInput>
					</SectionCard>
				</View>
			</DetailsLayout>
			<LoadingModal visible={verificationMutating} />
		</>
	);
}
