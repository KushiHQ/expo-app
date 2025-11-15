import React from "react";
import {
	useCreateOrUpdateHostingMutation,
	useHostingQuery,
} from "../services/graphql/generated";
import { useActiveFormHosingStore } from "../stores/hostings";
import { cast } from "../types/utils";

export const useHostingForm = (id?: string | string[]) => {
	const [{ fetching: mutating }, mutate] = useCreateOrUpdateHostingMutation();
	const { input, initiate, updateInput, hosting, clear } =
		useActiveFormHosingStore();
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
		updateInput,
		clearInput: clear,
		mutate,
		mutating,
		fetching,
		hosting,
		refetch,
	};
};
