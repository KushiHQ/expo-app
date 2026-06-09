import { View } from 'react-native';
import ThemedModal from '../molecules/m-modal';
import ThemedText from '../atoms/a-themed-text';
import { Fonts } from '@/lib/constants/theme';
import FloatingLabelInput from '../atoms/a-floating-label-input';
import { FolderPlus } from 'lucide-react-native';
import Button from '../atoms/a-button';
import React from 'react';
import { useThemeColors } from '@/lib/hooks/use-theme-color';
import {
  SavedHostingFolderInput,
  useCreateUpdateSavedHostingFolderMutation,
} from '@/lib/services/graphql/generated';
import { cast } from '@/lib/types/utils';
import { handleError } from '@/lib/utils/error';
import { toast } from '@/lib/hooks/use-toast';
import { hexToRgba } from '@/lib/utils/colors';

type Props = {
  open: boolean;
  onClose: () => void;
  onCreate?: () => void;
};

const SavedHostingFolderModal: React.FC<Props> = ({ open, onClose, onCreate }) => {
  const colors = useThemeColors();
  const [res, mutate] = useCreateUpdateSavedHostingFolderMutation();
  const [inputs, setInputs] = React.useState<Partial<SavedHostingFolderInput>>({});

  const handleCreate = () => {
    mutate({ input: cast(inputs) }).then((res) => {
      if (res.error) {
        handleError(res.error);
        onClose();
      }
      if (res.data) {
        toast.show({
          type: 'success',
          text1: 'Success',
          text2: res.data.createUpdateSavedHostingFolder.message,
        });
        setInputs({});
        onCreate?.();
      }
    });
  };

  return (
    <ThemedModal visible={open} onClose={onClose}>
      <View style={{ gap: 24 }}>
        <View>
          <ThemedText style={{ fontFamily: Fonts.semibold, fontSize: 18 }}>
            Create Collection
          </ThemedText>
          <ThemedText
            style={{
              fontFamily: Fonts.regular,
              fontSize: 14,
              color: hexToRgba(colors.text, 0.5),
              marginTop: 4,
            }}
          >
            Organize your saved listings into folders
          </ThemedText>
        </View>
        <FloatingLabelInput
          focused
          label="Folder Name"
          placeholder="e.g. Dream Homes"
          onChangeText={(v) => setInputs((c) => ({ ...c, folderName: v }))}
          suffix={<FolderPlus size={16} color={hexToRgba(colors.text, 0.4)} />}
        />
      </View>
      <View
        style={{
          marginTop: 24,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'flex-end',
          gap: 12,
        }}
      >
        <Button onPress={onClose} variant="text">
          <ThemedText style={{ color: hexToRgba(colors.text, 0.6) }}>Cancel</ThemedText>
        </Button>
        <Button
          loading={res.fetching}
          style={{ paddingHorizontal: 24 }}
          onPress={handleCreate}
          disabled={res.fetching || !inputs.folderName?.length}
          type="primary"
        >
          <ThemedText content="primary" style={{ fontFamily: Fonts.semibold }}>
            Create
          </ThemedText>
        </Button>
      </View>
    </ThemedModal>
  );
};

export default SavedHostingFolderModal;
