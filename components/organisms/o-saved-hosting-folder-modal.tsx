import { View } from "react-native";
import ThemedModal from "../molecules/m-modal";
import ThemedText from "../atoms/a-themed-text";
import { Fonts } from "@/lib/constants/theme";
import FloatingLabelInput from "../atoms/a-floating-label-input";
import { PhHeart } from "../icons/i-heart";
import Button from "../atoms/a-button";
import React from "react";
import { useThemeColors } from "@/lib/hooks/use-theme-color";
import {
	SavedHostingFolderInput,
	useCreateUpdateSavedHostingFolderMutation,
} from "@/lib/services/graphql/generated";
import { cast } from "@/lib/types/utils";
import { handleError } from "@/lib/utils/error";
import Toast from "react-native-toast-message";

type Props = {
	open: boolean;
	onClose: () => void;
	onCreate?: () => void;
};

const SavedHostingFolderModal: React.FC<Props> = ({
	open,
	onClose,
	onCreate,
}) => {
	const colors = useThemeColors();
	const [res, mutate] = useCreateUpdateSavedHostingFolderMutation();
	const [inputs, setInputs] = React.useState<Partial<SavedHostingFolderInput>>(
		{},
	);

	const handleCreate = () => {
		mutate({ input: cast(inputs) }).then((res) => {
			if (res.error) {
				handleError(res.error);
				onClose();
			}
			if (res.data) {
				Toast.show({
					type: "success",
					text1: "Success",
					text2: res.data.createUpdateSavedHostingFolder.message,
				});
				onCreate?.();
			}
		});
	};

	return (
		<ThemedModal visible={open} onClose={onClose}>
			<View className="gap-8">
				<ThemedText style={{ fontFamily: Fonts.medium, fontSize: 18 }}>
					Organize Your Collections
				</ThemedText>
				<FloatingLabelInput
					focused
					label="Add Folder"
					placeholder="Folder Name"
					onChangeText={(v) => setInputs((c) => ({ ...c, folderName: v }))}
					suffix={<PhHeart size={16} color={colors.text} />}
				/>
			</View>
			<View className="flex-row items-center justify-end mt-4 gap-8 px-4">
				<Button onPress={onClose}>
					<ThemedText style={{ color: colors.error }}>Cancel</ThemedText>
				</Button>
				<Button
					loading={res.fetching}
					style={{ width: 80 }}
					onPress={handleCreate}
					disabled={res.fetching || !inputs.folderName?.length}
				>
					<ThemedText content="tinted">Create</ThemedText>
				</Button>
			</View>
		</ThemedModal>
	);
};

export default SavedHostingFolderModal;
