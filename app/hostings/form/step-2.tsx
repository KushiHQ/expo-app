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
import { DraggableItem, useReorderController } from '@/components/molecules/m-draggable-reorder';
import { PROPERTY_BLURHASH } from '@/lib/constants/images';
import { Fonts } from '@/lib/constants/theme';
import { useHostingFormRoomUtils } from '@/lib/hooks/forms/use-hosting-form-room-utils';
import { useThemeColors } from '@/lib/hooks/use-theme-color';
import { hexToRgba } from '@/lib/utils/colors';
import { Image } from 'expo-image';
import { useLocalSearchParams } from 'expo-router';
import { useRouter } from '@/lib/hooks/use-router';
import { Room } from '@/lib/types/enums/hostings';
import { Layers, Plus } from 'lucide-react-native';
import React, { useRef } from 'react';
import { Pressable, RefreshControl, ScrollView, TextInput, View } from 'react-native';
import { CameraLinear } from '@/components/icons/i-camera';

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
    handleOpenRoomImage,
    handleDeleteImage,
    setActiveModalIndex,
    updateActiveRoom,
    setDeleteModalIndex,
    handleDeleteActiveRoom,
    handleSetCoverImage,
    coverImageUrl,
    resolveThumb,
    handleReorderRoomImages,
    handleMoveImages,
    handleDeleteImages,
  } = useHostingFormRoomUtils(String(id));

  const propertyType = hosting?.propertyType ?? undefined;

  // Group rooms by space type, preserving add order (= date added). Same-type
  // rooms render together under one header with a count badge; each instance is
  // still its own card with its own photos (WS-6).
  const groups = React.useMemo(() => {
    const order: (keyof typeof Room)[] = [];
    const map: Record<string, { room: (typeof rooms)[number]; index: number }[]> = {};
    rooms.forEach((room, index) => {
      if (!map[room.name]) {
        map[room.name] = [];
        order.push(room.name);
      }
      map[room.name].push({ room, index });
    });
    return order.map((name) => ({ name, items: map[name] }));
  }, [rooms]);

  // All SAVED spaces (move requires a persisted target room id), with their
  // instance labels — a card offers every space but itself as a move target.
  const roomTargets = React.useMemo(() => {
    const out: { id: string; label: string; name: keyof typeof Room }[] = [];
    groups.forEach((group) => {
      group.items.forEach(({ room }, i) => {
        if (!room.id) return;
        const label = group.items.length > 1 ? `${Room[group.name]} ${i + 1}` : Room[group.name];
        out.push({ id: room.id, label, name: group.name });
      });
    });
    return out;
  }, [groups]);

  // Photos within a space can be drag-reordered (in the details modal). Rooms are
  // grouped by type now, so room-level manual reorder is retired for the moment.
  const imageReorder = useReorderController({
    axis: 'x',
    count: activeModalIndex !== undefined ? (rooms[activeModalIndex]?.images.length ?? 0) : 0,
    estimatedSize: 96,
    enabled: activeModalIndex !== undefined && (rooms[activeModalIndex]?.images.length ?? 0) > 1,
    onReorder: (from, to) => {
      if (activeModalIndex !== undefined) handleReorderRoomImages(activeModalIndex, from, to);
    },
  });

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
              router.push(`/hostings/form/step-2-video?id=${hosting?.id}`);
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
            {/* Grouped spaces — same type together, each instance its own card */}
            {groups.map((group) => (
              <View key={group.name} style={{ marginBottom: 18 }}>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 8,
                    marginBottom: 10,
                  }}
                >
                  <ThemedText style={{ fontFamily: Fonts.semibold, fontSize: 15 }}>
                    {Room[group.name]}
                  </ThemedText>
                  {group.items.length > 1 && (
                    <View
                      style={{
                        paddingHorizontal: 8,
                        paddingVertical: 2,
                        borderRadius: 999,
                        backgroundColor: hexToRgba(colors.primary, 0.14),
                      }}
                    >
                      <ThemedText
                        style={{ fontSize: 11, fontFamily: Fonts.semibold, color: colors.primary }}
                      >
                        ×{group.items.length}
                      </ThemedText>
                    </View>
                  )}
                </View>
                <View style={{ gap: 12 }}>
                  {group.items.map(({ room, index }, i) => (
                    <RoomItemCard
                      key={room.id ?? `room-${index}`}
                      index={index}
                      room={room}
                      colors={colors}
                      hostingRoomSaving={hostingRoomSaving}
                      handleSaveHostingRoom={handleSaveHostingRoom}
                      handleRoomImageEdit={handleRoomImageEdit}
                      handleDeleteImage={handleDeleteImage}
                      setActiveModalIndex={setActiveModalIndex}
                      coverImageUrl={coverImageUrl}
                      handleSetCoverImage={handleSetCoverImage}
                      onOpenImage={handleOpenRoomImage}
                      resolveThumb={resolveThumb}
                      propertyType={propertyType}
                      instanceLabel={
                        group.items.length > 1 ? `${Room[group.name]} ${i + 1}` : Room[group.name]
                      }
                      moveTargets={roomTargets.filter((t) => t.id !== room.id)}
                      onMoveImages={handleMoveImages}
                      onDeleteImages={handleDeleteImages}
                    />
                  ))}
                  <Pressable
                    onPress={() =>
                      handleSaveHostingRoom(rooms.length, {
                        name: group.name,
                        images: [],
                        count: 1,
                      })
                    }
                    disabled={hostingRoomSaving}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 6,
                      paddingVertical: 10,
                      borderRadius: 12,
                      backgroundColor: hexToRgba(colors.text, 0.04),
                    }}
                  >
                    <Plus size={15} color={hexToRgba(colors.text, 0.6)} />
                    <ThemedText style={{ fontSize: 13, color: hexToRgba(colors.text, 0.6) }}>
                      Add another {Room[group.name]}
                    </ThemedText>
                  </Pressable>
                </View>
              </View>
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
                  No spaces added yet.{'\n'}Pick a space type below to add your first one.
                </ThemedText>
              </View>
            )}

            {/* Add a new space type (duplicates allowed; filtered to the property) */}
            {!allRoomTypesUsed && (
              <RoomItemCard
                key={`add-room-${rooms.length}`}
                index={rooms.length}
                room={undefined}
                colors={colors}
                hostingRoomSaving={hostingRoomSaving}
                handleSaveHostingRoom={handleSaveHostingRoom}
                handleRoomImageEdit={handleRoomImageEdit}
                handleDeleteImage={handleDeleteImage}
                setActiveModalIndex={setActiveModalIndex}
                coverImageUrl={coverImageUrl}
                handleSetCoverImage={handleSetCoverImage}
                propertyType={propertyType}
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
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{ paddingVertical: 2 }}
                >
                  {rooms[activeModalIndex].images.map((img, id) => (
                    <DraggableItem key={img} controller={imageReorder} index={id} gap={8}>
                      <HostingRoomImage
                        src={img}
                        displayUri={resolveThumb(img)}
                        imageIndex={id}
                        roomIndex={activeModalIndex}
                        onDeleteRoomImage={deleteRoomImage}
                        isCover={!!coverImageUrl && img === coverImageUrl}
                        canSetCover={!img.startsWith('file')}
                        onSetCover={handleSetCoverImage}
                      />
                    </DraggableItem>
                  ))}
                </ScrollView>
              )}

              <View className="gap-3">
                <Button
                  onPress={() => handleRoomImageEdit(activeModalIndex)}
                  style={{
                    backgroundColor: hexToRgba(colors.text, 0.08),
                    borderRadius: 10,
                  }}
                  className="flex-row items-center justify-center gap-2 py-3"
                >
                  <CameraLinear color={colors.text} size={20} />
                  <ThemedText style={{ fontSize: 13 }}>Add photos</ThemedText>
                </Button>
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
                  onPress={() => {
                    // Close the details modal BEFORE presenting the confirm
                    // modal — two stacked native Modals deadlock touch handling
                    // on iOS (the "delete freezes the app" bug).
                    const target = activeIndex;
                    setActiveModalIndex(undefined);
                    setTimeout(() => setDeleteModalIndex(target), 350);
                  }}
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
