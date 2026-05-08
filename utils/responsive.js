import { useMemo } from "react";
import { useWindowDimensions } from "react-native";

const BREAKPOINTS = {
  sm: 480,
  md: 768,
  lg: 1024,
};

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

export const getBreakpoint = (width) => {
  if (width >= BREAKPOINTS.lg) return "lg";
  if (width >= BREAKPOINTS.md) return "md";
  if (width >= BREAKPOINTS.sm) return "sm";
  return "xs";
};

export const getContentWidth = (width, maxWidth = 1120) => Math.min(width, maxWidth);

export const getScreenPadding = (width) => {
  if (width >= BREAKPOINTS.lg) return 28;
  if (width >= BREAKPOINTS.md) return 24;
  if (width >= BREAKPOINTS.sm) return 18;
  return 14;
};

export const getFluidValue = (width, minWidth, maxWidth, minValue, maxValue) => {
  if (width <= minWidth) return minValue;
  if (width >= maxWidth) return maxValue;
  const ratio = (width - minWidth) / (maxWidth - minWidth);
  return minValue + (maxValue - minValue) * ratio;
};

export const getBannerHeight = (width) => Math.round(clamp(width * 0.58, 180, 320));

export const getColumns = (width) => {
  if (width >= BREAKPOINTS.lg) return 4;
  if (width >= BREAKPOINTS.md) return 3;
  return width >= 360 ? 2 : 1;
};

export const useResponsive = () => {
  const { width, height } = useWindowDimensions();

  return useMemo(
    () => ({
      width,
      height,
      breakpoint: getBreakpoint(width),
      isTabletUp: width >= BREAKPOINTS.md,
      isDesktop: width >= BREAKPOINTS.lg,
      screenPadding: getScreenPadding(width),
      contentWidth: getContentWidth(width),
    }),
    [height, width]
  );
};

