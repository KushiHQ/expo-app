import Button from "@/components/atoms/a-button";
import FloatingLabelInput from "@/components/atoms/a-floating-label-input";
import LoadingModal from "@/components/atoms/a-loading-modal";
import ThemedText from "@/components/atoms/a-themed-text";
import DetailsLayout from "@/components/layouts/details";
import HostingStepper from "@/components/molecules/m-hosting-stepper";
import TextSelectButton from "@/components/molecules/m-text-select-button";
import { Fonts } from "@/lib/constants/theme";
import { useHostingForm } from "@/lib/hooks/hosting-form";
import { useThemeColors } from "@/lib/hooks/use-theme-color";
import { FACILITIES_BY_VARIANT } from "@/lib/types/enums/hostings";
import { cast } from "@/lib/types/utils";
import { hexToRgba } from "@/lib/utils/colors";
import { handleError } from "@/lib/utils/error";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Check, CircleQuestionMark } from "lucide-react-native";
import React from "react";
import { View } from "react-native";
import { SimpleGrid } from "react-native-super-grid";
import Toast from "react-native-toast-message";

export default function NewHostingStep4() {
	const router = useRouter();
	const colors = useThemeColors();
	const { id } = useLocalSearchParams();
	const [newFacility, setNewFacility] = React.useState<string | null>(null);
	const {
		input,
		mutate,
		updateInput,
		mutating,
		fetching: fetchingHosting,
	} = useHostingForm(id);

	const loading = fetchingHosting || mutating;

	const facilities = React.useMemo(() => {
		const selected = input.facilities ?? [];

		const defaultFacilities = FACILITIES_BY_VARIANT.filter((v) =>
			v.hostingVariants.includes(cast(input.propertyType ?? "")),
		).map((v) => v.facility);

		const other = selected.filter((v) => !defaultFacilities.includes(cast(v)));

		return [...defaultFacilities, ...other];
	}, [input.facilities, input.propertyType]);

	const toggleFacilitySelect = (facility: string) => {
		const facilities = [...(input.facilities ?? [])];
		if (facilities.includes(facility)) {
			updateInput({ facilities: facilities.filter((v) => v !== facility) });
		} else {
			updateInput({ facilities: [...facilities, facility] });
		}
	};

	const handleMutate = () => {
		mutate({ input: input }).then((res) => {
			if (res.error) {
				handleError(res.error);
			}
			if (res.data?.createOrUpdateHosting) {
				router.push(
					`/hostings/form/step-5?id=${res.data?.createOrUpdateHosting.data?.id}`,
				);
				Toast.show({
					type: "success",
					text1: "Success",
					text2: res.data.createOrUpdateHosting.message,
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
						disabled={mutating || !input.facilities?.length}
						loading={mutating}
						step={4}
					/>
				}
			>
				<View className="mt-2 gap-4 min-h-[660px]">
					<ThemedText
						style={{ fontSize: 12, color: hexToRgba(colors.text, 0.6) }}
					>
						<CircleQuestionMark color={hexToRgba(colors.text, 0.7)} size={12} />
						{"  "}
						Let guests know what to expect. Tap to select all the amenities and
						features available at your property.
					</ThemedText>
					<View className="mt-4 gap-3">
						<ThemedText style={{ fontFamily: Fonts.medium }}>
							Features & Amenities
						</ThemedText>
						<SimpleGrid
							listKey={undefined}
							itemDimension={180}
							data={facilities}
							spacing={0}
							renderItem={({ item }) => (
								<View className="mr-2 my-1">
									<TextSelectButton
										value={item}
										onSelect={toggleFacilitySelect}
										selected={input.facilities?.includes(item)}
									/>
								</View>
							)}
						/>
					</View>
					<View className="mt-4 gap-2">
						<ThemedText>Add new</ThemedText>
						<View className="flex-row items-center gap-2">
							<View className="flex-1">
								<FloatingLabelInput
									label="Feature / Facility"
									focused
									value={newFacility ?? ""}
									onChangeText={setNewFacility}
									placeholder="New feature"
								/>
							</View>
							<Button
								onPress={() => {
									if (newFacility) {
										toggleFacilitySelect(newFacility);
									}
									setNewFacility(null);
								}}
								variant="outline"
								type="primary"
							>
								<Check color={colors.primary} />
							</Button>
						</View>
					</View>
				</View>
			</DetailsLayout>
			<LoadingModal visible={loading} />
		</>
	);
}
