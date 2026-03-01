import {
	useCompletePhoneNumberVerificationMutation,
	useInitiatePhoneNumberVerificationMutation,
	useUserPhoneNumersQuery,
} from "@/lib/services/graphql/generated";
import SelectInput, {
	SelectOption,
	SelectOptionType,
} from "../molecules/m-select-input";
import React from "react";
import { View } from "react-native";
import Button from "../atoms/a-button";
import ThemedText from "../atoms/a-themed-text";
import BottomSheet from "../atoms/a-bottom-sheet";
import PhoneInput, {
	ICountry,
	IPhoneInputRef,
} from "react-native-international-phone-number";
import { hexToRgba } from "@/lib/utils/colors";
import { useThemeColors } from "@/lib/hooks/use-theme-color";
import { CircleQuestionMark } from "lucide-react-native";
import Toast from "react-native-toast-message";
import LoadingModal from "../atoms/a-loading-modal";
import { handleError } from "@/lib/utils/error";
import OTPInput from "../atoms/a-otp-input";

type Props = {
	defaultValue?: string;
	onSelect?: (phone: SelectOptionType) => void;
};

const PhoneNumberSelectInput: React.FC<Props> = ({
	defaultValue,
	onSelect,
}) => {
	const colors = useThemeColors();
	const [{ data }, refetchNumbers] = useUserPhoneNumersQuery();
	const [selected, setSelected] = React.useState<SelectOptionType>();
	const [creationOpen, setCreationOpen] = React.useState(false);

	React.useEffect(() => {
		if (defaultValue && data?.me.phoneNumbers.length) {
			const existing = data?.me.phoneNumbers.find(
				(v) => v.number === defaultValue,
			);
			if (existing && selected?.value !== existing.id) {
				setSelected({ label: existing.number, value: existing.id });
			}
		}
	}, [defaultValue, data]);

	const handleSelect = (v: SelectOptionType) => {
		setSelected(v);
		onSelect?.(v);
	};

	const NewPhone = () => {
		const [input, setInput] = React.useState("");
		const [country, setCountry] = React.useState<ICountry>();

		const [otp, setOtp] = React.useState("");
		const [otpRequested, setOtpRequested] = React.useState(false);

		const [
			{ fetching: initiating, error: initiationError },
			initiateVerification,
		] = useInitiatePhoneNumberVerificationMutation();

		const [
			{ fetching: completing, error: complectionError },
			completeVerification,
		] = useCompletePhoneNumberVerificationMutation();
		const phoneInputRef = React.useRef<IPhoneInputRef>(null);

		const formatedNumber = React.useMemo(() => {
			const str = input.length >= 11 ? input.slice(1) : input;
			return `${country?.idd.root ?? "+234"}${str}`.replaceAll(" ", "");
		}, [input, country]);

		const loading = initiating || completing;

		React.useEffect(() => {
			if (initiationError) {
				handleError(initiationError);
			} else if (complectionError) {
				handleError(complectionError);
			}
		}, [initiationError, complectionError]);

		const handleInitiate = () => {
			initiateVerification({ phoneNumber: formatedNumber }).then((res) => {
				if (res.data?.initiatePhoneNumberVerification) {
					Toast.show({
						type: "success",
						text1: "Success",
						text2: res.data.initiatePhoneNumberVerification.message,
					});
					setOtpRequested(true);
				}
			});
		};

		const handleComplete = () => {
			completeVerification({
				input: { phoneNumber: formatedNumber, otp },
			}).then((res) => {
				if (res.data?.completePhoneNumberVerification) {
					Toast.show({
						type: "success",
						text1: "Success",
						text2: res.data.completePhoneNumberVerification.message,
					});
					setCreationOpen(false);
					refetchNumbers({ requestPolicy: "network-only" });
				}
			});
		};

		return (
			<>
				<View className="mt-12 flex-row gap-2">
					<Button
						onPress={() => refetchNumbers({ requestPolicy: "network-only" })}
						variant="outline"
						type="primary"
						className="flex-1"
					>
						<ThemedText content="tinted">Refresh</ThemedText>
					</Button>
					<Button
						onPress={() => setCreationOpen(true)}
						type="primary"
						className="flex-1"
					>
						<ThemedText content="primary">Add</ThemedText>
					</Button>
				</View>

				<BottomSheet
					isVisible={creationOpen}
					onClose={() => setCreationOpen(false)}
				>
					<View>
						<View className="mb-8">
							<ThemedText>Create new phone number</ThemedText>
							<ThemedText
								style={{ fontSize: 12, color: hexToRgba(colors.text, 0.6) }}
							>
								<CircleQuestionMark
									color={hexToRgba(colors.text, 0.7)}
									size={12}
								/>
								{"  Provide and verify a new phone number"}
							</ThemedText>
						</View>

						<PhoneInput
							placeholderTextColor={hexToRgba(colors.text, 0.5)}
							modalSearchInputPlaceholderTextColor={hexToRgba(colors.text, 0.5)}
							cursorColor={colors.primary}
							modalStyles={{
								backdrop: { backgroundColor: hexToRgba(colors.text, 0.1) },
								content: { backgroundColor: colors.background },
								countryItem: { backgroundColor: colors.background },
								dragHandleIndicator: {
									backgroundColor: hexToRgba(colors.text, 0.7),
								},
								flag: { color: colors.text },
								callingCode: { color: colors.text },
								searchInput: { color: colors.text },
								countryName: { color: colors.text },
								sectionTitle: { color: colors.text },
								closeButtonText: { color: colors.text },
								countryNotFoundMessage: { color: colors.text },
								alphabetLetterText: { color: colors.text },
							}}
							phoneInputStyles={{
								container: {
									backgroundColor: colors.background,
									borderColor: hexToRgba(colors.text, 0.2),
								},
								flagContainer: { backgroundColor: colors.background },
								callingCode: { color: colors.text },
								input: { color: colors.text },
							}}
							ref={phoneInputRef}
							value={input}
							onChangeSelectedCountry={setCountry}
							defaultCountry="NG"
							onChangePhoneNumber={setInput}
							autoFocus
						/>

						{otpRequested && input && (
							<View className="mt-6">
								<OTPInput length={6} value={otp} onChangeText={setOtp} />
							</View>
						)}

						<View className="mt-8">
							<Button
								onPress={otpRequested ? handleComplete : handleInitiate}
								type="primary"
								className="self-end w-full max-w-[50%]"
							>
								<ThemedText content="primary">
									{otpRequested ? "Verify" : "Request OTP"}
								</ThemedText>
							</Button>
						</View>
					</View>
				</BottomSheet>
				<LoadingModal visible={loading} />
			</>
		);
	};

	return (
		<>
			<View>
				<SelectInput
					focused
					label="Phone Number"
					footer={<NewPhone />}
					placeholder="Select"
					defaultValue={selected}
					onSelect={handleSelect}
					renderItem={SelectOption}
					options={(data?.me.phoneNumbers ?? []).map((phone) => ({
						label: phone.number,
						value: phone.id,
					}))}
				/>
			</View>
		</>
	);
};

export default PhoneNumberSelectInput;
