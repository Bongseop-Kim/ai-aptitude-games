import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  AssessmentDifficultyTier,
  AssessmentGameKey,
  emitAssessmentEvent,
} from "@/shared/lib";

type Color = "red" | "blue" | "green";
type PotionStep = {
  sampleA: Color[];
  sampleB: Color[];
  correctColor: Color;
};

type Phase = "countdown" | "playing" | "finished";

const COLORS: Color[] = ["red", "blue", "green"];
const ROUND_COUNT = 12;
const ROUND_TIME_SEC = 8;
const ROUND_GAP_MS = 360;
const POTION_GAME_KEY: AssessmentGameKey = "potion";
const POTION_DIFFICULTY: AssessmentDifficultyTier = "normal";

function pick<T>(values: T[]): T {
  return values[Math.floor(Math.random() * values.length)] as T;
}

function randomSamples(): Color[] {
  return Array.from({ length: 4 }, () => pick(COLORS));
}

function makeStep(): PotionStep {
  const sampleA = randomSamples();
  const sampleB = randomSamples();
  const combined = [...sampleA, ...sampleB];
  const score = {
    red: combined.filter((value) => value === "red").length,
    blue: combined.filter((value) => value === "blue").length,
    green: combined.filter((value) => value === "green").length,
  };

  const maxCount = Math.max(score.red, score.blue, score.green);
  const candidates: Color[] = COLORS.filter((color) => score[color] === maxCount);
  const correctColor = pick(candidates);

  return {
    sampleA,
    sampleB,
    correctColor,
  };
}

function generateSteps(): PotionStep[] {
  return Array.from({ length: ROUND_COUNT }, makeStep);
}

function sampleLabel(color: Color) {
  if (color === "red") return "빨강";
  if (color === "blue") return "파랑";
  return "초록";
}

function renderSample(values: Color[]) {
  return values.map(sampleLabel).join(", ");
}

function counts(values: Color[]) {
  const map: Record<Color, number> = { red: 0, blue: 0, green: 0 };
  for (const value of values) {
    map[value] += 1;
  }
  return map;
}

export const usePotionGame = () => {
  const [phase, setPhase] = useState<Phase>("countdown");
  const [stepIndex, setStepIndex] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [questionStartAt, setQuestionStartAt] = useState<number>(Date.now());
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [isAnswerLocked, setIsAnswerLocked] = useState(false);
  const [showCountdown, setShowCountdown] = useState(true);
  const [answerMarkerRatio, setAnswerMarkerRatio] = useState<number | null>(null);
  const transitionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const sessionIdRef = useRef(
    `potion-${Date.now()}-${Math.floor(Math.random() * 1_000_000)}`
  );
  const hasStartedRef = useRef(false);
  const presentedRoundRef = useRef<number | null>(null);

  const steps = useMemo(() => generateSteps(), []);
  const totalSteps = steps.length;
  const currentStep = steps[stepIndex];

  useEffect(() => {
    return () => {
      if (transitionTimerRef.current) {
        clearTimeout(transitionTimerRef.current);
      }
    };
  }, []);

  const prepareStep = useCallback(() => {
    setIsAnswerLocked(false);
    setAnswerMarkerRatio(null);
    setIsTimerRunning(true);
    setQuestionStartAt(Date.now());
  }, []);

  const finalizeStep = useCallback(
    (selected: Color | null) => {
      if (!currentStep || isAnswerLocked || phase !== "playing") {
        return;
      }

      const elapsed = Date.now() - questionStartAt;
      const ratio = Math.min(1, Math.max(0, elapsed / (ROUND_TIME_SEC * 1000)));
      const isCorrect = selected === currentStep.correctColor;
      const nextCorrectCount = correctAnswers + (isCorrect ? 1 : 0);

      setIsAnswerLocked(true);
      setIsTimerRunning(false);
      setAnswerMarkerRatio(ratio);
      setCorrectAnswers(nextCorrectCount);

      emitAssessmentEvent({
        gameKey: POTION_GAME_KEY,
        sessionId: sessionIdRef.current,
        eventType: "response_submitted",
        difficultyTier: POTION_DIFFICULTY,
        blockIndex: 0,
        trialIndex: stepIndex,
        latencyMs: elapsed,
        isCorrect,
        payload: {
          selected,
          correctColor: currentStep.correctColor,
        },
      });

      emitAssessmentEvent({
        gameKey: POTION_GAME_KEY,
        sessionId: sessionIdRef.current,
        eventType: "trial_scored",
        difficultyTier: POTION_DIFFICULTY,
        blockIndex: 0,
        trialIndex: stepIndex,
        latencyMs: elapsed,
        isCorrect,
      });

      if (stepIndex + 1 >= totalSteps) {
        setPhase("finished");
        emitAssessmentEvent({
          gameKey: POTION_GAME_KEY,
          sessionId: sessionIdRef.current,
          eventType: "session_completed",
          difficultyTier: POTION_DIFFICULTY,
          blockIndex: 0,
          trialIndex: stepIndex,
          latencyMs: null,
          isCorrect: null,
          payload: {
            correctCount: nextCorrectCount,
            totalQuestions: totalSteps,
          },
        });
        return;
      }

      transitionTimerRef.current = setTimeout(() => {
        setStepIndex((prev) => prev + 1);
        prepareStep();
      }, ROUND_GAP_MS);
    },
    [
      correctAnswers,
      currentStep,
      isAnswerLocked,
      phase,
      prepareStep,
      questionStartAt,
      stepIndex,
      totalSteps,
    ],
  );

  const handleSelect = useCallback(
    (value: string | undefined) => {
      if (value !== "red" && value !== "blue" && value !== "green") {
        return;
      }
      finalizeStep(value);
    },
    [finalizeStep],
  );

  const handleTimeUp = useCallback(() => {
    finalizeStep(null);
  }, [finalizeStep]);

  const handleCountdownComplete = useCallback(() => {
    setShowCountdown(false);
    setPhase("playing");
    prepareStep();
    if (!hasStartedRef.current) {
      hasStartedRef.current = true;
      emitAssessmentEvent({
        gameKey: POTION_GAME_KEY,
        sessionId: sessionIdRef.current,
        eventType: "session_started",
        difficultyTier: POTION_DIFFICULTY,
        blockIndex: 0,
        trialIndex: null,
        latencyMs: null,
        isCorrect: null,
      });
    }
  }, [prepareStep]);

  useEffect(() => {
    if (phase !== "playing" || !currentStep) {
      return;
    }

    if (presentedRoundRef.current === stepIndex) {
      return;
    }

    presentedRoundRef.current = stepIndex;
    emitAssessmentEvent({
      gameKey: POTION_GAME_KEY,
      sessionId: sessionIdRef.current,
      eventType: "trial_presented",
      difficultyTier: POTION_DIFFICULTY,
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
    currentCounts: currentStep ? counts([...currentStep.sampleA, ...currentStep.sampleB]) : null,
    isAnswerLocked,
    isTimerRunning,
    showCountdown,
    answerMarkerRatio,
    finishedAccuracy:
      totalSteps === 0 ? 0 : Math.round((correctAnswers / totalSteps) * 100),
    stepDurationSec: ROUND_TIME_SEC,
    renderSample,
    sampleLabel,
    handleSelect,
    handleTimeUp,
    handleCountdownComplete,
  };
};
