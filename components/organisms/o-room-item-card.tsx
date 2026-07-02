import React, { memo } from 'react';
import { Room } from '@/lib/types/enums/hostings';
import { usePropertyTypeConfig } from '@/lib/hooks/use-property-type-config';
import { RoomData } from '@/lib/stores/hostings';
import { cast } from '@/lib/types/utils';
import { Pressable, ScrollView, View } from 'react-native';
import SelectInput, { SelectOption } from '../molecules/m-select-input';
import Button from '../atoms/a-button';
import BottomSheet from '../atoms/a-bottom-sheet';
import { hexToRgba } from '@/lib/utils/colors';
import {
  Bed,
  Briefcase,
  Building2,
  Clock,
  Coffee,
  DoorOpen,
  Droplets,
  Fence,
  FolderInput,
  Home,
  LucideIcon,
  MapPin,
  MoreHorizontal,
  Package,
  Palette,
  ShoppingBag,
  Stethoscope,
  Trash2,
  TreePine,
  Trees,
  Users,
  Utensils,
  Wind,
  Wrench,
} from 'lucide-react-native';
import ThemedText from '../atoms/a-themed-text';
import HostingRoomImage from '../atoms/a-hosting-room-image';
import { CameraLinear } from '../icons/i-camera';
import { SURFACE } from '@/lib/constants/surface';
import { Fonts } from '@/lib/constants/theme';

export const ROOM_ICONS: Partial<Record<keyof typeof Room, LucideIcon>> = {
  Exterior: MapPin,
  LivingRoom: Home,
  Bedroom: Bed,
  Bathroom: Home,
  Kitchen: Utensils,
  DiningRoom: Coffee,
  Corridor: DoorOpen,
  Balcony: Wind,
  OfficeSpace: Briefcase,
  MeetingRoom: Users,
  WaitingRoom: Clock,
  RetailArea: ShoppingBag,
  StockRoom: Package,
  MainHall: Building2,
  GuestRoom: Bed,
  PatientRoom: Stethoscope,
  StudioSpace: Palette,
  WorkshopArea: Wrench,
  StorageArea: Package,
  PlotBoundary: Fence,
  FrontArea: TreePine,
  BackArea: Trees,
  GateEntrance: DoorOpen,
  WellBorehole: Droplets,
  Others: MoreHorizontal,
};

