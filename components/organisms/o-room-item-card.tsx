import React, { memo } from "react";
import { Room, roomsForPropertyType } from "@/lib/types/enums/hostings";
import { RoomData } from "@/lib/stores/hostings";
import { cast } from "@/lib/types/utils";
import { ScrollView, View } from "react-native";
import SelectInput, { SelectOption } from "../molecules/m-select-input";
import Button from "../atoms/a-button";
import { hexToRgba } from "@/lib/utils/colors";
import {
  Bed,
  Briefcase,
  Building2,
  Clock,
  Coffee,
  DoorOpen,
  Droplets,
  Fence,
  Home,
  LucideIcon,
  MapPin,
  MoreHorizontal,
  Package,
  Palette,
  ShoppingBag,
  Stethoscope,
  TreePine,
  Trees,
  Users,
  Utensils,
  Wind,
  Wrench,
} from "lucide-react-native";
import ThemedText from "../atoms/a-themed-text";
import HostingRoomImage from "../atoms/a-hosting-room-image";
import { CameraLinear } from "../icons/i-camera";
import { SURFACE } from "@/lib/constants/surface";
import { Fonts } from "@/lib/constants/theme";

const ROOM_ICONS: Partial<Record<keyof typeof Room, LucideIcon>> = {
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
  }: RoomItemCardProps) => {
    // Spaces relevant to this property type; duplicates ARE allowed now — each
    // pick creates a separate room instance (WS-6/WS-7).
    const spaceOptions = React.useMemo(
      () => roomsForPropertyType(propertyType).map((v) => ({ label: Room[v], value: v })),
      [propertyType],
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
            borderStyle: "dashed",
            borderColor: hexToRgba(colors.text, 0.18),
            minHeight: 61,
            borderRadius: 16,
            overflow: "hidden",
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
          overflow: "hidden",
        }}
      >
        {/* Header: icon + instance label */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
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
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <RoomIcon color={colors.text} size={16} />
          </View>
          <ThemedText style={{ fontFamily: Fonts.semibold, fontSize: 15 }} numberOfLines={1}>
            {instanceLabel ?? Room[room.name]}
          </ThemedText>
        </View>

        {/* Image strip */}
        <View style={{ paddingHorizontal: 12, paddingBottom: 10 }}>
          {room.images.length === 0 ? (
            <View
              style={{
                height: 80,
                borderRadius: 12,
                backgroundColor: hexToRgba(colors.text, 0.04),
                alignItems: "center",
                justifyContent: "center",
                flexDirection: "row",
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
                  canSetCover={!img.startsWith("file")}
                  onSetCover={handleSetCoverImage}
                  onPress={onOpenImage}
                />
              ))}
            </ScrollView>
          )}
        </View>

        {/* Footer: actions */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "flex-end",
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
      </View>
    );
  },
);

RoomItemCard.displayName = "RoomItemCard";

export default RoomItemCard;
