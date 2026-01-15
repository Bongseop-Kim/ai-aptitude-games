import Game from "@/types/game";

const GAMES: Game[] = [
  {
    id: "nback",
    name: "도형 순서 기억",
    difficulty: 3,
    description: "현재 도형이 n번째 이전 도형과 같은지 판단 (2-back → 3-back)",
    measuredSkills: ["작업기억", "업데이트"],
    image: require("@/assets/images/android-icon-background.png"),
  },
  {
    id: "rotation",
    name: "도형 회전 / 반전",
    difficulty: 3,
    description: "도형을 회전·반전하여 목표 도형과 동일하게 만들기",
    measuredSkills: ["공간지각", "정신 회전"],
    image: require("@/assets/images/android-icon-background.png"),
  },
  {
    id: "stroop",
    name: "Stroop Test",
    difficulty: 2,
    description: "단어 의미가 아닌 글자 색상 기준으로 빠르게 선택",
    measuredSkills: ["억제", "선택적 주의"],
    image: require("@/assets/images/android-icon-background.png"),
  },
  {
    id: "gonogo",
    name: "Go / No-Go",
    difficulty: 2,
    description: "특정 자극에는 클릭, 특정 자극에는 클릭 금지",
    measuredSkills: ["충동 억제", "반응 통제"],
    image: require("@/assets/images/android-icon-background.png"),
  },
  {
    id: "rps",
    name: "가위바위보",
    difficulty: 2,
    description:
      "제시된 관점(나/상대)에 맞게 이기거나 지도록 선택. 라운드마다 규칙 전환",
    measuredSkills: ["규칙 전환", "억제", "반응속도"],
    image: require("@/assets/images/android-icon-background.png"),
  },
  {
    id: "promise",
    name: "약속 정하기",
    difficulty: 3,
    description: "3회 제시된 정보 중 공통(또는 미출현) 항목 기억 후 선택",
    measuredSkills: ["작업기억", "정보 갱신"],
    image: require("@/assets/images/android-icon-background.png"),
  },
  {
    id: "numbers",
    name: "숫자 누르기",
    difficulty: 2,
    description:
      "활성 숫자 클릭 / 조건(2번 클릭, 건너뛰기)에 맞춰 순서대로 입력",
    measuredSkills: ["선택적 주의", "작업기억"],
    image: require("@/assets/images/android-icon-background.png"),
  },
  {
    id: "potion",
    name: "마법약 만들기",
    difficulty: 3,
    description: "조합별 색 출현 빈도를 기반으로 더 가능성 높은 색 선택",
    measuredSkills: ["확률 추론", "통계적 학습"],
    image: require("@/assets/images/android-icon-background.png"),
  },
];

export default GAMES;
