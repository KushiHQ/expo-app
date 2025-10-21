import { MagePreviewFill } from "@/components/icons/i-preview";
import { SolarTagPriceOutline } from "@/components/icons/i-price";
import { SolarVerifiedCheckOutline } from "@/components/icons/i-verified";
import { HousePlus, Images, MapPinHouse } from "lucide-react-native";

export const ONBOARDING_STEPS = [
	{
		icon: HousePlus,
		title: "Enter Property Details",
		description:
			"Start by adding key details like the property title, description.",
	},
	{
		icon: Images,
		title: "Add Photos",
		description: "Add clear images for each room.",
	},
	{
		icon: MapPinHouse,
		title: "Set Your Location",
		description:
			"Pinpoint your property on the map and add your address so guests can find you.",
	},
	{
		icon: SolarTagPriceOutline,
		title: "Set Price & Amenities",
		description:
			"Define your price, payment terms, and select all the great features and amenities you offer.",
	},
	{
		icon: MagePreviewFill,
		title: "Review & Publish",
		description:
			"Give all your information one final look. Confirm your details are correct and submit your listing.",
	},
	{
		icon: SolarVerifiedCheckOutline,
		title: "Get Verified",
		description:
			"Our team will review your submission. You'll be notified as soon as your listing is approved and goes live!",
	},
];
