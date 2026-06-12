export type NcsJob = {
  name: string;
  standard: string;
  confidence: number;
  units: string[];
};

export type RecentMockInterview = {
  score: number;
  company: string;
  role: string;
};

export type InterviewSession = {
  date: string;
  company: string;
  role: string;
  score: number;
  delta: number | null;
  questionCount: number;
};

export const ncsJob: NcsJob = {
  name: '프론트엔드 엔지니어',
  standard: '응용SW엔지니어링',
  confidence: 92,
  units: ['요구사항 확인', '화면 구현', '기능 구현', '통합 구현', '테스트'],
};

export const recentMock: RecentMockInterview = {
  score: 74,
  company: '리플로우',
  role: '프론트엔드',
};

export const interviewSessions: InterviewSession[] = [
  {
    date: '1월 12일',
    company: '리플로우',
    role: '프론트엔드',
    score: 74,
    delta: 8,
    questionCount: 8,
  },
  {
    date: '1월 6일',
    company: '오월컴퍼니',
    role: '프론트엔드',
    score: 66,
    delta: null,
    questionCount: 6,
  },
];
