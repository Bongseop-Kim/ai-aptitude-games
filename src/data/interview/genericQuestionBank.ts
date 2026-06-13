import type { JobFamily } from '../../domain/report';

// Categories must match QUESTION_CATEGORY_TONE keys from src/data/interviewFlow.ts:
// '오프닝' | '지원 동기' | '경험' | '관계' | '직무' | '인성' | '가치'

export type InterviewPromptQuestion = {
  id: string;
  category: string;
  text: string;
  limitSeconds: number;
  hint?: string;
  source: 'generic' | 'job_posting' | 'resume';
};

// ─── Shared questions (used across all families) ──────────────────────────────

const SHARED_OPENING: InterviewPromptQuestion = {
  id: 'generic-shared-opening',
  category: '오프닝',
  text: '1분 안에 자기소개를 부탁드려요.',
  limitSeconds: 60,
  hint: '이름·경험·강점을 간결하게 전달해 보세요.',
  source: 'generic',
};

const SHARED_MOTIVATION: InterviewPromptQuestion = {
  id: 'generic-shared-motivation',
  category: '지원 동기',
  text: '이 직무에 지원하게 된 계기와 이유를 말씀해 주세요.',
  limitSeconds: 90,
  hint: '직무와 본인의 연결고리를 구체적으로 설명해 보세요.',
  source: 'generic',
};

const SHARED_CHARACTER: InterviewPromptQuestion = {
  id: 'generic-shared-character',
  category: '인성',
  text: '팀 내 의견 충돌이 생겼을 때 어떻게 해결했는지 경험을 이야기해 주세요.',
  limitSeconds: 90,
  hint: 'STAR 구조(상황→과제→행동→결과)로 답변해 보세요.',
  source: 'generic',
};

const SHARED_VALUE: InterviewPromptQuestion = {
  id: 'generic-shared-value',
  category: '가치',
  text: '5년 후 본인의 모습과 이 직무를 통해 이루고 싶은 것을 이야기해 주세요.',
  limitSeconds: 90,
  hint: '성장 방향과 직무의 연결점을 보여 주세요.',
  source: 'generic',
};

// ─── Family-specific questions ────────────────────────────────────────────────

const IT_QUESTIONS: readonly InterviewPromptQuestion[] = [
  {
    id: 'generic-it-1',
    category: '직무',
    text: '가장 자신 있는 기술 스택을 소개하고, 그 기술을 선택한 이유를 설명해 주세요.',
    limitSeconds: 90,
    hint: '구체적인 프로젝트 경험을 함께 언급해 보세요.',
    source: 'generic',
  },
  {
    id: 'generic-it-2',
    category: '경험',
    text: '기술적으로 가장 어려웠던 문제를 어떻게 해결했는지 이야기해 주세요.',
    limitSeconds: 120,
    hint: '문제 정의 → 접근 방식 → 결과 순으로 설명해 보세요.',
    source: 'generic',
  },
  {
    id: 'generic-it-3',
    category: '직무',
    text: '코드 품질을 유지하기 위해 어떤 방법을 사용하시나요?',
    limitSeconds: 90,
    hint: '테스트, 코드 리뷰, 리팩터링 등 실제 실천 사항을 말씀해 주세요.',
    source: 'generic',
  },
  {
    id: 'generic-it-4',
    category: '관계',
    text: '비기술 직군과 협업할 때 어떻게 소통하시나요?',
    limitSeconds: 90,
    hint: '구체적인 상황과 커뮤니케이션 방법을 예시와 함께 설명해 보세요.',
    source: 'generic',
  },
];

