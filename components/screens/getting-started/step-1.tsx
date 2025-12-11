import Button from "@/components/atoms/a-button";
import Checkbox from "@/components/atoms/a-checkbox";
import ThemedText from "@/components/atoms/a-themed-text";
import { BusinessDealHandshake } from "@/components/icons/i-business-deal-handshake";
import { CashPaymentBag } from "@/components/icons/i-payments";
import { useThemeColors } from "@/lib/hooks/use-theme-color";
import { useUser } from "@/lib/hooks/user";
import { UserType } from "@/lib/types/users";
import React from "react";
import { View } from "react-native";

type Props = {
	onNext?: () => void;
};

const GettingStartedStep1: React.FC<Props> = ({ onNext }) => {
	const colors = useThemeColors();
	const { user, updateUser } = useUser();

	return (
		<View>
			<View className="gap-4">
				<ThemedText type="semibold">What brings you to Kushi?</ThemedText>
				<ThemedText>
					Select your purpose to get a tailored experience
				</ThemedText>
			</View>
			<View className="mt-20 gap-4">
				<View
					style={{ borderColor: colors["primary"] }}
					className="border p-5 rounded-xl gap-4"
				>
					<CashPaymentBag color={colors["primary"]} size={48} />
					<View className="flex-row items-center justify-between">
						<ThemedText>I&apos;m looking for a house</ThemedText>
						<Checkbox
							checked={user.userType === UserType.Guest}
							color={colors["primary"]}
							size={28}
							onValueChange={() => {
								if (user.userType !== UserType.Guest) {
									updateUser({ userType: UserType.Guest });
								} else {
									updateUser({ userType: undefined });
								}
							}}
						/>
					</View>
				</View>
				<View
					style={{ borderColor: colors["primary"] }}
					className="border p-5 rounded-xl gap-4"
				>
					<BusinessDealHandshake color={colors["primary"]} size={48} />
					<View className="flex-row items-center justify-between">
						<ThemedText>I want to rent out my house</ThemedText>
						<Checkbox
							checked={user.userType === UserType.Host}
							color={colors["primary"]}
							size={28}
							onValueChange={() => {
								if (user.userType !== UserType.Host) {
									updateUser({ userType: UserType.Host });
								} else {
									updateUser({ userType: undefined });
								}
							}}
						/>
					</View>
				</View>
			</View>
			<Button
				onPress={onNext}
				disabled={user.userType === undefined}
				type="primary"
				className="mt-8"
			>
				<ThemedText content="primary">Continue</ThemedText>
			</Button>
		</View>
	);
};

export default GettingStartedStep1;
