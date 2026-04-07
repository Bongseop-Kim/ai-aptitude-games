import { AppInitError } from "@/shared/ui/app-init-error";
import HeaderIcon from "@/shared/ui/header-icon";
import { db, dbName, expo } from "@/shared/db/client";
import migrations from "@/shared/db/migrations/migrations";
import { AuthProvider } from "@/shared/auth/auth-context";
import { useColorScheme } from "@/shared/lib/use-color-scheme";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useMigrations } from "drizzle-orm/expo-sqlite/migrator";
import { useDrizzleStudio } from "expo-drizzle-studio-plugin";
import { Stack, router } from "expo-router";
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
  useDrizzleStudio(expo);

  if (!success && !error) {
    return <ActivityIndicator size="large" style={styles.loading} />;
  }

  if (error) {
    return (
      <AppInitError error={error} title="데이터베이스 초기화에 실패했습니다" />
    );
  }

  return (
    <Suspense fallback={<ActivityIndicator size="large" />}>
      <SQLiteProvider databaseName={dbName} useSuspense>
        <KeyboardProvider>
          <AuthProvider>
            <ThemeProvider
              value={colorScheme === "dark" ? DarkTheme : DefaultTheme}
            >
              <Stack
                screenOptions={{
                  headerBackButtonDisplayMode: "minimal",
                  headerTitle: "",
                  headerLeft: () => <HeaderIcon name="chevron.left" onPress={router.back} />,
                  headerRight: () => (
                    <HeaderIcon
                      name="gearshape"
                      onPress={() =>
                        router.push("/setting")
                      }
                    />
                  ),
                }}
              >
                <Stack.Screen
                  name="(tabs)"
                  options={{
                    headerLeft: undefined,
                  }}
                />
              </Stack>
              <StatusBar style="auto" />
            </ThemeProvider>
          </AuthProvider>
        </KeyboardProvider>
      </SQLiteProvider>
    </Suspense>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
  },
});
