import { ThemedText } from "@/shared/ui/themed-text";
import { ThemedView } from "@/shared/ui/themed-view";
import { useThemeColor } from "@/shared/lib/use-theme-color";
import { Padding, Spacing } from "@/shared/config/theme";
import { Stack } from "expo-router";
import { useCallback, useEffect, useState, type ReactNode } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { getAssessmentTelemetryKpiSnapshot } from "@/shared/lib/telemetry-analytics";

type MetricRows = {
    completionRatePct: number;
    p50CompletionSec: number | null;
    invalidEventRatioPct: number;
    retryRatePct: number;
};

type Summary = {
    loading: boolean;
    loadingError: string | null;
    data: Awaited<ReturnType<typeof getAssessmentTelemetryKpiSnapshot>> | null;
};

export default function TelemetrySettingScreen() {
    const [summary, setSummary] = useState<Summary>({
        loading: true,
        loadingError: null,
        data: null,
    });
    const borderColor = useThemeColor({}, "border.base");
    const mutedColor = useThemeColor({}, "text.tertiary");
    const positiveColor = useThemeColor({}, "feedback.successFg");
    const negativeColor = useThemeColor({}, "feedback.errorFg");
    const warningColor = useThemeColor({}, "feedback.warningFg");

    const load = useCallback(async () => {
        setSummary((previous) => ({ ...previous, loading: true, loadingError: null }));
        try {
            const data = await getAssessmentTelemetryKpiSnapshot();
            setSummary({
                loading: false,
                loadingError: null,
                data,
            });
        } catch {
            setSummary({
                loading: false,
                loadingError: "KPI 조회에 실패했습니다. 잠시 후 다시 시도해 주세요.",
                data: null,
            });
        }
    }, []);

    useEffect(() => {
        void load();
    }, [load]);

    return (
        <ThemedView style={styles.container}>
            <Stack.Screen options={{ headerTitle: "텔레메트리 KPI" }} />
            {summary.loading ? (
                <View style={styles.center}>
                    <ThemedText type="body1">지표 계산 중입니다...</ThemedText>
                </View>
            ) : summary.loadingError != null ? (
                <View style={styles.empty}>
                    <ThemedText type="body1" style={{ color: warningColor }}>
                        {summary.loadingError}
                    </ThemedText>
                    <Pressable
                        onPress={() => {
                            void load();
                        }}
                        style={({ pressed }) => [
                            styles.retryButton,
                            { opacity: pressed ? 0.7 : 1 },
                        ]}
                    >
                        <ThemedText type="body1" style={styles.retryText}>
                            다시 시도
                        </ThemedText>
                    </Pressable>
                </View>
            ) : (
                <ScrollView contentContainerStyle={styles.content} style={styles.scrollView}>
                    <Section title="요약">
                        <KpiRows data={summary.data?.current.overall} />
                        <View style={styles.alerts}>
                            {summary.data?.alerts.completionRateDrop.triggered ? (
                                <ThemedText type="captionM" style={[styles.alert, { color: negativeColor }]}>
                                    완료율 경고: 전주 대비 완료율이 15%p 이상 하락했습니다.
                                </ThemedText>
                            ) : (
                                <ThemedText type="captionM" style={[styles.alert, { color: mutedColor }]}>
                                    완료율 경고: 미발생
                                </ThemedText>
                            )}
                            {summary.data?.alerts.p50CompletionIncrease.triggered ? (
                                <ThemedText type="captionM" style={[styles.alert, { color: negativeColor }]}>
                                    p50 완료시간 경고: 전주 대비 25% 이상 증가했습니다.
                                </ThemedText>
                            ) : (
                                <ThemedText type="captionM" style={[styles.alert, { color: mutedColor }]}>
                                    p50 완료시간 경고: 미발생
                                </ThemedText>
                            )}
                            {summary.data?.alerts.invalidEventRatio.triggered ? (
                                <ThemedText type="captionM" style={[styles.alert, { color: negativeColor }]}>
                                    invalid 이벤트 경고: 비율이 2%를 초과했습니다.
                                </ThemedText>
                            ) : (
                                <ThemedText type="captionM" style={[styles.alert, { color: mutedColor }]}>
                                    invalid 이벤트 경고: 미발생
                                </ThemedText>
                            )}
                        </View>
                    </Section>

                    <Section
                        title={`현재 구간 비교 (현재: ${new Date(summary.data?.currentWindow.from ?? "").toLocaleDateString()} ~ ${new Date(summary.data?.currentWindow.to ?? "").toLocaleDateString()})`}
                    >
                        <KpiRows data={summary.data?.current.overall} />
                        <ThemedText type="captionM" style={[styles.notice, { color: mutedColor }]}>
                            전주 대비: {summary.data != null ? completionDeltaLabel(summary.data) : ""}
                        </ThemedText>
                    </Section>

                    <Section title="세그먼트: device_os">
                        <SegmentTable
                            rows={summary.data?.current.segments.device_os ?? {}}
                            color={positiveColor}
                            mutedColor={mutedColor}
                        />
                    </Section>
                    <Section title="세그먼트: app_version">
                        <SegmentTable
                            rows={summary.data?.current.segments.app_version ?? {}}
                            color={positiveColor}
                            mutedColor={mutedColor}
                        />
                    </Section>
                    <Section title="세그먼트: first_time_user">
                        <SegmentTable
                            rows={summary.data?.current.segments.first_time_user ?? {}}
                            color={positiveColor}
                            mutedColor={mutedColor}
                        />
                    </Section>
                    <Section title="세그먼트: game_mode">
                        <SegmentTable
                            rows={summary.data?.current.segments.game_mode ?? {}}
                            color={positiveColor}
                            mutedColor={mutedColor}
                            borderColor={borderColor}
                        />
                    </Section>
                </ScrollView>
            )}
        </ThemedView>
    );
}

