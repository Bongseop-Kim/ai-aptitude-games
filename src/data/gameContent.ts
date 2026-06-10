import { CAT_TOTAL_ROUNDS } from '../domain/games/cat';
import { COMPARE_TOTAL_ROUNDS } from '../domain/games/compare';
import { MEMORY_TOTAL_ROUNDS } from '../domain/games/memory';
import { NUMBERS_TOTAL_ROUNDS } from '../domain/games/numbers';
import { PATH_TOTAL_ROUNDS } from '../domain/games/path';
import { POTION_TOTAL_ROUNDS } from '../domain/games/potion';
import { PROMISE_TOTAL_ROUNDS } from '../domain/games/promise';
import { ROTATE_TOTAL_ROUNDS } from '../domain/games/rotate';
import { RPS_TOTAL_ROUNDS } from '../domain/games/rps';
import type { GameId } from '../domain/types';

export type GameContent = {
  totalRounds: number;
  steps: string[];
  tip?: string;
  skillDescription: string;
};

export const gameContent: Record<GameId, GameContent> = {
  cat: {
    totalRounds: CAT_TOTAL_ROUNDS,
    steps: [
      '생쥐들이 숨는 위치를 잠깐 보여줘요 — 외워두세요',
      '고양이가 한 칸에 나타나면, 생쥐를 찾았는지 판단해요',
      '얼마나 확신하는지 8단계로 답해요',
    ],
    tip: '확신이 없을 땐 솔직하게 답해요. 확신과 실제 정답이 일치할수록 점수가 높아져요.',
    skillDescription: '내 판단이 얼마나 맞는지 스스로 아는 메타인지. 확신과 실제 정답의 일치도를 측정해요.',
  },
  rps: {
    totalRounds: RPS_TOTAL_ROUNDS,
    steps: [
      '매 라운드 규칙이 바뀌어요 (이기기/지기/비기기)',
      'AI가 낸 손을 보고',
      '규칙에 맞는 손을 빠르게 골라요',
    ],
    tip: '규칙이 매 라운드 바뀌어요. 손이 먼저 나가지 않게 한 박자 참아요.',
    skillDescription: '지시와 반대로 반응하는 능력. 습관적 반응을 억누르는 전두엽 기능이에요.',
  },
  numbers: {
    totalRounds: NUMBERS_TOTAL_ROUNDS,
    steps: ['숫자 묶음을 잠깐 보고', '순서를 머릿속에 붙잡은 뒤', '사라진 숫자를 거꾸로 입력해요'],
    tip: '끝자리부터 하나씩 되짚으면 덜 헷갈려요.',
    skillDescription: '숫자를 거꾸로 되뇌는 작업기억. 정보를 잠깐 붙잡고 조작하는 힘을 보여줘요.',
  },
  memory: {
    totalRounds: MEMORY_TOTAL_ROUNDS,
    steps: [
      '도형이 하나씩 차례로 나타나요',
      '지금 도형을 2번째 전·3번째 전 도형과 비교해요',
      '다름 / 2번째 전 / 3번째 전 중에 골라요',
    ],
    tip: '직전 도형이 아니라 2번째 전과 3번째 전 도형을 떠올려요.',
    skillDescription: '새 도형을 보며 이전 정보를 계속 갱신하는 N-back 작업기억을 보여줘요.',
  },
  rotate: {
    totalRounds: ROTATE_TOTAL_ROUNDS,
    steps: [
      '왼쪽(전) 도형을 오른쪽(후) 모양으로 만들어요',
      '회전·반전 버튼을 순서대로 눌러',
      '최소 클릭으로 답안을 제출해요',
    ],
    skillDescription: '머릿속에서 도형을 돌려보는 시공간 작업기억. 설계·공간 직무와 연관돼요.',
  },
  promise: {
    totalRounds: PROMISE_TOTAL_ROUNDS,
    steps: [
      '세 친구의 단서를 하나씩 확인하고',
      '겹치는 조건을 머릿속에서 통합해',
      '약속 장소를 추론해 골라요',
    ],
    skillDescription: '흩어진 단서를 통합해 결론을 끌어내는 논리적 추론 능력이에요.',
  },
  potion: {
    totalRounds: POTION_TOTAL_ROUNDS,
    steps: [
      '네 가지 재료의 조합을 보고',
      '파란약·빨간약 중 무엇이 될지 예측해요',
      '결과를 확인하며 규칙을 찾아가요',
    ],
    tip: '오답도 학습 신호예요. 틀린 조합이 다음 판의 힌트가 돼요.',
    skillDescription: '결과를 보고 숨은 규칙을 찾아내는 귀납 추론. 실패에서 배우는 속도가 중요해요.',
  },
  path: {
    totalRounds: PATH_TOTAL_ROUNDS,
    steps: [
      '사람과 자동차가 한 공간에 있어요',
      '빈 칸을 눌러 울타리를 놓아요 — 개수가 정해져 있어요',
      '사람이 자동차 칸까지 갈 수 없게 막으면 성공이에요',
    ],
    tip: '울타리를 놓기 전에 길이 이어지는 곳부터 찾아보세요. 빈틈이 하나만 있어도 길은 다시 이어져요.',
    skillDescription: '제한된 자원으로 결과를 미리 내다보고 배치하는 계획력을 보여줘요.',
  },
  compare: {
    totalRounds: COMPARE_TOTAL_ROUNDS,
    steps: ['양쪽 패널에 점이 나타나요', '어느 쪽이 더 많은지', '직관적으로 빠르게 탭해요'],
    tip: '크기 착시에 속지 마세요. 점의 개수만 보세요.',
    skillDescription: '세지 않고 수량을 직관적으로 어림하는 수 감각(Subitizing)이에요.',
  },
};
