import { ThemedText } from "@/shared/ui/themed-text";
import { ThemedView } from "@/shared/ui/themed-view";
import { ThemeInput } from "@/shared/ui/theme-input";
import { FixedButtonView } from "@/shared/ui/fixed-button-view";
import { getAliasTokens } from "@/shared/config/theme";
import { useColorScheme } from "@/shared/lib/use-color-scheme";
import { type Href, Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Alert, StyleSheet } from "react-native";
import { useAuth } from "@/shared/auth/auth-context";
import { AuthServiceError } from "@/shared/auth/auth-service";

export default function AuthScreen() {
  const router = useRouter();
  const auth = useAuth();
  const { returnTo, reason } = useLocalSearchParams<{
    returnTo?: string | string[];
    reason?: string | string[];
  }>();
  const colorScheme = useColorScheme();
  const colors = getAliasTokens(colorScheme ?? "light");

  const [displayName, setDisplayName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const targetPath = resolveReturnTo(returnTo);
  const authReason = resolveReason(reason);

  const handleSubmit = useCallback(async () => {
    const normalized = displayName.trim();
    if (normalized.length === 0) {
      Alert.alert("알림", "이름을 입력해 주세요.");
      return;
    }
    if (normalized.length > 40) {
      Alert.alert("알림", "이름은 40자 이하로 입력해 주세요.");
      return;
    }

    try {
      setIsSubmitting(true);
      setSubmitError(null);
      await auth.signIn(normalized);
    } catch (error) {
      const message = resolveAuthErrorMessage(error);
      setSubmitError(message);
    } finally {
      setIsSubmitting(false);
    }
  }, [auth, displayName]);

  useEffect(() => {
    if (!auth.isLoading && auth.isAuthenticated) {
      router.replace(targetPath);
    }
  }, [auth.isAuthenticated, auth.isLoading, router, targetPath]);

  if (auth.isLoading) {
    return <ActivityIndicator size="large" style={styles.loading} />;
  }

  if (auth.isAuthenticated) {
    return null;
  }

  return (
    <FixedButtonView
      buttonProps={{
        onPress: handleSubmit,
        disabled: isSubmitting,
        accessibilityRole: "button",
        accessibilityLabel: "시작하기",
        accessibilityHint: "닉네임 입력 후 게임을 시작합니다",
        children: "시작하기",
      }}
    >
      <Stack.Screen options={{ headerTitle: "로그인" }} />
      <ThemedView style={styles.container}>
        <ThemedView style={styles.headerSection}>
          <ThemedText type="title1">세션 시작</ThemedText>
          <ThemedText type="body2" style={{ color: colors.text.secondary }}>
            닉네임을 등록하면 플레이 기록과 결과를 세션별로 확인할 수 있어요.
          </ThemedText>
          {authReason === "expired" ? (
            <ThemedText type="captionS" style={{ color: colors.feedback.warningFg }}>
              세션이 만료되어 다시 로그인해 주세요.
            </ThemedText>
          ) : null}
        </ThemedView>

        <ThemedView
          style={[
            styles.formCard,
            {
              backgroundColor: colors.surface.layer1,
              borderColor: colors.border.base,
            },
          ]}
        >
          <ThemeInput
            label="닉네임"
            accessibilityLabel="닉네임 입력"
            accessibilityHint="게임을 시작하려면 닉네임을 입력하고 시작하기를 눌러주세요"
            placeholder="예: 기민한호랑이"
            value={displayName}
            onChangeText={(value) => {
              setDisplayName(value);
              if (submitError != null) {
                setSubmitError(null);
              }
            }}
            maxLength={40}
            autoCapitalize="none"
            autoCorrect={false}
          />
          {submitError ? (
            <ThemedText type="captionS" style={[styles.errorText, { color: colors.text.danger }]}>
              {submitError}
            </ThemedText>
          ) : null}
          <ThemedText type="captionS" style={{ color: colors.text.tertiary }}>
            {displayName.trim().length}/40자
          </ThemedText>
        </ThemedView>
      </ThemedView>
    </FixedButtonView>
  );
}

const resolveReturnTo = (returnTo: string | string[] | undefined): Href => {
  const fallback: Href = "/";
  const candidate = Array.isArray(returnTo) ? returnTo[0] : returnTo;
  if (!candidate || candidate.length === 0) {
    return fallback;
  }

  let decoded = candidate;
  try {
    decoded = decodeURIComponent(candidate);
  } catch {
    return fallback;
  }

  if (!decoded.startsWith("/") || decoded === "/auth") {
    return fallback;
  }

  if (
    decoded === "/" ||
    decoded === "/setting" ||
    decoded.startsWith("/games/") ||
    decoded.startsWith("/pre-game/")
  ) {
    return decoded as Href;
  }

  return fallback;
};

const resolveReason = (reason: string | string[] | undefined) => {
  const value = Array.isArray(reason) ? reason[0] : reason;
  if (value === "expired") {
    return "expired";
  }
  return "unauthenticated";
};

const resolveAuthErrorMessage = (error: unknown) => {
  if (error instanceof AuthServiceError) {
    switch (error.code) {
      case "offline":
        return "오프라인 상태입니다. 네트워크 연결을 확인한 뒤 다시 시도해 주세요.";
      case "invalid_credentials":
        return "로그인 정보를 확인해 주세요.";
      case "server_unavailable":
        return "서버 응답이 지연되고 있어요. 잠시 후 다시 시도해 주세요.";
      default:
        return "로그인 처리 중 문제가 발생했습니다.";
    }
  }

  return "로그인 처리 중 문제가 발생했습니다.";
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    gap: 16,
  },
  headerSection: {
    gap: 8,
  },
  formCard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    gap: 8,
  },
  errorText: {
    marginTop: 2,
  },
  loading: {
    flex: 1,
  },
});
