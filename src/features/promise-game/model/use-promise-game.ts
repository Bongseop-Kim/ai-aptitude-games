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
  pick,
  shuffle,
} from "@/shared/lib";

type SymbolToken = "A" | "B" | "C" | "D" | "E" | "F";
type ShowOption = SymbolToken | "none";

type PromiseRound = {
  promptCards: SymbolToken[][];
  target: SymbolToken | null;
  options: ShowOption[];
};

type Phase = "countdown" | "playing" | "finished";

const ALL_TOKENS: SymbolToken[] = ["A", "B", "C", "D", "E", "F"];
const ROUND_COUNT = 12;
const ROUND_TIME_SEC = 8;
const ROUND_GAP_MS = 320;
const PROMISE_GAME_KEY: AssessmentGameKey = "promise";
const PROMISE_DIFFICULTY: AssessmentDifficultyTier = "normal";

const VALID_OPTIONS = new Set<string>([...ALL_TOKENS, "none"]);

function createRoundCards(target: SymbolToken | null): SymbolToken[][] {
  const rounds: SymbolToken[][] = [[], [], []];

  if (target !== null) {
    for (let i = 0; i < 3; i += 1) {
      const candidates = ALL_TOKENS.filter((token) => token !== target);
      rounds[i] = shuffle([target, pick(candidates), pick(candidates)]);
    }

    return rounds;
  }

  const avoidCommon = (() => {
    const first = shuffle(ALL_TOKENS).slice(0, 3);
    const second = shuffle(ALL_TOKENS.filter((token) => token !== first[0])).slice(0, 3);
    const third = shuffle(ALL_TOKENS.filter((token) => token !== first[0] && token !== second[0])).slice(0, 3);

    return [first, second, third] as SymbolToken[][];
  })();

  return avoidCommon;
}

function makeOptions(target: SymbolToken | null): ShowOption[] {
  const pool = new Set<ShowOption>([]);
  const distractors = shuffle(ALL_TOKENS.filter((token) => token !== target));

  for (let i = 0; i < 3; i += 1) {
    pool.add(distractors[i]);
  }

  pool.add("none");
  if (target !== null) {
    pool.add(target);
  }

  return shuffle([...pool]).slice(0, 4);
}

function generateRounds(): PromiseRound[] {
  return Array.from({ length: ROUND_COUNT }, () => {
    const hasCommon = Math.random() > 0.5;
    const target = hasCommon ? pick(ALL_TOKENS) : null;
    const promptCards = createRoundCards(target);
    const options = makeOptions(target);

    return { promptCards, target, options };
  });
}

function inferCorrectness(target: SymbolToken | null, answer: ShowOption) {
  return (target === null && answer === "none") || (target !== null && answer === target);
}

