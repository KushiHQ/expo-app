import {
  Call,
  JoinCallData,
  StreamVideoClient,
} from "@stream-io/video-react-native-sdk";
import { Router } from "expo-router";

export const joinWithRetry = async (
  call: Call,
  options: JoinCallData = { ring: true, create: true },
  retries = 3,
) => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      await call.join(options);
      return;
    } catch (error: any) {
      if (error?.code === 16 && attempt < retries) {
        await new Promise((res) => setTimeout(res, 300 * attempt));
      } else {
        throw error;
      }
    }
  }
};

export const checkActiveCalls = async (
  client: StreamVideoClient,
  user_id: string,
  router: Router,
) => {
  try {
    const { calls } = await client.queryCalls({
      filter_conditions: {
        "custom.recipient": { $eq: user_id },
      },
      sort: [{ field: "starts_at", direction: -1 }],
      limit: 1,
    });
    if (calls.length > 0) {
      const call = calls[0];
      const callId = call.cid.split(":")[1];
      console.log("ROUTING to", callId);
      router.replace(`/chats/${callId}/call/voice?initiate=false`);
    }
    return false;
  } catch {
    console.error("Failed to check active calls");
  }
};
