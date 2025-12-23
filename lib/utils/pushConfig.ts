import {
  StreamVideoClient,
  StreamVideoRN,
  User,
} from "@stream-io/video-react-native-sdk";
import { AndroidImportance } from "@notifee/react-native";
import { formMutation } from "../services/graphql/utils/fetch";
import {
  AuthStreamUserTokenQuery,
  AuthStreamUserTokenQueryVariables,
  MeQuery,
  MeQueryVariables,
} from "../services/graphql/generated";
import {
  AUTH_STREAM_USER_TOKEN,
  ME_QUERY,
} from "../services/graphql/requests/queries/users";

export function setPushConfig() {
  StreamVideoRN.setPushConfig({
    isExpo: true,

    ios: {
      pushProviderName: __DEV__ ? "apn-video-staging" : "apn-video-production",
    },

    android: {
      smallIcon: "ic_notification",
      pushProviderName: "firebase-calls",
      incomingCallChannel: {
        id: "default",
        name: "Incoming call notifications",
        importance: AndroidImportance.HIGH,
        sound: "@/assets/audio/ringtone.mp3",
      },
      incomingCallNotificationTextGetters: {
        getTitle: (userName: string) => `Incoming call from ${userName}`,
        getBody: (_userName: string) => "Tap to answer the call",
        getAcceptButtonTitle: () => "Accept",
        getDeclineButtonTitle: () => "Decline",
      },
    },

    createStreamVideoClient: async () => {
      const authUser = await formMutation<MeQuery, MeQueryVariables>(
        ME_QUERY,
        {},
      ).then((res) => res.data.me);
      if (!authUser.profile) return undefined;

      const tokenProvider = async (): Promise<string> =>
        formMutation<
          AuthStreamUserTokenQuery,
          AuthStreamUserTokenQueryVariables
        >(AUTH_STREAM_USER_TOKEN, {}).then((res) => {
          return res.data.authStreamUserToken;
        });

      const user: User = { id: authUser.id, name: authUser.profile.fullName };
      return StreamVideoClient.getOrCreateInstance({
        apiKey: process.env.EXPO_PUBLIC_STREAM_API_KEY ?? "",
        user,
        tokenProvider,
      });
    },
  });
}
