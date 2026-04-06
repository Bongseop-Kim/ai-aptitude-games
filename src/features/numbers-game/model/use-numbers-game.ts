import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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

type Rule = "single" | "double" | "skip";

type NumberStep = {
  value: number;
  rule: Rule;
};

type Phase = "countdown" | "playing" | "finished";

const TOTAL_STEPS = 10;
const STEP_TIME_SEC = 6;
const STEP_GAP_MS = 320;
const DIGITS = [1, 2, 3, 4, 5, 6, 7, 8, 9];
const NUMBERS_GAME_KEY: AssessmentGameKey = "numbers";
const NUMBERS_DIFFICULTY: AssessmentDifficultyTier = "normal";
type AnswerInput = number | "skip" | "timeout";

function randomDigit() {
  return DIGITS[Math.floor(Math.random() * DIGITS.length)] ?? 1;
}

function chooseRule(): Rule {
  const dice = Math.floor(Math.random() * 3);
  if (dice === 0) return "single";
  if (dice === 1) return "double";
  return "skip";
}

function generateSteps(): NumberStep[] {
  return Array.from({ length: TOTAL_STEPS }, () => ({
    value: randomDigit(),
    rule: chooseRule(),
  }));
}

export const useNumbersGame = () => {
  const [phase, setPhase] = useState<Phase>("countdown");
  const [stepIndex, setStepIndex] = useState(0);
  const latestStepIndexRef = useLatestRef<number | null>(stepIndex);
  const latestPhaseRef = useLatestRef(phase);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [isAnswerLocked, setIsAnswerLocked] = useState(false);
  const [showCountdown, setShowCountdown] = useState(true);
  const [answerMarkerRatio, setAnswerMarkerRatio] = useState<number | null>(null);
  const [doublePressReady, setDoublePressReady] = useState(false);
  const transitionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const questionStartAtRef = useRef<number>(Date.now());
  const sessionIdRef = useRef(generateSessionId("numbers"));
  const hasStartedRef = useRef(false);
  const hasCompletedRef = useRef(false);
  const presentedQuestionRef = useRef<number | null>(null);
  const latencyTracker = useLatencyTracker();

  const steps = useMemo(() => generateSteps(), []);
  const totalSteps = steps.length;
  const currentStep = steps[stepIndex];

  useEffect(() => {
    const sessionId = sessionIdRef.current;
    return () => {
      if (transitionTimerRef.current) {
        clearTimeout(transitionTimerRef.current);
      }

      emitSessionAbandonedIfNeeded({
        gameKey: NUMBERS_GAME_KEY,
        sessionId,
        difficultyTier: NUMBERS_DIFFICULTY,
        blockIndex: 0,
        trialIndex: latestStepIndexRef.current,
        hasStarted: hasStartedRef.current,
        hasCompleted: hasCompletedRef.current,
        payload: {
          reason: "hook_unmount",
          phase: latestPhaseRef.current,
        },
      });
    };
  }, []);

  const nextStep = useCallback(() => {
    setIsAnswerLocked(false);
    setDoublePressReady(false);
    setAnswerMarkerRatio(null);
    questionStartAtRef.current = Date.now();
    setIsTimerRunning(true);
  }, []);

  const finalizeStep = useCallback(
    (isCorrect: boolean, response: AnswerInput) => {
      if (!currentStep || isAnswerLocked || phase !== "playing") {
        return;
      }

      const elapsed = Date.now() - questionStartAtRef.current;
      const ratio = Math.min(1, Math.max(0, elapsed / (STEP_TIME_SEC * 1000)));
      const nextCorrectCount = correctAnswers + (isCorrect ? 1 : 0);
      const { nextAnsweredCount, nextAvgLatencyMs } = latencyTracker.recordAnswer(elapsed);

      setIsAnswerLocked(true);
      setIsTimerRunning(false);
      setDoublePressReady(false);
      setAnswerMarkerRatio(ratio);
      setCorrectAnswers(nextCorrectCount);

      emitAssessmentEvent({
        gameKey: NUMBERS_GAME_KEY,
        sessionId: sessionIdRef.current,
        eventType: "response_submitted",
        difficultyTier: NUMBERS_DIFFICULTY,
        blockIndex: 0,
        trialIndex: stepIndex,
        latencyMs: elapsed,
        isCorrect,
        payload: {
          response,
          rule: currentStep.rule,
          expected: currentStep.value,
        },
      });

      emitAssessmentEvent({
        gameKey: NUMBERS_GAME_KEY,
        sessionId: sessionIdRef.current,
        eventType: "trial_scored",
        difficultyTier: NUMBERS_DIFFICULTY,
        blockIndex: 0,
        trialIndex: stepIndex,
        latencyMs: elapsed,
        isCorrect,
      });

      if (stepIndex + 1 >= totalSteps) {
        const scoring = buildSessionCompletionScoringPayload({
          gameKey: NUMBERS_GAME_KEY,
          difficultyTier: NUMBERS_DIFFICULTY,
          totalQuestions: totalSteps,
          correctCount: nextCorrectCount,
          answeredCount: nextAnsweredCount,
          avgLatencyMs: nextAvgLatencyMs,
        });
        setPhase("finished");
        hasCompletedRef.current = true;
        emitAssessmentEvent({
          gameKey: NUMBERS_GAME_KEY,
          sessionId: sessionIdRef.current,
          eventType: "session_completed",
          difficultyTier: NUMBERS_DIFFICULTY,
          blockIndex: 0,
          trialIndex: stepIndex,
          latencyMs: null,
          isCorrect: null,
          payload: {
            correctCount: nextCorrectCount,
            totalQuestions: totalSteps,
            ...scoring,
          },
        });
        return;
      }

      transitionTimerRef.current = setTimeout(() => {
        setStepIndex((prev) => prev + 1);
        nextStep();
      }, STEP_GAP_MS);
    },
    [
      currentStep,
      correctAnswers,
      isAnswerLocked,
      phase,
      nextStep,
      stepIndex,
      totalSteps,
    ],
  );

  const handleDigit = useCallback(
    (value: string) => {
      if (!currentStep || isAnswerLocked || phase !== "playing") {
        return;
      }
      const typed = Number.parseInt(value, 10);
      if (Number.isNaN(typed)) return;

      if (currentStep.rule === "skip") {
        finalizeStep(false, typed);
        return;
      }

      if (currentStep.rule === "single") {
        finalizeStep(typed === currentStep.value, typed);
        return;
      }

      if (!doublePressReady) {
        if (typed === currentStep.value) {
          setDoublePressReady(true);
          return;
        }
        finalizeStep(false, typed);
        return;
      }

      finalizeStep(typed === currentStep.value, typed);
    },
    [currentStep, doublePressReady, finalizeStep, isAnswerLocked, phase],
  );

  const handleSkip = useCallback(() => {
    if (!currentStep || isAnswerLocked || phase !== "playing") {
      return;
    }
    finalizeStep(currentStep.rule === "skip", "skip");
  }, [currentStep, finalizeStep, isAnswerLocked, phase]);

  const handleCountdownComplete = useCallback(() => {
    setShowCountdown(false);
    setPhase("playing");
    nextStep();
    if (!hasStartedRef.current) {
      hasStartedRef.current = true;
      emitAssessmentEvent({
        gameKey: NUMBERS_GAME_KEY,
        sessionId: sessionIdRef.current,
        eventType: "session_started",
        difficultyTier: NUMBERS_DIFFICULTY,
        blockIndex: 0,
        trialIndex: null,
        latencyMs: null,
        isCorrect: null,
        payload: buildFixedDifficultySessionStartPayload(NUMBERS_DIFFICULTY),
      });
    }
  }, [nextStep]);

  const handleTimeUp = useCallback(() => {
    finalizeStep(false, "timeout");
  }, [finalizeStep]);

  useEffect(() => {
    if (phase !== "playing" || !currentStep) {
      return;
    }

    if (presentedQuestionRef.current === stepIndex) {
      return;
    }

    presentedQuestionRef.current = stepIndex;
    emitAssessmentEvent({
      gameKey: NUMBERS_GAME_KEY,
      sessionId: sessionIdRef.current,
      eventType: "trial_presented",
      difficultyTier: NUMBERS_DIFFICULTY,
      blockIndex: 0,
      trialIndex: stepIndex,
      latencyMs: null,
      isCorrect: null,
    });
  }, [currentStep, phase, stepIndex]);

  return {
    phase,
    currentIndex: stepIndex,
    totalSteps,
    currentStep: currentStep ?? null,
    isTimerRunning,
    isAnswerLocked,
    isDoublePressReady: doublePressReady,
    sessionId: sessionIdRef.current,
    showCountdown,
    answerMarkerRatio,
    finishedAccuracy:
      totalSteps === 0 ? 0 : Math.round((correctAnswers / totalSteps) * 100),
    stepDurationSec: STEP_TIME_SEC,
    handleDigit,
    handleSkip,
    handleCountdownComplete,
    handleTimeUp,
  };
};
