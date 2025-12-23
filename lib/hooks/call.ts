import {
  useCall,
  useStreamVideoClient,
} from "@stream-io/video-react-native-sdk";
import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import { useUser } from "./user";
import { useHostingChatQuery } from "../services/graphql/generated";
import { cast } from "../types/utils";
import { useCountUp } from "./use-countup";
import { useAudioPlayer } from "expo-audio";
import { checkActiveCalls, joinWithRetry } from "../utils/call";

const callerRingtone = require("@/assets/audio/caller-ringtone.mp3");
const receiverRingtone = require("@/assets/audio/ringtone.mp3");

export const useIncomingCallListener = () => {
  const { user } = useUser();
  const client = useStreamVideoClient();
  const router = useRouter();

  React.useEffect(() => {
    if (!client) return;

    const unsubscribe = client.on("call.ring", (e) => {
      const call = e.call;

      const callId = call.cid.split(":")[1];

      router.push(`/chats/${callId}/voice?initiate=false`);
    });

    checkActiveCalls(client, user.user?.id ?? "", router);

    return () => {
      unsubscribe();
    };
  }, [client, user]);
};

export const useActiveCall = () => {
  const router = useRouter();
  const { id, initiate } = useLocalSearchParams();
  const { user } = useUser();
  const call = useCall();
  const [isRinging, setIsRinging] = React.useState(true);
  const [{ data: chatData }] = useHostingChatQuery({
    variables: { chatId: cast(id) },
  });
  const { formatted: callDuration } = useCountUp(!isRinging);
  const player = useAudioPlayer(
    initiate === "true" ? callerRingtone : receiverRingtone,
  );

  React.useEffect(() => {
    const playRingTone = async () => {
      try {
        player.loop = true;
        player.seekTo(0);
        player.play();
        setIsRinging(true);
      } catch (err) {
        console.log("Error loading ringtone", err);
      }
    };
    playRingTone();
  }, [player]);

  React.useEffect(() => {
    return () => {
      call?.endCall();
      call?.update({
        custom: {
          recipient: null,
        },
      });
    };
  }, [call]);

  React.useEffect(() => {
    const unsubscribe = call?.on("call.session_participant_joined", (p) => {
      if (p.participant.user.id !== user.user?.id) {
        stopRingtone();
        setIsRinging(false);
      }
    });
    const unsubscribeAccepted = call?.on("call.accepted", () => {
      stopRingtone();
      setIsRinging(false);
    });
    const unsubscribeCallEnd = call?.on("call.ended", () => {
      router.back();
    });

    return () => {
      unsubscribe?.();
      unsubscribeAccepted?.();
      unsubscribeCallEnd?.();
    };
  }, [call]);

  const stopRingtone = async () => {
    try {
      if (player) {
        player.pause();
      }
    } catch { }
    setIsRinging(false);
  };

  function handleLeave() {
    stopRingtone();
    try {
      if (initiate === "true") {
        call?.leave();
      } else {
        call?.reject();
      }
    } catch { }
    router.replace(`/chats/${id}`);
  }

  async function handleJoin() {
    stopRingtone();
    try {
      if (call) joinWithRetry(call);
    } catch (e) {
      console.error("Join failed", e);
    }
  }

  return {
    callDuration,
    isCaller: initiate === "true",
    recipient: chatData?.hostingChat.recipientUser,
    leaveCall: handleLeave,
    joinCall: handleJoin,
    isRinging,
  };
};
