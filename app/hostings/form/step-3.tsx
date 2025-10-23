import FloatingLabelInput from "@/components/atoms/a-floating-label-input";
import LocationCard from "@/components/atoms/a-location-card";
import Skeleton from "@/components/atoms/a-skeleton";
import ThemedText from "@/components/atoms/a-themed-text";
import DetailsLayout from "@/components/layouts/details";
import HostingStepper from "@/components/molecules/m-hosting-stepper";
import { Fonts } from "@/lib/constants/theme";
import { useThemeColors } from "@/lib/hooks/use-theme-color";
import { HOSTING_VARIANT_ICONS } from "@/lib/types/enums/hosting-icons";
import { HostingVariant } from "@/lib/types/enums/hostings";
import { hexToRgba } from "@/lib/utils/colors";
import { getAddressFromCoords, getLocationAsync } from "@/lib/utils/locations";
import * as Location from "expo-location";
import React from "react";
import { Platform, View } from "react-native";
import { RefreshControl } from "react-native-gesture-handler";

export default function NewHostingStep3() {
  const colors = useThemeColors();
  const [location, setLocation] = React.useState<Location.LocationObject>();
  const [address, setAddress] =
    React.useState<Location.LocationGeocodedAddress>();
  const [locationFetching, setLocationFetching] = React.useState(false);

  const fetchLocation = async () => {
    setLocationFetching(true);
    const loc = await getLocationAsync();
    setLocation(loc ?? undefined);
    if (loc) {
      const addreses = await getAddressFromCoords(
        loc?.coords.latitude,
        loc?.coords.longitude,
      );
      setAddress(addreses?.at(0));
    }
    setLocationFetching(false);
  };

  React.useEffect(() => {
    fetchLocation();
  }, []);

  const Icon = HOSTING_VARIANT_ICONS[HostingVariant.Residential];

  return (
    <DetailsLayout
      refreshControl={
        <RefreshControl
          onRefresh={fetchLocation}
          refreshing={locationFetching}
        />
      }
      title="Hosting"
      footer={<HostingStepper step={3} />}
    >
      <View className="mt-8 gap-4">
        <View>
          {!location ? (
            <Skeleton style={{ height: 250, borderRadius: 12 }} />
          ) : (
            <LocationCard location={location?.coords} zoom={18} />
          )}
          {!address ? (
            <Skeleton
              style={{ height: 100, borderRadius: 12, marginTop: 32 }}
            />
          ) : (
            <View className="mt-8 gap-4">
              <View
                className="p-4 border rounded-xl gap-3"
                style={{
                  borderColor: hexToRgba(colors.primary, 0.15),
                  backgroundColor: colors.background,
                  ...Platform.select({
                    ios: {
                      shadowColor: colors.primary,
                      shadowOffset: { width: 0, height: -2 },
                      shadowOpacity: 0.1,
                      shadowRadius: 8,
                    },
                    android: {
                      elevation: 8,
                      shadowColor: hexToRgba(colors.primary, 0.3),
                    },
                  }),
                }}
              >
                <View className="flex-row items-center gap-2">
                  <Icon color={colors.primary} size={18} />
                  <ThemedText style={{ fontFamily: Fonts.semibold }}>
                    Address
                  </ThemedText>
                </View>
                <View>
                  <ThemedText style={{ fontSize: 12 }}>
                    {address?.street}, {address?.city} {address?.postalCode},
                  </ThemedText>
                  <ThemedText
                    style={{ fontSize: 14, fontFamily: Fonts.medium }}
                  >
                    {address?.region}, {address?.country}
                  </ThemedText>
                </View>
              </View>
              <FloatingLabelInput
                focused
                multiline
                label="Contact"
                inputMode="tel"
                containerStyle={{
                  borderColor: hexToRgba(colors.primary, 0.1),
                  backgroundColor: hexToRgba(colors.primary, 0.05),
                }}
                placeholder="+2349045698712"
              />
              <FloatingLabelInput
                focused
                multiline
                label="Landmarks"
                containerStyle={{
                  minHeight: 80,
                  borderColor: hexToRgba(colors.primary, 0.1),
                  backgroundColor: hexToRgba(colors.primary, 0.05),
                }}
                placeholder="Ender landmarks close to the property"
              />
            </View>
          )}
        </View>
      </View>
    </DetailsLayout>
  );
}
