import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Padding, SemanticTokens, Spacing } from "@/constants/theme";
import { useThemeColor } from "@/hooks/use-theme-color";
import Constants from "expo-constants";
import { RelativePathString, Stack, router } from "expo-router";
import { FlatList, Pressable, StyleSheet, View, useColorScheme } from "react-native";

const appVersion =
    Constants.nativeAppVersion ??
    Constants.expoConfig?.version;

const buildNumber =
    Constants.nativeBuildVersion ??
    Constants.expoConfig?.ios?.buildNumber ??
    Constants.expoConfig?.android?.versionCode;

export default function SettingScreen() {
    const separatorColor = useThemeColor({}, "border.base");

    return (
        <ThemedView style={styles.container}>
            <Stack.Screen options={{ headerTitle: "설정" }} />
            <FlatList
                data={SETTINGS}
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
}

const SETTINGS: Setting[] = [
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

const Item = ({ setting }: { setting: Setting }) => {
    const hoverBg = useThemeColor({}, "surface.layer1");
    const tertiaryColor = useThemeColor({}, "text.tertiary");
    const colorScheme = useColorScheme();
    const isPressable = !!setting.link;

    const content = (
        <View style={styles.itemInner}>
            <ThemedText type="captionL" numberOfLines={1}>
                {setting.name}
            </ThemedText>
            {setting.description != null && setting.link == null && (
                <ThemedText
                    type="captionM"
                    style={[styles.description, { color: tertiaryColor }]}
                    numberOfLines={1}
                >
                    {setting.description}
                </ThemedText>
            )}
            {setting.link != null && (
                <IconSymbol
                    name="chevron.right"
                    size={16}
                    color={SemanticTokens[colorScheme ?? "light"].icon.default}
                />
            )}
        </View>
    );

    if (isPressable) {
        return (
            <Pressable
                onPress={() => router.push(setting.link as RelativePathString)}
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
    header: {
        paddingHorizontal: Padding.m,
        paddingTop: Spacing.spacing24,
        paddingBottom: Spacing.spacing16,
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