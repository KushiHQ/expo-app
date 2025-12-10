import React, { useState } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Keyboard,
  Pressable,
} from "react-native";
import { useThemeColors } from "@/lib/hooks/use-theme-color";
import { hexToRgba } from "@/lib/utils/colors";
import { Send, Mic, Camera, Paperclip } from "lucide-react-native";
import { Fonts } from "@/lib/constants/theme";
import { twMerge } from "tailwind-merge";
import * as DocumentPicker from "expo-document-picker";
import { useFocusEffect, useLocalSearchParams } from "expo-router";
import { useCameraScreen } from "@/lib/hooks/camera";
import { useGalleryStore } from "@/lib/stores/gallery";
import ListImage from "../atoms/a-list-image";
import ListDocument from "./m-list-document";

export type ChatInputData = {
  text: string;
  documents: DocumentPicker.DocumentPickerAsset[];
  images: string[];
};

type Props = {
  onSend: (input: ChatInputData) => void;
  placeholder?: string;
  maxLines?: number;
};

const ChatInput: React.FC<Props> = ({
  onSend,
  placeholder = "Type a message...",
  maxLines = 5,
}) => {
  const colors = useThemeColors();
  const [message, setMessage] = useState("");
  const { fromCamera } = useLocalSearchParams();
  const [inputHeight, setInputHeight] = useState(40);
  const [isRecording, setIsRecording] = useState(false);
  const [media, setMedia] = React.useState<string[]>([]);
  const [documents, setDocuments] = React.useState<
    DocumentPicker.DocumentPickerAsset[]
  >([]);
  const { gallery, clearGallery } = useGalleryStore();
  const { redirect } = useCameraScreen();

  const minHeight = 40;
  const maxHeight = minHeight * maxLines;

  useFocusEffect(
    React.useCallback(() => {
      if (fromCamera === "true" && gallery.length) {
        setMedia(gallery);
        clearGallery();
      }
    }, [fromCamera, gallery]),
  );

  const handleContentSizeChange = (event: any) => {
    const { height } = event.nativeEvent.contentSize;
    const newHeight = Math.min(Math.max(minHeight, height), maxHeight);
    setInputHeight(newHeight);
  };

  const handleSend = () => {
    if (message.trim().length > 0) {
      onSend({
        text: message.trim(),
        images: media,
        documents,
      });
      setMessage("");
      setMedia([]);
      setDocuments([]);
      setInputHeight(minHeight);
      Keyboard.dismiss();
    }
  };

  const handleFilePicker = async () => {
    const results = await DocumentPicker.getDocumentAsync({
      multiple: true,
    });
    setDocuments((c) => [...c, ...(results.assets ?? [])]);
  };

  const handleCamera = async () => {
    redirect({ clear: true });
  };

  const handleVoicePress = () => {
    setIsRecording(!isRecording);
  };

  const hasMessage = message.trim().length > 0;

  return (
    <View>
      <View className="flex-row justify-end px-6 gap-4 flex-wrap">
        {media.map((image, index) => (
          <ListImage
            src={image}
            imageIndex={index}
            onDeleteImage={(index) =>
              setMedia((c) => c.filter((_, i) => i !== index))
            }
            key={index}
          />
        ))}
        {documents.map((document, index) => (
          <ListDocument
            document={document}
            index={index}
            key={index}
            onDelete={(index) =>
              setDocuments((c) => c.filter((_, i) => i !== index))
            }
          />
        ))}
      </View>
      <View
        style={[
          styles.container,
          {
            backgroundColor: colors.background,
            borderColor: hexToRgba(colors.text, 0.1),
          },
        ]}
      >
        <View
          className={twMerge(
            "flex-row items-center justify-between",
            inputHeight > minHeight && "items-end",
          )}
          style={[
            styles.inputContainer,
            {
              backgroundColor: hexToRgba(colors.text, 0.05),
              height: inputHeight + 10,
              paddingBottom: inputHeight > minHeight ? 10 : 0,
            },
          ]}
        >
          <TextInput
            style={[
              styles.input,
              {
                color: colors.text,
                fontFamily: Fonts.regular,
                height: inputHeight,
              },
            ]}
            className="flex-1"
            cursorColor={colors.primary}
            placeholder={placeholder}
            placeholderTextColor={hexToRgba(colors.text, 0.5)}
            value={message}
            onChangeText={setMessage}
            multiline
            onContentSizeChange={handleContentSizeChange}
            textAlignVertical="center"
          />
          <View className="flex-row items-center gap-4">
            <Pressable onPress={handleFilePicker}>
              <Paperclip size={26} color={colors.text} />
            </Pressable>
            <Pressable onPress={handleCamera}>
              <Camera size={26} color={colors.text} />
            </Pressable>
          </View>
        </View>

        {/* Send or Voice Button */}
        <TouchableOpacity
          onPress={hasMessage ? handleSend : handleVoicePress}
          style={[
            styles.sendButton,
            {
              backgroundColor: hasMessage
                ? colors.primary
                : hexToRgba(colors.text, 0.1),
            },
          ]}
        >
          {hasMessage ? (
            <Send size={26} color={colors["primary-content"]} />
          ) : (
            <Mic size={26} color={isRecording ? colors.error : colors.text} />
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: 12,
    paddingVertical: 14,
    paddingBottom: 16,
    gap: 8,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  inputContainer: {
    flex: 1,
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 16,
    justifyContent: "center",
    minHeight: 30,
  },
  input: {
    fontSize: 16,
    paddingVertical: 0,
    paddingTop: Platform.OS === "ios" ? 8 : 0,
  },
  sendButton: {
    width: 48,
    height: 48,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default ChatInput;
