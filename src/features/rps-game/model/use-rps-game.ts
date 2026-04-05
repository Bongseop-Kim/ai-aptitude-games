import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  AssessmentDifficultyTier,
  AssessmentGameKey,
  emitAssessmentEvent,
} from "@/shared/lib";

type Hand = "rock" | "paper" | "scissors";

type RpsRound = {
  opponentHand: Hand;
  target: "win" | "lose";
};

type Phase = "countdown" | "playing" | "finished";

const ROUND_COUNT = 24;
const ROUND_TIME_SEC = 3;
const ROUND_GAP_MS = 300;
const RPS_GAME_KEY: AssessmentGameKey = "rps";
const RPS_DIFFICULTY: AssessmentDifficultyTier = "normal";

const HANDS: Hand[] = ["rock", "paper", "scissors"];

const HAND_EMOJI: Record<Hand, string> = {
  rock: "✊",
  paper: "🖐️",
  scissors: "✌️",
};

function randomHand() {
  return HANDS[Math.floor(Math.random() * HANDS.length)] ?? "rock";
}

function randomBoolean() {
  return Math.random() >= 0.5;
}

function evaluateRound(user: Hand, opponent: Hand): "win" | "lose" | "draw" {
  if (user === opponent) return "draw";

  if (
    (user === "rock" && opponent === "scissors") ||
    (user === "paper" && opponent === "rock") ||
    (user === "scissors" && opponent === "paper")
  ) {
    return "win";
  }

  return "lose";
}

function createRounds(): RpsRound[] {
  return Array.from({ length: ROUND_COUNT }, () => ({
    opponentHand: randomHand(),
    target: randomBoolean() ? "win" : "lose",
  }));
}

export const useRpsGame = () => {
  const [phase, setPhase] = useState<Phase>("countdown");
  const [questionIndex, setQuestionIndex] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [isAnswerLocked, setIsAnswerLocked] = useState(false);
  const [answerMarkerRatio, setAnswerMarkerRatio] = useState<number | null>(null);
  const [questionStartAt, setQuestionStartAt] = useState<number>(Date.now());
  const [showCountdown, setShowCountdown] = useState(true);
  const sessionIdRef = useRef(
    `rps-${Date.now()}-${Math.floor(Math.random() * 1_000_000)}`
  );
  const hasStartedRef = useRef(false);
  const presentedQuestionRef = useRef<number | null>(null);

  const rounds = useMemo(() => createRounds(), []);
  const totalRounds = rounds.length;
  const currentRound = rounds[questionIndex];
  const nextTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const prepareRound = useCallback(() => {
    setIsAnswerLocked(false);
    setAnswerMarkerRatio(null);
    setQuestionStartAt(Date.now());
    setIsTimerRunning(true);
  }, []);

  const finalizeRound = useCallback(
    (userHand: Hand | undefined) => {
      if (!currentRound || isAnswerLocked || phase !== "playing") {
        return;
      }

      const elapsed = Math.max(0, Date.now() - questionStartAt);
      const ratio = Math.min(1, elapsed / (ROUND_TIME_SEC * 1000));
      const userResult =
        userHand === undefined ? "draw" : evaluateRound(userHand, currentRound.opponentHand);
      const isCorrect = currentRound.target === userResult;
      const nextCorrectCount = correctAnswers + (isCorrect ? 1 : 0);

      setIsAnswerLocked(true);
      setIsTimerRunning(false);
      setAnswerMarkerRatio(ratio);
      setCorrectAnswers(nextCorrectCount);

      emitAssessmentEvent({
        gameKey: RPS_GAME_KEY,
        sessionId: sessionIdRef.current,
        eventType: "response_submitted",
        difficultyTier: RPS_DIFFICULTY,
        blockIndex: 0,
        trialIndex: questionIndex,
        latencyMs: elapsed,
        isCorrect,
        payload: {
          userHand: userHand ?? "timeout",
          opponentHand: currentRound.opponentHand,
          target: currentRound.target,
          result: userResult,
        },
      });

      emitAssessmentEvent({
        gameKey: RPS_GAME_KEY,
        sessionId: sessionIdRef.current,
        eventType: "trial_scored",
        difficultyTier: RPS_DIFFICULTY,
        blockIndex: 0,
        trialIndex: questionIndex,
        latencyMs: elapsed,
        isCorrect,
      });

      if (questionIndex + 1 >= totalRounds) {
        setPhase("finished");
        emitAssessmentEvent({
          gameKey: RPS_GAME_KEY,
          sessionId: sessionIdRef.current,
          eventType: "session_completed",
          difficultyTier: RPS_DIFFICULTY,
          blockIndex: 0,
          trialIndex: questionIndex,
          latencyMs: null,
          isCorrect: null,
          payload: {
            correctCount: nextCorrectCount,
            totalQuestions: totalRounds,
          },
        });
        return;
      }

      nextTimerRef.current = setTimeout(() => {
        setQuestionIndex((prev) => prev + 1);
        prepareRound();
      }, ROUND_GAP_MS);
    },
    [
      correctAnswers,
      currentRound,
      isAnswerLocked,
      phase,
      prepareRound,
      questionIndex,
      questionStartAt,
      totalRounds,
    ]
  );

  const handleAnswer = useCallback(
    (value: string | undefined) => {
      if (value !== "rock" && value !== "paper" && value !== "scissors") {
        return;
      }
      finalizeRound(value);
    },
    [finalizeRound]
  );

  const handleTimeUp = useCallback(() => {
    finalizeRound(undefined);
  }, [finalizeRound]);

  const handleCountdownComplete = useCallback(() => {
    setShowCountdown(false);
    setPhase("playing");
    prepareRound();
    if (!hasStartedRef.current) {
      hasStartedRef.current = true;
      emitAssessmentEvent({
        gameKey: RPS_GAME_KEY,
        sessionId: sessionIdRef.current,
        eventType: "session_started",
        difficultyTier: RPS_DIFFICULTY,
        blockIndex: 0,
        trialIndex: null,
        latencyMs: null,
        isCorrect: null,
      });
    }
  }, [prepareRound]);

  useEffect(() => {
    if (phase !== "playing" || !currentRound) {
      return;
    }

    if (presentedQuestionRef.current === questionIndex) {
      return;
    }

    presentedQuestionRef.current = questionIndex;
    emitAssessmentEvent({
      gameKey: RPS_GAME_KEY,
      sessionId: sessionIdRef.current,
      eventType: "trial_presented",
      difficultyTier: RPS_DIFFICULTY,
      blockIndex: 0,
      trialIndex: questionIndex,
      latencyMs: null,
      isCorrect: null,
    });
  }, [currentRound, phase, questionIndex]);

  useEffect(() => {
    return () => {
      if (nextTimerRef.current) {
        clearTimeout(nextTimerRef.current);
      }
    };
  }, []);

  return {
    phase,
    currentIndex: questionIndex,
    totalRounds,
    currentRound: currentRound ?? null,
    currentRule: currentRound?.target ?? null,
    isTimerRunning,
    isAnswerLocked,
    showCountdown,
    answerMarkerRatio,
    finishedAccuracy:
      totalRounds === 0 ? 0 : Math.round((correctAnswers / totalRounds) * 100),
    questionDurationSec: ROUND_TIME_SEC,
    handEmoji: HAND_EMOJI,
    handleAnswer,
    handleCountdownComplete,
    handleTimeUp,
  };
};
