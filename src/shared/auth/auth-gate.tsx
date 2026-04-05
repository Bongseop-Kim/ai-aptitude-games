import { Redirect, usePathname } from "expo-router";
import { ActivityIndicator } from "react-native";
import { useAuth } from "./auth-context";
import { ThemedView } from "../ui/themed-view";
import { useEffect } from "react";

type AuthGateProps = {
  children: React.ReactNode;
};

export const AuthGate = ({ children }: AuthGateProps) => {
  const { isLoading, isAuthenticated, authStatus, refreshIfNeeded } = useAuth();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading && authStatus === "refreshing") {
      void refreshIfNeeded();
    }
  }, [authStatus, isLoading, refreshIfNeeded]);

  if (isLoading || authStatus === "refreshing") {
    return (
      <ThemedView style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </ThemedView>
    );
  }

  if (authStatus === "expired") {
    return (
      <Redirect href={{ pathname: "/auth", params: { returnTo: pathname, reason: "expired" } }} />
    );
  }

  if (!isAuthenticated) {
    return (
      <Redirect
        href={{
          pathname: "/auth",
          params: { returnTo: pathname, reason: "unauthenticated" },
        }}
      />
    );
  }

  return children;
};
