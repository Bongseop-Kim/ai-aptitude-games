import { IconSymbol } from "@/components/ui/icon-symbol";
import { getAliasTokens } from "@/constants/theme";
import { StyleSheet, useColorScheme } from "react-native";
import { ThemedText } from "./themed-text";
import { ThemedView } from "./themed-view";

export function AppInitError({
    error,
    title = "데이터베이스 초기화에 실패했습니다",
}: {
    error: unknown;
    title?: string;
}) {
    const colorScheme = useColorScheme();
    const tokens = getAliasTokens(colorScheme ?? "light");
    const message =
        error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다.";

    return (
        <ThemedView style={styles.container}>
            <ThemedView
                style={[
                    styles.glow,
                    { backgroundColor: tokens.brand.primaryAlpha20 },
                ]}
            />
            <ThemedView
                style={[
                    styles.glowSecondary,
                    { backgroundColor: tokens.feedback.errorBg },
                ]}
            />
            <ThemedView style={styles.content}>
                <ThemedView
                    style={[
                        styles.iconRing,
                        { borderColor: tokens.feedback.errorFg },
                    ]}
                >
                    <ThemedView
                        style={[
                            styles.iconBadge,
                            { backgroundColor: tokens.feedback.errorBg },
                        ]}
                    >
                        <IconSymbol
                            name="chevron.left.forwardslash.chevron.right"
                            size={28}
                            color={tokens.feedback.errorFg}
                        />
                    </ThemedView>
                </ThemedView>
                <ThemedText type="headlineM" style={styles.title}>
                    {title}
                </ThemedText>
                <ThemedText
                    type="body2"
                    style={[styles.description, { color: tokens.text.secondary }]}
                >
                    앱을 다시 시작하거나 잠시 후 다시 시도해 주세요.
                </ThemedText>
                <ThemedView style={styles.detailRow}>
                    <ThemedView
                        style={[
                            styles.detailDot,
                            { backgroundColor: tokens.feedback.errorFg },
                        ]}
                    />
                    <ThemedText
                        type="captionM"
                        style={[styles.details, { color: tokens.text.secondary }]}
                    >
                        {message}
                    </ThemedText>
                </ThemedView>
            </ThemedView>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 24,
    },
    glow: {
        position: "absolute",
        top: 120,
        right: -80,
        width: 220,
        height: 220,
        borderRadius: 110,
        opacity: 0.6,
    },
    glowSecondary: {
        position: "absolute",
        bottom: 140,
        left: -60,
        width: 180,
        height: 180,
        borderRadius: 90,
        opacity: 0.5,
    },
    content: {
        alignItems: "center",
        gap: 12,
    },
    iconRing: {
        width: 72,
        height: 72,
        borderRadius: 36,
        borderWidth: 2,
        alignItems: "center",
        justifyContent: "center",
    },
    iconBadge: {
        width: 56,
        height: 56,
        borderRadius: 28,
        alignItems: "center",
        justifyContent: "center",
    },
    title: {
        textAlign: "center",
    },
    description: {
        textAlign: "center",
        lineHeight: 20,
    },
    detailRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        marginTop: 8,
    },
    detailDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
    },
    details: {
        textAlign: "center",
        maxWidth: 280,
    },
});
