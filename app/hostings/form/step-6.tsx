import ThemedText from "@/components/atoms/a-themed-text";
import DetailsLayout from "@/components/layouts/details";
import HostingStepper from "@/components/molecules/m-hosting-stepper";
import { Fonts } from "@/lib/constants/theme";
import { useThemeColors } from "@/lib/hooks/use-theme-color";
import { hexToRgba } from "@/lib/utils/colors";
import React from "react";
import { Pressable, View } from "react-native";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import {
	Camera,
	CircleQuestionMark,
	MapPin,
	Plus,
	X,
} from "lucide-react-native";
import { useHostingForm } from "@/lib/hooks/hosting-form";
import {
	HostingPoliciesInput,
	PublishStatus,
	UpdateHostMutation,
	UpdateHostMutationVariables,
	useAuthHostQuery,
	useHostTenancyAgreementPreviewQuery,
} from "@/lib/services/graphql/generated";
import LoadingModal from "@/components/atoms/a-loading-modal";
import { handleError } from "@/lib/utils/error";
import Toast from "react-native-toast-message";
import FloatingLabelInput from "@/components/atoms/a-floating-label-input";
import Button from "@/components/atoms/a-button";
import Skeleton from "@/components/atoms/a-skeleton";
import WebView from "@/components/atoms/a-web-veiw";
import { useGalleryStore } from "@/lib/stores/gallery";
import { formMutation } from "@/lib/services/graphql/utils/fetch";
import { UPDATE_HOST } from "@/lib/services/graphql/requests/mutations/users";
import { generateRNFile } from "@/lib/utils/file";
import { Image } from "expo-image";
import { PROPERTY_BLURHASH } from "@/lib/constants/images";
import { useDebounce } from "@/lib/hooks/use-debounce";

