import {
  AssessmentDifficultyTier,
  AssessmentGameKey,
  buildFixedDifficultySessionStartPayload,
  emitAssessmentEvent,
  emitSessionAbandonedIfNeeded,
  buildSessionCompletionScoringPayload,
  useLatencyTracker,
  generateSessionId,
  useLatestRef,
} from "@/shared/lib";
import { useCallback, useEffect, useRef, useState } from "react";

type StroopAnswer = "match" | "mismatch";

type StroopColor = {
  key: string;
  label: string;
  value: string;
};

type StroopQuestion = {
  word: StroopColor;
  displayedColor: StroopColor;
  isMatch: boolean;
};

type Phase = "countdown" | "playing" | "finished";

const STROOP_QUESTIONS = 20;
const STROOP_TIME_PER_QUESTION_SEC = 3;
const STROOP_QUESTION_GAP_MS = 350;
const STROOP_GAME_KEY: AssessmentGameKey = "stroop";
const STROOP_DIFFICULTY: AssessmentDifficultyTier = "normal";

const STROOP_COLORS: StroopColor[] = [
  { key: "red", label: "빨강", value: "#ef4444" },
  { key: "blue", label: "파랑", value: "#3b82f6" },
  { key: "green", label: "초록", value: "#22c55e" },
  { key: "orange", label: "주황", value: "#f97316" },
  { key: "purple", label: "보라", value: "#8b5cf6" },
];

const pickRandomIndex = (maxExclusive: number) =>
  Math.floor(Math.random() * maxExclusive);

const generateQuestion = (): StroopQuestion => {
  const word = STROOP_COLORS[pickRandomIndex(STROOP_COLORS.length)]!;
  const shouldMatch = Math.random() >= 0.5;

  if (shouldMatch) {
    return {
      word,
      displayedColor: word,
      isMatch: true,
    };
  }

  const wrongCandidates = STROOP_COLORS.filter((color) => color.key !== word.key);
  const displayedColor =
    wrongCandidates[pickRandomIndex(wrongCandidates.length)]!;

  return {
    word,
    displayedColor,
    isMatch: false,
  };
};

const generateQuestions = (count: number): StroopQuestion[] =>
  Array.from({ length: count }, () => generateQuestion());

