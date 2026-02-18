import FloatingLabelInput from "@/components/atoms/a-floating-label-input";
import ThemedText from "@/components/atoms/a-themed-text";
import DetailsLayout from "@/components/layouts/details";
import HostingStepper from "@/components/molecules/m-hosting-stepper";
import SelectInput, {
	SelectOption,
} from "@/components/molecules/m-select-input";
import { useHostingForm } from "@/lib/hooks/hosting-form";
import { useThemeColors } from "@/lib/hooks/use-theme-color";
import { ListingType } from "@/lib/services/graphql/generated";
import { HOSTING_VARIANTS } from "@/lib/types/enums/hostings";
import { cast } from "@/lib/types/utils";
import { hexToRgba } from "@/lib/utils/colors";
import { handleError } from "@/lib/utils/error";
import { useLocalSearchParams, useRouter } from "expo-router";
import { CircleQuestionMark } from "lucide-react-native";
import React from "react";
import { RefreshControl, View } from "react-native";
import Toast from "react-native-toast-message";

export default function NewHostingStep1() {
	const router = useRouter();
	const colors = useThemeColors();
	const { id } = useLocalSearchParams();
	const {
		mutate,
		mutating,
		input,
		updateInput,
		fetching,
		refetch: refetchHosting,
	} = useHostingForm(id);
	const handleMutate = () => {
		mutate({ input: input }).then((res) => {
			if (res.error) {
				handleError(res.error);
			}
			if (res.data?.createOrUpdateHosting) {
				router.replace(
					`/hostings/form/step-2?id=${res.data?.createOrUpdateHosting.data?.id}`,
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
		<DetailsLayout
			title="Property Details"
			refreshControl={
				<RefreshControl
					refreshing={fetching}
					onRefresh={() =>
						id && refetchHosting({ requestPolicy: "network-only" })
					}
				/>
			}
			footer={
				<HostingStepper
					loading={mutating}
					onPress={handleMutate}
					disabled={
						mutating ||
						!input?.title?.length ||
						!input.propertyType?.length ||
						!input.listingType?.length ||
						!input.description?.length
					}
					step={1}
				/>
			}
		>
			<View className="mt-2 flex-1 gap-4">
				<ThemedText
					style={{ fontSize: 12, color: hexToRgba(colors.text, 0.6) }}
				>
					<CircleQuestionMark color={hexToRgba(colors.text, 0.7)} size={12} />
					{"  "}
					Provide the essential details for your listing, including a catchy
					Title, a Description, and what Type of property it is (e.g.,
					Residential, Commercial) and how you&apos;re listing it (For Sale or
					Rent).
				</ThemedText>
				<FloatingLabelInput
					focused
					label="Title"
					value={cast(input.title)}
					placeholder="4 Bedroom Appartment"
					onChangeText={(v) => updateInput({ title: v })}
				/>
				<View className="flex-row gap-4">
					<SelectInput
						focused
						label="Property Type"
						placeholder="Residential"
						defaultValue={
							input.propertyType
								? { label: input.propertyType, value: input.propertyType }
								: undefined
						}
						options={HOSTING_VARIANTS.map((v) => ({ label: v, value: v }))}
						onSelect={(v) => updateInput({ propertyType: v.value })}
						renderItem={SelectOption}
					/>
					<SelectInput
						focused
						label="Listing Type"
						placeholder="Rent"
						defaultValue={
							input.listingType
								? { label: input.listingType, value: input.listingType }
								: undefined
						}
						options={Object.keys(ListingType).map((v) => ({
							label: `For ${v}`,
							value: v,
						}))}
						onSelect={(v) =>
							updateInput({
								listingType: ListingType[v.value as keyof typeof ListingType],
							})
						}
						renderItem={SelectOption}
					/>
				</View>
				<View style={{ minHeight: 200 }}>
					<FloatingLabelInput
						focused
						multiline
						label="Description"
						placeholder="A 4 bedroom bungalow with a spacious compound..."
						containerStyle={{ minHeight: 200 }}
						numberOfLines={6}
						value={cast(input.description)}
						onChangeText={(v) => updateInput({ description: v })}
					/>
				</View>
			</View>
		</DetailsLayout>
	);
}