const BIZ_QUESTIONS: readonly InterviewPromptQuestion[] = [
  {
    id: 'generic-biz-1',
    category: '직무',
    text: '신규 사업 기회를 발굴한 경험이 있다면 구체적으로 설명해 주세요.',
    limitSeconds: 120,
    hint: '시장 분석 방법과 의사결정 과정을 중심으로 이야기해 보세요.',
    source: 'generic',
  },
  {
    id: 'generic-biz-2',
    category: '경험',
    text: '목표를 초과 달성하거나 실적 개선을 이룬 사례를 이야기해 주세요.',
    limitSeconds: 120,
    hint: '수치로 결과를 표현하면 더욱 설득력 있어요.',
    source: 'generic',
  },
  {
    id: 'generic-biz-3',
    category: '직무',
    text: '전략 수립 과정에서 데이터를 어떻게 활용하시나요?',
    limitSeconds: 90,
    hint: '데이터 수집 → 분석 → 의사결정 연결 흐름을 설명해 보세요.',
    source: 'generic',
  },
  {
    id: 'generic-biz-4',
    category: '관계',
    text: '여러 부서 이해관계자를 설득해야 했던 경험을 이야기해 주세요.',
    limitSeconds: 90,
    hint: '이해충돌 상황과 해결 방법에 집중해 주세요.',
    source: 'generic',
  },
];

const MKT_QUESTIONS: readonly InterviewPromptQuestion[] = [
  {
    id: 'generic-mkt-1',
    category: '직무',
    text: '기획부터 실행까지 담당한 마케팅 캠페인을 소개해 주세요.',
    limitSeconds: 120,
    hint: '목표 설정 → 실행 전략 → 성과 측정 순으로 이야기해 보세요.',
    source: 'generic',
  },
  {
    id: 'generic-mkt-2',
    category: '경험',
    text: '데이터를 분석해 마케팅 전략을 수정한 경험이 있다면 설명해 주세요.',
    limitSeconds: 120,
    hint: '어떤 지표를 보고 어떤 결정을 내렸는지 구체적으로 말씀해 주세요.',
    source: 'generic',
  },
  {
    id: 'generic-mkt-3',
    category: '직무',
    text: '브랜드 메시지를 타깃 고객에게 효과적으로 전달하기 위해 어떤 방법을 사용하시나요?',
    limitSeconds: 90,
    hint: '채널 선택 근거와 콘텐츠 전략을 예시로 설명해 보세요.',
    source: 'generic',
  },
  {
    id: 'generic-mkt-4',
    category: '관계',
    text: '크리에이티브팀·개발팀 등 다른 직군과 협업해 캠페인을 완성한 경험을 이야기해 주세요.',
    limitSeconds: 90,
    hint: '역할 분담과 커뮤니케이션 방법을 중심으로 말씀해 주세요.',
    source: 'generic',
  },
];

const DESIGN_QUESTIONS: readonly InterviewPromptQuestion[] = [
  {
    id: 'generic-design-1',
    category: '직무',
    text: '자신의 디자인 프로세스를 단계별로 설명해 주세요.',
    limitSeconds: 90,
    hint: '리서치 → 아이디어 → 프로토타입 → 검증 흐름으로 이야기해 보세요.',
    source: 'generic',
  },
  {
    id: 'generic-design-2',
    category: '경험',
    text: '사용자 리서치 결과가 디자인 방향을 바꾼 경험을 이야기해 주세요.',
    limitSeconds: 120,
    hint: '리서치 방법과 인사이트 도출 과정을 구체적으로 설명해 보세요.',
    source: 'generic',
  },
  {
    id: 'generic-design-3',
    category: '직무',
    text: '포트폴리오 중 가장 자랑스러운 작업물과 그 이유를 말씀해 주세요.',
    limitSeconds: 90,
    hint: '문제 정의와 디자인 결정의 근거를 중심으로 설명해 보세요.',
    source: 'generic',
  },
  {
    id: 'generic-design-4',
    category: '관계',
    text: '개발자·기획자와 디자인 의도를 효과적으로 공유한 경험을 이야기해 주세요.',
    limitSeconds: 90,
    hint: '핸드오프 도구나 소통 방식 등 실제 방법을 예시로 말씀해 주세요.',
    source: 'generic',
  },
];

