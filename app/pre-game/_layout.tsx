import { Slot } from "expo-router";
import { AuthGate } from "@/shared/auth/auth-gate";

export default function PreGameLayout() {
  return (
    <AuthGate>
      <Slot />
    </AuthGate>
  );
}
