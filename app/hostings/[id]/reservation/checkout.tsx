import { PayWithFlutterwave } from "flutterwave-react-native";
import DetailsLayout from "@/components/layouts/details";
import { View } from "react-native";
import { useUser } from "@/lib/hooks/user";

export default function ReservationCheckout() {
	const user = useUser();

	return (
		<DetailsLayout title="Checkout">
			<View></View>
		</DetailsLayout>
	);
}
