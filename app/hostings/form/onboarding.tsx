import ThemedText from "@/components/atoms/a-themed-text";
import DetailsLayout from "@/components/layouts/details";
import TopListingCard from "@/components/molecules/m-top-listing-card";
import { ONBOARDING_STEPS } from "@/lib/constants/hosting/onboarding";
import { Fonts } from "@/lib/constants/theme";
import { useHostingForm } from "@/lib/hooks/hosting-form";
import { useThemeColors } from "@/lib/hooks/use-theme-color";
import { hexToRgba } from "@/lib/utils/colors";
import { Href, useLocalSearchParams, useRouter } from "expo-router";
import { CircleQuestionMark } from "lucide-react-native";
import React from "react";
import { Pressable, View } from "react-native";
import { twMerge } from "tailwind-merge";

type Action = {
  filled: boolean;
  disabled: boolean;
  link: Href;
};

export default function HostingOnboarding() {
  const router = useRouter();
  const colors = useThemeColors();
  const { id } = useLocalSearchParams();
  const { hosting } = useHostingForm(id);

  const actions = React.useMemo(() => {
    const actions: Record<number, Action> = {};
    ONBOARDING_STEPS.forEach((_, index) => {
      actions[index] = {
        filled: false,
        disabled: true,
        link: `/hostings/form/step-${index + 1}?id=${hosting?.id}`,
      };
    });

    ONBOARDING_STEPS.forEach((_, index) => {
      if (index === 0) {
        actions[index]["filled"] =
          !!hosting?.title && !!hosting.propertyType && !!hosting.listingType;
        actions[index]["disabled"] = !hosting;
      } else if (index === 1) {
        actions[index]["filled"] = !!hosting?.rooms?.length;
      } else if (index === 2) {
        actions[index]["filled"] =
          !!hosting?.longitude &&
          !!hosting.latitude &&
          !!hosting.state &&
          !!hosting.country &&
          !!hosting.city &&
          !!hosting.street &&
          !!hosting.postalCode &&
          !!hosting.contact;
      } else if (index === 3) {
        actions[index]["filled"] = !!hosting?.facilities?.length;
      } else if (index === 4) {
        actions[index]["filled"] =
          !!hosting?.paymentInterval &&
          !!hosting.price &&
          !!hosting.paymentDetails;
      }
    });

    ONBOARDING_STEPS.forEach((_, index) => {
      if (index !== 0) {
        actions[index]["disabled"] =
          actions[index - 1].disabled || !actions[index - 1].filled;
      }
    });

    return actions;
  }, [hosting]);

  return (
    <DetailsLayout title="Hosting">
      <View>
        <ThemedText
          className="mb-4"
          style={{ fontSize: 12, color: hexToRgba(colors.text, 0.6) }}
        >
          <CircleQuestionMark color={hexToRgba(colors.text, 0.7)} size={12} />
          {"  "}
          Resume your setup, edit your property details, or preview your listing
          before it reaches future tenants.
        </ThemedText>
        <TopListingCard hosting={hosting} />
        <View className="gap-4 mt-8">
          {ONBOARDING_STEPS.map((step, index) => {
            const Icon = step.icon;
            return (
              <Pressable
                key={index}
                onPress={() => {
                  if (actions[index]?.link) {
                    router.push(actions[index]!.link);
                  }
                }}
                disabled={!actions[index]?.link || actions[index]?.disabled}
                className={twMerge(
                  "flex-row items-center gap-4 rounded-3xl border p-[14px]",
                  (!actions[index]?.link || actions[index]?.disabled) &&
                  "opacity-50",
                )}
                style={{
                  borderColor: actions[index]?.filled
                    ? hexToRgba(colors.primary, 0.2)
                    : hexToRgba(colors.text, 0.15),
                  backgroundColor: actions[index]?.filled
                    ? hexToRgba(colors.primary, 0.15)
                    : undefined,
                }}
              >
                <View
                  className="w-12 h-12 items-center justify-center rounded-full border"
                  style={{
                    backgroundColor: hexToRgba(colors.primary, 0.1),
                    borderColor: actions[index]?.filled
                      ? hexToRgba(colors.primary, 0.2)
                      : hexToRgba(colors.text, 0.1),
                  }}
                >
                  <Icon size={20} color={colors.text} />
                </View>
                <View className="flex-1">
                  <ThemedText style={{ fontFamily: Fonts.bold }}>
                    {step.title}
                  </ThemedText>
                  <ThemedText
                    style={{ fontSize: 12, color: hexToRgba(colors.text, 0.6) }}
                  >
                    {step.description}
                  </ThemedText>
                </View>
              </Pressable>
            );
          })}
        </View>
      </View>
    </DetailsLayout>
  );
}
