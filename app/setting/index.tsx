import { ThemedText } from "@/shared/ui/themed-text";
import { ThemedView } from "@/shared/ui/themed-view";
import { IconSymbol } from "@/shared/ui/icon-symbol";
import { Padding, SemanticTokens, Spacing } from "@/shared/config/theme";
import { useColorScheme } from "@/shared/lib/use-color-scheme";
import { useThemeColor } from "@/shared/lib/use-theme-color";
import { useAuth } from "@/shared/auth/auth-context";
import { useMemo } from "react";
import * as Application from "expo-application";
import Constants from "expo-constants";
import { RelativePathString, Stack, router } from "expo-router";
import { FlatList, Pressable, StyleSheet, View } from "react-native";

const appVersion =
    Application.nativeApplicationVersion ??
    Constants.expoConfig?.version ??
    "0.0.0";

const buildNumber =
    Application.nativeBuildVersion ??
    Constants.expoConfig?.ios?.buildNumber ??
    Constants.expoConfig?.android?.versionCode ??
    "0";

export default function SettingScreen() {
    const { session, signOut } = useAuth();
    const separatorColor = useThemeColor({}, "border.base");
    const displayName = session?.displayName;
    const settings = useMemo(
        () => buildSettings(signOut, displayName),
        [signOut, displayName]
    );

    return (
        <ThemedView style={styles.container}>
            <Stack.Screen options={{ headerTitle: "설정" }} />
            <FlatList
                data={settings}
                renderItem={({ item }) => <Item setting={item} />}
                keyExtractor={(item) => item.id}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.listContent}
                ItemSeparatorComponent={() => (
                    <View style={[styles.separator, { backgroundColor: separatorColor }]} />
                )}
            />
        </ThemedView>
    );
}

interface Setting {
    id: string;
    name: string;
    description?: string;
    link?: string;
    onPress?: () => void;
}

const baseSettings: Setting[] = [
    {
        id: "telemetry",
        name: "텔레메트리 KPI",
        link: "/setting/telemetry",
        description: "평균 완료율/이탈률/지연 지표 요약",
    },
    {
        id: "improvement",
        name: "개선 제안",
        link: "/setting/improvement",
    },
    {
        id: "issue",
        name: "버그 신고",
        link: "/setting/issue",
    },
    {
        id: "version",
        name: "버전",
        description: `${appVersion} (${buildNumber ?? "0"})`,
    },
];

const buildSettings = (signOut: () => Promise<void>, displayName?: string): Setting[] => {
    const settings: Setting[] = [...baseSettings];

    if (displayName != null) {
        settings.push({
            id: "user",
            name: `로그인: ${displayName}`,
            description: "탭하면 로그아웃합니다",
            onPress: async () => {
                await signOut();
                router.replace("/auth");
            },
        });
    }

    return settings;
};

const Item = ({ setting }: { setting: Setting }) => {
    const hoverBg = useThemeColor({}, "surface.layer1");
    const tertiaryColor = useThemeColor({}, "text.tertiary");
    const colorScheme = useColorScheme();
    const isPressable = setting.link != null || setting.onPress != null;
    const isLink = setting.link != null;

    const content = (
        <View style={styles.itemInner}>
            <ThemedText type="captionL" numberOfLines={1}>
                {setting.name}
            </ThemedText>
            {setting.description != null && (
                <ThemedText
                    type="captionM"
                    style={[styles.description, { color: tertiaryColor }]}
                    numberOfLines={1}
                >
                    {setting.description}
                </ThemedText>
            )}
            {(isLink || setting.onPress != null) && (
                <IconSymbol
                    name="chevron.right"
                    size={16}
                    color={SemanticTokens[colorScheme ?? "light"].icon.default}
                />
            )}
        </View>
    );

    if (isPressable) {
        const handlePress = () => {
            if (setting.link != null) {
                router.push(setting.link as RelativePathString);
                return;
            }
            setting.onPress?.();
        };

        return (
            <Pressable
                onPress={handlePress}
                accessibilityRole="button"
                accessibilityLabel={setting.link != null ? `${setting.name} 화면으로 이동` : `${setting.name}`}
                accessibilityHint={setting.link != null ? `${setting.name} 화면으로 이동하려면 더블 탭하세요` : `${setting.name} 동작을 실행하려면 더블 탭하세요`}
                style={({ pressed }) => [
                    styles.item,
                    pressed && { backgroundColor: hoverBg },
                ]}
            >
                {content}
            </Pressable>
        );
    }

    return <View style={styles.item}>{content}</View>;
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    listContent: {
        paddingBottom: Padding.xl,
    },
    separator: {
        height: StyleSheet.hairlineWidth,
        marginLeft: Padding.m,
    },
    item: {
        paddingHorizontal: Padding.m,
        paddingVertical: Spacing.spacing16,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        minHeight: 52,
    },
    itemInner: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        gap: Spacing.spacing12,
    },
    description: {
        flexShrink: 1,
        textAlign: "right",
    },
});
