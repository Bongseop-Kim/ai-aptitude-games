import { SemanticTokens } from "@/constants/theme";
import { Pressable, StyleSheet, useColorScheme } from "react-native";
import { IconSymbol, IconSymbolName } from "./ui/icon-symbol";


export default function HeaderIcon({ name, onPress }: { name: IconSymbolName, onPress: () => void }) {
    const colorScheme = useColorScheme();

    return (
        <Pressable onPress={onPress} style={styles.container}>
            <IconSymbol
                size={24}
                name={name}
                color={SemanticTokens[colorScheme ?? "light"].icon.default}
            />
        </Pressable>
    )
}

const styles = StyleSheet.create({
    container: {
        width: 36,
        height: 36,
        alignItems: "center",
        justifyContent: "center",
    },
});