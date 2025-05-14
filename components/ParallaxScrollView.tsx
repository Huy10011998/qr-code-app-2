import type { PropsWithChildren, ReactElement } from "react";
import { Dimensions, StyleSheet } from "react-native";
import Animated, { useAnimatedRef } from "react-native-reanimated";

import React from "react";
import { ThemedView } from "./ThemedView";

const windowWidth = Dimensions.get("window").width;
const windowHeight = Dimensions.get("window").height;

type Props = PropsWithChildren<{
  containerBackground: ReactElement;
}>;

export default function ParallaxScrollView({
  children,
  containerBackground,
}: Props) {
  const scrollRef = useAnimatedRef<Animated.ScrollView>();

  return (
    <ThemedView style={styles.container}>
      <Animated.ScrollView ref={scrollRef} scrollEventThrottle={16}>
        <Animated.View style={styles.backgroundImage}>
          {containerBackground}
        </Animated.View>
        <ThemedView style={styles.content}>{children}</ThemedView>
      </Animated.ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundImage: {
    width: windowWidth,
    height: windowHeight,
  },
  content: {
    flex: 1,
    overflow: "hidden",
    position: "absolute",
    backgroundColor: "transparent",
    padding: 16,
    height: "90%",
    width: windowWidth,
    justifyContent: "space-between",
    alignItems: "center",
  },
});