export const useStroopGame = () => {
  const [gamePhase, setGamePhase] = useState<Phase>("countdown");
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<StroopAnswer | undefined>();
  const [isAnswerLocked, setIsAnswerLocked] = useState(false);
  const [showCountdown, setShowCountdown] = useState(true);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [answerMarkerRatio, setAnswerMarkerRatio] = useState<number | null>(
    null
  );
  const [finishedAccuracy, setFinishedAccuracy] = useState<number | null>(null);
  const [answeredQuestions, setAnsweredQuestions] = useState(0);

  const questions = useRef(generateQuestions(STROOP_QUESTIONS)).current;
  const questionStartAtRef = useRef<number | null>(null);
  const resultRef = useRef<boolean[]>([]);
  const transitionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const presentedQuestionRef = useRef<number | null>(null);
  const hasStartedRef = useRef(false);
  const hasCompletedRef = useRef(false);
  const sessionIdRef = useRef(generateSessionId("stroop"));
  const latestQuestionIndexRef = useLatestRef<number | null>(questionIndex);
  const latestPhaseRef = useLatestRef(gamePhase);
  const latencyTracker = useLatencyTracker();

  const currentQuestion = questions[questionIndex];
  const remainingQuestions = STROOP_QUESTIONS - questionIndex;

  const finalizeQuestion = useCallback(
    (answer: StroopAnswer | undefined) => {
      if (!currentQuestion || isAnswerLocked || gamePhase !== "playing") return;

      const elapsedMs =
        questionStartAtRef.current == null
          ? STROOP_TIME_PER_QUESTION_SEC * 1000
          : Math.max(0, Date.now() - questionStartAtRef.current);
      const expectedAnswer: StroopAnswer = currentQuestion.isMatch
        ? "match"
        : "mismatch";
      const isCorrect = answer === expectedAnswer;
      const normalizedAnswerRatio = Math.min(
        1,
        elapsedMs / (STROOP_TIME_PER_QUESTION_SEC * 1000)
      );

      resultRef.current.push(isCorrect);
      const { nextAnsweredCount, nextAvgLatencyMs } = latencyTracker.recordAnswer(elapsedMs);
      setAnsweredQuestions(nextAnsweredCount);
      setIsAnswerLocked(true);
      setIsTimerRunning(false);
      setAnswerMarkerRatio(normalizedAnswerRatio);

      emitAssessmentEvent({
        gameKey: STROOP_GAME_KEY,
        sessionId: sessionIdRef.current,
        eventType: "response_submitted",
        difficultyTier: STROOP_DIFFICULTY,
        blockIndex: 0,
        trialIndex: questionIndex,
        latencyMs: elapsedMs,
        isCorrect,
        payload: {
          expected: currentQuestion.isMatch ? "match" : "mismatch",
          answer: answer ?? "timeout",
        },
      });

      emitAssessmentEvent({
        gameKey: STROOP_GAME_KEY,
        sessionId: sessionIdRef.current,
        eventType: "trial_scored",
        difficultyTier: STROOP_DIFFICULTY,
        blockIndex: 0,
        trialIndex: questionIndex,
        latencyMs: elapsedMs,
        isCorrect,
      });

      const nextIndex = questionIndex + 1;
      if (nextIndex >= STROOP_QUESTIONS) {
        const correctCount = resultRef.current.filter((v) => v).length;
        const totalCount = resultRef.current.length;
        const scoring = buildSessionCompletionScoringPayload({
          gameKey: STROOP_GAME_KEY,
          difficultyTier: STROOP_DIFFICULTY,
          totalQuestions: totalCount,
          correctCount,
          answeredCount: totalCount,
          avgLatencyMs: totalCount > 0 ? nextAvgLatencyMs : null,
        });
        setFinishedAccuracy(totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0);
        setGamePhase("finished");
        hasCompletedRef.current = true;
        emitAssessmentEvent({
          gameKey: STROOP_GAME_KEY,
          sessionId: sessionIdRef.current,
          eventType: "session_completed",
          difficultyTier: STROOP_DIFFICULTY,
          blockIndex: 0,
          trialIndex: questionIndex,
          latencyMs: null,
          isCorrect: null,
          payload: {
            correctCount,
            totalQuestions: totalCount,
            ...scoring,
          },
        });
        return;
      }

      if (transitionTimerRef.current) {
        clearTimeout(transitionTimerRef.current);
      }
      transitionTimerRef.current = setTimeout(() => {
        setSelectedAnswer(undefined);
        setIsAnswerLocked(false);
        setAnswerMarkerRatio(null);
        setQuestionIndex(nextIndex);
      }, STROOP_QUESTION_GAP_MS);
    },
    [currentQuestion, gamePhase, isAnswerLocked, questionIndex],
  );

  const handleAnswer = useCallback(
    (value: string | undefined) => {
      if (
        !value ||
        isAnswerLocked ||
        gamePhase !== "playing" ||
        (value !== "match" &&
        value !== "mismatch")
      ) {
        return;
      }
      setSelectedAnswer(value);
      finalizeQuestion(value);
    },
    [finalizeQuestion, gamePhase, isAnswerLocked]
  );

  const handleCountdownComplete = useCallback(() => {
    setShowCountdown(false);
    setGamePhase("playing");
    if (!hasStartedRef.current) {
      hasStartedRef.current = true;
      emitAssessmentEvent({
        gameKey: STROOP_GAME_KEY,
        sessionId: sessionIdRef.current,
        eventType: "session_started",
        difficultyTier: STROOP_DIFFICULTY,
        blockIndex: 0,
        trialIndex: null,
        latencyMs: null,
        isCorrect: null,
        payload: buildFixedDifficultySessionStartPayload(STROOP_DIFFICULTY),
      });
    }
  }, []);

  const handleTimeUp = useCallback(() => {
    finalizeQuestion(undefined);
  }, [finalizeQuestion]);

  useEffect(() => {
    if (gamePhase !== "playing") return;

    setIsAnswerLocked(false);
    setAnswerMarkerRatio(null);
    setSelectedAnswer(undefined);
    questionStartAtRef.current = Date.now();
    setIsTimerRunning(true);
  }, [gamePhase, questionIndex]);

  useEffect(() => {
    const sessionId = sessionIdRef.current;
    return () => {
      if (transitionTimerRef.current) {
        clearTimeout(transitionTimerRef.current);
      }

      emitSessionAbandonedIfNeeded({
        gameKey: STROOP_GAME_KEY,
        sessionId,
        difficultyTier: STROOP_DIFFICULTY,
        blockIndex: 0,
        trialIndex: latestQuestionIndexRef.current,
        hasStarted: hasStartedRef.current,
        hasCompleted: hasCompletedRef.current,
        payload: {
          reason: "hook_unmount",
          phase: latestPhaseRef.current,
        },
      });
    };
  }, []);

  useEffect(() => {
    if (gamePhase !== "playing" || !currentQuestion) return;
    if (presentedQuestionRef.current === questionIndex) return;

    presentedQuestionRef.current = questionIndex;
    emitAssessmentEvent({
      gameKey: STROOP_GAME_KEY,
      sessionId: sessionIdRef.current,
      eventType: "trial_presented",
      difficultyTier: STROOP_DIFFICULTY,
      blockIndex: 0,
      trialIndex: questionIndex,
      latencyMs: null,
      isCorrect: null,
    });
  }, [currentQuestion, gamePhase, questionIndex]);

  return {
    currentQuestion,
    gamePhase,
    remainingQuestions,
    answeredQuestions,
    selectedAnswer,
    sessionId: sessionIdRef.current,
    isAnswerLocked,
    isTimerRunning,
    showCountdown,
    answerMarkerRatio,
    finishedAccuracy,
    handleAnswer,
    handleCountdownComplete,
    handleTimeUp,
    questionDurationSec: STROOP_TIME_PER_QUESTION_SEC,
  };
};
