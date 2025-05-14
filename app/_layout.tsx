import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { useColorScheme } from "react-native";
import "react-native-reanimated";
import { AuthProvider } from "../components/auth/AuthProvider";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <AuthProvider>
      <AppNavigator colorScheme={colorScheme ?? "light"} />
    </AuthProvider>
  );
}

function AppNavigator({ colorScheme }: { colorScheme: "light" | "dark" }) {
  // const { token } = useAuth();
  // const router = useRouter();
  // const [hasNavigated, setHasNavigated] = React.useState(false);

  // useEffect(() => {
  //   if (token) {
  //     router.replace("(tabs)" as Href);
  //   } else {
  //     router.replace("index" as Href);
  //   }
  //   setHasNavigated(true);
  // }, [token, hasNavigated]);

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="+not-found" />
      </Stack>
    </ThemeProvider>
  );
}
