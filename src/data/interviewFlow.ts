import type { BadgeTone, IconName } from '../shared/types';

export type InterviewStepKey = 'setup' | 'record' | 'feedback';

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
  { key: 'setup', n: 1, label: '준비', icon: 'FileText' },
  { key: 'record', n: 2, label: '답변', icon: 'Video' },
  { key: 'feedback', n: 3, label: '완료', icon: 'CircleCheck' },
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
