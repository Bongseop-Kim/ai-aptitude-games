import { games } from '../games';
import { GENERIC_QUESTION_BANK } from '../interview/genericQuestionBank';
import { buildPressureRecoveryCurve, resolvePressureRecoverySummary } from '../../domain/reportResilience';
import type {
  MockExamReport,
  ReportBand,
  ReportCompetencyScore,
  ReportGameInsight,
  ReportGrowthArea,
  ReportHighlight,
  ReportInterviewAxis,
  ReportInterviewQuestion,
} from '../../domain/report';

// Dev-only deterministic dummy report builder. All values are derived from the
// numeric inputs (no Math.random, no Date) so seeded reports render every report
// section with plausible, chart-compatible numbers.
//
// Value ranges (verified against the renderers):
//   - All scores / percentiles / peer values are 0..100.
//   - Resilience curve values are 0..100.
//   - Response-pattern scale values are 0..100, where 50 is the neutral center.
//   - Interview band uses the Korean BAND_STEPS labels, not the English ReportBand.

type BuildDummyReportInput = {
  score: number;
  perGameScores: Record<string, number>;
  perGameDifficulties?: Record<string, number>;
  interviewScore: number;
};

const COMPETENCY_KEYS: ReportCompetencyScore['key'][] = [
  'trust',
  'strategy',
  'relationship',
  'value',
  'fit',
];

const COMPETENCY_NOTES: Record<ReportCompetencyScore['key'], string> = {
  trust: '일관된 선택으로 신뢰감을 안정적으로 전달했어요.',
  strategy: '제한된 자원 속에서도 합리적인 우선순위를 잡았어요.',
  relationship: '협업 신호를 빠르게 읽고 부드럽게 조율했어요.',
  value: '본인의 기준을 분명히 드러내며 답했어요.',
  fit: '조직의 결과 지향 문화와 잘 맞는 태도를 보였어요.',
};

const COMPETENCY_OFFSETS: Record<ReportCompetencyScore['key'], number> = {
  trust: 4,
  strategy: -3,
  relationship: 2,
  value: -5,
  fit: 6,
};

const GAME_INSIGHTS: Record<string, string> = {
  rps: '습관적 반응을 잘 억눌렀지만 후반 속도에서 흔들렸어요.',
  rotate: '머릿속 회전이 빠르고 정확했어요.',
  promise: '단서를 통합해 가능성을 효율적으로 좁혔어요.',
  potion: '숨은 규칙을 비교적 빠르게 찾아냈어요.',
  path: '충돌 없는 경로 설계에서 안정적인 계획력을 보였어요.',
  numbers: '역순 입력에서 작업기억 용량이 잘 드러났어요.',
  memory: '갱신해야 할 정보를 놓치지 않고 유지했어요.',
  cat: '확신과 실제 정답의 간극이 작아 메타인지가 좋았어요.',
  compare: '크기 착시에 흔들리지 않고 개수를 빠르게 비교했어요.',
};

const RESPONSE_SCALES: { key: string; left: string; right: string; offset: number }[] = [
  { key: 'pace', left: '신중', right: '민첩', offset: 12 },
  { key: 'risk', left: '안정 지향', right: '도전 지향', offset: -8 },
  { key: 'focus', left: '폭넓게', right: '깊게', offset: 6 },
  { key: 'social', left: '독립', right: '협업', offset: -4 },
];

const INTERVIEW_AXIS_KEYS: ReportInterviewAxis['key'][] = [
  'content',
  'star',
  'voice',
  'gaze',
  'delivery',
];

const INTERVIEW_AXIS_OFFSETS: Record<ReportInterviewAxis['key'], number> = {
  content: 5,
  star: -6,
  voice: 3,
  gaze: -2,
  delivery: 4,
};

const QUESTION_FEEDBACK: { good: string; fix: string; why: string } = {
  good: '핵심을 먼저 제시하고 사례로 뒷받침한 흐름이 좋았어요.',
  fix: '결론 이후 구체적인 수치나 결과를 한 문장 더 덧붙이면 설득력이 올라가요.',
  why: '상황 대처와 직무 적합성을 함께 확인하기 위한 질문이에요.',
};

