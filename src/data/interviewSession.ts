import type { InterviewAxisKey } from './interviewFlow';

export type InterviewQuestion = {
  id: number;
  cat: string;
  text: string;
  limit: number;
  scores: Record<InterviewAxisKey, number>;
  dur: string;
  transcript: string;
  good: string;
  fix: string;
  why: string;
};

export const interviewQuestions: readonly InterviewQuestion[] = [
  {
    id: 1,
    cat: '오프닝',
    text: '1분 안에 자기소개를 부탁드려요.',
    limit: 60,
    scores: { content: 78, star: 60, voice: 86, gaze: 74, delivery: 82 },
    dur: '0:52',
    transcript: '안녕하세요. 3년 차 프론트엔드 엔지니어 김준비입니다. 커머스 웹을 맡아 MAU 80만 서비스를 운영했고, 사내 디자인 시스템을 처음부터 구축한 경험이 있습니다…',
    good: '말 속도가 안정적이고, 핵심 경력을 앞에 배치해 첫인상이 또렷했어요.',
    fix: '강점을 지원 직무 요건과 한 문장으로 연결하면 설득력이 올라가요.',
    why: '면접 도입 — 첫인상과 전달력 확인',
  },
  {
    id: 2,
    cat: '지원 동기',
    text: '리플로우에 지원하신 이유가 궁금해요.',
    limit: 90,
    scores: { content: 72, star: 55, voice: 80, gaze: 66, delivery: 70 },
    dur: '1:08',
    transcript: '디자인 시스템을 제품의 핵심으로 삼는 점에 끌렸습니다. 제가 0→1로 만든 경험과 방향이 맞다고…',
    good: '회사의 가치와 본인 경험을 연결한 점이 좋았어요.',
    fix: '"끌렸다" 같은 표현보다 구체적 사례 한 가지를 들면 진정성이 커져요.',
    why: '컬처핏 — 회사 가치와 지원 동기 정합성',
  },
  {
    id: 3,
    cat: '경험',
    text: '가장 도전적이었던 프로젝트와 본인의 역할을 말씀해 주세요.',
    limit: 120,
    scores: { content: 84, star: 80, voice: 78, gaze: 72, delivery: 76 },
    dur: '1:46',
    transcript: '레거시 결제 페이지의 LCP가 4.1초였는데, 번들 분석과 이미지 전략을 바꿔 1.8초까지 줄였습니다. 제가 측정·가설·실험을 주도했고…',
    good: '상황-행동-결과가 분명하고 수치로 임팩트를 증명했어요. STAR가 잘 잡혔어요.',
    fix: '"과제(Task)"에서 왜 어려웠는지 제약을 한 줄 더하면 완벽해요.',
    why: '핵심 경험 — LCP 개선 사례를 STAR로 검증',
  },
  {
    id: 4,
    cat: '관계',
    text: '팀 내 의견 충돌을 해결한 경험이 있나요?',
    limit: 120,
    scores: { content: 70, star: 58, voice: 74, gaze: 62, delivery: 64 },
    dur: '1:22',
    transcript: '디자이너와 컴포넌트 추상화 범위로 부딪혔습니다. 서로의 우선순위를 정리한 표를 만들어…',
    good: '갈등을 회피하지 않고 구조적으로 접근한 점이 인상적이에요.',
    fix: '결과(Result)가 약해요 — 합의 이후 무엇이 좋아졌는지 마무리가 필요해요.',
    why: '협업 — 디자이너와의 갈등 조율 능력',
  },
  {
    id: 5,
    cat: '직무',
    text: '디자인 시스템을 구축할 때 가장 중요하게 본 것은?',
    limit: 120,
    scores: { content: 82, star: 66, voice: 80, gaze: 70, delivery: 74 },
    dur: '1:34',
    transcript: '토큰 계층과 채택률이었습니다. 아무리 잘 만들어도 쓰지 않으면 의미가 없어서, 마이그레이션 도구와 문서를…',
    good: '직무 깊이가 느껴지는 답변이에요. 우선순위 판단이 명확했어요.',
    fix: '전문 용어가 연달아 나와요. 한 번은 쉬운 말로 풀어주면 전달력이 좋아져요.',
    why: '직무 깊이 — 디자인 시스템 설계 요건 대조',
  },
  {
    id: 6,
    cat: '직무',
    text: '성능 최적화에서 트레이드오프를 어떻게 판단했나요?',
    limit: 120,
    scores: { content: 76, star: 64, voice: 72, gaze: 58, delivery: 66 },
    dur: '1:18',
    transcript: '초기 로딩과 상호작용 지연 사이에서 사용자 여정을 기준으로…',
    good: '판단 기준을 "사용자 여정"으로 둔 점이 설득력 있었어요.',
    fix: '시선이 자주 아래로 향했어요. 카메라를 기준점으로 삼아 보세요.',
    why: '직무 — 성능 트레이드오프 판단력',
  },
  {
    id: 7,
    cat: '인성',
    text: '실패했던 경험과 그로부터 배운 점을 말씀해 주세요.',
    limit: 120,
    scores: { content: 68, star: 54, voice: 76, gaze: 64, delivery: 68 },
    dur: '1:05',
    transcript: '급하게 배포한 기능에서 장애가 났습니다. 롤백 후 회고를 진행했고…',
    good: '실패를 솔직하게 인정한 태도가 좋았어요.',
    fix: '"배운 점"이 추상적이에요. 이후 바꾼 습관을 구체적으로 들어주세요.',
    why: '인성 — 실패 회복력과 학습 태도',
  },
  {
    id: 8,
    cat: '가치',
    text: '5년 후 어떤 엔지니어가 되고 싶나요?',
    limit: 90,
    scores: { content: 74, star: 56, voice: 82, gaze: 72, delivery: 78 },
    dur: '0:58',
    transcript: '제품의 문제를 정의하는 엔지니어가 되고 싶습니다. 기술은 수단이고…',
    good: '가치관이 분명하고 표현이 깔끔했어요.',
    fix: '회사에서의 구체적 기여로 연결하면 면접관이 그림을 그리기 쉬워요.',
    why: '가치 — 장기 동기와 성장 방향',
  },
];

