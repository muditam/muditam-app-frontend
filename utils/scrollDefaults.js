import { FlatList, Platform, ScrollView } from "react-native";

let hasAppliedScrollDefaults = false;

export function applyGlobalScrollDefaults() {
  if (hasAppliedScrollDefaults) return;
  hasAppliedScrollDefaults = true;

  ScrollView.defaultProps = {
    ...(ScrollView.defaultProps || {}),
    directionalLockEnabled:
      ScrollView.defaultProps?.directionalLockEnabled ?? true,
    keyboardShouldPersistTaps:
      ScrollView.defaultProps?.keyboardShouldPersistTaps ?? "handled",
    scrollEventThrottle: ScrollView.defaultProps?.scrollEventThrottle ?? 16,
    showsVerticalScrollIndicator:
      ScrollView.defaultProps?.showsVerticalScrollIndicator ?? false,
    showsHorizontalScrollIndicator:
      ScrollView.defaultProps?.showsHorizontalScrollIndicator ?? false,
    overScrollMode: ScrollView.defaultProps?.overScrollMode ?? "never",
  };

  FlatList.defaultProps = {
    ...(FlatList.defaultProps || {}),
    directionalLockEnabled:
      FlatList.defaultProps?.directionalLockEnabled ?? true,
    keyboardShouldPersistTaps:
      FlatList.defaultProps?.keyboardShouldPersistTaps ?? "handled",
    scrollEventThrottle: FlatList.defaultProps?.scrollEventThrottle ?? 16,
    showsVerticalScrollIndicator:
      FlatList.defaultProps?.showsVerticalScrollIndicator ?? false,
    showsHorizontalScrollIndicator:
      FlatList.defaultProps?.showsHorizontalScrollIndicator ?? false,
    overScrollMode: FlatList.defaultProps?.overScrollMode ?? "never",
    removeClippedSubviews:
      FlatList.defaultProps?.removeClippedSubviews ??
      (Platform.OS === "android"),
    windowSize: FlatList.defaultProps?.windowSize ?? 7,
    initialNumToRender: FlatList.defaultProps?.initialNumToRender ?? 6,
    maxToRenderPerBatch: FlatList.defaultProps?.maxToRenderPerBatch ?? 6,
    updateCellsBatchingPeriod:
      FlatList.defaultProps?.updateCellsBatchingPeriod ?? 16,
  };
}