const FIN_QUESTIONS: readonly InterviewPromptQuestion[] = [
  {
    id: 'generic-fin-1',
    category: '직무',
    text: '재무 분석이나 모델링을 수행한 경험과 사용한 방법론을 설명해 주세요.',
    limitSeconds: 120,
    hint: '사용한 도구와 분석 결과가 의사결정에 미친 영향을 이야기해 보세요.',
    source: 'generic',
  },
  {
    id: 'generic-fin-2',
    category: '경험',
    text: '리스크 요인을 발견하고 이를 관리한 경험을 이야기해 주세요.',
    limitSeconds: 120,
    hint: '리스크 식별 → 평가 → 대응 순으로 설명해 보세요.',
    source: 'generic',
  },
  {
    id: 'generic-fin-3',
    category: '직무',
    text: '규정 준수(컴플라이언스)와 업무 효율성 사이의 균형을 어떻게 유지하시나요?',
    limitSeconds: 90,
    hint: '실제 사례와 함께 원칙과 실용적 접근을 설명해 보세요.',
    source: 'generic',
  },
  {
    id: 'generic-fin-4',
    category: '관계',
    text: '비재무 부서에 복잡한 재무 정보를 쉽게 설명한 경험을 이야기해 주세요.',
    limitSeconds: 90,
    hint: '청중 수준에 맞춘 커뮤니케이션 방법을 구체적으로 말씀해 주세요.',
    source: 'generic',
  },
];

const ETC_QUESTIONS: readonly InterviewPromptQuestion[] = [
  {
    id: 'generic-etc-1',
    category: '직무',
    text: '이 직무에서 가장 중요하다고 생각하는 역량은 무엇이고, 본인은 그 역량을 어떻게 키워 왔나요?',
    limitSeconds: 90,
    hint: '구체적인 경험이나 학습 과정을 예로 들어 보세요.',
    source: 'generic',
  },
  {
    id: 'generic-etc-2',
    category: '경험',
    text: '어려운 상황에서 문제를 창의적으로 해결한 경험을 이야기해 주세요.',
    limitSeconds: 120,
    hint: 'STAR 구조로 상황과 결과를 명확히 전달해 보세요.',
    source: 'generic',
  },
  {
    id: 'generic-etc-3',
    category: '직무',
    text: '빠르게 변하는 환경에서 적응하고 성과를 낸 경험을 설명해 주세요.',
    limitSeconds: 90,
    hint: '변화에 어떻게 대응했는지 구체적인 행동을 중심으로 말씀해 주세요.',
    source: 'generic',
  },
  {
    id: 'generic-etc-4',
    category: '관계',
    text: '팀워크를 발휘해 공동 목표를 달성한 경험을 이야기해 주세요.',
    limitSeconds: 90,
    hint: '본인의 역할과 팀 기여 방식을 구체적으로 설명해 보세요.',
    source: 'generic',
  },
];

// ─── Question bank: 8 questions per family ───────────────────────────────────
// Order: opening, motivation, [4 family-specific], character, value

export const GENERIC_QUESTION_BANK: Record<JobFamily, readonly InterviewPromptQuestion[]> = {
  it: [SHARED_OPENING, SHARED_MOTIVATION, ...IT_QUESTIONS, SHARED_CHARACTER, SHARED_VALUE],
  biz: [SHARED_OPENING, SHARED_MOTIVATION, ...BIZ_QUESTIONS, SHARED_CHARACTER, SHARED_VALUE],
  mkt: [SHARED_OPENING, SHARED_MOTIVATION, ...MKT_QUESTIONS, SHARED_CHARACTER, SHARED_VALUE],
  design: [SHARED_OPENING, SHARED_MOTIVATION, ...DESIGN_QUESTIONS, SHARED_CHARACTER, SHARED_VALUE],
  fin: [SHARED_OPENING, SHARED_MOTIVATION, ...FIN_QUESTIONS, SHARED_CHARACTER, SHARED_VALUE],
  etc: [SHARED_OPENING, SHARED_MOTIVATION, ...ETC_QUESTIONS, SHARED_CHARACTER, SHARED_VALUE],
};
