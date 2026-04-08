import FloatingLabelInput from "@/components/atoms/a-floating-label-input";
import LoadingModal from "@/components/atoms/a-loading-modal";
import LocationCard from "@/components/atoms/a-location-card";
import Skeleton from "@/components/atoms/a-skeleton";
import ThemedText from "@/components/atoms/a-themed-text";
import DetailsLayout from "@/components/layouts/details";
import HostingStepper from "@/components/molecules/m-hosting-stepper";
import { Fonts } from "@/lib/constants/theme";
import { useHostingForm } from "@/lib/hooks/hosting-form";
import { useThemeColors } from "@/lib/hooks/use-theme-color";
import { PROPERTY_TYPE_ICONS } from "@/lib/types/enums/hosting-icons";
import { PropertyType } from "@/lib/types/enums/hostings";
import { cast } from "@/lib/types/utils";
import { hexToRgba } from "@/lib/utils/colors";
import { handleError } from "@/lib/utils/error";
import { getAddressFromCoords, getLocationAsync } from "@/lib/utils/locations";
import * as Location from "expo-location";
import { useLocalSearchParams, useRouter } from "expo-router";
import { CircleQuestionMark } from "lucide-react-native";
import React from "react";
import { Platform, View } from "react-native";
import { RefreshControl } from "react-native-gesture-handler";
import Toast from "react-native-toast-message";

export default function NewHostingStep3() {
	const router = useRouter();
	const colors = useThemeColors();
	const { id } = useLocalSearchParams();
	const [locationFetching, setLocationFetching] = React.useState(false);
	const [permission, requestPermission] = Location.useForegroundPermissions();
	const {
		input,
		mutate,
		updateInput,
		mutating,
		fetching: fetchingHosting,
	} = useHostingForm(id);

	const loading = fetchingHosting || locationFetching || mutating;

	const fetchLocation = React.useCallback(async () => {
		setLocationFetching(true);
		try {
			const loc = await getLocationAsync();
			if (loc) {
				const addreses = await getAddressFromCoords(
					loc?.coords.latitude,
					loc?.coords.longitude,
				);
				const address = addreses?.at(0);
				updateInput({
					latitude: loc.coords.latitude.toString(),
					longitude: loc.coords.longitude.toString(),
					state: address?.region,
					country: address?.country,
					city: address?.city,
					street: address?.street,
					postalCode: address?.postalCode,
				});
			}
		} catch (err) {
			console.log("Failed", { err });
		} finally {
			setLocationFetching(false);
		}
	}, [updateInput]);

	React.useEffect(() => {
		if (!permission?.granted) {
			requestPermission();
		} else if (!input.longitude || !input.latitude) {
			fetchLocation();
		}
	}, [
		permission,
		input.latitude,
		input.longitude,
		fetchLocation,
		requestPermission,
	]);

	const Icon = PROPERTY_TYPE_ICONS[PropertyType.Residential];

	const handleMutate = () => {
		mutate({ input: input }).then((res) => {
			if (res.error) {
				handleError(res.error);
			}
			if (res.data?.createOrUpdateHosting) {
				router.push(
					`/hostings/form/step-4?id=${res.data?.createOrUpdateHosting.data?.id}`,
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
				refreshControl={
					<RefreshControl
						onRefresh={fetchLocation}
						refreshing={locationFetching}
					/>
				}
				title="Hosting"
				footer={
					<HostingStepper
						onPress={handleMutate}
						disabled={
							mutating || !input.contact || !input.longitude || !input.latitude
						}
						loading={mutating}
						step={3}
					/>
				}
			>
				<View className="mt-2 gap-4">
					<ThemedText
						style={{ fontSize: 12, color: hexToRgba(colors.text, 0.6) }}
					>
						<CircleQuestionMark color={hexToRgba(colors.text, 0.7)} size={12} />
						{"  "}
						Pin your property&apos;s Location on the map. We&apos;ll
						automatically find the Address, and you can add extra details like
						Contact info and nearby Landmarks to help guests find you.
					</ThemedText>
					<View>
						{!input.longitude || !input.latitude ? (
							<Skeleton style={{ height: 250, borderRadius: 12 }} />
						) : (
							<LocationCard
								location={{
									longitude: Number(input.longitude),
									latitude: Number(input.latitude),
								}}
								zoom={18}
							/>
						)}
						{!input.state ? (
							<Skeleton
								style={{ height: 100, borderRadius: 12, marginTop: 32 }}
							/>
						) : (
							<View className="mt-8 gap-4">
								<View
									className="p-4 border rounded-xl gap-3"
									style={{
										borderColor: hexToRgba(colors.primary, 0.15),
										backgroundColor: colors.background,
										...Platform.select({
											ios: {
												shadowColor: colors.primary,
												shadowOffset: { width: 0, height: -2 },
												shadowOpacity: 0.1,
												shadowRadius: 8,
											},
											android: {
												elevation: 8,
												shadowColor: hexToRgba(colors.primary, 0.3),
											},
										}),
									}}
								>
									<View className="flex-row items-center gap-2">
										<Icon color={colors.primary} size={18} />
										<ThemedText style={{ fontFamily: Fonts.semibold }}>
											Address
										</ThemedText>
									</View>
									<View>
										<ThemedText style={{ fontSize: 12 }}>
											{input?.street}, {input?.city} {input?.postalCode},
										</ThemedText>
										<ThemedText
											style={{ fontSize: 14, fontFamily: Fonts.medium }}
										>
											{input?.state}, {input?.country}
										</ThemedText>
									</View>
								</View>
								<FloatingLabelInput
									focused
									multiline
									value={cast(input.contact)}
									label="Contact"
									inputMode="tel"
									onChangeText={(contact) => updateInput({ contact })}
									containerStyle={{
										borderColor: hexToRgba(colors.primary, 0.1),
										backgroundColor: hexToRgba(colors.primary, 0.05),
									}}
									placeholder="+2349045698712"
								/>
								<FloatingLabelInput
									focused
									multiline
									label="Landmarks (Optional)"
									onChangeText={(landmarks) => updateInput({ landmarks })}
									containerStyle={{
										minHeight: 80,
										borderColor: hexToRgba(colors.primary, 0.1),
										backgroundColor: hexToRgba(colors.primary, 0.05),
									}}
									placeholder="Ender landmarks close to the property"
								/>
							</View>
						)}
					</View>
				</View>
			</DetailsLayout>
			<LoadingModal visible={loading} />
		</>
	);
}
