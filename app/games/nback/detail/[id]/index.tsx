import { FixedButtonScroll } from "@/components/fixed-button-scroll";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useLocalSearchParams } from "expo-router";

export default function NBackDetailScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();

    return (
        <FixedButtonScroll
            buttonProps={{
                onPress: () => {
                    console.log('button pressed');
                },
                children: '확인',
            }}
        >
            <ThemedView>
                <ThemedText>NBackDetailScreen</ThemedText>
            </ThemedView>
        </FixedButtonScroll>
    );
}