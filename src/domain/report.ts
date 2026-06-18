export type JobFamily = 'it' | 'biz' | 'mkt' | 'design' | 'fin' | 'etc';

export type QuestionMaterial = {
  question_id: string;
  category: string;
  text: string;
  why?: string;
};

// ─── Report JSONB types ───────────────────────────────────────────────────────
// Field names are snake_case — the report JSONB payload is consumed as-is from
// the server and never re-serialized by the app.

export type ReportBand = 'poor' | 'fair' | 'good' | 'excellent';

export type ReportOverall = {
  score: number;
  score_range: [number, number];
  band: ReportBand;
  summary: string;
  percentile: number | null;
  cohort: { n: number; label: string } | null;
};

export type ReportCompetencyScore = {
  key: 'trust' | 'strategy' | 'relationship' | 'value' | 'fit';
  score: number;
  score_range: [number, number];
  percentile: number | null;
  peer_median: number | null;
  note: string;
};

export type ReportGameInsight = {
  game_id: string;
  insight: string | null;
  percentile: number | null;
  peer_median?: number | null;
};

export type ReportHighlightAction = {
  game_id: string;
  level_label: string;
  minutes: number;
};

export type ReportHighlight = {
  game_id: string;
  skill: string;
  score: number;
  note: string;
};

export type ReportGrowthArea = ReportHighlight & {
  action: ReportHighlightAction;
};

export type ReportHighlights = {
  strengths: ReportHighlight[];
  growth_areas: ReportGrowthArea[];
};

export type ReportResilienceCurvePoint = {
  game_id: string;
  segment: number;
  value: number;
  actual_score?: number;
  difficulty?: number;
  difficulty_jump?: number;
  expected_score?: number;
  is_pressure_event?: boolean;
  next_game_gap?: number | null;
  score_gap?: number;
};

export type ReportResilienceInsight = {
  tone: string;
  label: string;
  title: string;
  body: string;
};

export type ReportResilience = {
  curve: ReportResilienceCurvePoint[];
  insights: ReportResilienceInsight[];
} | null;

export type ReportResponsePatternScale = {
  key: string;
  left: string;
  right: string;
  value: number;
};

export type ReportResponsePattern = {
  scales: ReportResponsePatternScale[];
} | null;

export type ReportCoachInsight = {
  title: string;
  body: string;
};

export type ReportCoachPlanItem = {
  day_range: string;
  game_id: string;
  level_label: string;
  minutes_per_day: number;
};

export type ReportCoach = {
  insight: ReportCoachInsight;
  plan: ReportCoachPlanItem[];
};

export type ReportInterviewAxis = {
  key: 'content' | 'star' | 'voice' | 'gaze' | 'delivery';
  score: number;
  peer_avg: number | null;
};

export type ReportNcsUnit = {
  label: string;
  score: number;
  basis?: string;
};

export type ReportTopFix = {
  axis: string;
  title: string;
  body: string;
  pro: boolean;
};

export type ReportInterviewQuestion = {
  question_id: string;
  category: string;
  text: string;
  scores: {
    content: number | null;
    star: number | null;
    voice: number | null;
    gaze: number | null;
    delivery: number | null;
  } | null;
  transcript: string | null;
  good: string | null;
  fix: string | null;
  why: string | null;
};

export type ReportDeliveryDetail = {
  label: string;
  value: number;
};

export type ReportInterview = {
  status: 'pending' | 'done' | 'failed';
  overall_score: number;
  band: string;
  axes: ReportInterviewAxis[];
  ncs_units: ReportNcsUnit[];
  top_fixes: ReportTopFix[];
  questions: ReportInterviewQuestion[];
  delivery_details: ReportDeliveryDetail[] | null;
};

export type MockExamReport = {
  overall: ReportOverall;
  competencies: ReportCompetencyScore[];
  games: ReportGameInsight[];
  highlights: ReportHighlights;
  resilience: ReportResilience;
  response_pattern: ReportResponsePattern;
  coach: ReportCoach;
  interview: ReportInterview;
};

// ─── Server row (camelCase at query boundary) ─────────────────────────────────

export type MockExamReportRow = {
  mockExamId: string;
  userId: string;
  status: 'processing' | 'done' | 'failed';
  reportVersion: number;
  report: MockExamReport | null;
  error: string | null;
  analyzedAt: string | null;
  createdAt: string;
};
