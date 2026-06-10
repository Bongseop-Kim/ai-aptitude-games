import type { SubscriptionPlan } from '../domain/types';

export const subscriptionPlans: SubscriptionPlan[] = [
  {
    id: 'free',
    name: '무료',
    priceLabel: '월 1회',
    description: '기본 리포트와 개별 게임을 체험해요.',
  },
  {
    id: 'pro-monthly',
    name: '역검 Pro 월간',
    priceLabel: '7일 무료',
    description: '전체 리포트, 코치 플랜, 무제한 모의고사를 열어요.',
    recommended: true,
  },
  {
    id: 'pro-yearly',
    name: '역검 Pro 연간',
    priceLabel: '연간 할인',
    description: '꾸준한 면접 준비를 위한 장기 플랜이에요.',
  },
];
