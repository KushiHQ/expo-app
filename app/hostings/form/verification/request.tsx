import DetailsLayout from "@/components/layouts/details";
import RequestVerificationForm from "@/components/molecules/m-request-verification-form";
import { useRouter } from "@/lib/hooks/use-router";
import { HostingVerificationTier } from "@/lib/services/graphql/generated";
import { useLocalSearchParams } from "expo-router";
import React from "react";

export default function RequestVerificationScreen() {
	const router = useRouter();
	const { id: hostingId, tier } = useLocalSearchParams<{
		id?: string;
		tier?: HostingVerificationTier;
	}>();

	const hostingIdStr = Array.isArray(hostingId)
		? hostingId[0]
		: (hostingId ?? "");
	const initialTier = Array.isArray(tier) ? tier[0] : tier;

	return (
		<DetailsLayout title="Get Verified" backButton="translucent" scrollable>
			<RequestVerificationForm
				hostingId={hostingIdStr}
				selectedTier={initialTier}
				title="Request verification"
				onSubmitted={() => router.back()}
			/>
		</DetailsLayout>
	);
}
