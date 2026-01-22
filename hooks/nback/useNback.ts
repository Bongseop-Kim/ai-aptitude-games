import { NBACK_GAME, SHAPE_POOL } from "@/constants/nback/nback";
import { saveNbackGameData } from "@/db/services/nback";
import {
  NbackPhase,
  NbackTrial,
  StageSummary,
  UseNBackGameOptions,
} from "@/types/nback/nback";
import {
  generateShapeSequence,
  getCurrentSequenceIndex,
  getHeaderText,
  getIsPickerDisabled,
  getPreCount,
  getRemainingQuestions,
  summarizeStageTrials,
} from "@/utils/nback/nback";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

export const useNBackGame = ({
  sessionType = "real",
}: UseNBackGameOptions = {}) => {
  const router = useRouter();
  const interStimulusSec = NBACK_GAME.rules.interStimulusSec;

  const [stageIndex, setStageIndex] = useState<number>(0);
  const [gamePhase, setGamePhase] = useState<NbackPhase>("countdown");
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [showCountdown, setShowCountdown] = useState(true);
  const [selectedValue, setSelectedValue] = useState<number | undefined>();
  const [questionIndex, setQuestionIndex] = useState(0);
  const [preCountIndex, setPreCountIndex] = useState(0);
  const [isAnswerLocked, setIsAnswerLocked] = useState(false);
  const [answerMarkerRatio, setAnswerMarkerRatio] = useState<number | null>(
    null
  );
  const [finishedAccuracy, setFinishedAccuracy] = useState<number | null>(null);

  const restTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const shownAtRef = useRef<number | null>(null);
  const currentTrialRef = useRef<NbackTrial | null>(null);
  const stageTrialsRef = useRef<NbackTrial[]>([]);
  const sessionTrialsRef = useRef<NbackTrial[]>([]);
  const stageSummariesRef = useRef<StageSummary[]>([]);
  const savedStagesRef = useRef<Set<number>>(new Set());
  const savedSessionRef = useRef(false);

  const currentStage = useMemo(
    () => NBACK_GAME.stages[stageIndex],
    [stageIndex]
  );

  const allowedOffsets = currentStage?.rules.allowedOffsets ?? [];
  const totalQuestions = currentStage?.rules.totalQuestions ?? 0;

  const preCount = useMemo(() => getPreCount(allowedOffsets), [allowedOffsets]);

  const { shapeSequence, correctAnswers } = useMemo(() => {
    if (!currentStage) {
      return { shapeSequence: [], correctAnswers: [] };
    }
    return generateShapeSequence(
      totalQuestions,
      allowedOffsets,
      preCount,
      SHAPE_POOL.length
    );
  }, [allowedOffsets, currentStage, preCount, totalQuestions]);

  const currentSequenceIndex = useMemo(
    () =>
      getCurrentSequenceIndex({
        questionIndex,
        preCountIndex,
        preCount,
      }),
    [preCount, preCountIndex, questionIndex]
  );

  const currentShape =
    SHAPE_POOL[shapeSequence[currentSequenceIndex] ?? 0] ?? SHAPE_POOL[0];

  const handleCountdownComplete = useCallback(() => {
    setShowCountdown(false);
    setGamePhase("preCount");
    setQuestionIndex(0);
    setPreCountIndex(0);
    setAnswerMarkerRatio(null);
    setIsTimerRunning(true);
  }, []);

  const finalizeCurrentTrial = useCallback((userAnswer?: number) => {
    const currentTrial = currentTrialRef.current;
    if (!currentTrial) return;

    const answeredAt = Date.now();
    const shownAt = shownAtRef.current ?? answeredAt;
    const rtMs =
      userAnswer !== undefined ? Math.max(0, answeredAt - shownAt) : undefined;
    const isCorrect =
      userAnswer !== undefined && userAnswer === currentTrial.correctAnswer;
    const finalized: NbackTrial = {
      ...currentTrial,
      userAnswer,
      isCorrect,
      rtMs,
    };

    stageTrialsRef.current.push(finalized);
    sessionTrialsRef.current.push(finalized);
    currentTrialRef.current = null;
    setIsAnswerLocked(true);
  }, []);

  const handleTimeUp = useCallback(() => {
    setIsTimerRunning(false);
    if (gamePhase === "playing" && currentTrialRef.current) {
      finalizeCurrentTrial(undefined);
    }
    setGamePhase("rest");
  }, [finalizeCurrentTrial, gamePhase]);

  const advanceToNextQuestion = useCallback(
    (
      currentPreCountIdx: number,
      currentQuestionIdx: number,
      currentStageIdx: number
    ) => {
      setSelectedValue(undefined);
      setIsAnswerLocked(false);
      setAnswerMarkerRatio(null);

      if (currentQuestionIdx === 0 && currentPreCountIdx < preCount - 1) {
        setPreCountIndex((prev) => prev + 1);
        setGamePhase("preCount");
        setIsTimerRunning(true);
        return;
      }

      if (currentQuestionIdx === 0 && currentPreCountIdx >= preCount - 1) {
        setGamePhase("playing");
        setQuestionIndex(1);
        setIsTimerRunning(true);
        return;
      }

      if (currentQuestionIdx > 0 && currentQuestionIdx < totalQuestions) {
        setQuestionIndex((prev) => prev + 1);
        setGamePhase("playing");
        setIsTimerRunning(true);
        return;
      }

      if (currentQuestionIdx >= totalQuestions) {
        if (!savedStagesRef.current.has(currentStageIdx)) {
          const summary = summarizeStageTrials(
            currentStageIdx,
            totalQuestions,
            allowedOffsets,
            stageTrialsRef.current
          );
          savedStagesRef.current.add(currentStageIdx);
          stageSummariesRef.current.push(summary);
          console.log("NBack stage summary", summary);
          console.log("NBack stage trials", stageTrialsRef.current);
        }

        const isLastStage = currentStageIdx >= NBACK_GAME.stages.length - 1;

        if (!isLastStage) {
          const nextStageIndex = currentStageIdx + 1;
          setStageIndex(nextStageIndex);
          setQuestionIndex(0);
          setPreCountIndex(0);
          setGamePhase("countdown");
          setShowCountdown(true);
          setIsTimerRunning(false);
          return;
        }

        console.log("게임 종료!");
        const sessionTrials = sessionTrialsRef.current;
        const correctCount = sessionTrials.filter(
          (trial) => trial.isCorrect
        ).length;
        const totalCount = sessionTrials.length;
        setFinishedAccuracy(totalCount > 0 ? correctCount / totalCount : 0);
        setGamePhase("finished");
        setIsTimerRunning(false);
        if (!savedSessionRef.current) {
          savedSessionRef.current = true;
          void (async () => {
            try {
              const sessionId = await saveNbackGameData({
                summaryList: stageSummariesRef.current,
                trialsList: sessionTrialsRef.current,
                type: sessionType,
              });
              router.replace(`/games/nback/summary/${sessionId}`);
            } catch (error) {
              savedSessionRef.current = false;
              console.error("Failed to save NBack game data", error);
            }
          })();
        }
        console.log("NBack session trials", sessionTrialsRef.current);
        console.log("NBack session summaries", stageSummariesRef.current);
      }
    },
    [allowedOffsets, preCount, router, sessionType, totalQuestions]
  );

  useEffect(() => {
    if (gamePhase !== "rest") return;

    if (restTimerRef.current) {
      clearTimeout(restTimerRef.current);
    }

    const currentPreCountIdx = preCountIndex;
    const currentQuestionIdx = questionIndex;
    const currentStageIdx = stageIndex;

    restTimerRef.current = setTimeout(() => {
      advanceToNextQuestion(
        currentPreCountIdx,
        currentQuestionIdx,
        currentStageIdx
      );
    }, interStimulusSec * 1000);

    return () => {
      if (restTimerRef.current) {
        clearTimeout(restTimerRef.current);
      }
    };
  }, [
    advanceToNextQuestion,
    gamePhase,
    interStimulusSec,
    preCountIndex,
    questionIndex,
    stageIndex,
  ]);

  useEffect(() => {
    stageTrialsRef.current = [];
    currentTrialRef.current = null;
    setSelectedValue(undefined);
    setIsAnswerLocked(false);
    setAnswerMarkerRatio(null);
  }, [stageIndex]);

  useEffect(() => {
    if (gamePhase !== "preCount" && gamePhase !== "playing") return;
    const shownAt = Date.now();
    shownAtRef.current = shownAt;

    if (gamePhase === "playing") {
      const correctAnswer = correctAnswers[questionIndex - 1] ?? 0;
      currentTrialRef.current = {
        stageIndex,
        trialIndex: questionIndex,
        shownShapeId: currentShape?.id ?? "unknown",
        correctAnswer,
        isCorrect: false,
      };
      setIsAnswerLocked(false);
    }
  }, [correctAnswers, currentShape?.id, gamePhase, questionIndex, stageIndex]);

  const isPreCountPhase = questionIndex === 0;

  const isPickerDisabled = useMemo(
    () => getIsPickerDisabled({ phase: gamePhase, isAnswerLocked }),
    [gamePhase, isAnswerLocked]
  );

  const remainingQuestions = useMemo(
    () =>
      getRemainingQuestions({
        isPreCountPhase,
        totalQuestions,
        questionIndex,
      }),
    [isPreCountPhase, questionIndex, totalQuestions]
  );

  const headerText = useMemo(
    () =>
      getHeaderText({
        isPreCountPhase,
        commonHeader: NBACK_GAME.copy.common.headerPreContent,
        stageHeader: currentStage?.copy.headerContent ?? "",
      }),
    [currentStage?.copy.headerContent, isPreCountPhase]
  );

  const handleAnswer = useCallback(
    (val?: string) => {
      if (val === undefined || val === null || val === "" || isAnswerLocked || gamePhase !== "playing") return;
      const numericValue = Number(val);
      setSelectedValue(numericValue);
      const shownAt = shownAtRef.current ?? Date.now();
      const elapsedMs = Math.max(0, Date.now() - shownAt);
      const ratio = elapsedMs / (NBACK_GAME.rules.stimulusSec * 1000 || 1);
      setAnswerMarkerRatio(Math.min(1, Math.max(0, ratio)));
      finalizeCurrentTrial(numericValue);
    },
    [finalizeCurrentTrial, gamePhase, isAnswerLocked]
  );

  return {
    currentStage,
    currentShape,
    gamePhase,
    handleAnswer,
    handleCountdownComplete,
    handleTimeUp,
    headerText,
    isPickerDisabled,
    isTimerRunning,
    answerMarkerRatio,
    finishedAccuracy,
    remainingQuestions,
    selectedValue,
    showCountdown,
  };
};
