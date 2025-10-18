import { FALLBACK_IMAGE, PROPERTY_BLURHASH } from "@/lib/constants/images";
import { Booking } from "@/lib/constants/mocks/bookings";
import { useFallbackImages } from "@/lib/hooks/images";
import { useThemeColors } from "@/lib/hooks/use-theme-color";
import { Image } from "expo-image";
import React from "react";
import { Pressable, View } from "react-native";
import ThemedText from "../atoms/a-themed-text";
import { Fonts } from "@/lib/constants/theme";
import { hexToRgba } from "@/lib/utils/colors";
import Button from "../atoms/a-button";
import { ChevronDown } from "lucide-react-native";
import BottomSheet from "../atoms/a-bottom-sheet";
import ThemedBarcode from "../atoms/a-barcode";
import CopyButton from "../atoms/a-copy-button";

type Props = {
  booking: Booking;
};

const BookingCard: React.FC<Props> = ({ booking }) => {
  const colors = useThemeColors();
  const [open, setOpen] = React.useState(false);
  const { failedImages, handleImageError } = useFallbackImages();

  const img = booking.hosting.images.at(0);

  return (
    <>
      <View
        className="gap-4 border-b pb-4"
        style={{ borderColor: hexToRgba(colors.text, 0.1) }}
      >
        <Pressable
          className="flex-row gap-4 items-center border p-2 rounded-xl"
          style={{ borderColor: hexToRgba(colors.text, 0.1) }}
        >
          <View
            className="w-[107px] h-[90px] rounded-xl border overflow-hidden"
            style={{ borderColor: colors.text }}
          >
            <Image
              source={{ uri: failedImages.has(0) ? FALLBACK_IMAGE : img }}
              style={{ height: "100%", width: "100%" }}
              contentFit="cover"
              transition={300}
              placeholder={{ blurhash: PROPERTY_BLURHASH }}
              placeholderContentFit="cover"
              cachePolicy="memory-disk"
              priority="high"
              onError={() => handleImageError(0)}
            />
          </View>
          <View className="flex-1 justify-between gap-2">
            <ThemedText
              style={{ fontSize: 18, fontFamily: Fonts.bold }}
              ellipsizeMode="tail"
              numberOfLines={2}
            >
              {booking.hosting.title}
            </ThemedText>
            <ThemedText
              style={{ fontSize: 14, color: hexToRgba(colors.text, 0.6) }}
            >
              {booking.hosting.city}, {booking.hosting.state}
            </ThemedText>
            <View className="flex-row items-center justify-between">
              <ThemedText style={{ fontFamily: Fonts.medium, fontSize: 14 }}>
                ₦{booking.hosting.price.toLocaleString()}{" "}
                {booking.hosting.pricing}
              </ThemedText>
              <View
                className="p-1 px-2 flex-1 items-center justify-center max-w-[74px] rounded-lg"
                style={{
                  backgroundColor: hexToRgba(
                    booking.status === "Pending"
                      ? colors.primary
                      : colors.success,
                    0.3,
                  ),
                }}
              >
                <ThemedText
                  style={{
                    fontSize: 12,
                    color:
                      booking.status === "Pending"
                        ? colors.primary
                        : colors.success,
                  }}
                >
                  {booking.status}
                </ThemedText>
              </View>
            </View>
          </View>
        </Pressable>
        <Button
          onPress={() => setOpen(true)}
          type="tinted"
          style={{ paddingBlock: 4 }}
        >
          <View className="flex-row items-center gap-2">
            <ThemedText content="tinted">View Reciept</ThemedText>
            <ChevronDown color={colors.primary} />
          </View>
        </Button>
      </View>
      <BottomSheet isVisible={open} onClose={() => setOpen(false)}>
        <View>
          <View
            className="border-b pb-4"
            style={{ borderColor: hexToRgba(colors.text, 0.2) }}
          >
            <View
              className="border rounded-[14px] overflow-hidden"
              style={{ borderColor: colors.text }}
            >
              <ThemedBarcode
                format="CODE128"
                value={booking.details.transactionId}
              />
              <View className="flex-row items-center justify-between p-2">
                <ThemedText
                  style={{ color: hexToRgba(colors.text, 0.6), fontSize: 14 }}
                >
                  Transaction ID
                </ThemedText>
                <View className="flex-row items-center gap-2">
                  <ThemedText
                    style={{ fontFamily: Fonts.medium, fontSize: 16 }}
                  >
                    {booking.details.transactionId}
                  </ThemedText>
                  <CopyButton
                    text={booking.details.transactionId}
                    size={18}
                    color={colors.primary}
                  />
                </View>
              </View>
            </View>
          </View>
        </View>
      </BottomSheet>
    </>
  );
};

export default BookingCard;
