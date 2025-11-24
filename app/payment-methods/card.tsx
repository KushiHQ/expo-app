import BottomSheet from "@/components/atoms/a-bottom-sheet";
import Button from "@/components/atoms/a-button";
import FloatingLabelInput from "@/components/atoms/a-floating-label-input";
import Skeleton from "@/components/atoms/a-skeleton";
import ThemedText from "@/components/atoms/a-themed-text";
import DetailsLayout from "@/components/layouts/details";
import CreditCard from "@/components/molecules/m-credit-card";
import EmptyList from "@/components/molecules/m-empty-list";
import { useThemeColors } from "@/lib/hooks/use-theme-color";
import {
	FlutterwaveCardInput,
	PaymentMethod,
	useCreateFlutterwaveCardPaymentMethodsMutation,
	useFlutterwaveCardPaymentMethodsQuery,
} from "@/lib/services/graphql/generated";
import { useReservationStore } from "@/lib/stores/reservation";
import { cast } from "@/lib/types/utils";
import { hexToRgba } from "@/lib/utils/colors";
import { handleError } from "@/lib/utils/error";
import { useLocalSearchParams, useRouter } from "expo-router";
import { CircleQuestionMark } from "lucide-react-native";
import React from "react";
import { View } from "react-native";
import Toast from "react-native-toast-message";

export default function CardPayment() {
	const router = useRouter();
	const colors = useThemeColors();
	const { redirect } = useLocalSearchParams();
	const [showCreate, setShowCreate] = React.useState(false);
	const { input, updateInput } = useReservationStore();
	const [{ fetching, data }, refetch] = useFlutterwaveCardPaymentMethodsQuery();
	const [exp, setExp] = React.useState("");
	const [{ fetching: mutating }, mutate] =
		useCreateFlutterwaveCardPaymentMethodsMutation();
	const [newCard, setNewCard] = React.useState({} as FlutterwaveCardInput);

	const handleCreateNew = () => {
		mutate({ input: newCard }).then((res) => {
			if (res.error) {
				handleError(res.error);
			}
			if (res.data) {
				Toast.show({
					type: "success",
					text1: "Success",
					text2: res.data.createFlutterwaveCardPaymentMethods.message,
				});
				setShowCreate(false);
				refetch({ requestPolicy: "network-only" });
			}
		});
	};

	const handleSelect = () => {
		if (redirect) {
			router.push(cast(redirect));
		}
	};

	const handleExpiryChange = (text: string) => {
		const previousText = exp;
		let newText = text;
		const rawDigits = newText.replace(/\D/g, "");

		const isDeleting = newText.length < previousText.length;

		if (isDeleting) {
			if (previousText.endsWith("/") && newText.length === 2) {
				setExp(rawDigits.substring(0, 1));
				return;
			}
			setExp(newText);
			return;
		}

		if (rawDigits.length > 4) {
			return;
		}

		if (rawDigits.length === 1) {
			if (Number(rawDigits) > 1) {
				setExp(`0${rawDigits}/`);
				return;
			}
		}

		if (rawDigits.length >= 2) {
			const month = rawDigits.substring(0, 2);
			if (Number(month) > 12) {
				setExp(previousText);
				return;
			}

			if (rawDigits.length === 2) {
				newText = `${rawDigits}/`;
			} else if (rawDigits.length > 2) {
				newText = `${rawDigits.substring(0, 2)}/${rawDigits.substring(2)}`;
			}
		}
		setExp(newText);
		setNewCard((c) => ({
			...c,
			expiryMonth: newText.split("/")[0],
			expiryYear: newText.split("/")[1],
		}));
	};

	return (
		<>
			<DetailsLayout
				title="Card Payment"
				footer={
					<View
						className="flex-row gap-4 p-4"
						style={{ backgroundColor: colors.background }}
					>
						<Button
							onPress={() => setShowCreate(true)}
							type="text"
							className="flex-1"
						>
							<ThemedText content="text">Add New</ThemedText>
						</Button>
						<Button
							onPress={handleSelect}
							disabled={!input.paymentMethod?.id}
							type="primary"
							className="flex-1"
						>
							<ThemedText content="primary">Select</ThemedText>
						</Button>
					</View>
				}
			>
				<View className="flex-1 gap-4 justify-between">
					<View className="gap-4">
						<ThemedText
							style={{ fontSize: 12, color: hexToRgba(colors.text, 0.6) }}
						>
							<CircleQuestionMark
								color={hexToRgba(colors.text, 0.7)}
								size={12}
							/>
							{"  "}
							Select or add a new card to use for your payment.
						</ThemedText>
						{(data?.flutterwaveCardPaymentMethods ?? []).map((method) => (
							<CreditCard
								key={method.id}
								card={method}
								selected={input.paymentMethod?.id === method.id}
								onSelect={(id) =>
									updateInput({
										paymentMethod: { id, method: PaymentMethod.Card },
									})
								}
							/>
						))}
						{fetching &&
							Array.from({ length: 5 }).map((_, index) => (
								<Skeleton
									key={index}
									style={{ height: 220, borderRadius: 18 }}
								/>
							))}
						{!fetching &&
							!(data?.flutterwaveCardPaymentMethods ?? []).length && (
								<EmptyList message="No cards yet" />
							)}
					</View>
				</View>
			</DetailsLayout>
			<BottomSheet isVisible={showCreate} onClose={() => setShowCreate(false)}>
				<View className="gap-6 pb-8">
					<ThemedText type="semibold">Card details</ThemedText>
					<View className="gap-2">
						<FloatingLabelInput
							focused
							label="Card Number"
							inputMode="numeric"
							autoComplete="cc-number"
							onChangeText={(v) => setNewCard((c) => ({ ...c, cardNumber: v }))}
							placeholder="2345 6789 1234 1023"
						/>
						<FloatingLabelInput
							focused
							label="Cardholder Name"
							inputMode="text"
							autoComplete="cc-name"
							onChangeText={(v) =>
								setNewCard((c) => ({ ...c, cardHolderName: v }))
							}
							placeholder="John Maxwell"
						/>
						<View className="flex-row gap-4">
							<View className="flex-1">
								<FloatingLabelInput
									focused
									value={exp}
									label="Exp. Date"
									inputMode="tel"
									autoComplete="cc-exp"
									onChangeText={handleExpiryChange}
									placeholder="11/25"
								/>
							</View>
							<View className="flex-1">
								<FloatingLabelInput
									focused
									label="CVV"
									secureTextEntry
									inputMode="numeric"
									autoComplete="cc-csc"
									onChangeText={(v) => setNewCard((c) => ({ ...c, cvv: v }))}
									placeholder="***"
								/>
							</View>
						</View>
					</View>
					<Button
						loading={mutating}
						onPress={handleCreateNew}
						disabled={
							mutating ||
							newCard.cardNumber?.length < 15 ||
							newCard.cvv?.length !== 3 ||
							newCard.expiryMonth?.length !== 2 ||
							newCard.expiryYear?.length !== 2 ||
							!newCard.cardHolderName?.length
						}
						type="text"
					>
						<ThemedText content="text">Save</ThemedText>
					</Button>
				</View>
			</BottomSheet>
		</>
	);
}