export const interviewTopFixes = [
  {
    axis: 'star' as const,
    title: '결과(Result)로 마무리하기',
    body: '답변 4개에서 결과가 빠졌어요. "그래서 무엇이 좋아졌는지"를 수치로 닫아주세요.',
  },
  {
    axis: 'gaze' as const,
    title: '카메라를 기준점으로',
    body: '시선이 자주 아래로 향했어요. 렌즈를 사람 눈이라 생각하고 70% 이상 유지해 보세요.',
    pro: true,
  },
  {
    axis: 'content' as const,
    title: '전문 용어 한 번씩 풀기',
    body: '용어가 연달아 나올 때 쉬운 말로 한 번 풀어주면 전달력이 올라가요.',
  },
];

export const peerAxisScores: Record<InterviewAxisKey, number> = {
  content: 70,
  star: 63,
  voice: 76,
  gaze: 67,
  delivery: 71,
};

export const deliveryDetails = [
  { label: '표정 안정', value: 78 },
  { label: '자세 일관성', value: 71 },
  { label: '제스처', value: 64 },
  { label: '말 속도', value: 82 },
] as const;

export const ncsUnitScores = [
  { label: '요구사항 확인', score: 82 },
  { label: '화면 구현', score: 78 },
  { label: '기능 구현', score: 75 },
  { label: '통합 구현', score: 71 },
  { label: '테스트', score: 68 },
] as const;

export function getAxisAverages(questions = interviewQuestions) {
  const sums: Record<InterviewAxisKey, number> = {
    content: 0,
    star: 0,
    voice: 0,
    gaze: 0,
    delivery: 0,
  };
  const axisKeys = Object.keys(sums) as InterviewAxisKey[];
  questions.forEach((question) => {
    axisKeys.forEach((key) => {
      sums[key] += question.scores[key];
    });
  });

  return axisKeys.reduce<Record<InterviewAxisKey, number>>((result, key) => {
    result[key] = Math.round(sums[key] / questions.length);
    return result;
  }, { content: 0, star: 0, voice: 0, gaze: 0, delivery: 0 });
}

export function getQuestionOverall(question: InterviewQuestion) {
  const scores = Object.values(question.scores);
  return Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length);
}

export function getOverallInterviewScore() {
  const averages = getAxisAverages();
  const scores = Object.values(averages);
  return Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length);
}

export function getWeakInterviewQuestions() {
  return interviewQuestions
    .toSorted((left, right) => (
      left.scores.star + left.scores.content - (right.scores.star + right.scores.content)
    ))
    .slice(0, 3);
}
