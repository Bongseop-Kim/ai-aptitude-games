import { RULES } from "@/constants/nback/rule";
import { TEMPLATES } from "@/constants/nback/template";
import { SessionFeedback } from "@/types/nback/generate";
import { StageSummary } from "@/types/nback/nback";
import { Offset, Tier } from "@/types/nback/rule";
import { PerformancePattern } from "@/types/nback/template";


function pickOne(arr: string[]) {
    return arr[Math.floor(Math.random() * arr.length)];
}

function toPct01(x: number) {
    return Math.round(x * 100);
}

function msToSec1(ms: number) {
    return (ms / 1000).toFixed(1);
}

function getTierByAccuracy(acc: number): Tier {
    if (acc >= RULES.accuracyTier.excellent) return "excellent";
    if (acc >= RULES.accuracyTier.good) return "good";
    if (acc >= RULES.accuracyTier.ok) return "ok";
    return "weak";
}

function getWeightedAccuracy(stages: StageSummary[]) {
    const total = stages.reduce((s, x) => s + x.totalQuestions, 0);
    const correct = stages.reduce((s, x) => s + x.correctCount, 0);
    return {
        total,
        correct,
        accuracy: total ? correct / total : 0,
    };
}

function getWeightedAvgRtMs(stages: StageSummary[]) {
    const total = stages.reduce((s, x) => s + x.totalQuestions, 0);
    const weighted = stages.reduce((s, x) => s + (x.avgRtMs ?? 0) * x.totalQuestions, 0);
    return total ? Math.round(weighted / total) : 0;
}

function parseOffsetKey(k: string): Offset | undefined {
    const n = Number(k);
    if (n === 0 || n === 1 || n === 2 || n === 3) return n;
    return undefined;
}

function aggregatePerOffset(stages: StageSummary[]) {
    const map = new Map<Offset, { total: number; correct: number; rtSum: number }>();

    for (const st of stages) {
        for (const [k, v] of Object.entries(st.perOffset ?? {})) {
            const off = parseOffsetKey(k);
            if (off === undefined || v == null) continue;

            const cur = map.get(off) ?? { total: 0, correct: 0, rtSum: 0 };
            cur.total += v.total;
            cur.correct += v.correct;
            cur.rtSum += (v.avgRtMs ?? 0) * v.total; // total 가중
            map.set(off, cur);
        }
    }

    const result = Array.from(map.entries()).map(([offset, v]) => ({
        offset,
        total: v.total,
        correct: v.correct,
        accuracy: v.total ? v.correct / v.total : 0,
        avgRtMs: v.total ? Math.round(v.rtSum / v.total) : 0,
    }));

    // total 큰 순 → 안정적으로 판단
    result.sort((a, b) => b.total - a.total);
    return result;
}

function chooseBestOffset(buckets: ReturnType<typeof aggregatePerOffset>) {
    const candidates = buckets.filter((b) => b.total >= RULES.minQuestionsPerBucket);
    if (!candidates.length) return undefined;
    // 정확도 우선, 동률이면 total 우선
    candidates.sort((a, b) => b.accuracy - a.accuracy || b.total - a.total);
    return candidates[0].offset;
}

function chooseWeakOffset(buckets: ReturnType<typeof aggregatePerOffset>) {
    const candidates = buckets.filter((b) => b.total >= RULES.minQuestionsPerBucket);
    if (!candidates.length) return undefined;
    // 어려운 오프셋(3) 우선 노출: 존재하고 낮으면 그걸 선택
    const off3 = candidates.find((c) => c.offset === RULES.hardOffset);
    if (off3) return off3.offset;

    // 아니면 가장 낮은 정확도
    candidates.sort((a, b) => a.accuracy - b.accuracy || b.total - a.total);
    return candidates[0].offset;
}

