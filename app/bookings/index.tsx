import Skeleton from "@/components/atoms/a-skeleton";
import DetailsLayout from "@/components/layouts/details";
import BookingCard from "@/components/molecules/m-booking-card";
import EmptyList from "@/components/molecules/m-empty-list";
import TextPill from "@/components/molecules/m-text-pill-pill";
import {
  BookingApplicationStatus,
  PaymentStatus,
  useBookingApplicationsQuery,
  useBookingsQuery,
} from "@/lib/services/graphql/generated";
import { cast } from "@/lib/types/utils";
import { useInfiniteQuery } from "@/lib/hooks/use-infinite-query";
import React from "react";
import {
  FlatList,
  LayoutChangeEvent,
  NativeScrollEvent,
  NativeSyntheticEvent,
  RefreshControl,
  ScrollView,
  TouchableOpacity,
  View,
} from "react-native";
import { useThemeColors } from "@/lib/hooks/use-theme-color";
import ThemedText from "@/components/atoms/a-themed-text";
import { hexToRgba } from "@/lib/utils/colors";
import Animated, {
  runOnUI,
  scrollTo,
  useAnimatedRef,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";
import BookingApplicationCard from "@/components/molecules/m-booking-application-card";
import { useLocalSearchParams, useRouter } from "expo-router";

const MAIN_TABS = ["Bookings", "Applications"] as const;

export default function UserBookings() {
  const router = useRouter();
  const colors = useThemeColors();
  const params = useLocalSearchParams();

  const initialIndex = params.tab === "applications" ? 1 : 0;
  const [mainTab, setMainTab] = React.useState<(typeof MAIN_TABS)[number]>(
    params.tab === "applications" ? "Applications" : "Bookings",
  );
  const [pagerHeight, setPagerHeight] = React.useState(0);
  const [pageContainerWidth, setPageContainerWidth] = React.useState(0);
  const hasScrolledToInitial = React.useRef(false);
  const mainTabRef = React.useRef(mainTab);
  mainTabRef.current = mainTab;

  const pagerRef = useAnimatedRef<Animated.ScrollView>();
  const scrollX = useSharedValue(0);
  const tabWidth = useSharedValue(0);
  const pageWidthSv = useSharedValue(0);

  const onPagerContainerLayout = (e: LayoutChangeEvent) => {
    const h = e.nativeEvent.layout.height;
    const w = e.nativeEvent.layout.width;
    if (h > 0) setPagerHeight(h);
    if (w > 0) setPageContainerWidth(w);
  };

  // Re-sync page width shared value and re-snap to current tab on rotation.
  React.useEffect(() => {
    if (pageContainerWidth === 0) return;
    pageWidthSv.value = pageContainerWidth;

    if (!hasScrolledToInitial.current && initialIndex > 0 && pagerHeight > 0) {
      hasScrolledToInitial.current = true;
      runOnUI(() => {
        scrollTo(pagerRef, initialIndex * pageWidthSv.value, 0, false);
      })();
      return;
    }

    const currentIndex = MAIN_TABS.indexOf(mainTabRef.current);
    runOnUI(() => {
      scrollTo(pagerRef, currentIndex * pageWidthSv.value, 0, false);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageContainerWidth]);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollX.value = event.contentOffset.x;
    },
  });

  const onTabBarLayout = (event: LayoutChangeEvent) => {
    tabWidth.value = event.nativeEvent.layout.width / MAIN_TABS.length;
  };

  const animatedIndicatorStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateX:
          pageWidthSv.value > 0
            ? (scrollX.value / pageWidthSv.value) * tabWidth.value
            : 0,
      },
    ],
    width: tabWidth.value,
  }));

  const handleTabPress = (tab: (typeof MAIN_TABS)[number], index: number) => {
    setMainTab(tab);
    runOnUI(() => {
      scrollTo(pagerRef, index * pageWidthSv.value, 0, true);
    })();
  };

  const handleMomentumScrollEnd = (
    e: NativeSyntheticEvent<NativeScrollEvent>,
  ) => {
    if (pageContainerWidth === 0) return;
    const index = Math.round(
      e.nativeEvent.contentOffset.x / pageContainerWidth,
    );
    setMainTab(MAIN_TABS[index]);
  };

  const bookingsQuery = useInfiniteQuery(useBookingsQuery, {
    queryKey: "bookings",
    initialVariables: {
      filter: {},
    },
  });

  const appsQuery = useInfiniteQuery(useBookingApplicationsQuery, {
    queryKey: "bookingApplications",
    initialVariables: {
      filter: { authGuest: true },
    },
  });

  return (
    <DetailsLayout title="My Bookings" scrollable={false}>
      <View style={{ flex: 1, marginTop: 16 }}>
        {/* Tab bar */}
        <View
          onLayout={onTabBarLayout}
          className="relative flex-row items-center border-b"
          style={{ borderBottomColor: hexToRgba(colors.text, 0.05) }}
        >
          {MAIN_TABS.map((tab, index) => (
            <TouchableOpacity
              key={tab}
              onPress={() => handleTabPress(tab, index)}
              className="flex-1 items-center justify-center py-4"
            >
              <ThemedText
                type={mainTab === tab ? "semibold" : "default"}
                style={{
                  color:
                    mainTab === tab
                      ? colors.primary
                      : hexToRgba(colors.text, 0.4),
                }}
              >
                {tab}
              </ThemedText>
            </TouchableOpacity>
          ))}
          <Animated.View
            className="absolute bottom-0 h-[2px]"
            style={[
              animatedIndicatorStyle,
              { backgroundColor: colors.primary },
            ]}
          />
        </View>

        {/* Filter pills — outside the pager so horizontal scroll doesn't conflict with swipe */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ flexGrow: 0 }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 8,
              paddingHorizontal: 20,
              paddingVertical: 11,
            }}
          >
            {mainTab === "Bookings"
              ? [
                PaymentStatus.Paid,
                PaymentStatus.Pending,
                PaymentStatus.Failed,
              ].map((v) => (
                <TextPill
                  selected={
                    bookingsQuery.variables.filter?.paymentStatus === v
                  }
                  key={v}
                  onSelect={(val) =>
                    bookingsQuery.setVariables((c) => ({
                      ...c,
                      filter: { ...c.filter, paymentStatus: cast(val) },
                    }))
                  }
                >
                  {v}
                </TextPill>
              ))
              : ["ALL", ...Object.values(BookingApplicationStatus)].map((v) => (
                <TextPill
                  selected={
                    v === "ALL"
                      ? !appsQuery.variables.filter?.status
                      : appsQuery.variables.filter?.status === v
                  }
                  key={v}
                  onSelect={(val) =>
                    appsQuery.setVariables((c) => ({
                      ...c,
                      filter: {
                        ...c.filter,
                        status: val === "ALL" ? undefined : cast(val),
                      },
                    }))
                  }
                >
                  {v}
                </TextPill>
              ))}
          </View>
        </ScrollView>

        {/* Pager — only FlatLists, full swipe area */}
        <View style={{ flex: 1 }} onLayout={onPagerContainerLayout}>
          {pagerHeight > 0 && pageContainerWidth > 0 && (
            <Animated.ScrollView
              ref={pagerRef}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onScroll={scrollHandler}
              onMomentumScrollEnd={handleMomentumScrollEnd}
              scrollEventThrottle={16}
              style={{ height: pagerHeight }}
              contentContainerStyle={{ height: pagerHeight }}
            >
              {/* Page 1 — Bookings */}
              <View style={{ width: pageContainerWidth, height: pagerHeight }}>
                <FlatList
                  data={cast<any>(bookingsQuery.items)}
                  keyExtractor={(item) => item.id}
                  style={{ height: pagerHeight }}
                  contentContainerStyle={{
                    paddingHorizontal: 20,
                    paddingBottom: 20,
                  }}
                  renderItem={({ item }) => (
                    <View className="mb-2">
                      <BookingCard booking={item} />
                    </View>
                  )}
                  ListEmptyComponent={
                    !bookingsQuery.fetching &&
                      bookingsQuery.items.length === 0 ? (
                      <View className="mt-20">
                        <EmptyList
                          message="No bookings found"
                          buttonTitle="Explore Hostings"
                          onButtonPress={() => router.replace("/guest/home")}
                        />
                      </View>
                    ) : null
                  }
                  ListHeaderComponent={
                    bookingsQuery.fetching &&
                      bookingsQuery.items.length === 0 ? (
                      <View className="mt-4 gap-6">
                        {Array.from({ length: 4 }).map((_, i) => (
                          <Skeleton
                            key={i}
                            style={{ height: 140, borderRadius: 16 }}
                          />
                        ))}
                      </View>
                    ) : null
                  }
                  onEndReached={() =>
                    bookingsQuery.hasNextPage && bookingsQuery.loadMore()
                  }
                  onEndReachedThreshold={0.5}
                  refreshControl={
                    <RefreshControl
                      refreshing={bookingsQuery.fetching}
                      onRefresh={() => bookingsQuery.refresh()}
                    />
                  }
                />
              </View>

              {/* Page 2 — Applications */}
              <View style={{ width: pageContainerWidth, height: pagerHeight }}>
                <FlatList
                  data={cast<any>(appsQuery.items)}
                  keyExtractor={(item) => item.id}
                  style={{ height: pagerHeight }}
                  contentContainerStyle={{
                    paddingHorizontal: 20,
                    paddingBottom: 20,
                  }}
                  renderItem={({ item }) => (
                    <View className="mb-2">
                      <BookingApplicationCard application={cast(item)} />
                    </View>
                  )}
                  ListEmptyComponent={
                    !appsQuery.fetching && appsQuery.items.length === 0 ? (
                      <View className="mt-20">
                        <EmptyList
                          message="No applications found"
                          buttonTitle="Explore Hostings"
                          onButtonPress={() => router.replace("/guest/home")}
                        />
                      </View>
                    ) : null
                  }
                  ListHeaderComponent={
                    appsQuery.fetching && appsQuery.items.length === 0 ? (
                      <View className="mt-4 gap-6">
                        {Array.from({ length: 4 }).map((_, i) => (
                          <Skeleton
                            key={i}
                            style={{ height: 140, borderRadius: 16 }}
                          />
                        ))}
                      </View>
                    ) : null
                  }
                  onEndReached={() =>
                    appsQuery.hasNextPage && appsQuery.loadMore()
                  }
                  onEndReachedThreshold={0.5}
                  refreshControl={
                    <RefreshControl
                      refreshing={appsQuery.fetching}
                      onRefresh={() => appsQuery.refresh()}
                    />
                  }
                />
              </View>
            </Animated.ScrollView>
          )}
        </View>
      </View>
    </DetailsLayout>
  );
}
