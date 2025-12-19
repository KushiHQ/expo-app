import LoadingModal from "@/components/atoms/a-loading-modal";
import { useUser } from "@/lib/hooks/user";
import {
	useAuthStreamUserTokenQuery,
	useGetStreamUserIdQuery,
} from "@/lib/services/graphql/generated";
import { cast } from "@/lib/types/utils";
import {
	StreamCall,
	StreamVideo,
	StreamVideoClient,
	callManager,
} from "@stream-io/video-react-native-sdk";
import { Stack, useLocalSearchParams } from "expo-router";
import { useHostingChatQuery } from "@/lib/services/graphql/generated";
import React, { useEffect } from "react";
import { handleError } from "@/lib/utils/error";

export default function Layout() {
	const { user } = useUser();
	const { id } = useLocalSearchParams();
	const [{ data: tokenData }] = useAuthStreamUserTokenQuery();
	const [{ data: chatData }] = useHostingChatQuery({
		variables: { chatId: cast(id) },
	});
	const [{ data: recipientStreamUser, error: recipientError }] =
		useGetStreamUserIdQuery({
			variables: {
				userId: chatData?.hostingChat.recipientUser.id ?? "",
			},
			pause: !chatData?.hostingChat.recipientUser.id,
		});

	React.useEffect(() => {
		if (recipientError) {
			handleError(recipientError);
		}
	}, [recipientError]);

	const stream = React.useMemo(() => {
		if (
			tokenData?.authStreamUserToken &&
			chatData?.hostingChat.recipientUser.id &&
			user.user?.id &&
			recipientStreamUser?.getStreamUserId
		) {
			const client = StreamVideoClient.getOrCreateInstance({
				apiKey: process.env.EXPO_PUBLIC_STREAM_API_KEY ?? "",
				user: { id: user.user?.id ?? "" },
				token: tokenData?.authStreamUserToken,
			});
			const call = client.call("default", cast(id));
			call.getOrCreate({
				ring: true,
				data: {
					members: [
						{ user_id: user.user.id ?? "" },
						{ user_id: recipientStreamUser?.getStreamUserId },
					],
				},
			});
			return { client, call };
		}
		return null;
	}, [tokenData, user, chatData, recipientStreamUser]);

	useEffect(() => {
		return () => {
			if (stream?.call) {
				stream.call.leave();
			}
		};
	}, [stream]);

	useEffect(() => {
		if (stream) {
			callManager.start({
				audioRole: "communicator",
				deviceEndpointType: "earpiece",
			});
		}

		return () => {
			if (stream) {
				callManager.stop();
			}
		};
	}, [stream]);

	if (!stream) {
		return <LoadingModal visible />;
	}

	return (
		<StreamVideo client={stream.client}>
			<StreamCall call={stream.call}>
				<Stack screenOptions={{ animation: "fade" }}>
					<Stack.Screen name="voice" options={{ headerShown: false }} />
					<Stack.Screen name="video" options={{ headerShown: false }} />
				</Stack>
			</StreamCall>
		</StreamVideo>
	);
}
