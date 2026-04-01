import { Tabs } from "expo-router";
import React from "react";

import { HapticTab } from "@/shared/ui/haptic-tab";
import { IconSymbol } from "@/shared/ui/icon-symbol";
import { AliasTokens } from "@/shared/config/theme";
import { useColorScheme } from "@/shared/lib/use-color-scheme";

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor:
          AliasTokens[colorScheme ?? "light"].brand.primary,
        headerShown: false,
        tabBarButton: HapticTab,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "홈",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="house.fill" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: "팁",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="book.fill" color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