const NCS_UNITS: { label: string; basis: string; offset: number }[] = [
  { label: '문제해결능력', basis: '상황을 구조화하고 대안을 고른 답변 흐름을 봤어요.', offset: 4 },
  { label: '의사소통능력', basis: '핵심을 먼저 말하고 근거를 이어 가는 방식을 봤어요.', offset: -3 },
  { label: '대인관계능력', basis: '협업 상황에서 상대와 조율하는 태도를 봤어요.', offset: 1 },
  { label: '자기관리능력', basis: '목표와 우선순위를 유지하는 답변 흐름을 봤어요.', offset: -2 },
];

function clampScore(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function bandForScore(score: number): ReportBand {
  if (score < 40) return 'poor';
  if (score < 60) return 'fair';
  if (score < 80) return 'good';
  return 'excellent';
}

// Interview band labels match BAND_STEPS in InterviewAnalysisBody, not ReportBand.
function interviewBandLabel(score: number) {
  if (score < 40) return '부족';
  if (score < 60) return '필요';
  if (score < 80) return '우수';
  return '완성';
}

// Maps a 0..100 score to a 30..95 percentile (top-N% style: higher score → lower
// number). Overall and competency "상위 N%" copy both read this scale.
function percentileForScore(score: number) {
  return clampScore(95 - (score / 100) * 65);
}

function buildHighlight(gameId: string, score: number): ReportHighlight {
  const game = games.find((item) => item.id === gameId);
  return {
    game_id: gameId,
    skill: game?.skill ?? gameId,
    score,
    note: GAME_INSIGHTS[gameId] ?? '안정적인 수행을 보였어요.',
  };
}

function buildGrowthArea(gameId: string, score: number): ReportGrowthArea {
  return {
    ...buildHighlight(gameId, score),
    action: { game_id: gameId, level_label: '레벨 2', minutes: 5 },
  };
}

function buildGameInsight(gameId: string, score: number): ReportGameInsight {
  return {
    game_id: gameId,
    insight: GAME_INSIGHTS[gameId] ?? '안정적인 수행을 보였어요.',
    percentile: percentileForScore(score),
    peer_median: clampScore(score - 6),
  };
}

function buildQuestion(index: number, baseScore: number): ReportInterviewQuestion {
  const prompt = GENERIC_QUESTION_BANK.it[index];
  const wobble = ((index % 3) - 1) * 4;
  const axisScore = clampScore(baseScore + wobble);
  return {
    question_id: prompt.id,
    category: prompt.category,
    text: prompt.text,
    scores: {
      content: clampScore(axisScore + 2),
      star: clampScore(axisScore - 5),
      voice: clampScore(axisScore + 1),
      gaze: clampScore(axisScore - 2),
      delivery: clampScore(axisScore + 3),
    },
    transcript:
      '저는 사용자 경험을 중심에 두고 문제를 정의한 뒤, 데이터를 근거로 우선순위를 정해 해결했습니다.',
    good: QUESTION_FEEDBACK.good,
    fix: QUESTION_FEEDBACK.fix,
    why: QUESTION_FEEDBACK.why,
  };
}

export function buildDummyReport(input: BuildDummyReportInput): MockExamReport {
  const score = clampScore(input.score);
  const interviewScore = clampScore(input.interviewScore);

  const rankedGames = games
    .map((game) => ({ id: game.id, score: clampScore(input.perGameScores[game.id] ?? score) }))
    .sort((a, b) => b.score - a.score);
  const strongest = rankedGames.slice(0, 3);
  const weakest = [...rankedGames].reverse().slice(0, 3);

  const competencies: ReportCompetencyScore[] = COMPETENCY_KEYS.map((key) => {
    const competencyScore = clampScore(score + COMPETENCY_OFFSETS[key]);
    return {
      key,
      score: competencyScore,
      score_range: [clampScore(competencyScore - 4), clampScore(competencyScore + 4)],
      percentile: percentileForScore(competencyScore),
      peer_median: clampScore(competencyScore - 6),
      note: COMPETENCY_NOTES[key],
    };
  });

  const gameInsights = games.map((game) =>
    buildGameInsight(game.id, clampScore(input.perGameScores[game.id] ?? score)),
  );
  const resilienceCurve = buildPressureRecoveryCurve(
    games.map((game, index) => ({
      gameId: game.id,
      actualScore: clampScore(input.perGameScores[game.id] ?? score),
      difficulty: input.perGameDifficulties?.[game.id] ?? clampScore(44 + ((index * 9) % 34)),
    })),
  );
  const resilienceSummary = resolvePressureRecoverySummary(resilienceCurve);
  const eventGame = games.find((game) => game.id === resilienceSummary.event?.game_id);

  const interviewAxes: ReportInterviewAxis[] = INTERVIEW_AXIS_KEYS.map((key) => {
    const axisScore = clampScore(interviewScore + INTERVIEW_AXIS_OFFSETS[key]);
    return {
      key,
      score: axisScore,
      peer_avg: clampScore(axisScore - 7),
    };
  });

  return {
    overall: {
      score,
      score_range: [clampScore(score - 5), clampScore(score + 5)],
      band: bandForScore(score),
      summary:
        '9개 게임과 면접을 종합한 결과, 전반적으로 균형 잡힌 역량을 보였어요. 강점을 살리고 보완 영역을 집중 훈련하면 다음 회차에서 더 높은 점수를 기대할 수 있어요.',
      percentile: percentileForScore(score),
      cohort: { n: 1284, label: '동일 직군 지원자' },
    },
    competencies,
    games: gameInsights,
    highlights: {
      strengths: strongest.map((item) => buildHighlight(item.id, item.score)),
      growth_areas: weakest.map((item) => buildGrowthArea(item.id, item.score)),
    },
    resilience: {
      curve: resilienceCurve,
      insights: [
        {
          tone: resilienceSummary.impact === 'continued' ? 'warning' : 'positive',
          label: '강점',
          title: resilienceSummary.event ? '압박 직후 영향 확인' : '큰 압박 구간 없음',
          body: resilienceSummary.event
            ? `${eventGame?.name ?? '해당 게임'} 이후 다음 게임의 예상 대비 차이를 확인했어요.`
            : '이번 회차에서는 예상보다 크게 흔들린 게임이 뚜렷하지 않았어요.',
        },
        {
          tone: 'warning',
          label: '주의',
          title: '난도와 점수 차이',
          body: '출제 난도와 예상 점수를 함께 보고, 단순 낮은 점수와 압박 이후 흔들림을 구분했어요.',
        },
      ],
    },
    response_pattern: {
      scales: RESPONSE_SCALES.map((scale) => ({
        key: scale.key,
        left: scale.left,
        right: scale.right,
        value: clampScore(50 + scale.offset),
      })),
    },
    coach: {
      insight: {
        title: '2주 집중 플랜으로 보완 영역을 끌어올려요',
        body: '가장 약한 영역부터 짧게 반복하면 점수 상승 폭이 가장 커요. 하루 10분이면 충분해요.',
      },
      plan: [
        { day_range: '1–3일', game_id: weakest[0]?.id ?? games[0].id, level_label: '레벨 2', minutes_per_day: 5 },
        { day_range: '4–7일', game_id: weakest[1]?.id ?? games[1].id, level_label: '레벨 2', minutes_per_day: 7 },
        { day_range: '8–11일', game_id: weakest[2]?.id ?? games[2].id, level_label: '레벨 3', minutes_per_day: 7 },
        { day_range: '12–14일', game_id: 'mock-exam', level_label: '전체 점검', minutes_per_day: 10 },
      ],
    },
    interview: {
      status: 'done',
      overall_score: interviewScore,
      band: interviewBandLabel(interviewScore),
      axes: interviewAxes,
      ncs_units: NCS_UNITS.map((unit) => ({
        label: unit.label,
        basis: unit.basis,
        score: clampScore(interviewScore + unit.offset),
      })),
      top_fixes: [
        {
          axis: 'star',
          title: 'STAR 구조를 한 문장으로 마무리하세요',
          body: '상황·과제·행동까지는 좋았지만 결과를 수치로 마무리하면 설득력이 올라가요.',
          pro: false,
        },
        {
          axis: 'gaze',
          title: '카메라 정면 응시 비율을 높이세요',
          body: '답변 중 시선이 아래로 향하는 구간이 있어요. 핵심 문장에서는 정면을 바라보세요.',
          pro: true,
        },
        {
          axis: 'delivery',
          title: '문장 끝 속도를 일정하게 유지하세요',
          body: '문장 끝에서 속도가 빨라지는 경향이 있어요. 마지막 단어까지 또렷하게 전달해 보세요.',
          pro: true,
        },
      ],
      questions: Array.from({ length: 8 }, (_, index) => buildQuestion(index, interviewScore)),
      delivery_details: [
        { label: '말 속도', value: clampScore(interviewScore + 2) },
        { label: '발음 명료도', value: clampScore(interviewScore - 1) },
        { label: '시선 안정', value: clampScore(interviewScore - 4) },
      ],
    },
  };
}
