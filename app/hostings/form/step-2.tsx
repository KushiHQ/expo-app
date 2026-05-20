import Button from '@/components/atoms/a-button';
import FloatingLabelInput from '@/components/atoms/a-floating-label-input';
import HostingRoomImage from '@/components/atoms/a-hosting-room-image';
import LoadingModal from '@/components/atoms/a-loading-modal';
import ThemedText from '@/components/atoms/a-themed-text';
import DetailsLayout from '@/components/layouts/details';
import HostingStepper from '@/components/molecules/m-hosting-stepper';
import ThemedModal from '@/components/molecules/m-modal';
import RoomItemCard from '@/components/organisms/o-room-item-card';
import { FALLBACK_IMAGE, PROPERTY_BLURHASH } from '@/lib/constants/images';
import { Fonts } from '@/lib/constants/theme';
import { useHostingFormRoomUtils } from '@/lib/hooks/forms/use-hosting-form-room-utils';
import { useFallbackImages } from '@/lib/hooks/images';
import { useThemeColors } from '@/lib/hooks/use-theme-color';
import { hexToRgba } from '@/lib/utils/colors';
import { Image } from 'expo-image';
import { useLocalSearchParams } from 'expo-router';
import { useRouter } from '@/lib/hooks/use-router';
import { Room } from '@/lib/types/enums/hostings';
import { CircleQuestionMark, Layers } from 'lucide-react-native';
import React, { useRef } from 'react';
import { RefreshControl, TextInput, View } from 'react-native';

