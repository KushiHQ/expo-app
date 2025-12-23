import { useUser } from "@/lib/hooks/user";
import { useAuthStreamUserTokenQuery } from "@/lib/services/graphql/generated";
import {
  StreamVideo,
  StreamVideoClient,
} from "@stream-io/video-react-native-sdk";
import React from "react";

interface Props {
  children: React.ReactNode;
}

const StreamVideoClientProvider: React.FC<Props> = ({ children }) => {
  const { user } = useUser();
  const [{ data: tokenData }] = useAuthStreamUserTokenQuery();

  const client = React.useMemo(() => {
    if (tokenData?.authStreamUserToken && user.user?.id) {
      const client = StreamVideoClient.getOrCreateInstance({
        apiKey: process.env.EXPO_PUBLIC_STREAM_API_KEY ?? "",
        user: { id: user.user?.id ?? "" },
        token: tokenData?.authStreamUserToken,
      });
      return client;
    }
    return null;
  }, [tokenData, user]);

  if (!client) return children;

  return <StreamVideo client={client}>{children}</StreamVideo>;
};

export default StreamVideoClientProvider;
