import React from "react";
import {
	OnlineUserSubscription,
	useOnlineUserSubscription,
} from "../services/graphql/generated";
import { useUserStore } from "../stores/users";

export const useUser = () => {
	const [online, setOnline] = React.useState(false);
	const store = useUserStore();
	useOnlineUserSubscription(
		{
			variables: {
				userId: store.user.user?.id ?? "",
			},
			pause: !store.user.user?.id,
		},
		(prev: OnlineUserSubscription["onlineUser"][] = [], curr) => {
			setOnline(curr.onlineUser.online);
			return [curr.onlineUser, ...(prev ?? [])];
		},
	);

	return { ...store, online };
};
