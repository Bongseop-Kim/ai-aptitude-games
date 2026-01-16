import { IconSymbol } from "@/components/ui/icon-symbol";
import { SemanticTokens } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { StyleSheet } from "react-native";
import { KeyboardProvider } from "react-native-keyboard-controller";
import "react-native-reanimated";

export const unstable_settings = {
  anchor: "(tabs)",
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <KeyboardProvider>
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
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
                  color={SemanticTokens[colorScheme ?? "light"].icon.default}
                  style={styles.headerRight}
                />
              ),
            }}
          />
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
    </KeyboardProvider>
  );
}

const styles = StyleSheet.create({
  headerRight: {
    marginLeft: 6,
  },
});