export const usePromiseGame = () => {
  const [phase, setPhase] = useState<Phase>("countdown");
  const [questionIndex, setQuestionIndex] = useState(0);
  const latestQuestionIndexRef = useLatestRef<number | null>(questionIndex);
  const latestPhaseRef = useLatestRef(phase);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [showCountdown, setShowCountdown] = useState(true);
  const [isAnswerLocked, setIsAnswerLocked] = useState(false);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [answerMarkerRatio, setAnswerMarkerRatio] = useState<number | null>(null);
  const transitionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const questionStartAtRef = useRef<number>(Date.now());
  const sessionIdRef = useRef(generateSessionId("promise"));
  const hasStartedRef = useRef(false);
  const hasCompletedRef = useRef(false);
  const presentedQuestionRef = useRef<number | null>(null);
  const latencyTracker = useLatencyTracker();

  const rounds = useMemo(() => generateRounds(), []);
  const totalRounds = rounds.length;
  const currentRound = rounds[questionIndex];

  const startRound = useCallback(() => {
    setIsTimerRunning(true);
    setIsAnswerLocked(false);
    setAnswerMarkerRatio(null);
    questionStartAtRef.current = Date.now();
  }, []);

  const finalizeRound = useCallback(
    (answer: ShowOption | undefined) => {
      if (!currentRound || isAnswerLocked || phase !== "playing") {
        return;
      }

      const elapsed = Date.now() - questionStartAtRef.current;
      const ratio = Math.min(1, Math.max(0, elapsed / (ROUND_TIME_SEC * 1000)));
      const selected = answer ?? "none";
      const isCorrect = inferCorrectness(currentRound.target, selected);
      const nextCorrectCount = correctAnswers + (isCorrect ? 1 : 0);
      const { nextAnsweredCount, nextAvgLatencyMs } = latencyTracker.recordAnswer(elapsed);

      setIsAnswerLocked(true);
      setIsTimerRunning(false);
      setAnswerMarkerRatio(ratio);
      setCorrectAnswers(nextCorrectCount);

      emitAssessmentEvent({
        gameKey: PROMISE_GAME_KEY,
        sessionId: sessionIdRef.current,
        eventType: "response_submitted",
        difficultyTier: PROMISE_DIFFICULTY,
        blockIndex: 0,
        trialIndex: questionIndex,
        latencyMs: elapsed,
        isCorrect,
        payload: {
          selected,
          target: currentRound.target,
        },
      });

      emitAssessmentEvent({
        gameKey: PROMISE_GAME_KEY,
        sessionId: sessionIdRef.current,
        eventType: "trial_scored",
        difficultyTier: PROMISE_DIFFICULTY,
        blockIndex: 0,
        trialIndex: questionIndex,
        latencyMs: elapsed,
        isCorrect,
      });

      if (questionIndex + 1 >= totalRounds) {
        const scoring = buildSessionCompletionScoringPayload({
          gameKey: PROMISE_GAME_KEY,
          difficultyTier: PROMISE_DIFFICULTY,
          totalQuestions: totalRounds,
          correctCount: nextCorrectCount,
          answeredCount: nextAnsweredCount,
          avgLatencyMs: nextAvgLatencyMs,
        });
        setPhase("finished");
        hasCompletedRef.current = true;
        emitAssessmentEvent({
          gameKey: PROMISE_GAME_KEY,
          sessionId: sessionIdRef.current,
          eventType: "session_completed",
          difficultyTier: PROMISE_DIFFICULTY,
          blockIndex: 0,
          trialIndex: questionIndex,
          latencyMs: null,
          isCorrect: null,
          payload: {
            correctCount: nextCorrectCount,
            totalQuestions: totalRounds,
            ...scoring,
          },
        });
        return;
      }

      transitionTimerRef.current = setTimeout(() => {
        setQuestionIndex((prev) => prev + 1);
        startRound();
      }, ROUND_GAP_MS);
    },
    [
      correctAnswers,
      currentRound,
      isAnswerLocked,
      phase,
      questionIndex,
      startRound,
      totalRounds,
    ],
  );

  const handleAnswer = useCallback(
    (value: string | undefined) => {
      if (!VALID_OPTIONS.has(value ?? "")) {
        return;
      }
      finalizeRound(value as ShowOption);
    },
    [finalizeRound],
  );

  const handleCountdownComplete = useCallback(() => {
    setShowCountdown(false);
    setPhase("playing");
    startRound();
    if (!hasStartedRef.current) {
      hasStartedRef.current = true;
      emitAssessmentEvent({
        gameKey: PROMISE_GAME_KEY,
        sessionId: sessionIdRef.current,
        eventType: "session_started",
        difficultyTier: PROMISE_DIFFICULTY,
        blockIndex: 0,
        trialIndex: null,
        latencyMs: null,
        isCorrect: null,
        payload: buildFixedDifficultySessionStartPayload(PROMISE_DIFFICULTY),
      });
    }
  }, [startRound]);

  const handleTimeUp = useCallback(() => {
    finalizeRound("none");
  }, [finalizeRound]);

  useEffect(() => {
    const sessionId = sessionIdRef.current;
    return () => {
      if (transitionTimerRef.current) {
        clearTimeout(transitionTimerRef.current);
      }

      emitSessionAbandonedIfNeeded({
        gameKey: PROMISE_GAME_KEY,
        sessionId,
        difficultyTier: PROMISE_DIFFICULTY,
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
    if (phase !== "playing" || !currentRound) {
      return;
    }

    if (presentedQuestionRef.current === questionIndex) {
      return;
    }

    presentedQuestionRef.current = questionIndex;
    emitAssessmentEvent({
      gameKey: PROMISE_GAME_KEY,
      sessionId: sessionIdRef.current,
      eventType: "trial_presented",
      difficultyTier: PROMISE_DIFFICULTY,
      blockIndex: 0,
      trialIndex: questionIndex,
      latencyMs: null,
      isCorrect: null,
    });
  }, [currentRound, phase, questionIndex]);

  return {
    phase,
    totalRounds,
    currentRound: currentRound ?? null,
    currentIndex: questionIndex,
    answerMarkerRatio,
    isAnswerLocked,
    isTimerRunning,
    showCountdown,
    questionDurationSec: ROUND_TIME_SEC,
    finishedAccuracy:
      totalRounds === 0 ? 0 : Math.round((correctAnswers / totalRounds) * 100),
    handleAnswer,
    handleCountdownComplete,
    handleTimeUp,
  };
};
