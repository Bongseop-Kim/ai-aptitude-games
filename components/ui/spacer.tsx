import { Spacing, SpacingToken } from "@/constants/theme";
import { View } from "react-native";

type SpacerProps = {
  size?: SpacingToken;
  horizontal?: boolean;
};

export function Spacer({
  size = "spacing16",
  horizontal = false,
}: SpacerProps) {
  const value = Spacing[size];

  return (
    <View
      pointerEvents="none"
      style={
        horizontal ? { width: value, height: 1 } : { height: value, width: 1 }
      }
    />
  );
}
