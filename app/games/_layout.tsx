import { Slot } from "expo-router";
import { AuthGate } from "@/shared/auth/auth-gate";

export default function GamesLayout() {
  return (
    <AuthGate>
      <Slot />
    </AuthGate>
  );
}
