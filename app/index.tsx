import axios from "axios";
import * as LocalAuthentication from "expo-local-authentication";
import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  Keyboard,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useAuth } from "../components/auth/AuthProvider";
import { ThemedView } from "../components/ThemedView";
import { ThemedText } from "../components/ThemedText";
import { ThemedTextInput } from "../components/ThemedTextInput";

const windowWidth = Dimensions.get("window").width;
const windowHeight = Dimensions.get("window").height;

export default function LoginScreen() {
  const router = useRouter();
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isLoginDisabled, setIsLoginDisabled] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const { setUserData, setToken } = useAuth();

  useEffect(() => {
    setIsLoginDisabled(!(userId.trim() && password.trim()));
  }, [userId, password]);

  useEffect(() => {
    const tryAutoLoginWithFaceID = async () => {
      const savedData = await SecureStore.getItemAsync("faceid_credentials");
      if (savedData) {
        const compatible = await LocalAuthentication.hasHardwareAsync();
        const enrolled = await LocalAuthentication.isEnrolledAsync();

        if (compatible && enrolled) {
          const result = await LocalAuthentication.authenticateAsync({
            promptMessage: "Xác thực để đăng nhập",
            fallbackLabel: "Dùng mật khẩu",
          });

          if (result.success) {
            const { userId, password } = JSON.parse(savedData);
            try {
              const response = await axios.post(
                "https://hrcert.cholimexfood.com.vn/api/auth/login",
                { userId, password }
              );

              if (response.status === 200) {
                const userData = response.data.data;
                setUserData(userData);
                setToken(response.data.token);

                router.replace("/(tabs)/qrcode");
              }
            } catch {
              Alert.alert("Lỗi", "Không thể đăng nhập tự động.");
            }
          }
        }
      }
    };

    tryAutoLoginWithFaceID();
  }, [setToken, setUserData, router]);

  const handlePressLogin = async () => {
    if (isLoading) return;
    Keyboard.dismiss();
    setIsLoading(true);

    try {
      const response = await axios.post(
        "https://hrcert.cholimexfood.com.vn/api/auth/login",
        { userId, password }
      );

      if (response.status === 200) {
        const userData = response.data.data;
        setUserData(userData);
        setToken(response.data.token);

        Alert.alert(
          "Lưu đăng nhập?",
          "Bạn có muốn sử dụng Face ID để đăng nhập tự động lần sau?",
          [
            {
              text: "Không",
              style: "cancel",
              onPress: () => {
                router.replace("/(tabs)/qrcode");
              },
            },
            {
              text: "Có",
              onPress: async () => {
                try {
                  await SecureStore.setItemAsync(
                    "faceid_credentials",
                    JSON.stringify({ userId, password })
                  );
                } catch (e) {
                  console.warn("Không thể lưu thông tin FaceID:", e);
                }

                router.replace("/(tabs)/qrcode");
              },
            },
          ]
        );
      }
    } catch {
      Alert.alert("Đăng nhập thất bại", "Sai tài khoản hoặc mật khẩu.");
      setPassword("");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFaceIDLogin = async () => {
    if (isLoading) return;
    setIsLoading(true);

    try {
      const compatible = await LocalAuthentication.hasHardwareAsync();
      const enrolled = await LocalAuthentication.isEnrolledAsync();

      if (!compatible || !enrolled) {
        Alert.alert("Thiết bị không hỗ trợ hoặc chưa cài Face ID.");
        return;
      }

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: "Đăng nhập bằng Face ID",
        fallbackLabel: "Dùng mật khẩu",
      });

      if (result.success) {
        const savedData = await SecureStore.getItemAsync("faceid_credentials");
        if (!savedData) {
          Alert.alert("Không tìm thấy thông tin đăng nhập đã lưu.");
          return;
        }

        const { userId, password } = JSON.parse(savedData);
        setUserId(userId);
        setPassword(password);
        handlePressLogin();
      } else {
        Alert.alert("Thất bại", "Xác thực Face ID không thành công.");
      }
    } catch {
      Alert.alert("Lỗi", "Đã xảy ra lỗi khi xác thực Face ID.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <KeyboardAwareScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <ThemedView style={[styles.contaiContent, { flex: 0.5 }]}>
          <Image
            source={require("../assets/images/logo-cholimex.jpg")}
            style={styles.logoCholimex}
          />
        </ThemedView>

        <ThemedView style={[styles.contaiInput, { flex: 0.5 }]}>
          <ThemedTextInput
            placeholder="Tài khoản"
            value={userId}
            onChangeText={setUserId}
          />
          <ThemedView style={styles.contaiInputPW}>
            <ThemedTextInput
              secureTextEntry={!isPasswordVisible}
              placeholder="Mật khẩu"
              value={password}
              onChangeText={setPassword}
            />
            <TouchableOpacity
              style={styles.iconEyeContainer}
              onPress={() => setIsPasswordVisible(!isPasswordVisible)}
            >
              <Image
                source={
                  isPasswordVisible
                    ? require("../assets/images/iconEye-hide.png")
                    : require("../assets/images/iconEye-view.png")
                }
                style={styles.iconEye}
              />
            </TouchableOpacity>
          </ThemedView>

          <ThemedView style={styles.rowContainer}>
            <TouchableOpacity
              style={[styles.btnContai, isLoginDisabled && styles.disabledBtn]}
              onPress={handlePressLogin}
              disabled={isLoginDisabled || isLoading}
            >
              {isLoading ? (
                <ActivityIndicator size="small" />
              ) : (
                <ThemedText type="default">Đăng nhập</ThemedText>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.iconFaceID}
              onPress={handleFaceIDLogin}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator size="small" />
              ) : (
                <Image
                  source={require("../assets/images/faceid-icon2.png")}
                  style={styles.faceIDIcon}
                />
              )}
            </TouchableOpacity>
          </ThemedView>
        </ThemedView>
      </KeyboardAwareScrollView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  bgLogin: {
    width: windowWidth,
    height: windowHeight,
  },
  contaiContent: {
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
  },
  contaiInput: {
    width: "100%",
    padding: 16,
  },
  logoCholimex: {
    resizeMode: "contain",
    width: 300,
    height: 150,
  },
  contaiInputPW: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 20,
  },
  iconEyeContainer: {
    position: "absolute",
    right: 10,
  },
  iconEye: {
    width: 25,
    height: 25,
  },
  btnContai: {
    borderRadius: 8,
    width: "80%",
    height: 60,
    padding: 20,
    backgroundColor: "#FF3333",
    justifyContent: "center",
  },
  disabledBtn: {
    opacity: 0.6,
    backgroundColor: "#cccccc",
  },
  iconFaceID: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  faceIDIcon: {
    width: 50,
    height: 50,
  },
  rowContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 30,
  },
});
