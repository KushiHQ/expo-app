import React from "react";
import {
	useCreateOrUpdateHostingMutation,
	useHostingQuery,
	useInitiateHostingVerificationMutation,
} from "../services/graphql/generated";
import { useActiveFormHosingStore } from "../stores/hostings";
import { cast } from "../types/utils";

export const useHostingForm = (id?: string | string[]) => {
	const [{ fetching: mutating }, mutate] = useCreateOrUpdateHostingMutation();
	const [{ fetching: verificationMutating }, verificationMutate] =
		useInitiateHostingVerificationMutation();
	const {
		input,
		verificationInput,
		initiate,
		updateVerificationInput,
		updateInput,
		hosting,
		clear,
	} = useActiveFormHosingStore();
	const [{ data, fetching }, refetch] = useHostingQuery({
		pause: !id,
		variables: { hostingId: cast(id) },
	});

	React.useEffect(() => {
		if (data) {
			initiate(data.hosting);
		}
	}, [data]);

	return {
		input,
		verificationInput,
		updateVerificationInput,
		updateInput,
		clearInput: clear,
		mutate,
		verificationMutating,
		verificationMutate,
		mutating,
		fetching,
		hosting,
		refetch: () => refetch({ requestPolicy: "network-only" }),
	};
};
