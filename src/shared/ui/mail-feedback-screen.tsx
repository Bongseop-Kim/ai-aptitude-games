import { FixedButtonView } from "@/shared/ui/fixed-button-view";
import { ThemeInput } from "@/shared/ui/theme-input";
import { VStack } from "@/shared/ui/stack";
import { Padding } from "@/shared/config/theme";
import * as MailComposer from "expo-mail-composer";
import { Stack } from "expo-router";
import { useCallback, useState } from "react";
import { Alert, Platform, StyleSheet } from "react-native";

interface MailFeedbackScreenProps {
  headerTitle: string;
  recipient: string;
  defaultSubject: string;
  subjectPlaceholder: string;
  bodyPlaceholder: string;
}

export function MailFeedbackScreen({
  headerTitle,
  recipient,
  defaultSubject,
  subjectPlaceholder,
  bodyPlaceholder,
}: MailFeedbackScreenProps) {
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

    setIsSending(true);

    const available = await MailComposer.isAvailableAsync();
    if (!available) {
      Alert.alert("알림", "이 기기에서는 메일 앱을 사용할 수 없습니다.");
      setIsSending(false);
      return;
    }

    try {
      const result = await MailComposer.composeAsync({
        recipients: [recipient],
        subject: trimmedSubject || defaultSubject,
        body: trimmedBody || "",
      });

      if (Platform.OS !== "android") {
        // iOS / web: clear inputs only when the user actually sent or saved the draft.
        // Android does not provide reliable send/cancel info; preserve inputs to avoid data loss.
        if (result?.status === "sent" || result?.status === "saved") {
          setSubject("");
          setBody("");
        }
      }
    } catch {
      Alert.alert("알림", "메일 앱을 열지 못했습니다.");
    } finally {
      setIsSending(false);
    }
  }, [subject, body, isSending, recipient, defaultSubject]);

  return (
    <FixedButtonView
      buttonProps={{
        onPress: handleSend,
        disabled: isSending,
        children: "메일 앱으로 보내기",
      }}
    >
      <Stack.Screen options={{ headerTitle }} />
      <VStack spacing="spacing24" style={styles.content}>
        <VStack spacing="spacing16">
          <ThemeInput
            label="제목"
            placeholder={subjectPlaceholder}
            value={subject}
            onChangeText={setSubject}
            maxLength={100}
          />
          <ThemeInput
            label="내용"
            placeholder={bodyPlaceholder}
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
