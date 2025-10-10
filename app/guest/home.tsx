import ThemedText from "@/components/atoms/a-themed-text";
import ProfileLayout from "@/components/layouts/profile";
import HostingFilterManager from "@/components/organisms/o-hosting-filter-manager";
import { View } from "react-native";

export default function GuestHome() {
  return (
    <ProfileLayout>
      <View className="mt-8">
        <HostingFilterManager />
        <ThemedText>Home</ThemedText>
      </View>
    </ProfileLayout>
  );
}
