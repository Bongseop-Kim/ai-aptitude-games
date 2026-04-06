import { GAMES_MAP } from "@/entities/game";
import { BorderRadius, Spacing, getAliasTokens } from "@/shared/config/theme";
import { getAssessmentSessionEventStream, type AssessmentGameKey } from "@/shared/lib";
import { useColorScheme } from "@/shared/lib/use-color-scheme";
import { useThemeColor } from "@/shared/lib/use-theme-color";
import { FixedButtonView } from "@/shared/ui/fixed-button-view";
import { Spacer } from "@/shared/ui/spacer";
import { ThemedText } from "@/shared/ui/themed-text";
import { ThemedView } from "@/shared/ui/themed-view";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet } from "react-native";

type CompletionSummary = {
  readinessScore: number | null;
  accuracy: number | null;
  completionRate: number | null;
  speedScore: number | null;
  totalQuestions: number | null;
  answeredCount: number | null;
  correctCount: number | null;
};

const toNumber = (value: unknown): number | null => {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return null;
  }
  return value;
};

const toInteger = (value: unknown): number | null => {
  const next = toNumber(value);
  if (next === null) {
    return null;
  }
  return Math.round(next);
};

const roundPercent = (value: number | null) => {
  if (value === null) {
    return "미집계";
  }
  return `${Math.round(value * 100)}%`;
};

const parseScoreSummary = (events: unknown[]): CompletionSummary => {
  let completionEvent: Record<string, unknown> | undefined;
  for (let i = events.length - 1; i >= 0; i--) {
    const e = events[i] as Record<string, unknown> | null | undefined;
    if (typeof e?.event === "string" && (e.event as string).endsWith(".session_completed")) {
      completionEvent = e;
      break;
    }
  }

  const rawPayload = completionEvent?.payload;
  if (rawPayload == null || typeof rawPayload !== "object") {
    return {
      readinessScore: null,
      accuracy: null,
      completionRate: null,
      speedScore: null,
      totalQuestions: null,
      answeredCount: null,
      correctCount: null,
    };
  }

  const payload = rawPayload as Record<string, unknown>;
  const scoring = (payload.scoring ?? {}) as Record<string, unknown>;

  return {
    readinessScore: toNumber(scoring.readinessScore),
    accuracy: toNumber(scoring.accuracy),
    completionRate: toNumber(scoring.completionRate),
    speedScore: toNumber(scoring.speedScore),
    totalQuestions: toInteger(payload.totalQuestions),
    answeredCount: toInteger(scoring.answeredCount),
    correctCount: toInteger(payload.correctCount),
  };
};

type SessionResultSummaryWidgetProps = {
  gameKey: AssessmentGameKey;
  sessionId: string;
};

export function SessionResultSummaryWidget({
  gameKey,
  sessionId,
}: SessionResultSummaryWidgetProps) {
  const [summary, setSummary] = useState<CompletionSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const game = GAMES_MAP[gameKey];
  const mutedTextColor = useThemeColor({}, "text.secondary");
  const colorScheme = useColorScheme();
  const aliasTokens = getAliasTokens(colorScheme ?? "light");

  useEffect(() => {
    let isMounted = true;

    const loadSummary = async () => {
      try {
        const events = await getAssessmentSessionEventStream({
          sessionId,
          direction: "asc",
        });
        if (!isMounted) {
          return;
        }

        const nextSummary = parseScoreSummary(events);
        setSummary(nextSummary);
      } catch {
        if (isMounted) {
          setLoadError("점수 데이터를 불러오지 못했습니다.");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void loadSummary();

    return () => {
      isMounted = false;
    };
  }, [sessionId]);

  const handleRestart = () => {
    router.replace(`/pre-game/${gameKey}`);
  };
  const handleHistory = () => {
    router.replace(`/games/${gameKey}/history`);
  };

  return (
    <FixedButtonView
      buttonProps={{
        onPress: handleRestart,
        children: "다시 시작",
      }}
      secondaryButtonProps={{
        onPress: handleHistory,
        children: "기록 보기",
      }}
    >
      <ThemedView style={styles.container}>
        <ThemedText type="title1">{game?.name ?? gameKey} 결과</ThemedText>
        <Spacer size="spacing12" />
        <ThemedText type="body2" style={{ color: mutedTextColor }}>
          세션 {sessionId}
        </ThemedText>
        <Spacer size="spacing24" />

        {isLoading && <ActivityIndicator size="large" />}

        {!isLoading && loadError && (
          <ThemedText type="body1" style={{ color: aliasTokens.feedback.errorFg }}>
            {loadError}
          </ThemedText>
        )}

        {!isLoading && !loadError && summary && (
          <>
            <ThemedView
              style={[
                styles.metricCard,
                { borderColor: aliasTokens.border.muted },
              ]}
            >
              <ThemedText type="labelL">
                정확도: {roundPercent(summary.accuracy)}
              </ThemedText>
              <Spacer size="spacing4" />
              <ThemedText type="labelL">
                완료율: {roundPercent(summary.completionRate)}
              </ThemedText>
              <Spacer size="spacing4" />
              <ThemedText type="labelL">
                속도 점수: {roundPercent(summary.speedScore)}
              </ThemedText>
              <Spacer size="spacing4" />
              <ThemedText type="labelL">
                readiness: {summary.readinessScore === null ? "미집계" : `${summary.readinessScore.toFixed(1)}/100`}
              </ThemedText>
            </ThemedView>

            <Spacer size="spacing16" />
            <ThemedView
              style={[
                styles.metricCard,
                { borderColor: aliasTokens.border.muted },
              ]}
            >
              <ThemedText type="body2">
                {summary.correctCount !== null && summary.totalQuestions !== null
                  ? `정답 ${summary.correctCount}/${summary.totalQuestions}건`
                  : "정답/문항 정보를 계산할 수 없습니다"}
              </ThemedText>
              {summary.answeredCount !== null && summary.totalQuestions !== null ? (
                <ThemedText type="body2" style={{ color: mutedTextColor }}>
                  응답 {summary.answeredCount}/{summary.totalQuestions} 완료
                </ThemedText>
              ) : null}
            </ThemedView>
          </>
        )}
      </ThemedView>
    </FixedButtonView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: Spacing.spacing20,
    gap: Spacing.spacing8,
  },
  metricCard: {
    borderWidth: 1,
    borderRadius: BorderRadius.s,
    padding: 14,
    gap: Spacing.spacing8,
    width: "100%",
  },
});