const formatMetric = (value: MetricRows[string] | null | undefined) => {
    if (value == null) return "N/A";
    if (typeof value === "number") return `${value.toFixed(2)}%`;
    return "N/A";
};

const formatSeconds = (value: number | null) => {
    if (value == null) return "N/A";
    return `${value.toFixed(2)}s`;
};

const completionDeltaLabel = (snapshot: NonNullable<Summary["data"]>) => {
    const current = snapshot.current.overall.completionRatePct;
    const previous = snapshot.previous.overall.completionRatePct;
    const delta = current - previous;
    const prefix = delta > 0 ? "+" : "";
    return `완료율: ${previous.toFixed(2)}% → ${current.toFixed(2)}% (${prefix}${delta.toFixed(2)}%)`;
};

const KpiRows = ({ data }: { data?: MetricRows }) => (
    <View style={styles.kpiRows}>
        <MetricRow label="완료율" value={formatMetric(data?.completionRatePct)} />
        <MetricRow
            label="p50 완료시간"
            value={data?.p50CompletionSec == null ? "N/A" : formatSeconds(data.p50CompletionSec)}
        />
        <MetricRow label="invalid 이벤트 비율" value={formatMetric(data?.invalidEventRatioPct)} />
        <MetricRow label="재시도율" value={formatMetric(data?.retryRatePct)} />
    </View>
);

const SegmentTable = ({
    rows,
    color,
    mutedColor,
    borderColor,
}: {
    rows: Record<string, MetricRows>;
    color: string;
    mutedColor: string;
    borderColor?: string;
}) => {
    const entries = Object.entries(rows);
    if (entries.length === 0) {
        return <ThemedText type="captionM">데이터 없음</ThemedText>;
    }

    return (
        <View style={styles.segmentList}>
            {entries.map(([name, row]) => (
                <View
                    key={name}
                    style={[styles.segmentItem, borderColor == null ? null : { borderColor }]}
                >
                    <ThemedText type="body2" style={{ color }}>
                        {name}
                    </ThemedText>
                    <View>
                        <ThemedText type="captionM" style={{ color: mutedColor }}>
                            {`완료율 ${formatMetric(row?.completionRatePct)}, p50 ${formatSeconds(row?.p50CompletionSec)}`}
                        </ThemedText>
                        <ThemedText type="captionM" style={{ color: mutedColor }}>
                            {`invalid ${formatMetric(row?.invalidEventRatioPct)} / 재시도 ${formatMetric(row?.retryRatePct)}`}
                        </ThemedText>
                    </View>
                </View>
            ))}
        </View>
    );
};

const Section = ({
    title,
    children,
}: {
    title: string;
    children: ReactNode;
}) => (
    <View style={styles.section}>
        <ThemedText type="body1" style={styles.sectionTitle}>
            {title}
        </ThemedText>
        {children}
    </View>
);

const MetricRow = ({
    label,
    value,
}: {
    label: string;
    value: string;
}) => (
    <View style={styles.metricRow}>
        <ThemedText type="captionM">{label}</ThemedText>
        <ThemedText type="body2">
            {value}
        </ThemedText>
    </View>
);

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollView: {
        flex: 1,
    },
    content: {
        padding: Padding.m,
        paddingBottom: Padding.xl,
        gap: Spacing.spacing16,
    },
    section: {
        borderWidth: 1,
        borderColor: "transparent",
        borderRadius: 14,
        padding: Spacing.spacing12,
        gap: Spacing.spacing8,
    },
    sectionTitle: {
        fontWeight: "700",
    },
    kpiRows: {
        gap: Spacing.spacing8,
    },
    metricRow: {
        paddingVertical: Spacing.spacing8,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: "transparent",
        flexDirection: "row",
        justifyContent: "space-between",
    },
    alerts: {
        gap: Spacing.spacing6,
        paddingTop: Spacing.spacing8,
    },
    alert: {
        lineHeight: 20,
    },
    notice: {
        paddingTop: Spacing.spacing8,
    },
    segmentList: {
        gap: Spacing.spacing10,
    },
    segmentItem: {
        borderWidth: 1,
        borderColor: "rgba(0,0,0,0)",
        borderRadius: 10,
        padding: Spacing.spacing10,
        gap: Spacing.spacing6,
    },
    center: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        padding: Padding.m,
    },
    empty: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        gap: Spacing.spacing12,
        padding: Padding.m,
    },
    retryButton: {
        backgroundColor: "rgba(0, 111, 255, 0.12)",
        borderWidth: 1,
        borderColor: "rgba(0, 111, 255, 0.30)",
        borderRadius: 8,
        paddingHorizontal: Spacing.spacing12,
        paddingVertical: Spacing.spacing8,
    },
    retryText: {
        color: "#0655a7",
    },
});