export default function NewHostingStep6() {
	const router = useRouter();
	const colors = useThemeColors();
	const { id } = useLocalSearchParams();
	const {
		input,
		hosting,
		mutate,
		refetch,
		mutating,
		updateInput,
		fetching: fetchingHosting,
	} = useHostingForm(id);
	const { setGallery, gallery } = useGalleryStore();
	const [{ data: hostQueryData, fetching: hostFetching }, refetchHost] =
		useAuthHostQuery();
	const [uploading, setUploading] = React.useState(false);
	const [newRestriction, setNewRestriction] = React.useState<string>();
	const debouncedPolicies = useDebounce(input.policies, 500);
	const [{ data: templateData, fetching: templateFetching }] =
		useHostTenancyAgreementPreviewQuery({
			variables: { policies: debouncedPolicies },
		});

	const loading = fetchingHosting || mutating || uploading;

	const handleMutate = () => {
		mutate({ input }).then((res) => {
			if (res.error) {
				handleError(res.error);
			}
			if (res.data) {
				Toast.show({
					type: "success",
					text1: "Success",
					text2: res.data.createOrUpdateHosting.message,
				});
				refetch();
				router.push(
					`/hostings/form/step-7?id=${res.data?.createOrUpdateHosting.data?.id}`,
				);
			}
		});
	};

	const handleTakeSignaturePic = () => {
		setGallery([]);
		router.push("/camera?redirect=/hostings/form/step-6&multiple=false");
	};

	useFocusEffect(
		React.useCallback(() => {
			let signature = gallery.at(0);

			if (
				signature &&
				!hostQueryData?.authHost.signature?.publicUrl &&
				!hostFetching
			) {
				setUploading(true);
				formMutation<UpdateHostMutation, UpdateHostMutationVariables>(
					UPDATE_HOST,
					{
						input: {
							signature: generateRNFile(signature),
						},
					},
				)
					.then((res) => {
						if (res.error) {
							handleError(res.error);
						}
						if (res.data) {
							refetchHost({ requestPolicy: "network-only" });
							Toast.show({
								type: "success",
								text1: "Success",
								text2: res.data.updateHost.message,
							});
						}
					})
					.finally(() => setUploading(false));
			}
		}, [gallery]),
	);

	return (
		<>
			<DetailsLayout
				title="Hosting"
				footer={
					<HostingStepper
						onPress={handleMutate}
						published={hosting?.publishStatus === PublishStatus.Live}
						loading={mutating}
						disabled={
							!input.policies?.correspondenceAddress ||
							!hostQueryData?.authHost.signature?.publicUrl
						}
						step={6}
					/>
				}
			>
				<View className="mt-2 gap-4">
					<ThemedText style={{ fontFamily: Fonts.medium }}>
						Legal & House Rules
					</ThemedText>
					<ThemedText
						style={{ fontSize: 12, color: hexToRgba(colors.text, 0.6) }}
					>
						<CircleQuestionMark color={hexToRgba(colors.text, 0.7)} size={12} />
						{"  "}
						Finalize your Tenancy Agreement by setting the maximum Occupancy,
						detailing any House Rules (not allowed items), and providing your
						Digital Signature. Review the live preview of the agreement before
						continuing.
					</ThemedText>
					<View className="gap-2">
						<View className="gap-4">
							<FloatingLabelInput
								focused
								label="Correspondence Address"
								suffix={
									<MapPin color={hexToRgba(colors.text, 0.8)} size={16} />
								}
								placeholder="A tenancy agreement will be adressed to this address"
								value={input.policies?.correspondenceAddress}
								onChangeText={(v) =>
									updateInput({
										policies: {
											...(input.policies ?? ({} as HostingPoliciesInput)),
											correspondenceAddress: v,
										},
									})
								}
							/>
							<FloatingLabelInput
								focused
								label="Max Occupancy (Optional)"
								inputMode="numeric"
								value={input.policies?.maxOccupancy?.toString()}
								placeholder="5"
								onChangeText={(v) =>
									updateInput({
										policies: {
											...(input.policies ?? ({} as HostingPoliciesInput)),
											maxOccupancy: Number(v),
										},
									})
								}
							/>
						</View>
						<View className="flex-row gap-2 mt-2">
							<View className="flex-1">
								<FloatingLabelInput
									focused
									value={newRestriction}
									label="Not allowed (Optional)"
									placeholder="Loud music"
									onChangeText={setNewRestriction}
								/>
							</View>
							<Button
								onPress={() => {
									if (newRestriction)
										updateInput({
											policies: {
												...(input.policies ?? ({} as HostingPoliciesInput)),
												notAllowed: [
													...(input.policies?.notAllowed ?? []),
													newRestriction,
												],
											},
										});
									setNewRestriction(undefined);
								}}
								type="text"
								disabled={!newRestriction?.length}
							>
								<Plus color={colors.background} size={34} />
							</Button>
						</View>
						<View className="flex-row gap-2">
							{input.policies?.notAllowed?.map((item, index) => (
								<View
									className="p-2 rounded-lg flex-row gap-4 items-center max-w-fit"
									key={index}
									style={{ backgroundColor: colors.primary }}
								>
									<ThemedText content="primary">{item}</ThemedText>
									<Pressable
										onPress={() =>
											updateInput({
												policies: {
													...(input.policies ?? ({} as HostingPoliciesInput)),
													notAllowed: (input.policies?.notAllowed ?? []).filter(
														(v) => v !== item,
													),
												},
											})
										}
									>
										<X color={colors.text} size={18} />
									</Pressable>
								</View>
							))}
							{!input.policies?.notAllowed?.length && (
								<View
									className="items-center flex-1 p-4 rounded-xl"
									style={{ backgroundColor: hexToRgba(colors.text, 0.05) }}
								>
									<ThemedText style={{ color: hexToRgba(colors.text, 0.6) }}>
										No items specified
									</ThemedText>
								</View>
							)}
						</View>
						<View className="mt-4">
							<FloatingLabelInput
								focused
								multiline
								label="Additional Clause (Optional)"
								onChangeText={(value) =>
									updateInput({
										policies: {
											...(input.policies ?? ({} as HostingPoliciesInput)),
											additionalClauses: value,
										},
									})
								}
								containerStyle={{ minHeight: 120 }}
								placeholder="An additional clause that will go on the tenancy agreement..."
							/>
						</View>
						<View className="gap-2 mt-4">
							<ThemedText>Signature</ThemedText>
							{hostQueryData?.authHost.signature?.publicUrl ? (
								<View className="h-[120px] bg-white rounded-xl">
									<Image
										source={{
											uri: hostQueryData?.authHost.signature?.publicUrl,
										}}
										style={{
											height: "100%",
											width: "100%",
											borderRadius: 20,
										}}
										contentFit="contain"
										transition={300}
										placeholder={{ blurhash: PROPERTY_BLURHASH }}
										placeholderContentFit="cover"
										cachePolicy="memory-disk"
										priority="high"
									/>
								</View>
							) : (
								<Pressable
									onPress={handleTakeSignaturePic}
									className="p-4 py-6 items-center justify-center rounded-xl"
									style={{
										borderWidth: 1.5,
										borderColor: hexToRgba(colors.primary, 0.5),
										borderStyle: "dashed",
									}}
								>
									<Camera color={hexToRgba(colors.primary, 0.7)} />
									<ThemedText
										style={{
											fontSize: 14,
											maxWidth: 200,
											textAlign: "center",
											color: hexToRgba(colors.text, 0.6),
										}}
									>
										Take a picture of your signature on a piece of paper
									</ThemedText>
								</Pressable>
							)}
						</View>
					</View>
					{templateFetching ? (
						<Skeleton style={{ height: 700, borderRadius: 20 }} />
					) : (
						<WebView html={templateData?.hostTenancyAgreementPreview ?? ""} />
					)}
				</View>
			</DetailsLayout>
			<LoadingModal visible={loading} />
		</>
	);
}
