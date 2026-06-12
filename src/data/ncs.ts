export const NCS_PRIMARY = {
  name: '응용SW엔지니어링',
  group: '정보통신 › 정보기술 › 정보기술개발',
  code: '20010206',
  level: '세분류',
  conf: 92,
  units: ['요구사항 확인', '화면 구현', '기능 구현', '통합 구현', '테스트'],
};

export const NCS_CANDIDATES = [
  {
    name: '응용SW엔지니어링',
    code: '20010206',
    conf: 92,
    units: ['요구사항 확인', '화면 구현', '기능 구현', '통합 구현', '테스트'],
  },
  {
    name: 'UI/UX엔지니어링',
    code: '20010212',
    conf: 86,
    units: ['UI 요구사항 분석', 'UI 설계', 'UI 구현', '사용성 평가'],
  },
  {
    name: '시스템SW엔지니어링',
    code: '20010204',
    conf: 64,
    units: ['시스템 SW 기초 설계', '시스템 SW 구현'],
  },
  {
    name: '데이터베이스엔지니어링',
    code: '20010205',
    conf: 58,
    units: ['DB 설계', 'DB 구현', 'DB 운영'],
  },
] as const;

export const SRC_AIHUB = "본 서비스는 과학기술정보통신부의 재원으로 한국지능정보사회진흥원(NIA)의 지원을 받아 구축된 'AI Hub 채용면접 인터뷰 데이터'를 활용합니다.";
export const SRC_NCS = '출처: 한국산업인력공단, 국가직무능력표준(NCS) — 공공데이터포털';
