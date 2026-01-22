export type NbackPhase = "countdown" | "preCount" | "playing" | "rest" | "finished";

// 허용 가능한 offset 값 (0 = 다름, 2 = 2번째 전, 3 = 3번째 전 등)
export type AllowedOffset = 0 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

// 게임 규칙 (로직에 사용)
export type NbackStageRules = {
    allowedOffsets: AllowedOffset[]; // 허용 가능한 offset 목록 (최소 1개, 첫 번째가 기본값)
    totalQuestions: number; // 실제 문제 개수
    // preCount는 자동 계산: max(allowedOffsets.filter(o => o > 0))
};

// 게임 문구 (UI에 사용, i18n 가능)
export type NbackStageCopy = {
    headerContent: string;
    options: { label: string; value: AllowedOffset }[]; // value는 "몇 번째 전"을 의미
    // options.value는 반드시 rules.allowedOffsets에 포함되어야 함
};

// 스테이지 전체 설정
export type NbackStage = {
    rules: NbackStageRules;
    copy: NbackStageCopy;
};

export type Shape = {
    id: string;
    source: number;
};

export type NbackTrial = {
    stageIndex: number;
    trialIndex: number;
    shownShapeId: string;
    correctAnswer: number;
    userAnswer?: number;
    isCorrect: boolean;
    rtMs?: number;
};

export type StageSummary = {
    stageIndex: number;
    totalQuestions: number;
    correctCount: number;
    accuracy: number;
    avgRtMs: number | null;
    perOffset: Record<
        number,
        { total: number; correct: number; avgRtMs: number | null }
    >;
};


export type saveNbackGameDataParams = {
    summaryList: StageSummary[];
    trialsList: NbackTrial[];
    type: "practice" | "real";
};

export type UseNBackGameOptions = {
    sessionType?: "practice" | "real";
};