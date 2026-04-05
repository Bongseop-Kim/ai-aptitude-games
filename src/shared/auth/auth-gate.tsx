import { Redirect, usePathname } from "expo-router";
import { ActivityIndicator } from "react-native";
import { useAuth } from "./auth-context";
import { ThemedView } from "../ui/themed-view";

type AuthGateProps = {
  children: React.ReactNode;
};

export const AuthGate = ({ children }: AuthGateProps) => {
  const { isLoading, isAuthenticated } = useAuth();
  const pathname = usePathname();

  if (isLoading) {
    return (
      <ThemedView style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </ThemedView>
    );
  }

  if (!isAuthenticated) {
    return <Redirect href={{ pathname: "/auth", params: { returnTo: pathname } }} />;
  }

  return children;
};
