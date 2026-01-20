export const NBACK_GAME = {
  rules: {
    stimulusSec: 3, // 각 자극(도형) 표시 시간 (초)
    interStimulusSec: 0.5, // 문제 간 휴식 시간 (초)
  },
  copy: {
    common: {
      headerPreContent: "제시되는 도형을 기억해 주세요.",
    },
  },
  stages: [
    {
      rules: {
        allowedOffsets: [2], // 2-back만 가능
        totalQuestions: 10, // 실제 문제 개수
      },
      copy: {
        headerContent:
          "화면에서 제시되는 도형이\n두번째 전 도형과 같은지 맞춰주세요.",
        options: [
          { label: "다름", value: 0 }, // 0 = 다름
          { label: "같음", value: 2 }, // 2 = 2번째 전과 같음
        ],
      },
    },
    {
      rules: {
        allowedOffsets: [2, 3], // 2-back 또는 3-back 선택 가능
        totalQuestions: 10, // 실제 문제 개수
      },
      copy: {
        headerContent:
          "화면에서 제시되는 도형이\n몇 번째 전 도형과 같은지 맞춰주세요.",
        options: [
          { label: "다름", value: 0 }, // 0 = 다름
          { label: "같음 (2번째 전)", value: 2 }, // 2 = 2번째 전과 같음
          { label: "같음 (3번째 전)", value: 3 }, // 3 = 3번째 전과 같음
        ],
      },
    },
  ],
};

export const SHAPE_POOL = [
  {
    id: "android-background",
    source: require("@/assets/images/android-icon-background.png"),
  },
  {
    id: "android-foreground",
    source: require("@/assets/images/android-icon-foreground.png"),
  },
  {
    id: "android-monochrome",
    source: require("@/assets/images/android-icon-monochrome.png"),
  },
  { id: "favicon", source: require("@/assets/images/favicon.png") },
  { id: "icon", source: require("@/assets/images/icon.png") },
  { id: "react-logo", source: require("@/assets/images/react-logo.png") },
  {
    id: "react-logo-partial",
    source: require("@/assets/images/partial-react-logo.png"),
  },
  { id: "splash", source: require("@/assets/images/splash-icon.png") },
];

