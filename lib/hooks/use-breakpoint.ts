import { useWindowDimensions } from 'react-native';

export const useBreakpoint = () => {
  const { width, height } = useWindowDimensions();
  return {
    isTablet: width >= 768,
    isLandscape: width > height,
    screenWidth: width,
    screenHeight: height,
  };
};
