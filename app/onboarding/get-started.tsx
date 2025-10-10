import React, { useEffect, useRef } from "react";
import { Image } from "expo-image";
import { SafeAreaView } from "react-native-safe-area-context";
import ThemedView from "@/components/atoms/a-themed-view";
import {
  Pressable,
  View,
  Animated,
  Dimensions,
  ScrollView,
} from "react-native";
import ThemedText from "@/components/atoms/a-themed-text";
import AnimatedStepper from "@/components/atoms/a-animated-stepper";
import { useThemeColors } from "@/lib/hooks/use-theme-color";
import GettingStartedStep1 from "@/components/screens/getting-started/step-1";
import GettingStartedStep2 from "@/components/screens/getting-started/step-2";
import GettingStartedStep3 from "@/components/screens/getting-started/step-3";
import GettingStartedStep4 from "@/components/screens/getting-started/step-4";
import GettingStartedStep5 from "@/components/screens/getting-started/step-5";
import BackButton from "@/components/atoms/a-backbutton";

type Step = {
  img: string;
  component?: React.ReactNode;
};

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export default function GetStarted() {
  const [step, setStep] = React.useState(1);
  const colors = useThemeColors();

  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

  const Steps: Record<number, Step> = {
    1: {
      img: require("@/assets/images/onboarding/get-started-1.png"),
      component: <GettingStartedStep1 onNext={() => handleNext()} />,
    },
    2: {
      img: require("@/assets/images/onboarding/get-started-2.png"),
      component: <GettingStartedStep2 onNext={() => handleNext()} />,
    },
    3: {
      img: require("@/assets/images/onboarding/get-started-3.png"),
      component: <GettingStartedStep3 onNext={() => handleNext()} />,
    },
    4: {
      img: require("@/assets/images/onboarding/get-started-4.png"),
      component: <GettingStartedStep4 onNext={() => handleNext()} />,
    },
    5: {
      img: require("@/assets/images/onboarding/get-started-5.png"),
      component: <GettingStartedStep5 />,
    },
  };

  const handleNext = () => {
    animateTransition(() => setStep((c) => c + 1), "left");
  };

  const handlePrevious = () => {
    animateTransition(() => setStep((c) => c - 1), "right");
  };

  const animateTransition = (
    callback: () => void,
    direction: "left" | "right",
  ) => {
    const slideOutValue = direction === "left" ? -SCREEN_WIDTH : SCREEN_WIDTH;
    const slideInValue = direction === "left" ? SCREEN_WIDTH : -SCREEN_WIDTH;

    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: slideOutValue,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start(() => {
      callback();

      slideAnim.setValue(slideInValue);

      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
      ]).start();
    });
  };

  useEffect(() => {
    fadeAnim.setValue(1);
    slideAnim.setValue(0);
  }, [fadeAnim, slideAnim]);

  return (
    <ThemedView className="flex-1">
      <SafeAreaView edges={["bottom", "left", "right"]} className="flex-1">
        <ScrollView showsVerticalScrollIndicator={false}>
          <View>
            <Animated.View
              style={{
                opacity: fadeAnim,
                transform: [{ translateX: slideAnim }],
              }}
            >
              <Image
                source={Steps[step].img}
                style={{
                  height: 250,
                  width: "100%",
                  objectFit: "cover",
                  borderBottomRightRadius: 16,
                  borderBottomLeftRadius: 16,
                }}
              />
            </Animated.View>

            <View className="p-5 gap-8">
              <View className="flex-row items-center justify-between">
                <ThemedText>{step}/5</ThemedText>
                <AnimatedStepper currentStep={step} steps={5} />
                <Pressable onPress={() => setStep(5)}>
                  <ThemedText style={{ color: colors["accent"] }}>
                    Skip
                  </ThemedText>
                </Pressable>
              </View>

              <Animated.View
                style={{
                  opacity: fadeAnim,
                  transform: [{ translateX: slideAnim }],
                }}
              >
                {Steps[step].component}
              </Animated.View>
            </View>

            {step > 1 && <BackButton onPress={handlePrevious} />}
          </View>
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}