function detectPerformancePattern(stages: StageSummary[]): PerformancePattern {
    if (stages.length < 2) return "stable";

    const accuracies = stages.map((s) => s.accuracy);
    const firstHalf = accuracies.slice(0, Math.floor(accuracies.length / 2));
    const secondHalf = accuracies.slice(Math.floor(accuracies.length / 2));

    const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
    const diff = secondAvg - firstAvg;

    // 초반 좋고 후반 나쁨 (0.15 이상 차이)
    if (diff < -0.15) return "performanceDecline";

    // 초반 나쁘고 후반 좋음 (0.15 이상 차이)
    if (diff > 0.15) return "performanceImprovement";

    // 한 스테이지에서 크게 실패 (평균 대비 0.3 이상 낮음)
    const overallAvg = accuracies.reduce((a, b) => a + b, 0) / accuracies.length;
    const hasSingleFailure = accuracies.some((acc) => acc < overallAvg - 0.3);
    if (hasSingleFailure) return "singleStageFailure";

    // 일관성 없음 (표준편차가 큼)
    const variance = accuracies.reduce((sum, acc) => sum + Math.pow(acc - overallAvg, 2), 0) / accuracies.length;
    const stdDev = Math.sqrt(variance);
    if (stdDev > 0.2) return "inconsistent";

    return "stable";
}

function fill(template: string, vars: Record<string, string | number>) {
    return template.replace(/\{(\w+)\}/g, (_, key) => String(vars[key] ?? ""));
}

export function generateSessionFeedback(stages: StageSummary[]): SessionFeedback {
    const { total, correct, accuracy } = getWeightedAccuracy(stages);
    const avgRtMs = getWeightedAvgRtMs(stages);
    const overallTier = getTierByAccuracy(accuracy);
    const hasNoResponse = avgRtMs === 0; // 무응답 케이스 감지

    const perOffset = aggregatePerOffset(stages);
    const bestOffset = chooseBestOffset(perOffset);
    const weakOffset = chooseWeakOffset(perOffset);
    const pattern = detectPerformancePattern(stages);

    // 패턴 기반 headline 우선, 없으면 tier 기반
    const headline = TEMPLATES.headline.byPattern?.[pattern]?.length
        ? pickOne(TEMPLATES.headline.byPattern[pattern]!)
        : pickOne(TEMPLATES.headline.byTier![overallTier]);

    const vars = {
        total,
        correct,
        accuracyPct: toPct01(accuracy),
        avgRtSec: msToSec1(avgRtMs),
    };

    // 무응답인 경우 noResponse 템플릿 사용, 아니면 generic 사용
    const summaryTemplate = hasNoResponse
        ? (TEMPLATES.summary.noResponse ?? TEMPLATES.summary.generic ?? [])
        : (TEMPLATES.summary.generic ?? []);
    const summaryLines = summaryTemplate.map((t: string) => fill(t, vars));

    const highlights: string[] = [];

    // 무응답인 경우 weakness에 noResponse 메시지 추가
    if (hasNoResponse && TEMPLATES.weakness.noResponse?.length) {
        highlights.push(pickOne(TEMPLATES.weakness.noResponse));
    } else {
        // 패턴 기반 strength 우선
        if (TEMPLATES.strength.byPattern?.[pattern]?.length) {
            highlights.push(pickOne(TEMPLATES.strength.byPattern[pattern]!));
        } else if (bestOffset != null && TEMPLATES.strength.byOffset?.[bestOffset]?.length) {
            highlights.push(pickOne(TEMPLATES.strength.byOffset[bestOffset]!));
        } else if (TEMPLATES.strength.generic?.length) {
            highlights.push(pickOne(TEMPLATES.strength.generic));
        }

        // 패턴 기반 weakness 우선
        if (TEMPLATES.weakness.byPattern?.[pattern]?.length) {
            highlights.push(pickOne(TEMPLATES.weakness.byPattern[pattern]!));
        } else if (weakOffset != null && TEMPLATES.weakness.byOffset?.[weakOffset]?.length) {
            highlights.push(pickOne(TEMPLATES.weakness.byOffset[weakOffset]!));
        } else if (TEMPLATES.weakness.generic?.length) {
            highlights.push(pickOne(TEMPLATES.weakness.generic));
        }
    }

    // 패턴 기반 tip 우선, 무응답인 경우 noResponse tip 사용, 아니면 generic 사용
    const tipTemplate = hasNoResponse
        ? (TEMPLATES.tip.noResponse ?? TEMPLATES.tip.generic ?? ["지금 단계에서 한 번 더 연습해보세요"])
        : (TEMPLATES.tip.byPattern?.[pattern]?.length
            ? TEMPLATES.tip.byPattern[pattern]!
            : (TEMPLATES.tip.generic ?? ["지금 단계에서 한 번 더 연습해보세요"]));
    const tip = pickOne(tipTemplate);

    return {
        headline,
        summaryLines,
        highlights,
        tip,
        debug: { overallTier, avgRtMs, bestOffset, weakOffset, pattern },
    };
}