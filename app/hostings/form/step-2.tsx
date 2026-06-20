import Button from '@/components/atoms/a-button';
import FloatingLabelInput from '@/components/atoms/a-floating-label-input';
import HostingRoomImage from '@/components/atoms/a-hosting-room-image';
import LoadingModal from '@/components/atoms/a-loading-modal';
import ThemedText from '@/components/atoms/a-themed-text';
import DetailsLayout from '@/components/layouts/details';
import HostingStepper from '@/components/molecules/m-hosting-stepper';
import ThemedModal from '@/components/molecules/m-modal';
import SectionCard from '@/components/molecules/m-section-card';
import RoomItemCard from '@/components/organisms/o-room-item-card';
import { PROPERTY_BLURHASH } from '@/lib/constants/images';
import { Fonts } from '@/lib/constants/theme';
import { useHostingFormRoomUtils } from '@/lib/hooks/forms/use-hosting-form-room-utils';
import { useThemeColors } from '@/lib/hooks/use-theme-color';
import { hexToRgba } from '@/lib/utils/colors';
import { Image } from 'expo-image';
import { useLocalSearchParams } from 'expo-router';
import { useRouter } from '@/lib/hooks/use-router';
import { Room } from '@/lib/types/enums/hostings';
import { Layers } from 'lucide-react-native';
import React, { useRef } from 'react';
import { RefreshControl, TextInput, View } from 'react-native';

export default function NewHostingStep2() {
  const router = useRouter();
  const colors = useThemeColors();
  const { id } = useLocalSearchParams();
  const descriptionRef = useRef<TextInput>(null);

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

  // Quality floor: require at least 5 photos across all spaces before the host
  // can continue, and surface progress so the requirement is clear.
  const MIN_PHOTOS = 5;
  const totalPhotos = rooms.reduce((sum, room) => sum + (room.images?.length ?? 0), 0);
  const hasEnoughPhotos = totalPhotos >= MIN_PHOTOS;

  const [refreshing, setRefreshing] = React.useState(false);
  React.useEffect(() => {
    if (!fetchingHosting) setRefreshing(false);
  }, [fetchingHosting]);

  return (
    <>
      <DetailsLayout
        title="Hosting"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              refetchHosting();
            }}
          />
        }
        footer={
          <HostingStepper
            disabled={!rooms.length || !hasEnoughPhotos}
            step={2}
            onPress={() => {
              router.push(`/hostings/form/step-3?id=${hosting?.id}`);
            }}
          />
        }
      >
        <View style={{ gap: 20, paddingBottom: 24 }}>
          <SectionCard
            icon={<Layers size={16} color={colors.primary} />}
            title="Spaces & Photos"
            subtitle="Add space types and upload media for each space"
          >
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
                style={{
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 10,
                  borderRadius: 12,
                  paddingVertical: 32,
                  backgroundColor: hexToRgba(colors.text, 0.03),
                }}
              >
                <Layers color={hexToRgba(colors.text, 0.25)} size={28} />
                <ThemedText
                  style={{
                    fontSize: 13,
                    color: hexToRgba(colors.text, 0.4),
                    textAlign: 'center',
                    lineHeight: 20,
                  }}
                >
                  No spaces added yet.{'\n'}Use the selector below to add your first space.
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
          </SectionCard>

          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 8,
              borderRadius: 12,
              padding: 12,
              backgroundColor: hexToRgba(hasEnoughPhotos ? colors.primary : colors.text, 0.06),
            }}
          >
            <ThemedText
              style={{
                fontSize: 13,
                lineHeight: 19,
                color: hexToRgba(colors.text, hasEnoughPhotos ? 0.6 : 0.8),
              }}
            >
              {hasEnoughPhotos
                ? `Great — ${totalPhotos} photos added.`
                : `Add at least ${MIN_PHOTOS} photos across your spaces to continue (${totalPhotos}/${MIN_PHOTOS}). Quality photos help your listing stand out.`}
            </ThemedText>
          </View>
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
                      placeholder="How many of this space"
                      returnKeyType="next"
                      onSubmitEditing={() => descriptionRef.current?.focus()}
                      blurOnSubmit={false}
                    />
                  </View>
                  <Button
                    onPress={() => handleRoomImageEdit(activeModalIndex)}
                    style={{
                      backgroundColor: hexToRgba(colors.text, 0.08),
                      borderRadius: 10,
                    }}
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
                  <ThemedText content="error">Delete Space</ThemedText>
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
                Delete this space
                {rooms[deleteModalIndex]?.images.length ? ' and all its photos' : ''}?
              </ThemedText>
              <View className="items-center gap-3">
                <View className="h-28 w-32">
                  <Image
                    source={
                      rooms[deleteModalIndex]?.images.length
                        ? {
                            uri: rooms[deleteModalIndex].images[0],
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
