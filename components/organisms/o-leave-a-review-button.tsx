import { useThemeColors } from "@/lib/hooks/use-theme-color";
import Button from "../atoms/a-button";
import ThemedText from "../atoms/a-themed-text";
import { HugeiconsStar } from "../icons/i-star";
import { View } from "react-native";
import ThemedModal from "../molecules/m-modal";
import React from "react";
import { hexToRgba } from "@/lib/utils/colors";
import RatingInput from "../atoms/a-rating-input";
import ReviewMetricsInfoButton from "../molecules/m-review-metrics-info-button";
import FloatingLabelInput from "../atoms/a-floating-label-input";
import { SimpleGrid } from "react-native-super-grid";
import { REVIEW_METRICS } from "@/lib/constants/reviews";
import { capitalize } from "@/lib/utils/text";
import { cast } from "@/lib/types/utils";
import {
	BookingQuery,
	HostingReviewInput,
	useCreateUpdateHostingReviewMutation,
} from "@/lib/services/graphql/generated";
import { handleError } from "@/lib/utils/error";
import Toast from "react-native-toast-message";
import LoadingModal from "../atoms/a-loading-modal";
import { FluentImageEdit24Regular } from "../icons/i-edit";

type Props = {
	edit?: boolean;
	review?: BookingQuery["booking"]["userReview"];
	hostingId?: string;
};

const LeaveAReviewButton: React.FC<Props> = ({ hostingId, review, edit }) => {
	const colors = useThemeColors();
	const [modalOpen, setModalOpen] = React.useState(false);
	const [inputs, setInputs] = React.useState({
		accuracy: review?.accuracy,
		checkIn: review?.checkIn,
		cleanliness: review?.cleanliness,
		communication: review?.communication,
		description: review?.description,
		hostingId,
		id: review?.id,
		location: review?.location,
		value: review?.value,
	} as HostingReviewInput);
	const [{ fetching }, submitReview] = useCreateUpdateHostingReviewMutation();

	const loading = fetching;

	const handleSubmit = () => {
		submitReview({
			input: { ...inputs, hostingId: hostingId ?? "" },
		}).then((res) => {
			if (res.error) {
				handleError(res.error);
			}
			if (res.data) {
				Toast.show({
					type: "success",
					text1: "Success",
					text2: res.data.createOrUpdateHostingReview.message,
				});
				setModalOpen(false);
			}
		});
	};

	const Icon = edit ? FluentImageEdit24Regular : HugeiconsStar;
	const ratingData = Object.keys(REVIEW_METRICS).map((key) => ({
		key,
		value: Math.min(Number(inputs[key as keyof HostingReviewInput] ?? 0), 5),
	}));

	return (
		<>
			<Button
				onPress={() => setModalOpen(true)}
				variant="outline"
				className="py-2"
				style={{ borderColor: colors.accent }}
			>
				<View className="flex-row items-center gap-2">
					<Icon color={colors.accent} size={18} />
					<ThemedText style={{ color: colors.accent }}>
						{edit ? "Edit" : "Leave a Review"}
					</ThemedText>
				</View>
			</Button>
			<ThemedModal visible={modalOpen} onClose={() => setModalOpen(false)}>
				<View className="gap-4">
					<View
						className="border-b pb-4"
						style={{ borderColor: hexToRgba(colors.text, 0.15) }}
					>
						<ThemedText type="semibold">Leave A Review</ThemedText>
					</View>
					<View className="gap-4">
						<SimpleGrid
							listKey="index"
							itemDimension={120}
							data={ratingData}
							renderItem={({ item }) => (
								<View className="gap-2">
									<View className="flex-row items-center gap-2">
										<ThemedText>{capitalize(item.key)}</ThemedText>
										<ReviewMetricsInfoButton metric={cast(item.key)} />
									</View>
									<RatingInput
										value={item.value}
										onChange={(v) =>
											setInputs((c) => ({ ...c, [item.key]: v }))
										}
									/>
								</View>
							)}
						/>
						<FloatingLabelInput
							focused
							multiline
							value={cast(inputs.description)}
							label="Share Your Thoughts"
							placeholder="Give a brief review"
							containerStyle={{ minHeight: 100 }}
							numberOfLines={6}
							onChangeText={(v) => setInputs((c) => ({ ...c, description: v }))}
						/>
					</View>
					<Button
						onPress={handleSubmit}
						disabled={
							!inputs.checkIn &&
							!inputs.description &&
							!inputs.value &&
							!inputs.accuracy &&
							!inputs.location &&
							!inputs.cleanliness &&
							!inputs.communication
						}
						type="primary"
					>
						<ThemedText content="primary">Submit</ThemedText>
					</Button>
				</View>
			</ThemedModal>
			<LoadingModal visible={loading} />
		</>
	);
};

export default LeaveAReviewButton;
