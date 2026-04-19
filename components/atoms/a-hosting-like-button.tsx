import {
  useCreateUpdateSavedHostingMutation,
  useDeleteSavedHostingMutation,
} from "@/lib/services/graphql/generated";
import { handleError } from "@/lib/utils/error";
import * as Haptics from "expo-haptics";
import React from "react";
import { Pressable, View } from "react-native";
import Toast from "react-native-toast-message";
import { PhHeart, PhHeartFill } from "../icons/i-heart";
import { useThemeColors } from "@/lib/hooks/use-theme-color";

type Props = {
  id: string;
  saved: boolean;
  className?: string;
};

const HostingLikeButton: React.FC<Props> = ({
  saved: defSaved,
  className,
  id,
}) => {
  const colors = useThemeColors();
  const [saved, setSaved] = React.useState(defSaved ?? false);
  const [{ fetching: savingHosting }, saveHosting] =
    useCreateUpdateSavedHostingMutation();
  const [{ fetching: deletingSaved }, deleteSaved] =
    useDeleteSavedHostingMutation();

  function toggleSaved() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const previousSaved = saved;
    setSaved(!previousSaved);

    if (previousSaved) {
      deleteSaved({ hostingId: id }).then((res) => {
        if (res.error) {
          setSaved(true);
          handleError(res.error);
        }
        if (res.data) {
          Toast.show({
            type: "success",
            text2: res.data.deleteSavedHosting.message,
          });
        }
      });
    } else {
      saveHosting({ input: { hostingId: id } }).then((res) => {
        if (res.error) {
          setSaved(false);
          handleError(res.error);
        }
        if (res.data) {
          Toast.show({
            type: "success",
            text2: res.data.createUpdateSavedHosting.message,
          });
        }
      });
    }
  }

  return (
    <Pressable
      onPress={toggleSaved}
      className={className}
    >
      <View className="absolute top-0 right-0">
        <PhHeartFill color={saved ? "#de4b71" : "white"} />
      </View>
      <View className="absolute top-0 right-0">
        <PhHeart color={colors.text} />
      </View>
    </Pressable>
  );
};

export default HostingLikeButton;
