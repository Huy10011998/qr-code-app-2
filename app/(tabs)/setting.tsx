import React, { useState } from "react";
import ParallaxScrollView from "../../components/ParallaxScrollView";
import {
  Image,
  Dimensions,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { ThemedText } from "../../components/ThemedText";
import * as SecureStore from "expo-secure-store";
import { useRouter } from "expo-router";
import { useAuth } from "../../components/auth/AuthProvider";
import AsyncStorage from "@react-native-async-storage/async-storage";

const windowWidth = Dimensions.get("window").width;
const windowHeight = Dimensions.get("window").height;

export default function SettingScreen() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const { setToken } = useAuth();

  const handlePressLogout = async () => {
    if (isLoading) return;
    setIsLoading(true);

    try {
      const tokenBefore = await AsyncStorage.getItem("token");
      console.log("Token trước khi logout (AsyncStorage):", tokenBefore);

      await SecureStore.deleteItemAsync("faceid_credentials");
      await AsyncStorage.removeItem("userData");
      await AsyncStorage.removeItem("token");

      setToken(null); // Cập nhật context

      const tokenAfter = await AsyncStorage.getItem("token");
      console.log("Token sau khi logout (AsyncStorage):", tokenAfter);

      // Chuyển về trang index sau khi xoá xong
      router.replace("/");
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ParallaxScrollView
      containerBackground={
        <Image
          // source prop removed to avoid JSX compile error
          resizeMode="stretch"
          style={{ width: 0, height: 0 }}
        />
      }
      style={styles.content}
    >
      <TouchableOpacity style={styles.btnContai} onPress={handlePressLogout}>
        {isLoading ? (
          <ActivityIndicator size="small" />
        ) : (
          <ThemedText type="default">Đăng xuất</ThemedText>
        )}
      </TouchableOpacity>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "center",
    padding: 16,
    backgroundColor: "transparent",
    width: windowWidth,
    height: windowHeight * 0.9,
  },
  btnContai: {
    borderRadius: 8,
    width: windowWidth - 32,
    height: 60,
    padding: 20,
    backgroundColor: "#0a7ea4",
    justifyContent: "center",
  },
});
