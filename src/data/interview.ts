export type NcsJob = {
  name: string;
  standard: string;
  confidence: number;
  units: string[];
};

export const ncsJob: NcsJob = {
  name: '프론트엔드 엔지니어',
  standard: '응용SW엔지니어링',
  confidence: 92,
  units: ['요구사항 확인', '화면 구현', '기능 구현', '통합 구현', '테스트'],
};
