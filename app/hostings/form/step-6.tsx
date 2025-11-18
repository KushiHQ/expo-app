import ThemedText from "@/components/atoms/a-themed-text";
import DetailsLayout from "@/components/layouts/details";
import HostingStepper from "@/components/molecules/m-hosting-stepper";
import { Fonts } from "@/lib/constants/theme";
import { useThemeColors } from "@/lib/hooks/use-theme-color";
import { hexToRgba } from "@/lib/utils/colors";
import React from "react";
import { Platform, Pressable, View } from "react-native";
import Button from "@/components/atoms/a-button";
import { FluentSlideTextEdit28Regular } from "@/components/icons/i-edit";
import { Href, useLocalSearchParams, useRouter } from "expo-router";
import { CircleQuestionMark, Home } from "lucide-react-native";
import Checkbox from "@/components/atoms/a-checkbox";
import { useHostingForm } from "@/lib/hooks/hosting-form";
import { capitalize } from "@/lib/utils/text";
import HostingCard from "@/components/molecules/m-hosting-card";
import { PublishStatus } from "@/lib/services/graphql/generated";
import LoadingModal from "@/components/atoms/a-loading-modal";
import { handleError } from "@/lib/utils/error";
import Toast from "react-native-toast-message";
import PublishListingSuccess from "@/components/molecules/m-publish-listing-success";
import TextSelectButton from "@/components/molecules/m-text-select-button";

type ItemSummaryProps = {
	label: string;
	summary: string;
};

const ItemSummary: React.FC<ItemSummaryProps> = ({ label, summary }) => {
	const colors = useThemeColors();

	return (
		<View className="flex-row items-center gap-2">
			<ThemedText style={{ fontFamily: Fonts.medium, fontSize: 14 }}>
				{label}:
			</ThemedText>
			<ThemedText style={{ fontSize: 14, color: hexToRgba(colors.text, 0.6) }}>
				{summary}
			</ThemedText>
		</View>
	);
};

const EditButton: React.FC<{ href: Href }> = ({ href }) => {
	const router = useRouter();
	const colors = useThemeColors();

	return (
		<Button
			onPress={() => router.push(href)}
			style={{ alignSelf: "flex-end", borderRadius: 8 }}
			type="shade"
			className="py-2"
		>
			<View className="flex-row items-center gap-2">
				<ThemedText content="shade" style={{ fontSize: 14 }}>
					Edit
				</ThemedText>
				<FluentSlideTextEdit28Regular
					color={colors["shade-content"]}
					size={16}
				/>
			</View>
		</Button>
	);
};

const SummarySection: React.FC<{ children?: React.ReactNode }> = ({
	children,
}) => {
	const colors = useThemeColors();
	return (
		<View
			className="p-3 rounded gap-2"
			style={{
				borderWidth: 2,
				borderStyle: "dashed",
				borderColor: hexToRgba(colors.primary, 0.4),
				backgroundColor: hexToRgba(colors.primary, 0.1),
			}}
		>
			{children}
		</View>
	);
};

