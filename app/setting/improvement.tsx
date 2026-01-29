import { FixedButtonView } from "@/components/fixed-button-view";
import { ThemeInput } from "@/components/theme-input";
import { VStack } from "@/components/ui/stack";
import { Padding } from "@/constants/theme";
import * as MailComposer from "expo-mail-composer";
import { Stack } from "expo-router";
import { useCallback, useState } from "react";
import {
    Alert,
    StyleSheet
} from "react-native";

const IMPROVEMENT_RECIPIENT = "biblecookie@naver.com";

export default function ImprovementScreen() {
    const [subject, setSubject] = useState("");
    const [body, setBody] = useState("");
    const [isSending, setIsSending] = useState(false);

    const handleSend = useCallback(async () => {
        if (isSending) return;

        const trimmedSubject = subject.trim();
        const trimmedBody = body.trim();
        if (!trimmedSubject && !trimmedBody) {
            Alert.alert("알림", "제목 또는 내용을 입력해 주세요.");
            return;
        }

        const available = await MailComposer.isAvailableAsync();
        if (!available) {
            Alert.alert(
                "알림",
                "이 기기에서는 메일 앱을 사용할 수 없습니다."
            );
            return;
        }

        setIsSending(true);
        try {
            await MailComposer.composeAsync({
                recipients: [IMPROVEMENT_RECIPIENT],
                subject: trimmedSubject || "[개선 제안]",
                body: trimmedBody || "",
            });
            setSubject("");
            setBody("");
        } catch (e) {
            Alert.alert("알림", "메일 앱을 열지 못했습니다.");
        } finally {
            setIsSending(false);
        }
    }, [subject, body, isSending]);

    return (
        <FixedButtonView
            buttonProps={{
                onPress: handleSend,
                disabled: isSending,
                children: "메일 앱으로 보내기",
            }}
        >
            <Stack.Screen options={{ headerTitle: "개선 제안" }} />
            <VStack spacing="spacing24" style={styles.content}>
                <VStack spacing="spacing16">
                    <ThemeInput
                        label="제목"
                        placeholder="제안 제목을 입력해 주세요"
                        value={subject}
                        onChangeText={setSubject}
                        maxLength={100}
                    />
                    <ThemeInput
                        label="내용"
                        placeholder="개선하고 싶은 점, 아이디어 등을 적어 주세요"
                        value={body}
                        onChangeText={setBody}
                        multiline
                        textAlignVertical="top"
                        inputStyle={styles.bodyInput}
                    />
                </VStack>
            </VStack>
        </FixedButtonView>
    );
}

const styles = StyleSheet.create({
    content: {
        flex: 1,
        padding: Padding.m,
    },
    bodyInput: {
        minHeight: 140,
        paddingTop: 12,
        paddingBottom: 12,
    },
});
