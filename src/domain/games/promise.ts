import type { IconName } from '../../shared/types';
import { shuffle } from './random';

export type PromiseClue = {
  who: string;
  icon: IconName;
  text: string;
};

export type PromiseQuestion = {
  clues: PromiseClue[];
  options: string[];
  answerIndex: number;
};

export const PROMISE_TOTAL_ROUNDS = 4;
export const PROMISE_FEEDBACK_MS = 900;

const promiseQuestionBank: readonly PromiseQuestion[] = [
  {
    clues: [
      { who: '철수', icon: 'Bus', text: '"16번 버스를 타고 편의점 앞에서 내렸어"' },
      { who: '영희', icon: 'Map', text: '"사거리 북동쪽 블록, 편의점과 한 블록 떨어진 곳"' },
      { who: '미미', icon: 'Utensils', text: '"가운데 가게에서 스테이크를 먹었어"' },
    ],
    options: ['북동 카페', '편의점 옆 분식', '사거리 스테이크집', '남쪽 베이커리'],
    answerIndex: 2,
  },
  {
    clues: [
      { who: '준호', icon: 'Bus', text: '"22번 버스를 타고 도서관 정류장에서 내렸어"' },
      { who: '하나', icon: 'Map', text: '"도서관 바로 맞은편, 공원 서쪽 입구 옆이야"' },
      { who: '소라', icon: 'Utensils', text: '"조용한 북카페에서 샌드위치를 먹었어"' },
    ],
    options: ['도서관 앞 북카페', '공원 동쪽 분식', '시청 뒤 파스타집', '학교 앞 베이커리'],
    answerIndex: 0,
  },
  {
    clues: [
      { who: '민재', icon: 'Bus', text: '"7번 버스를 타고 영화관 앞에서 내렸어"' },
      { who: '수빈', icon: 'Map', text: '"영화관 남쪽 골목, 약국과 같은 줄에 있어"' },
      { who: '아라', icon: 'Utensils', text: '"떡볶이랑 튀김을 같이 먹었어"' },
    ],
    options: ['영화관 북쪽 카페', '약국 옆 분식집', '시장 안 초밥집', '공원 앞 피자집'],
    answerIndex: 1,
  },
  {
    clues: [
      { who: '도윤', icon: 'Bus', text: '"3번 버스를 타고 수영장 정류장에서 내렸어"' },
      { who: '예린', icon: 'Map', text: '"수영장 뒤편, 파란 간판이 보이는 건물이야"' },
      { who: '지우', icon: 'Utensils', text: '"점심으로 우동을 먹고 바로 만났어"' },
    ],
    options: ['수영장 뒤 우동집', '파란 카페', '체육관 앞 햄버거집', '분수대 옆 김밥집'],
    answerIndex: 0,
  },
  {
    clues: [
      { who: '서준', icon: 'Bus', text: '"40번 버스를 타고 은행 앞 정류장에서 내렸어"' },
      { who: '나은', icon: 'Map', text: '"은행 건너편 2층, 꽃집 위에 있어"' },
      { who: '유나', icon: 'Utensils', text: '"케이크를 나눠 먹고 선물을 골랐어"' },
    ],
    options: ['은행 옆 편의점', '꽃집 위 디저트 카페', '지하 분식집', '문구점 앞 라멘집'],
    answerIndex: 1,
  },
  {
    clues: [
      { who: '현우', icon: 'Bus', text: '"12번 버스를 타고 지하철역 3번 출구에서 내렸어"' },
      { who: '민서', icon: 'Map', text: '"3번 출구에서 오른쪽으로 돌아 첫 번째 골목이야"' },
      { who: '채원', icon: 'Utensils', text: '"따뜻한 국밥을 먹고 바로 출발했어"' },
    ],
    options: ['역 1번 출구 카페', '첫 골목 국밥집', '역 뒤편 피자집', '왼쪽 골목 베이커리'],
    answerIndex: 1,
  },
  {
    clues: [
      { who: '가은', icon: 'Bus', text: '"5번 버스를 타고 미술관 정류장에서 내렸어"' },
      { who: '태오', icon: 'Map', text: '"미술관 정문 왼쪽, 작은 분수 옆이야"' },
      { who: '다인', icon: 'Utensils', text: '"파스타를 먹고 전시를 보러 갔어"' },
    ],
    options: ['미술관 오른쪽 카페', '분수 옆 파스타집', '정문 앞 떡볶이집', '후문 베이커리'],
    answerIndex: 1,
  },
  {
    clues: [
      { who: '로운', icon: 'Bus', text: '"18번 버스를 타고 시장 남문에서 내렸어"' },
      { who: '세아', icon: 'Map', text: '"남문 안쪽 첫 번째 교차로, 과일가게 맞은편이야"' },
      { who: '윤서', icon: 'Utensils', text: '"칼국수를 먹고 장을 봤어"' },
    ],
    options: ['시장 북문 카페', '과일가게 맞은편 칼국수집', '남문 밖 빵집', '교차로 옆 치킨집'],
    answerIndex: 1,
  },
];

export function createPromiseSession(): PromiseQuestion[] {
  return shuffle(promiseQuestionBank).slice(0, PROMISE_TOTAL_ROUNDS);
}
