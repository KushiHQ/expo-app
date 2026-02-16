import React, { useEffect, useRef, useState } from "react";
import { View, ActivityIndicator, Dimensions } from "react-native";

interface InfiniteScrollTriggerProps {
  onInView: () => void;
  isLoading?: boolean;
  active?: boolean;
}

export const InfiniteScrollTrigger = ({
  onInView,
  isLoading = false,
  active = true,
}: InfiniteScrollTriggerProps) => {
  const viewRef = useRef<View>(null);
  const [isTriggered, setIsTriggered] = useState(false);

  useEffect(() => {
    if (!active || isLoading || isTriggered) return;

    const intervalId = setInterval(() => {
      if (viewRef.current) {
        viewRef.current.measureInWindow((x, y, width, height) => {
          const windowHeight = Dimensions.get("window").height;

          const isVisible = y < windowHeight + 50 && y + height > 0;

          if (isVisible) {
            setIsTriggered(true);
            onInView();

            setTimeout(() => setIsTriggered(false), 1000);
          }
        });
      }
    }, 500);

    return () => clearInterval(intervalId);
  }, [active, isLoading, isTriggered, onInView]);

  if (!active) return null;

  return (
    <View
      ref={viewRef}
      className="p-4 items-center justify-center w-full h-20"
      collapsable={false}
    >
      {isLoading ? (
        <ActivityIndicator size="small" color="#0000ff" />
      ) : (
        <View style={{ height: 1 }} />
      )}
    </View>
  );
};
