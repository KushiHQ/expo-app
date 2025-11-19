import {
  useCreateUpdateSavedHostingMutation,
  useDeleteSavedHostingMutation,
} from "@/lib/services/graphql/generated";
import { handleError } from "@/lib/utils/error";
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
    if (saved) {
      deleteSaved({ hostingId: id }).then((res) => {
        if (res.error) {
          handleError(res.error);
        }
        if (res.data) {
          Toast.show({
            type: "success",
            text2: res.data.deleteSavedHosting.message,
          });
          setSaved(false);
        }
      });
    } else {
      saveHosting({ input: { hostingId: id } }).then((res) => {
        if (res.error) {
          handleError(res.error);
        }
        if (res.data) {
          Toast.show({
            type: "success",
            text2: res.data.createUpdateSavedHosting.message,
          });
          setSaved(true);
        }
      });
    }
  }

  return (
    <Pressable
      onPress={toggleSaved}
      disabled={savingHosting || deletingSaved}
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
