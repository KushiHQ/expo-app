import React, { memo } from 'react';
import { Room, ROOM_KEYS } from '@/lib/types/enums/hostings';
import { cast } from '@/lib/types/utils';
import { View } from 'react-native';
import SelectInput, { SelectOption } from '../molecules/m-select-input';
import Button from '../atoms/a-button';
import { hexToRgba } from '@/lib/utils/colors';
import { HeroiconsCamera } from '../icons/i-camera';
import ThemedText from '../atoms/a-themed-text';
import HostingRoomImage from '../atoms/a-hosting-room-image';
import { FluentContentViewGallery28Regular } from '../icons/i-gallery';

export interface RoomData {
  name: keyof typeof Room;
  images: string[];
  count: number;
  description?: string;
}

interface RoomItemCardProps {
  index: number;
  room?: RoomData;
  colors: { text: string; background?: string };
  hostingRoomSaving: boolean;
  handleSaveHostingRoom: (index: number, data: RoomData) => void;
  handleRoomImageEdit: (index: number) => void;
  handleDeleteImage: (roomIndex: number, imageIndex: number) => void;
  setActiveModalIndex: (index?: number | undefined) => void;
}

const ROOM_OPTIONS = ROOM_KEYS.map((v) => ({
  label: Room[v as keyof typeof Room],
  value: v,
}));

const RoomItemCard = memo(
  ({
    index,
    room,
    colors,
    hostingRoomSaving,
    handleSaveHostingRoom,
    handleRoomImageEdit,
    handleDeleteImage,
    setActiveModalIndex,
  }: RoomItemCardProps) => {
    const onSelectRoom = React.useCallback(
      (v: { label: string; value: string }) => {
        handleSaveHostingRoom(index, {
          name: cast(v.value),
          images: [],
          count: 1,
        });
      },
      [index, handleSaveHostingRoom],
    );

    const onEditImage = React.useCallback(() => {
      handleRoomImageEdit(index);
    }, [index, handleRoomImageEdit]);

    const onOpenDetails = React.useCallback(() => {
      setActiveModalIndex(index);
    }, [index, setActiveModalIndex]);

    return (
      <View className="gap-2">
        <View className="flex-row items-center gap-2">
          <SelectInput
            focused
            defaultValue={
              room
                ? {
                    label: Room[room.name],
                    value: Room[room.name],
                  }
                : undefined
            }
            label="Room"
            placeholder="Select room or exterior to add image"
            onSelect={onSelectRoom}
            options={ROOM_OPTIONS}
            renderItem={SelectOption}
          />
          <Button
            onPress={onEditImage}
            disabled={!room || hostingRoomSaving}
            variant="outline"
            className="p-6"
            style={{
              borderColor: hexToRgba(colors.text, 0.25),
              borderRadius: 12,
            }}
          >
            <HeroiconsCamera color={colors.text} size={20} />
          </Button>
        </View>
        <View className="flex-row gap-2">
          {room && !(room.images.length > 0) && (
            <View
              className="flex-1 items-center justify-center rounded-xl p-4"
              style={{ backgroundColor: hexToRgba(colors.text, 0.1) }}
            >
              <ThemedText
                style={{
                  color: hexToRgba(colors.text, 0.8),
                  fontSize: 12,
                }}
              >
                No Images Yet
              </ThemedText>
            </View>
          )}
          {room && room?.images?.length > 0 && (
            <View className="flex-1 flex-row gap-2">
              {room.images.slice(0, 4).map((img, id) => (
                <HostingRoomImage
                  src={img}
                  key={id}
                  imageIndex={id}
                  roomIndex={index}
                  onDeleteRoomImage={handleDeleteImage}
                />
              ))}
            </View>
          )}
          {room && (
            <>
              <Button
                variant="outline"
                disabled={hostingRoomSaving}
                loading={hostingRoomSaving}
                type="shade"
                className="px-3 py-0.5 pt-2.5"
                onPress={onOpenDetails}
              >
                <View className="items-center justify-center">
                  <FluentContentViewGallery28Regular color={colors.text} size={14} />
                  <ThemedText style={{ fontSize: 10 }}>Details</ThemedText>
                </View>
              </Button>
            </>
          )}
        </View>
      </View>
    );
  },
);

RoomItemCard.displayName = 'RoomItemCard';

export default RoomItemCard;
