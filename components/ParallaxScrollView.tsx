import type { PropsWithChildren, ReactElement } from "react";
import { Dimensions, StyleSheet, ViewStyle } from "react-native";
import Animated, { useAnimatedRef } from "react-native-reanimated";
import { ThemedView } from "./ThemedView";

const windowWidth = Dimensions.get("window").width;
const windowHeight = Dimensions.get("window").height;

type Props = PropsWithChildren<{
  containerBackground: ReactElement;
  style?: ViewStyle | ViewStyle[];
}>;

export default function ParallaxScrollView({
  style,
  children,
  containerBackground,
}: Props) {
  const scrollRef = useAnimatedRef<Animated.ScrollView>();

  return (
    <ThemedView style={styles.container}>
      <Animated.ScrollView ref={scrollRef} scrollEventThrottle={16}>
        <Animated.View style={styles.backgroundImageWrapper}>
          {containerBackground}
        </Animated.View>
        <ThemedView style={style}>{children}</ThemedView>
      </Animated.ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: "relative",
  },
  backgroundImageWrapper: {
    position: "absolute",
    top: 0,
    left: 0,
    width: windowWidth,
    height: windowHeight,
    zIndex: 0,
  },
});
