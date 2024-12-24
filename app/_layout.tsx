import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import "react-native-reanimated";
import * as FileSystem from "expo-file-system";
import { useColorScheme } from "@/hooks/useColorScheme";
import { SQLiteProvider } from "expo-sqlite";
import { Asset } from "expo-asset";
import LoadingScreen from "@/components/LoadingScreen";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });
  const [dbLoaded, setdbLoaded] = useState(false);
  const loadDatabase = async () => {
    const dbName = "base.db";
    const dbAsset = require("@/assets/db/base.db");
    const dbUri = Asset.fromModule(dbAsset).uri;
    const dbFilePath = `${FileSystem.documentDirectory}SQLite/${dbName}`;

    const fileInfo = await FileSystem.getInfoAsync(dbFilePath);
    if (!fileInfo.exists) {
      await FileSystem.makeDirectoryAsync(
        `${FileSystem.documentDirectory}SQLite`,
        {
          intermediates: true,
        }
      );
      await FileSystem.downloadAsync(dbUri, dbFilePath);
    }
  };
  useEffect(() => {
    loadDatabase().then(() => {
      setdbLoaded(true);
    });
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!dbLoaded || !loaded) {
    return <LoadingScreen />;
  }

  return (
    <SQLiteProvider databaseName="base.db">
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="add" />
        </Stack>
        <StatusBar style="dark" />
      </ThemeProvider>
    </SQLiteProvider>
  );
}
