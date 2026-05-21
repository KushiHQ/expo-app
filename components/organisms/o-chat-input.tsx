import React, { useState } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Keyboard,
  Pressable,
} from 'react-native';
import { useThemeColors } from '@/lib/hooks/use-theme-color';
import { hexToRgba } from '@/lib/utils/colors';
import { Send, Mic, Camera, Paperclip } from 'lucide-react-native';
import { Fonts } from '@/lib/constants/theme';
import * as DocumentPicker from 'expo-document-picker';
import { useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCameraScreen } from '@/lib/hooks/camera';
import { useGalleryStore } from '@/lib/stores/gallery';
import ListImage from '../atoms/a-list-image';
import ListDocument from '../molecules/m-list-document';
import { VoiceRecorder } from '../atoms/a-voice-recorder';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export type ChatInputData = {
  text: string;
  documents: DocumentPicker.DocumentPickerAsset[];
  images: string[];
  audio?: string;
};

type Props = {
  onSend: (input: ChatInputData) => void;
  placeholder?: string;
  maxLines?: number;
};

const ChatInput: React.FC<Props> = ({
  onSend,
  placeholder = 'Type a message...',
  maxLines = 5,
}) => {
  const colors = useThemeColors();
  const [message, setMessage] = useState('');
  const { fromCamera } = useLocalSearchParams();
  const [inputHeight, setInputHeight] = useState(40);
  const [isRecording, setIsRecording] = useState(false);
  const [media, setMedia] = React.useState<string[]>([]);
  const [documents, setDocuments] = React.useState<DocumentPicker.DocumentPickerAsset[]>([]);
  const { gallery, clearGallery } = useGalleryStore();
  const { redirect } = useCameraScreen();

  const sendScale = useSharedValue(1);
  const sendAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: sendScale.value }],
  }));

  const minHeight = 40;
  const maxHeight = minHeight * maxLines;

  useFocusEffect(
    React.useCallback(() => {
      if (fromCamera === 'true' && gallery.length) {
        setMedia(gallery);
        clearGallery();
      }
    }, [fromCamera, gallery, clearGallery]),
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
      setMessage('');
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
      <View className="flex-row flex-wrap justify-end gap-4 px-6">
        {media.map((image, index) => (
          <ListImage
            src={image}
            deletable
            index={index}
            onDelete={(index) => setMedia((c) => c.filter((_, i) => i !== index))}
            key={index}
          />
        ))}
        {documents.map((document, index) => (
          <ListDocument
            document={{ type: 'local', asset: document }}
            index={index}
            deletable
            key={index}
            onDelete={(index) => setDocuments((c) => c.filter((_, i) => i !== index))}
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
        {isRecording ? (
          <VoiceRecorder
            onCancel={() => setIsRecording(false)}
            onSend={(audioUri) => {
              onSend({
                text: '',
                images: [],
                documents: [],
                audio: audioUri,
              });
              setIsRecording(false);
            }}
          />
        ) : (
          <>
            <View
              style={[
                styles.inputContainer,
                {
                  backgroundColor: colors['surface-01'],
                  height: inputHeight + 16,
                  paddingBottom: inputHeight > minHeight ? 8 : 0,
                },
                inputHeight > minHeight ? { alignItems: 'flex-end' } : { alignItems: 'center' },
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
                placeholderTextColor={hexToRgba(colors.text, 0.35)}
                value={message}
                onChangeText={setMessage}
                multiline
                onContentSizeChange={handleContentSizeChange}
                textAlignVertical="center"
              />
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <TouchableOpacity
                  onPress={handleFilePicker}
                  style={[styles.iconButton, { backgroundColor: hexToRgba(colors.text, 0.07) }]}
                >
                  <Paperclip size={18} color={hexToRgba(colors.text, 0.65)} />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleCamera}
                  style={[styles.iconButton, { backgroundColor: hexToRgba(colors.text, 0.07) }]}
                >
                  <Camera size={18} color={hexToRgba(colors.text, 0.65)} />
                </TouchableOpacity>
              </View>
            </View>

            <AnimatedPressable
              onPressIn={() => (sendScale.value = withSpring(0.88))}
              onPressOut={() => (sendScale.value = withSpring(1))}
              onPress={hasMessage ? handleSend : handleVoicePress}
              style={[
                styles.sendButton,
                {
                  backgroundColor: hasMessage ? colors.primary : colors['surface-01'],
                },
                sendAnimatedStyle,
              ]}
            >
              {hasMessage ? (
                <Send size={20} color={colors['primary-content']} />
              ) : (
                <Mic size={20} color={hexToRgba(colors.text, 0.65)} />
              )}
            </AnimatedPressable>
          </>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 12,
    paddingVertical: 10,
    paddingBottom: 14,
    gap: 8,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -1 },
        shadowOpacity: 0.04,
        shadowRadius: 6,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  inputContainer: {
    flex: 1,
    flexDirection: 'row',
    borderRadius: 24,
    paddingHorizontal: 14,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 46,
  },
  iconButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    fontSize: 15,
    paddingVertical: 0,
    paddingTop: Platform.OS === 'ios' ? 2 : 0,
  },
  sendButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ChatInput;
