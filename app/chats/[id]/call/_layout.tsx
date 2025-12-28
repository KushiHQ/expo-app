import { useUser } from "@/lib/hooks/user";
import {
	CallType,
	useAuthStreamUserTokenQuery,
	useGetStreamUserIdQuery,
	useSendChatCallNotificationMutation,
	useHostingChatQuery,
} from "@/lib/services/graphql/generated";
import { cast } from "@/lib/types/utils";
import {
	Call,
	StreamCall,
	useStreamVideoClient,
	callManager,
} from "@stream-io/video-react-native-sdk";
import { Stack, useLocalSearchParams, usePathname } from "expo-router";
import React, { useEffect, useState } from "react";
import CallScreen from "@/components/screens/call";
import ChatVideoCallScreen from "@/components/screens/video-call";

export default function Layout() {
	const { user } = useUser();

	const pathname = usePathname();
	const { id, initiate } = useLocalSearchParams();
	const isVideoCall = pathname.endsWith("video");

	const [{ data: tokenData }] = useAuthStreamUserTokenQuery();
	const [{ data: chatData }] = useHostingChatQuery({
		variables: { chatId: cast(id) },
	});

	const shouldFetchRecipient =
		initiate === "true" && !!chatData?.hostingChat.recipientUser.id;
	const [{ data: recipientStreamUser }] = useGetStreamUserIdQuery({
		variables: { userId: chatData?.hostingChat.recipientUser.id ?? "" },
		pause: !shouldFetchRecipient,
	});

	const [, sendNotification] = useSendChatCallNotificationMutation();
	const client = useStreamVideoClient();
	const [call, setCall] = useState<Call | null>(null);
	const isCallInitialized = React.useRef(false);

	useEffect(() => {
		if (!client || !user.user?.id || !tokenData?.authStreamUserToken) return;
		if (initiate === "true" && !recipientStreamUser?.getStreamUserId) return;
		if (isCallInitialized.current) return;

		isCallInitialized.current = true;

		const myCall = client.call("default", cast(id));

		const startCall = async () => {
			try {
				const defaultDevice = isVideoCall ? "speaker" : "earpiece";
				callManager.start({
					audioRole: "communicator",
					deviceEndpointType: defaultDevice,
				});
				if (initiate === "true") {
					const recipientId = recipientStreamUser?.getStreamUserId;

					await myCall.join({
						create: true,
						video: isVideoCall,
						data: {
							members: [
								{ user_id: user.user?.id ?? "" },
								{ user_id: recipientId ?? "" },
							],
							settings_override: {
								video: {
									camera_default_on: isVideoCall,
									target_resolution: {
										bitrate: 400000,
										height: 640,
										width: 360,
									},
								},
							},
						},
					});

					if (isVideoCall) {
						await myCall.camera.enable();
					}

					await sendNotification({
						chatId: cast(id),
						callType: isVideoCall ? CallType.Video : CallType.Voice,
					});
				} else {
					if (isVideoCall) {
						await myCall.camera.enable();
					}
				}

				setCall(myCall);
			} catch (error) {
				console.error("Failed to start/join call", error);
			}
		};

		startCall();
	}, [
		client,
		id,
		initiate,
		user.user?.id,
		tokenData?.authStreamUserToken,
		recipientStreamUser?.getStreamUserId,
	]);

	useEffect(() => {
		return () => {
			if (isCallInitialized.current) {
				callManager.stop();

				setCall((currentCall) => {
					currentCall
						?.leave()
						.catch((err) => console.log("Cleanup error", err));
					return null;
				});

				isCallInitialized.current = false;
			}
		};
	}, []);

	if (!call) {
		return isVideoCall ? <ChatVideoCallScreen /> : <CallScreen />;
	}

	return (
		<StreamCall call={call}>
			<Stack screenOptions={{ animation: "fade", headerShown: false }}>
				<Stack.Screen name="voice" />
				<Stack.Screen name="video" />
			</Stack>
		</StreamCall>
	);
}
