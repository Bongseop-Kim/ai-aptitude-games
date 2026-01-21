import Variant1 from "@/assets/images/nback/variant-1.svg";
import Variant10 from "@/assets/images/nback/variant-10.svg";
import Variant11 from "@/assets/images/nback/variant-11.svg";
import Variant12 from "@/assets/images/nback/variant-12.svg";
import Variant13 from "@/assets/images/nback/variant-13.svg";
import Variant14 from "@/assets/images/nback/variant-14.svg";
import Variant15 from "@/assets/images/nback/variant-15.svg";
import Variant16 from "@/assets/images/nback/variant-16.svg";
import Variant17 from "@/assets/images/nback/variant-17.svg";
import Variant18 from "@/assets/images/nback/variant-18.svg";
import Variant19 from "@/assets/images/nback/variant-19.svg";
import Variant2 from "@/assets/images/nback/variant-2.svg";
import Variant20 from "@/assets/images/nback/variant-20.svg";
import Variant21 from "@/assets/images/nback/variant-21.svg";
import Variant22 from "@/assets/images/nback/variant-22.svg";
import Variant23 from "@/assets/images/nback/variant-23.svg";
import Variant24 from "@/assets/images/nback/variant-24.svg";
import Variant25 from "@/assets/images/nback/variant-25.svg";
import Variant26 from "@/assets/images/nback/variant-26.svg";
import Variant27 from "@/assets/images/nback/variant-27.svg";
import Variant28 from "@/assets/images/nback/variant-28.svg";
import Variant29 from "@/assets/images/nback/variant-29.svg";
import Variant3 from "@/assets/images/nback/variant-3.svg";
import Variant30 from "@/assets/images/nback/variant-30.svg";
import Variant31 from "@/assets/images/nback/variant-31.svg";
import Variant32 from "@/assets/images/nback/variant-32.svg";
import Variant33 from "@/assets/images/nback/variant-33.svg";
import Variant34 from "@/assets/images/nback/variant-34.svg";
import Variant35 from "@/assets/images/nback/variant-35.svg";
import Variant36 from "@/assets/images/nback/variant-36.svg";
import Variant37 from "@/assets/images/nback/variant-37.svg";
import Variant38 from "@/assets/images/nback/variant-38.svg";
import Variant39 from "@/assets/images/nback/variant-39.svg";
import Variant4 from "@/assets/images/nback/variant-4.svg";
import Variant40 from "@/assets/images/nback/variant-40.svg";
import Variant41 from "@/assets/images/nback/variant-41.svg";
import Variant42 from "@/assets/images/nback/variant-42.svg";
import Variant43 from "@/assets/images/nback/variant-43.svg";
import Variant44 from "@/assets/images/nback/variant-44.svg";
import Variant5 from "@/assets/images/nback/variant-5.svg";
import Variant6 from "@/assets/images/nback/variant-6.svg";
import Variant7 from "@/assets/images/nback/variant-7.svg";
import Variant8 from "@/assets/images/nback/variant-8.svg";
import Variant9 from "@/assets/images/nback/variant-9.svg";

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
    id: "variant-1",
    svg: Variant1,
  },
  {
    id: "variant-2",
    svg: Variant2,
  },
  {
    id: "variant-3",
    svg: Variant3,
  },
  {
    id: "variant-4",
    svg: Variant4,
  },
  {
    id: "variant-5",
    svg: Variant5,
  },
  {
    id: "variant-6",
    svg: Variant6,
  },
  {
    id: "variant-7",
    svg: Variant7,
  },
  {
    id: "variant-8",
    svg: Variant8,
  },
  {
    id: "variant-9",
    svg: Variant9,
  },
  {
    id: "variant-10",
    svg: Variant10,
  },
  {
    id: "variant-11",
    svg: Variant11,
  },
  {
    id: "variant-12",
    svg: Variant12,
  },
  {
    id: "variant-13",
    svg: Variant13,
  },
  {
    id: "variant-14",
    svg: Variant14,
  },
  {
    id: "variant-15",
    svg: Variant15,
  },
  {
    id: "variant-16",
    svg: Variant16,
  },
  {
    id: "variant-17",
    svg: Variant17,
  },
  {
    id: "variant-18",
    svg: Variant18,
  },
  {
    id: "variant-19",
    svg: Variant19,
  },
  {
    id: "variant-20",
    svg: Variant20,
  },
  {
    id: "variant-21",
    svg: Variant21,
  },
  {
    id: "variant-22",
    svg: Variant22,
  },
  {
    id: "variant-23",
    svg: Variant23,
  },
  {
    id: "variant-24",
    svg: Variant24,
  },
  {
    id: "variant-25",
    svg: Variant25,
  },
  {
    id: "variant-26",
    svg: Variant26,
  },
  {
    id: "variant-27",
    svg: Variant27,
  },
  {
    id: "variant-28",
    svg: Variant28,
  },
  {
    id: "variant-29",
    svg: Variant29,
  },
  {
    id: "variant-30",
    svg: Variant30,
  },
  {
    id: "variant-31",
    svg: Variant31,
  },
  {
    id: "variant-32",
    svg: Variant32,
  },
  {
    id: "variant-33",
    svg: Variant33,
  },
  {
    id: "variant-34",
    svg: Variant34,
  },
  {
    id: "variant-35",
    svg: Variant35,
  },
  {
    id: "variant-36",
    svg: Variant36,
  },
  {
    id: "variant-37",
    svg: Variant37,
  },
  {
    id: "variant-38",
    svg: Variant38,
  },
  {
    id: "variant-39",
    svg: Variant39,
  },
  {
    id: "variant-40",
    svg: Variant40,
  },
  {
    id: "variant-41",
    svg: Variant41,
  },
  {
    id: "variant-42",
    svg: Variant42,
  },
  {
    id: "variant-43",
    svg: Variant43,
  },
  {
    id: "variant-44",
    svg: Variant44,
  },
];

