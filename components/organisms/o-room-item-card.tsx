import React, { memo } from "react";
import { Room, ROOM_KEYS } from "@/lib/types/enums/hostings";
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
  Camera,
  Clock,
  Coffee,
  DoorOpen,
  Home,
  LucideIcon,
  MapPin,
  MoreHorizontal,
  Package,
  Palette,
  ShoppingBag,
  Stethoscope,
  Users,
  Utensils,
  Wind,
  Wrench,
} from "lucide-react-native";
import ThemedText from "../atoms/a-themed-text";
import HostingRoomImage from "../atoms/a-hosting-room-image";

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
  Others: MoreHorizontal,
};

const ALL_ROOM_OPTIONS = ROOM_KEYS.map((v) => ({
  label: Room[v as keyof typeof Room],
  value: v,
}));

export interface RoomItemCardProps {
  index: number;
  room?: RoomData;
  rooms: RoomData[];
  colors: { text: string; background?: string };
  hostingRoomSaving: boolean;
  handleSaveHostingRoom: (index: number, data: RoomData) => void;
  handleRoomImageEdit: (index: number) => void;
  handleDeleteImage: (roomIndex: number, imageIndex: number) => void;
  setActiveModalIndex: (index?: number | undefined) => void;
}

const RoomItemCard = memo(
  ({
    index,
    room,
    rooms,
    colors,
    hostingRoomSaving,
    handleSaveHostingRoom,
    handleRoomImageEdit,
    handleDeleteImage,
    setActiveModalIndex,
  }: RoomItemCardProps) => {
    const usedNames = React.useMemo(
      () => rooms.filter((_, i) => i !== index).map((r) => r.name),
      [rooms, index],
    );

    const availableOptions = React.useMemo(
      () =>
        ALL_ROOM_OPTIONS.filter(
          (o) => !usedNames.includes(o.value as keyof typeof Room),
        ),
      [usedNames],
    );

    const onSelectRoom = React.useCallback(
      (v: { label: string; value: string }) => {
        handleSaveHostingRoom(index, {
          name: cast(v.value),
          images: room?.images ?? [],
          count: room?.count ?? 1,
          description: room?.description,
        });
      },
      [index, handleSaveHostingRoom, room],
    );

    const onEditImage = React.useCallback(
      () => handleRoomImageEdit(index),
      [index, handleRoomImageEdit],
    );

    const onOpenDetails = React.useCallback(
      () => setActiveModalIndex(index),
      [index, setActiveModalIndex],
    );

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
            label="Add New Room"
            placeholder="Select a room type to showcase..."
            onSelect={onSelectRoom}
            options={availableOptions}
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
          borderRadius: 16,
          borderWidth: 1,
          borderColor: hexToRgba(colors.text, 0.1),
          overflow: "hidden",
        }}
      >
        {/* Header: icon + room type selector */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 10,
            paddingHorizontal: 12,
            paddingTop: 12,
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
          <View style={{ flex: 1 }}>
            <SelectInput
              searchable
              searchField="label"
              defaultValue={{ label: Room[room.name], value: room.name }}
              label="Room Type"
              placeholder="Select room type"
              className="border-0"
              onSelect={onSelectRoom}
              options={availableOptions}
              renderItem={SelectOption}
            />
          </View>
        </View>

        {/* Image strip */}
        <View style={{ paddingHorizontal: 12, paddingBottom: 10 }}>
          {room.images.length === 0 ? (
            <View
              style={{
                height: 80,
                borderRadius: 12,
                backgroundColor: hexToRgba(colors.text, 0.04),
                borderWidth: 1,
                borderColor: hexToRgba(colors.text, 0.08),
                borderStyle: "dashed",
                alignItems: "center",
                justifyContent: "center",
                flexDirection: "row",
                gap: 7,
              }}
            >
              <Camera color={hexToRgba(colors.text, 0.28)} size={14} />
              <ThemedText
                style={{ fontSize: 12, color: hexToRgba(colors.text, 0.32) }}
              >
                Tap "Add Photos" to showcase this space
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
                  key={id}
                  imageIndex={id}
                  roomIndex={index}
                  onDeleteRoomImage={handleDeleteImage}
                />
              ))}
            </ScrollView>
          )}
        </View>

        {/* Footer: count label + actions */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            paddingHorizontal: 12,
            paddingBottom: 12,
            paddingTop: 6,
            borderTopWidth: 1,
            borderTopColor: hexToRgba(colors.text, 0.07),
          }}
        >
          <ThemedText
            style={{ fontSize: 11, color: hexToRgba(colors.text, 0.42) }}
          >
            {room.count} {room.count === 1 ? "space" : "spaces"}
          </ThemedText>
          <View style={{ flexDirection: "row", gap: 8 }}>
            <Button
              onPress={onEditImage}
              disabled={hostingRoomSaving}
              variant="outline"
              className="flex-row items-center gap-1.5 px-3 py-2"
              style={{
                borderColor: hexToRgba(colors.text, 0.2),
                borderRadius: 10,
              }}
            >
              <Camera color={colors.text} size={13} />
              <ThemedText style={{ fontSize: 12 }}>Add Photos</ThemedText>
            </Button>
            <Button
              variant="outline"
              disabled={hostingRoomSaving}
              className="px-3 py-2"
              style={{
                borderColor: hexToRgba(colors.text, 0.2),
                borderRadius: 10,
              }}
              onPress={onOpenDetails}
            >
              <ThemedText style={{ fontSize: 12 }}>Details</ThemedText>
            </Button>
          </View>
        </View>
      </View>
    );
  },
);

RoomItemCard.displayName = "RoomItemCard";

export default RoomItemCard;