export default function NewHostingStep2() {
  const router = useRouter();
  const colors = useThemeColors();
  const { id } = useLocalSearchParams();
  const descriptionRef = useRef<TextInput>(null);
  const { failedImages, handleImageError } = useFallbackImages();

  const {
    rooms,
    hosting,
    loading,
    hostingRoomSaving,
    activeModalIndex,
    deleteRoomImage,
    deleteModalIndex,
    activeIndex,
    fetchingHosting,
    refetchHosting,
    handleSaveHostingRoom,
    handleRoomImageEdit,
    handleDeleteImage,
    setActiveModalIndex,
    updateActiveRoom,
    setDeleteModalIndex,
    handleDeleteActiveRoom,
  } = useHostingFormRoomUtils(String(id));

  const allRoomTypesUsed = rooms.length >= 20;

  return (
    <>
      <DetailsLayout
        title="Hosting"
        refreshControl={
          <RefreshControl refreshing={fetchingHosting} onRefresh={() => refetchHosting()} />
        }
        footer={
          <HostingStepper
            disabled={!rooms.length}
            step={2}
            onPress={() => {
              router.push(`/hostings/form/step-3?id=${hosting?.id}`);
            }}
          />
        }
      >
        <View className="mt-2 flex-1 gap-4">
          <ThemedText style={{ fontSize: 12, color: hexToRgba(colors.text, 0.6) }}>
            <CircleQuestionMark color={hexToRgba(colors.text, 0.7)} size={12} />
            {'  '}
            Select a room type, then tap <ThemedText style={{ fontSize: 12, fontFamily: Fonts.semibold, color: hexToRgba(colors.text, 0.75) }}>Add Photos</ThemedText> to upload images for that space. Use <ThemedText style={{ fontSize: 12, fontFamily: Fonts.semibold, color: hexToRgba(colors.text, 0.75) }}>Details</ThemedText> to set the room count and description.
          </ThemedText>

          {/* Existing room cards */}
          {rooms.map((room, index) => (
            <RoomItemCard
              key={room.id ?? `room-${index}`}
              index={index}
              room={room}
              rooms={rooms}
              colors={colors}
              hostingRoomSaving={hostingRoomSaving}
              handleSaveHostingRoom={handleSaveHostingRoom}
              handleRoomImageEdit={handleRoomImageEdit}
              handleDeleteImage={handleDeleteImage}
              setActiveModalIndex={setActiveModalIndex}
            />
          ))}

          {/* Empty state */}
          {rooms.length === 0 && (
            <View
              className="items-center justify-center gap-3 rounded-2xl py-10"
              style={{ backgroundColor: hexToRgba(colors.text, 0.04) }}
            >
              <Layers color={hexToRgba(colors.text, 0.3)} size={28} />
              <ThemedText style={{ fontSize: 13, color: hexToRgba(colors.text, 0.4), textAlign: 'center' }}>
                No rooms added yet.{'\n'}Use the selector below to add your first space.
              </ThemedText>
            </View>
          )}

          {/* Add new room card */}
          {!allRoomTypesUsed && (
            <RoomItemCard
              key={`add-room-${rooms.length}`}
              index={rooms.length}
              room={undefined}
              rooms={rooms}
              colors={colors}
              hostingRoomSaving={hostingRoomSaving}
              handleSaveHostingRoom={handleSaveHostingRoom}
              handleRoomImageEdit={handleRoomImageEdit}
              handleDeleteImage={handleDeleteImage}
              setActiveModalIndex={setActiveModalIndex}
            />
          )}
        </View>
      </DetailsLayout>

      {/* Details modal */}
      <ThemedModal
        visible={activeModalIndex !== undefined}
        onClose={() => setActiveModalIndex(undefined)}
      >
        <View className="gap-4">
          {activeModalIndex !== undefined && rooms[activeModalIndex] && (
            <>
              <ThemedText style={{ fontFamily: Fonts.semibold, fontSize: 16 }}>
                {Room[rooms[activeModalIndex].name]}
              </ThemedText>

              {/* Images preview in modal */}
              {rooms[activeModalIndex].images.length > 0 && (
                <View className="flex-row flex-wrap gap-2">
                  {rooms[activeModalIndex].images.slice(0, 6).map((img, id) => (
                    <HostingRoomImage
                      src={img}
                      key={id}
                      imageIndex={id}
                      roomIndex={activeModalIndex}
                      onDeleteRoomImage={deleteRoomImage}
                    />
                  ))}
                </View>
              )}

              <View className="gap-3">
                <View className="flex-row gap-3">
                  <View className="flex-1">
                    <FloatingLabelInput
                      focused
                      value={rooms.at(activeIndex)?.count?.toString()}
                      label="Count"
                      inputMode="numeric"
                      onChangeText={(v) => updateActiveRoom({ count: Number(v) })}
                      placeholder="How many of this room"
                      returnKeyType="next"
                      onSubmitEditing={() => descriptionRef.current?.focus()}
                      blurOnSubmit={false}
                    />
                  </View>
                  <Button
                    onPress={() => handleRoomImageEdit(activeModalIndex)}
                    style={{ backgroundColor: hexToRgba(colors.text, 0.08), borderRadius: 10 }}
                    className="items-center justify-center px-4"
                  >
                    <ThemedText style={{ fontSize: 12 }}>Add{'\n'}Photos</ThemedText>
                  </Button>
                </View>
                <FloatingLabelInput
                  ref={descriptionRef}
                  focused
                  multiline
                  value={rooms.at(activeIndex)?.description}
                  label="Description (Optional)"
                  placeholder="Brief description of this space"
                  containerStyle={{ minHeight: 80 }}
                  numberOfLines={4}
                  onChangeText={(description) => updateActiveRoom({ description })}
                  returnKeyType="done"
                />
              </View>

              <View className="flex-row gap-2">
                <Button
                  className="flex-1"
                  type="error"
                  disabled={hostingRoomSaving}
                  onPress={() => setDeleteModalIndex(activeIndex)}
                >
                  <ThemedText content="error">Delete Room</ThemedText>
                </Button>
                <Button
                  disabled={hostingRoomSaving}
                  loading={hostingRoomSaving}
                  className="flex-1"
                  type="text"
                  onPress={() => {
                    handleSaveHostingRoom(activeIndex, rooms[activeIndex]);
                    setActiveModalIndex(undefined);
                  }}
                >
                  <ThemedText content="text">Save</ThemedText>
                </Button>
              </View>
            </>
          )}
        </View>
      </ThemedModal>

      {/* Delete confirmation modal */}
      <ThemedModal
        visible={deleteModalIndex !== undefined}
        onClose={() => setDeleteModalIndex(undefined)}
      >
        <View>
          {deleteModalIndex !== undefined && (
            <View className="gap-6">
              <ThemedText style={{ fontFamily: Fonts.medium }}>
                Delete this room{rooms[deleteModalIndex]?.images.length ? ' and all its photos' : ''}?
              </ThemedText>
              <View className="items-center gap-3">
                <View className="h-28 w-32">
                  <Image
                    source={
                      rooms[deleteModalIndex]?.images.length
                        ? {
                            uri: failedImages.has(0)
                              ? FALLBACK_IMAGE
                              : rooms[deleteModalIndex].images[0],
                          }
                        : require('@/assets/images/room-image.jpg')
                    }
                    style={{ height: '100%', width: '100%', borderRadius: 10 }}
                    contentFit="cover"
                    transition={300}
                    placeholder={{ blurhash: PROPERTY_BLURHASH }}
                    placeholderContentFit="cover"
                    cachePolicy="memory-disk"
                    priority="high"
                    onError={() => handleImageError(0)}
                  />
                </View>
                <ThemedText style={{ fontFamily: Fonts.semibold, fontSize: 18 }}>
                  {rooms[deleteModalIndex] ? Room[rooms[deleteModalIndex].name] : ''}
                </ThemedText>
              </View>
              <View className="flex-row items-center gap-2">
                <Button
                  type="shade"
                  className="flex-1"
                  onPress={() => setDeleteModalIndex(undefined)}
                >
                  <ThemedText content="shade">Cancel</ThemedText>
                </Button>
                <Button type="error" className="flex-1" onPress={handleDeleteActiveRoom}>
                  <ThemedText content="error">Delete</ThemedText>
                </Button>
              </View>
            </View>
          )}
        </View>
      </ThemedModal>

      <LoadingModal visible={loading} />
    </>
  );
}
