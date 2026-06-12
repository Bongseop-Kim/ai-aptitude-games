import type { BadgeTone, IconName } from '../shared/types';

export type InterviewStepKey = 'resume' | 'job' | 'analysis' | 'record' | 'feedback' | 'retry';

export type InterviewAxisKey = 'content' | 'star' | 'voice' | 'gaze' | 'delivery';

export type InterviewAxis = {
  key: InterviewAxisKey;
  name: string;
  sub: string;
  icon: IconName;
  tone: BadgeTone;
  pro: boolean;
};

export const INTERVIEW_STEPS: readonly {
  key: InterviewStepKey;
  n: number;
  label: string;
  icon: IconName;
}[] = [
  { key: 'resume', n: 1, label: '이력서', icon: 'FileText' },
  { key: 'job', n: 2, label: '채용공고', icon: 'Building2' },
  { key: 'analysis', n: 3, label: 'AI 분석', icon: 'Sparkles' },
  { key: 'record', n: 4, label: '모의 면접', icon: 'Video' },
  { key: 'feedback', n: 5, label: '피드백', icon: 'ChartNoAxesColumnIncreasing' },
  { key: 'retry', n: 6, label: '재도전', icon: 'RotateCcw' },
];

export const INTERVIEW_AXES: readonly InterviewAxis[] = [
  { key: 'content', name: '내용', sub: '충실도·관련성', icon: 'Lightbulb', tone: 'brand', pro: false },
  { key: 'star', name: '내용 구조', sub: 'STAR 흐름', icon: 'Timeline', tone: 'informative', pro: false },
  { key: 'voice', name: '음성', sub: '속도·떨림·발음', icon: 'AudioLines', tone: 'neutral', pro: false },
  { key: 'gaze', name: '시선', sub: '카메라 아이컨택', icon: 'Eye', tone: 'warning', pro: true },
  { key: 'delivery', name: '전달력', sub: '표정·자세·제스처', icon: 'Smile', tone: 'critical', pro: true },
];

export const QUESTION_CATEGORY_TONE: Record<string, BadgeTone> = {
  오프닝: 'brand',
  '지원 동기': 'neutral',
  경험: 'informative',
  관계: 'critical',
  직무: 'informative',
  인성: 'warning',
  가치: 'neutral',
};

export const STAR_GUIDE = [
  { key: 'S', label: '상황', hint: '언제·어디서' },
  { key: 'T', label: '과제', hint: '무엇이 문제' },
  { key: 'A', label: '행동', hint: '내가 한 일' },
  { key: 'R', label: '결과', hint: '수치·배움' },
] as const;

export const ANALYSIS_LOADING_STEPS = [
  '이력서 핵심 역량 추출',
  '채용공고 요건 파싱',
  '역량 ↔ 요건 매칭',
  '약점·갭 식별',
  '맞춤 질문 8개 생성',
] as const;

export const mockResume = {
  name: '김준비',
  role: '프론트엔드 엔지니어',
  years: '경력 3년',
  file: '김준비_이력서_2026.pdf',
  skills: ['React', 'TypeScript', 'Next.js', '디자인 시스템', 'Jest', 'GraphQL'],
  highlights: [
    '커머스 웹 프론트엔드 리드 (MAU 80만)',
    '사내 디자인 시스템 0→1 구축',
    'LCP 4.1s → 1.8s 성능 개선',
  ],
};

export const mockJobPosting = {
  company: '리플로우',
  role: '프론트엔드 엔지니어 (Senior)',
  type: '정규직 · 서울 성수',
  source: 'reflow.team/careers/fe-senior',
  must: ['React · TypeScript 3년+', '디자인 시스템 설계/운영', '웹 성능 최적화', '협업·코드리뷰 문화'],
  nice: ['Next.js App Router', '디자인-엔지니어링 협업', '오픈소스 기여'],
};

export const mockMatch = {
  score: 78,
  matched: [
    { key: 'React · TypeScript', note: '3년 실무 — 요건 충족', hit: true },
    { key: '디자인 시스템', note: '0→1 구축 경험 — 강한 매칭', hit: true },
    { key: '웹 성능 최적화', note: 'LCP 56% 개선 사례', hit: true },
    { key: 'Next.js App Router', note: '경험 명시 없음 — 보완 권장', hit: false },
    { key: '리더십·코드리뷰', note: '리드 경험 있으나 근거 약함', hit: false },
  ],
};

export function matchLabel(score: number) {
  if (score >= 80) return '아주 강한 매칭';
  if (score >= 70) return '강한 매칭';
  if (score >= 55) return '보통 매칭';
  return '보완 필요';
}
