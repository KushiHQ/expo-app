import Button from "@/components/atoms/a-button";
import FloatingLabelInput from "@/components/atoms/a-floating-label-input";
import ThemedText from "@/components/atoms/a-themed-text";
import DetailsLayout from "@/components/layouts/details";
import SelectInput, {
	SelectOption,
} from "@/components/molecules/m-select-input";
import UserProfileSummary from "@/components/molecules/m-user-profile-summary";
import { View } from "react-native";

export default function UserProfileEdit() {
	return (
		<DetailsLayout title="Profile">
			<View className="mt-8 flex-1 justify-between gap-4">
				<View>
					<UserProfileSummary edit />
					<View className="mt-8 gap-4">
						<FloatingLabelInput
							focused
							label="Full Name"
							autoComplete="name"
							value="Uzumaki Naruto"
							placeholder="John Doe"
						/>
						<FloatingLabelInput
							focused
							label="Email"
							inputMode="email"
							autoComplete="email"
							value="uzumakinaruto@gmail.com"
							placeholder="example@email.com"
						/>
						<View className="flex-row gap-4 items-center">
							<View className="flex-[1.5]">
								<FloatingLabelInput
									focused
									disabled
									label="Password"
									placeholder="********"
									secureTextEntry
								/>
							</View>
							<Button className="flex-1" type="primary">
								<ThemedText content="primary">Change</ThemedText>
							</Button>
						</View>
						<View className="flex-row gap-4">
							<SelectInput
								focused
								label="Gender"
								placeholder="Male"
								options={["Male", "Femal"].map((v) => ({ label: v, value: v }))}
								renderItem={SelectOption}
							/>
							<View className="flex-1">
								<FloatingLabelInput
									focused
									label="Phone Number"
									inputMode="tel"
									autoComplete="tel"
									placeholder="08032145687"
								/>
							</View>
						</View>
					</View>
				</View>
				<Button type="primary" disabled>
					<ThemedText content="primary">Update</ThemedText>
				</Button>
			</View>
		</DetailsLayout>
	);
}
