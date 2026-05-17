import Toast from "react-native-toast-message";
import { CombinedError } from "urql";

export function handleError(error: CombinedError) {
	Toast.show({
		type: "error",
		text1: "Error",
		text2: error.message.replace("[GraphQL] ", ""),
	});
}
