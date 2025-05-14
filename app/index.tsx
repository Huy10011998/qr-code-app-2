import axios from "axios";
import * as LocalAuthentication from "expo-local-authentication";
import { useNavigation } from "expo-router";
import * as SecureStore from "expo-secure-store";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  Keyboard,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useAuth } from "../components/auth/AuthProvider";
import { ThemedView } from "../components/ThemedView";

const windowWidth = Dimensions.get("window").width;
const windowHeight = Dimensions.get("window").height;

export default function LoginScreen() {
  const navigation = useNavigation();
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isLoginDisabled, setIsLoginDisabled] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSavedLogin, setHasSavedLogin] = useState(false); // Track if credentials are saved
  const { setUserData, setToken, token } = useAuth();

  useEffect(() => {
    setIsLoginDisabled(!(userId.trim() && password.trim()));
  }, [userId, password]);

  // Attempt auto-login with saved FaceID credentials
  useEffect(() => {
    // SecureStore.deleteItemAsync("faceid_credentials");
    const tryAutoLoginWithFaceID = async () => {
      const savedData = await SecureStore.getItemAsync("faceid_credentials");
      console.log("===1", savedData);

      if (!savedData) return;

      const compatible = await LocalAuthentication.hasHardwareAsync();
      const enrolled = await LocalAuthentication.isEnrolledAsync();

      if (compatible && enrolled) {
        const result = await LocalAuthentication.authenticateAsync({
          promptMessage: "Xác thực để đăng nhập",
          fallbackLabel: "Dùng mật khẩu",
        });

        if (result.success) {
          const { userId, password } = JSON.parse(savedData);
          console.log("===2", savedData);
          try {
            const response = await axios.post(
              "https://hrcert.cholimexfood.com.vn/api/auth/login",
              { userId, password }
            );

            if (response.status === 200) {
              const userData = response.data.data;
              setUserData(userData);
              setToken(response.data.token);
              (navigation.navigate as any)("(tabs)");
            }
          } catch {
            Alert.alert("Lỗi", "Không thể đăng nhập tự động.");
          }
        }
      }
    };

    tryAutoLoginWithFaceID();
  }, []);

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

        // ✅ Hỏi người dùng có muốn lưu thông tin để dùng Face ID
        Alert.alert(
          "Lưu đăng nhập?",
          "Bạn có muốn sử dụng Face ID để đăng nhập tự động lần sau?",
          [
            {
              text: "Không",
              style: "cancel",
              onPress: () => {
                (navigation.navigate as any)("(tabs)");
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
                (navigation.navigate as any)("(tabs)");
              },
            },
          ]
        );
      }
    } catch (error) {
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
      if (!compatible) {
        Alert.alert("Lỗi", "Thiết bị của bạn không hỗ trợ Face ID.");
        setIsLoading(false);
        return;
      }

      const enrolled = await LocalAuthentication.isEnrolledAsync();
      if (!enrolled) {
        Alert.alert("Lỗi", "Bạn chưa cài đặt Face ID trên thiết bị.");
        setIsLoading(false);
        return;
      }

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: "Đăng nhập bằng khuôn mặt",
        fallbackLabel: "Sử dụng mật khẩu",
      });

      if (result.success) {
        const savedData = await SecureStore.getItemAsync("faceid_credentials");
        if (!savedData) {
          Alert.alert("Không tìm thấy tài khoản đã lưu.");
          return;
        }

        const { userId, password } = JSON.parse(savedData);

        // Gọi hàm handlePressLogin để tự động đăng nhập
        setUserId(userId);
        setPassword(password);
        handlePressLogin(); // Tự động gửi yêu cầu đăng nhập
      } else {
        Alert.alert(
          "Đăng nhập thất bại",
          "Xác thực khuôn mặt không thành công."
        );
      }
    } catch (error) {
      Alert.alert("Lỗi", "Đã xảy ra lỗi khi đăng nhập bằng Face ID.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <KeyboardAwareScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        enableOnAndroid={true}
        extraScrollHeight={50}
      >
        <View style={styles.bgLogin}>
          <ThemedView style={[styles.contaiContent, { flex: 0.5 }]}>
            <Image
              source={require("../assets/images/logo-cholimex.jpg")}
              style={styles.logoCholimex}
            />
          </ThemedView>

          <ThemedView style={[styles.contaiInput, { flex: 0.5 }]}>
            {!hasSavedLogin && (
              <>
                <TextInput
                  style={styles.inputContai}
                  placeholder="Tài khoản"
                  value={userId}
                  onChangeText={setUserId}
                />
                <View style={styles.contaiInputPW}>
                  <TextInput
                    style={styles.inputContaiPW}
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
                </View>
              </>
            )}
            <View style={styles.rowContainer}>
              <TouchableOpacity
                style={[
                  styles.btnContai,
                  isLoginDisabled && styles.disabledBtn,
                ]}
                onPress={handlePressLogin}
                disabled={isLoginDisabled || isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.textContai}>Đăng nhập</Text>
                )}
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.iconFaceID}
                onPress={handleFaceIDLogin}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Image
                    source={require("../assets/images/faceid-icon.png")} // Cập nhật icon Face ID ở đây
                    style={styles.faceIDIcon}
                  />
                )}
              </TouchableOpacity>
            </View>
          </ThemedView>
        </View>
      </KeyboardAwareScrollView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  bgLogin: {
    width: windowWidth,
    height: windowHeight,
    backgroundColor: "white",
    padding: 16,
  },
  contaiContent: {
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
  },
  contaiInput: {
    backgroundColor: "transparent",
    width: "100%",
  },
  logoCholimex: {
    resizeMode: "contain",
    width: 200,
    height: 100,
  },
  inputContai: {
    fontSize: 16,
    height: 60,
    borderBottomWidth: 1,
    borderColor: "#000",
    color: "#000",
    fontWeight: "500",
  },
  contaiInputPW: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 20,
  },
  inputContaiPW: {
    fontSize: 16,
    height: 60,
    borderBottomWidth: 1,
    borderColor: "#000",
    color: "#000",
    fontWeight: "500",
    flex: 1,
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
  textContai: {
    textAlign: "center",
    fontSize: 16,
    fontWeight: "500",
    color: "#fff",
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
    width: 40,
    height: 40,
  },
  rowContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 30,
  },
});
