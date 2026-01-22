import { AppInitError } from "@/components/app-init-error";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { SemanticTokens } from "@/constants/theme";
import { db, dbName, expo } from "@/db/client";
import migrations from "@/db/migrations/migrations";
import { useColorScheme } from "@/hooks/use-color-scheme";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useMigrations } from "drizzle-orm/expo-sqlite/migrator";
import { useDrizzleStudio } from "expo-drizzle-studio-plugin";
import { Stack } from "expo-router";
import { SQLiteProvider } from "expo-sqlite";
import { StatusBar } from "expo-status-bar";
import { Suspense } from "react";
import { ActivityIndicator, StyleSheet } from "react-native";
import { KeyboardProvider } from "react-native-keyboard-controller";
import "react-native-reanimated";

export const unstable_settings = {
  anchor: "(tabs)",
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const { success, error } = useMigrations(db, migrations);

  if (__DEV__ && useDrizzleStudio) {
    useDrizzleStudio(expo);
  }

  if (!success && !error) {
    return <ActivityIndicator size="large" style={{ flex: 1 }} />;
  }

  if (error) {
    return (
      <AppInitError
        error={error}
        title="데이터베이스 초기화에 실패했습니다"
      />
    );
  }

  return (
    <Suspense fallback={<ActivityIndicator size="large" />}>
      <SQLiteProvider databaseName={dbName} useSuspense>
        <KeyboardProvider>
          <ThemeProvider
            value={colorScheme === "dark" ? DarkTheme : DefaultTheme}
          >
            <Stack
              screenOptions={{
                headerBackButtonDisplayMode: "minimal",
                headerTitle: "",
              }}
            >
              <Stack.Screen
                name="(tabs)"
                options={{
                  headerRight: () => (
                    <IconSymbol
                      size={24}
                      name="gearshape"
                      color={
                        SemanticTokens[colorScheme ?? "light"].icon.default
                      }
                      style={styles.headerRight}
                    />
                  ),
                }}
              />
            </Stack>
            <StatusBar style="auto" />
          </ThemeProvider>
        </KeyboardProvider>
      </SQLiteProvider>
    </Suspense>
  );
}

const styles = StyleSheet.create({
  headerRight: {
    marginLeft: 6,
  },
});