export interface RoomItemCardProps {
  index: number;
  /** Undefined renders the "add a space" selector. */
  room?: RoomData;
  colors: { text: string; background?: string };
  hostingRoomSaving: boolean;
  handleSaveHostingRoom: (index: number, data: RoomData) => void;
  handleRoomImageEdit: (index: number) => void;
  handleDeleteImage: (roomIndex: number, imageIndex: number) => void;
  setActiveModalIndex: (index?: number | undefined) => void;
  /** publicUrl of the hosting's current cover image, for badging. */
  coverImageUrl?: string;
  handleSetCoverImage?: (roomIndex: number, imageIndex: number) => void;
  onOpenImage?: (roomIndex: number, imageIndex: number) => void;
  resolveThumb?: (url: string) => string;
  /** Property type, to scope the space-type options (WS-7). */
  propertyType?: string;
  /** Client-rendered instance label, e.g. "Bedroom 2" (WS-6). */
  instanceLabel?: string;
  /** Other saved spaces in this listing (move targets). Enables select+move. */
  moveTargets?: { id: string; label: string; name: keyof typeof Room }[];
  /** Move the given image URLs (from this room) to another room. */
  onMoveImages?: (targetRoomId: string, imageUrls: string[]) => void;
  /** Delete the given image URLs from this room. */
  onDeleteImages?: (roomIndex: number, imageUrls: string[]) => void;
}

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
    coverImageUrl,
    handleSetCoverImage,
    onOpenImage,
    resolveThumb,
    propertyType,
    instanceLabel,
    moveTargets,
    onMoveImages,
    onDeleteImages,
  }: RoomItemCardProps) => {
    // Multi-select (move / delete) state, keyed by image URL.
    const [selecting, setSelecting] = React.useState(false);
    const [selected, setSelected] = React.useState<string[]>([]);
    const [moveSheetOpen, setMoveSheetOpen] = React.useState(false);

    const roomImages = React.useMemo(() => room?.images ?? [], [room?.images]);
    const canSelect = !!moveTargets && moveTargets.length > 0 && roomImages.length > 0;

    const exitSelect = React.useCallback(() => {
      setSelecting(false);
      setSelected([]);
      setMoveSheetOpen(false);
    }, []);

    const toggleSelect = React.useCallback(
      (_roomIndex: number, imageIndex: number) => {
        const url = roomImages[imageIndex];
        if (!url) return;
        setSelected((prev) =>
          prev.includes(url) ? prev.filter((u) => u !== url) : [...prev, url],
        );
      },
      [roomImages],
    );

    const confirmMove = React.useCallback(
      (targetRoomId: string) => {
        onMoveImages?.(targetRoomId, selected);
        exitSelect();
      },
      [onMoveImages, selected, exitSelect],
    );

    const deleteSelected = React.useCallback(() => {
      onDeleteImages?.(index, selected);
      exitSelect();
    }, [onDeleteImages, index, selected, exitSelect]);
    // Spaces relevant to this property type (from the server's admin-editable
    // config, with a bundled fallback); duplicates ARE allowed — each pick
    // creates a separate room instance (WS-6/WS-7).
    const { roomsFor } = usePropertyTypeConfig();
    const spaceOptions = React.useMemo(
      () =>
        roomsFor(propertyType).map((v) => ({
          label: Room[v as keyof typeof Room] ?? v,
          value: v,
        })),
      [roomsFor, propertyType],
    );

    const onSelectRoom = React.useCallback(
      (v: { label: string; value: string }) => {
        handleSaveHostingRoom(index, {
          name: cast(v.value),
          images: [],
          count: 1,
          description: undefined,
        });
      },
      [index, handleSaveHostingRoom],
    );

    const onEditImage = React.useCallback(
      () => handleRoomImageEdit(index),
      [index, handleRoomImageEdit],
    );

    const onOpenDetails = React.useCallback(
      () => setActiveModalIndex(index),
      [index, setActiveModalIndex],
    );

    // Add-a-space selector
    if (!room) {
      return (
        <View
          className="overflow-hidden"
          style={{
            borderWidth: 1,
            borderStyle: 'dashed',
            borderColor: hexToRgba(colors.text, 0.18),
            minHeight: 61,
            borderRadius: 16,
            overflow: 'hidden',
          }}
        >
          <SelectInput
            searchable
            searchField="label"
            defaultValue={undefined}
            className="border-0"
            label="Add a space"
            placeholder="Search a space type to add…"
            onSelect={onSelectRoom}
            options={spaceOptions}
            renderItem={SelectOption}
          />
        </View>
      );
    }

    const RoomIcon: LucideIcon = ROOM_ICONS[room.name] ?? Home;

    return (
      <View
        style={{
          backgroundColor: hexToRgba(colors.text, 0.05),
          borderRadius: 20,
          boxShadow: SURFACE.shadow,
          overflow: 'hidden',
        }}
      >
        {/* Header: icon + instance label */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 10,
            paddingHorizontal: 14,
            paddingTop: 14,
            paddingBottom: 8,
          }}
        >
          <View
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              backgroundColor: hexToRgba(colors.text, 0.08),
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <RoomIcon color={colors.text} size={16} />
          </View>
          <ThemedText
            style={{ fontFamily: Fonts.semibold, fontSize: 15, flex: 1 }}
            numberOfLines={1}
          >
            {instanceLabel ?? Room[room.name]}
          </ThemedText>
          {canSelect ? (
            <Pressable onPress={() => (selecting ? exitSelect() : setSelecting(true))} hitSlop={8}>
              <ThemedText style={{ fontSize: 12, fontFamily: Fonts.semibold, color: colors.text }}>
                {selecting ? 'Cancel' : 'Select'}
              </ThemedText>
            </Pressable>
          ) : null}
        </View>

        {/* Image strip */}
        <View style={{ paddingHorizontal: 12, paddingBottom: 10 }}>
          {room.images.length === 0 ? (
            <View
              style={{
                height: 80,
                borderRadius: 12,
                backgroundColor: hexToRgba(colors.text, 0.04),
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'row',
                gap: 7,
              }}
            >
              <CameraLinear color={hexToRgba(colors.text, 0.28)} size={14} />
              <ThemedText style={{ fontSize: 12, color: hexToRgba(colors.text, 0.32) }}>
                Tap Add Photos to showcase this space
              </ThemedText>
            </View>
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 8 }}
            >
              {room.images.map((img, id) => (
                <HostingRoomImage
                  src={img}
                  displayUri={resolveThumb ? resolveThumb(img) : undefined}
                  key={id}
                  imageIndex={id}
                  roomIndex={index}
                  onDeleteRoomImage={handleDeleteImage}
                  isCover={!!coverImageUrl && img === coverImageUrl}
                  canSetCover={!img.startsWith('file')}
                  onSetCover={handleSetCoverImage}
                  onPress={onOpenImage}
                  selectMode={selecting}
                  selected={selected.includes(img)}
                  onToggleSelect={toggleSelect}
                />
              ))}
            </ScrollView>
          )}
        </View>

        {/* Footer: normal actions, or the multi-select move/delete bar. */}
        {selecting ? (
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 8,
              paddingHorizontal: 12,
              paddingBottom: 12,
              paddingTop: 4,
            }}
          >
            <ThemedText style={{ flex: 1, fontSize: 13, fontFamily: Fonts.semibold }}>
              {selected.length} selected
            </ThemedText>
            <Button
              variant="soft"
              type="error"
              disabled={selected.length === 0}
              onPress={deleteSelected}
              className="flex-row items-center gap-1.5 px-3 py-2"
            >
              <Trash2 color="#F87171" size={13} />
              <ThemedText style={{ fontSize: 12, color: '#F87171', fontFamily: Fonts.semibold }}>
                Delete
              </ThemedText>
            </Button>
            <Button
              type="primary"
              disabled={selected.length === 0}
              onPress={() => setMoveSheetOpen(true)}
              className="flex-row items-center gap-1.5 px-3 py-2"
            >
              <FolderInput color={colors.background ?? '#0A0A0A'} size={13} />
              <ThemedText content="primary" style={{ fontSize: 12 }}>
                Move
              </ThemedText>
            </Button>
          </View>
        ) : (
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'flex-end',
              gap: 8,
              paddingHorizontal: 12,
              paddingBottom: 12,
              paddingTop: 4,
            }}
          >
            <Button
              onPress={onEditImage}
              disabled={hostingRoomSaving}
              variant="outline"
              className="flex-row items-center gap-1.5 px-3 py-2"
              style={{ borderColor: hexToRgba(colors.text, 0.2), borderRadius: 10 }}
            >
              <CameraLinear color={colors.text} size={13} />
              <ThemedText style={{ fontSize: 12 }}>Add Photos</ThemedText>
            </Button>
            <Button
              variant="outline"
              disabled={hostingRoomSaving}
              className="px-3 py-2"
              style={{ borderColor: hexToRgba(colors.text, 0.2), borderRadius: 10 }}
              onPress={onOpenDetails}
            >
              <ThemedText style={{ fontSize: 12 }}>Details</ThemedText>
            </Button>
          </View>
        )}

        {/* Move-to-space sheet */}
        {moveTargets ? (
          <BottomSheet isVisible={moveSheetOpen} onClose={() => setMoveSheetOpen(false)}>
            <View style={{ gap: 2, paddingBottom: 4 }}>
              <ThemedText style={{ fontFamily: Fonts.bold, fontSize: 16 }}>
                Move {selected.length} photo{selected.length === 1 ? '' : 's'} to…
              </ThemedText>
              <ThemedText
                style={{ fontSize: 12, color: hexToRgba(colors.text, 0.55), marginBottom: 10 }}
              >
                Pick a space in this listing.
              </ThemedText>
              {moveTargets.map((t) => {
                const TargetIcon: LucideIcon = ROOM_ICONS[t.name] ?? Home;
                return (
                  <Pressable
                    key={t.id}
                    onPress={() => confirmMove(t.id)}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 12,
                      paddingVertical: 12,
                    }}
                  >
                    <View
                      style={{
                        width: 34,
                        height: 34,
                        borderRadius: 11,
                        backgroundColor: hexToRgba(colors.text, 0.08),
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <TargetIcon color={colors.text} size={15} />
                    </View>
                    <ThemedText style={{ flex: 1, fontFamily: Fonts.semibold, fontSize: 14 }}>
                      {t.label}
                    </ThemedText>
                  </Pressable>
                );
              })}
            </View>
          </BottomSheet>
        ) : null}
      </View>
    );
  },
);

RoomItemCard.displayName = 'RoomItemCard';

export default RoomItemCard;
