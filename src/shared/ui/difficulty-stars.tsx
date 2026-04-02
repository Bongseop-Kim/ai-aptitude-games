import { AliasTokens } from "../config/theme";
import { useColorScheme } from "../lib/use-color-scheme";
import { ThemedView } from "./themed-view";
import { IconSymbol } from "./icon-symbol";

const DifficultyStars = ({
  level,
  size = 14,
}: {
  level: number;
  size?: number;
}) => {
  const colorScheme = useColorScheme();
  const stars = [];
  for (let i = 0; i < 5; i++) {
    stars.push(
      <IconSymbol
        key={i}
        name={i < level ? "star.fill" : "star"}
        size={size}
        color={AliasTokens[colorScheme ?? "light"].text.secondary}
      />
    );
  }
  return (
    <ThemedView style={{ flexDirection: "row", gap: 2 }}>{stars}</ThemedView>
  );
};

export default DifficultyStars;