export default function NewHostingStep6() {
	const router = useRouter();
	const colors = useThemeColors();
	const { id } = useLocalSearchParams();
	const {
		input,
		hosting,
		mutate,
		mutating,
		updateInput,
		fetching: fetchingHosting,
	} = useHostingForm(id);
	const [accepted, setAccepted] = React.useState({ truth: false, tos: false });
	const [success, setSuccess] = React.useState(false);

	const loading = fetchingHosting || mutating;

	const handleMutate = () => {
		updateInput({
			publishStatus:
				hosting?.publishStatus !== PublishStatus.Live
					? PublishStatus.Draft
					: PublishStatus.Live,
		});
		mutate({
			input: {
				...input,
				publishStatus:
					hosting?.publishStatus !== PublishStatus.Live
						? PublishStatus.Draft
						: PublishStatus.Live,
			},
		}).then((res) => {
			if (res.error) {
				handleError(res.error);
			}
			if (res.data?.createOrUpdateHosting) {
				router.push(
					`/hostings/form/step-6?id=${res.data?.createOrUpdateHosting.data?.id}`,
				);
				Toast.show({
					type: "success",
					text1: "Success",
					text2: res.data.createOrUpdateHosting.message,
				});
				setSuccess(true);
			}
		});
	};

	const handleClose = () => {
		setSuccess(false);
		router.dismissAll();
		router.replace("/host/analytics");
	};

	return (
		<>
			<DetailsLayout
				title="Hosting"
				footer={
					<HostingStepper
						onTogglePublish={handleMutate}
						published={hosting?.publishStatus === PublishStatus.Live}
						loading={mutating}
						disabled={
							(!accepted.tos || !accepted.truth) &&
							hosting?.publishStatus !== PublishStatus.Live
						}
						step={6}
					/>
				}
			>
				<View className="mt-2 gap-4">
					<ThemedText style={{ fontFamily: Fonts.medium }}>
						Overview of Collected Information
					</ThemedText>
					<ThemedText
						style={{ fontSize: 12, color: hexToRgba(colors.text, 0.6) }}
					>
						<CircleQuestionMark color={hexToRgba(colors.text, 0.7)} size={12} />
						{"  "}
						You're almost there! Please review all the details below carefully.
						Ensure everything is correct, agree to our terms, and choose whether
						to Publish your listing now or save it as a draft.
					</ThemedText>
					{hosting && <HostingCard disabled hosting={hosting} />}
					<View className="border p-2 rounded-xl gap-3">
						<SummarySection>
							<ItemSummary label="Title" summary={input.title ?? ""} />
							<ItemSummary
								label="Property Type"
								summary={input.propertyType ?? ""}
							/>
							<ItemSummary
								label="Payment Interval"
								summary={capitalize(input.paymentInterval ?? "")}
							/>
							<View>
								<ThemedText style={{ fontFamily: Fonts.medium, fontSize: 14 }}>
									Description
								</ThemedText>
								<ThemedText style={{ fontSize: 13, color: colors.primary }}>
									{input.description}
								</ThemedText>
							</View>
							<EditButton href={"/hostings/form/step-1"} />
						</SummarySection>
						<SummarySection>
							<View className="flex-row gap-4 flex-wrap">
								{hosting?.rooms.map((v) => (
									<ItemSummary
										label={v.name}
										summary={`${v.count}`}
										key={v.id}
									/>
								))}
							</View>
							<View className="flex-row gap-4">
								<ItemSummary
									label="Images"
									summary={`${hosting?.rooms.map((v) => v.images.length).reduce((p, c) => p + c) ?? 0}`}
								/>
							</View>
							<EditButton href={"/hostings/form/step-2"} />
						</SummarySection>
						<SummarySection>
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
									<Home color={colors.primary} size={18} />
									<ThemedText style={{ fontFamily: Fonts.semibold }}>
										Address
									</ThemedText>
								</View>
								<View>
									<ThemedText style={{ fontSize: 12 }}>
										{input.street}, {input.city}, {input.postalCode}
									</ThemedText>
									<ThemedText
										style={{ fontSize: 14, fontFamily: Fonts.medium }}
									>
										{input.state}
									</ThemedText>
								</View>
							</View>
							<ItemSummary label="Contact" summary={input.contact ?? ""} />
							<ItemSummary
								label="Landmarks"
								summary={input.landmarks ?? "nil"}
							/>
							<EditButton href={"/hostings/form/step-3"} />
						</SummarySection>
						<SummarySection>
							<ThemedText>Features & Amenities</ThemedText>
							<View className="flex-row gap-2 flex-wrap">
								{input.facilities?.map((v, i) => (
									<TextSelectButton key={i} value={v} selected />
								))}
							</View>
							<EditButton href={"/hostings/form/step-4"} />
						</SummarySection>

						<SummarySection>
							<ItemSummary
								label="Account Number"
								summary={hosting?.paymentDetails?.accountNumber ?? ""}
							/>
							<ItemSummary
								label="Bank"
								summary={hosting?.paymentDetails?.bankDetails?.name ?? ""}
							/>
							<ItemSummary
								label="Payment Interval"
								summary={capitalize(hosting?.paymentInterval ?? "")}
							/>
							<ItemSummary
								label="Price"
								summary={`₦${Number(hosting?.price).toLocaleString()}`}
							/>
							<EditButton href={"/hostings/form/step-5"} />
						</SummarySection>
					</View>
					<View className="gap-2">
						<Pressable className="flex-row items-start gap-1">
							<Checkbox
								color={colors.primary}
								size={20}
								checked={accepted.truth}
								onValueChange={(v) => setAccepted((c) => ({ ...c, truth: v }))}
							/>
							<ThemedText className="flex-1" style={{ fontSize: 14 }}>
								I confirm that the above information is true and accurate.
							</ThemedText>
						</Pressable>
						<Pressable className="flex-row items-start gap-1">
							<Checkbox
								color={colors.primary}
								size={20}
								checked={accepted.tos}
								onValueChange={(v) => setAccepted((c) => ({ ...c, tos: v }))}
							/>
							<ThemedText className="flex-1" style={{ fontSize: 14 }}>
								I agree to Kushi's hosting terms of service
							</ThemedText>
						</Pressable>
					</View>
				</View>
			</DetailsLayout>
			<LoadingModal visible={loading} />
			<PublishListingSuccess show={success} onClose={handleClose} />
		</>
	);
}
