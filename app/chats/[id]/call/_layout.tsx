import { useUser } from "@/lib/hooks/user";
import {
	useAuthStreamUserTokenQuery,
	useGetStreamUserIdQuery,
} from "@/lib/services/graphql/generated";
import { cast } from "@/lib/types/utils";
import {
	Call,
	StreamCall,
	callManager,
	useStreamVideoClient,
} from "@stream-io/video-react-native-sdk";
import { Stack, useLocalSearchParams } from "expo-router";
import { useHostingChatQuery } from "@/lib/services/graphql/generated";
import React, { useEffect } from "react";
import { handleError } from "@/lib/utils/error";
import CallScreen from "@/components/screens/call";

export default function Layout() {
	const { user } = useUser();
	const { id, initiate } = useLocalSearchParams();
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

	const client = useStreamVideoClient();
	const [call, setCall] = React.useState<Call | null>(null);

	React.useEffect(() => {
		if (recipientError) {
			handleError(recipientError);
		}
	}, [recipientError]);

	React.useEffect(() => {
		if (
			!call &&
			client &&
			tokenData?.authStreamUserToken &&
			chatData?.hostingChat.recipientUser.id &&
			user.user?.id &&
			recipientStreamUser?.getStreamUserId
		) {
			const call = client.call("default", cast(id));
			const init = async () => {
				try {
					if (initiate === "true") {
						const recipient = recipientStreamUser?.getStreamUserId;
						await call.join({
							create: true,
							ring: true,
							data: {
								custom: { recipient },
								members: [
									{ user_id: user.user?.id ?? "" },
									{ user_id: recipient },
								],
							},
						});
					}
					setCall(call);
				} catch (error) {
					console.log("INIT Error", error);
				}
			};
			init();
		}
	}, [call, tokenData, user, chatData, recipientStreamUser, client]);

	useEffect(() => {
		return () => {
			if (call) {
				try {
					callManager.stop();
					call.leave();
				} catch { }
			}
		};
	}, []);

	useEffect(() => {
		if (call) {
			callManager.start({
				audioRole: "communicator",
				deviceEndpointType: "earpiece",
			});
		}
	}, [call]);

	if (!call) {
		return <CallScreen />;
	}

	return (
		<StreamCall call={call}>
			<Stack screenOptions={{ animation: "fade" }}>
				<Stack.Screen name="voice" options={{ headerShown: false }} />
				<Stack.Screen name="video" options={{ headerShown: false }} />
			</Stack>
		</StreamCall>
	);
}
