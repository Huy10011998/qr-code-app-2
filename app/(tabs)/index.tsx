import axios, { isAxiosError } from "axios";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  Linking,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { useAuth } from "../../components/auth/AuthProvider";
import ParallaxScrollView from "../../components/ParallaxScrollView";
import QRCodeGenerator from "../../components/QRCodeGenerator";
import { ThemedText } from "../../components/ThemedText";
import { ThemedView } from "../../components/ThemedView";

const windowWidth = Dimensions.get("window").width;
const windowHeight = Dimensions.get("window").height;

export default function TabOneScreen() {
  const [id, setId] = useState("");
  const [fullName, setfullName] = useState("");
  const [department, setDepartment] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [imageLoaded, setImageLoaded] = useState(false);

  const { userData } = useAuth();
  const userId = userData.userId;
  const { token } = useAuth();

  const formatPhoneNumber = (phoneNumber: string) => {
    const cleaned = ("" + phoneNumber).replace(/\D/g, "");

    if (cleaned === null || cleaned === "") {
      return "";
    }

    const parts = [];

    if (cleaned.length > 3) {
      parts.push(cleaned.slice(0, 4));
    }

    for (let i = 4; i < cleaned.length; i += 3) {
      parts.push(cleaned.slice(i, i + 3));
    }

    return parts.join(" ");
  };

  const sleep = (ms: any) => new Promise((resolve) => setTimeout(resolve, ms));

  useEffect(() => {
    const fetchQrCode = async () => {
      try {
        setLoading(true);
        const response = await axios.post(
          "https://hrcert.cholimexfood.com.vn/api/auth/getQrCode",
          {
            userId,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        await sleep(500);

        if (response.status === 200) {
          setId(response.data.data.id);
          setfullName(response.data.data.fullName);
          setDepartment(response.data.data.department);
          setPhoneNumber(response.data.data.phoneNumber);
          setEmail(response.data.data.email);
        }
      } catch (error) {
        if (isAxiosError(error)) {
          if (error.response?.status === 401) {
            Alert.alert("Thông báo", "Lấy thông tin thất bại!!!");
          } else if (error.response?.status === 404) {
            Alert.alert("Thông báo", "Thông tin không tìm thấy!!!");
          } else {
            Alert.alert(
              "Thông báo",
              "Đã xảy ra lỗi khi lấy thông tin. Vui lòng thử lại sau!!!"
            );
          }
        } else {
          Alert.alert(
            "Thông báo",
            "Đã xảy ra lỗi khi lấy thông tin. Vui lòng thử lại sau!!!"
          );
        }
      } finally {
        setLoading(false);
      }
    };

    fetchQrCode();
  }, [token, userId]);

  const WebsiteLink = () => {
    const handlePress = () => {
      Linking.openURL("https://cholimexfood.com.vn/");
    };

    return (
      <TouchableOpacity onPress={handlePress}>
        <ThemedText type="titleFooter">
          Website: www.cholimexfood.com.vn
        </ThemedText>
      </TouchableOpacity>
    );
  };

  return (
    <ParallaxScrollView
      containerBackground={
        <Image
          source={require("../../assets/images/bg-qrcode.png")}
          onLoad={() => setImageLoaded(true)}
          resizeMode="stretch"
          style={{ width: windowWidth, height: windowHeight }}
        />
      }
    >
      {!imageLoaded || loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#FF3333" />
        </View>
      ) : (
        <>
          <ThemedView style={styles.contaiQrcode}>
            <QRCodeGenerator
              url={`https://hrcert.cholimexfood.com.vn/profile/${id}`}
            />
          </ThemedView>
          <ThemedView style={styles.contaiContent}>
            <ThemedText type="subtitle">{fullName}</ThemedText>
            <ThemedText type="titleDepartment">{department}</ThemedText>
            <ThemedView style={[styles.contaiContent, styles.rowContai]}>
              <Image
                source={require("../../assets/images/iconphone.png")}
                style={styles.iconPhone}
              />
              <ThemedText type="titlePhone">
                {formatPhoneNumber(phoneNumber)}
              </ThemedText>
            </ThemedView>
          </ThemedView>
          <ThemedView style={[styles.flexStart]}>
            <ThemedText type="subtitleFooter">
              Công ty cổ phần thực phẩm cholimex
            </ThemedText>
            <ThemedView
              style={[
                styles.contaiContent,
                styles.rowContai,
                styles.padTopLeft,
              ]}
            >
              <Image
                source={require("../../assets/images/iconlocation.png")}
                style={[styles.iconFooter, styles.flexStart]}
              />
              <ThemedText type="titleFooter">
                Đường số 7, KCN Vĩnh Lộc, Huyện Bình Chánh, TP.HCM, Việt Nam
              </ThemedText>
            </ThemedView>
            <ThemedView
              style={[
                styles.contaiContent,
                styles.rowContai,
                styles.padTopLeft,
              ]}
            >
              <Image
                source={require("../../assets/images/iconmail.png")}
                style={styles.iconFooter}
              />
              <ThemedText type="titleFooter">Email: {email}</ThemedText>
            </ThemedView>
            <ThemedView
              style={[
                styles.contaiContent,
                styles.rowContai,
                styles.padTopLeft,
              ]}
            >
              <Image
                source={require("../../assets/images/iconwebsite.png")}
                style={styles.iconFooter}
              />
              <WebsiteLink />
            </ThemedView>
          </ThemedView>
        </>
      )}
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  contaiQrcode: {
    marginTop: 32,
    alignSelf: "flex-start",
  },
  contaiContent: {
    justifyContent: "flex-start",
    alignItems: "center",
    backgroundColor: "transparent",
    marginRight: 10,
  },
  qrCodeIcon: {
    width: 128,
    height: 128,
  },
  iconPhone: {
    marginTop: 15,
    width: 20,
    height: 20,
  },
  iconFooter: {
    width: 20,
    height: 20,
    alignItems: "center",
  },
  rowContai: {
    flexDirection: "row",
    alignItems: "center",
  },
  flexStart: {
    alignSelf: "flex-start",
    backgroundColor: "transparent",
  },
  padTopLeft: {
    paddingTop: 5,
    paddingLeft: 5,
  },
});
