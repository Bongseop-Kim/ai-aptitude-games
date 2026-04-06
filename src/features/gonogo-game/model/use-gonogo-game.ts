import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
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

type GoNoGoTrial = {
  isGo: boolean;
  label: string;
};

type Phase = "countdown" | "playing" | "finished";

const GO_NO_GO_TRIALS = 40;
const TRIAL_TIME_SEC = 1.5;
const TRIAL_GAP_MS = 320;
const GO_PROBABILITY = 0.65;

const GO_STIMULUS: GoNoGoTrial = { isGo: true, label: "🟢" };
const NO_GO_STIMULUS: GoNoGoTrial = { isGo: false, label: "🔴" };
const GONO_GAME_KEY: AssessmentGameKey = "gonogo";
const GONO_DIFFICULTY: AssessmentDifficultyTier = "normal";

function createTrials(): GoNoGoTrial[] {
  return Array.from({ length: GO_NO_GO_TRIALS }, () => {
    const isGo = Math.random() < GO_PROBABILITY;
    return isGo ? GO_STIMULUS : NO_GO_STIMULUS;
  });
}

export const useGoNoGoGame = () => {
  const [phase, setPhase] = useState<Phase>("countdown");
  const latestPhaseRef = useLatestRef(phase);
  const [showCountdown, setShowCountdown] = useState(true);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [isAnswerLocked, setIsAnswerLocked] = useState(false);
  const [answerMarkerRatio, setAnswerMarkerRatio] = useState<number | null>(null);
  const [questionIndex, setQuestionIndex] = useState(0);
  const latestTrialIndexRef = useLatestRef<number | null>(questionIndex);
  const [correctCount, setCorrectCount] = useState(0);
  const [isTapCorrect, setIsTapCorrect] = useState<boolean | null>(null);
  const trialStartAtRef = useRef<number>(Date.now());
  const sessionIdRef = useRef(generateSessionId("gonogo"));
  const hasStartedRef = useRef(false);
  const hasCompletedRef = useRef(false);
  const presentedTrialRef = useRef<number | null>(null);
  const latencyTracker = useLatencyTracker();

  const trials = useMemo(() => createTrials(), []);
  const totalTrials = trials.length;
  const currentTrial = trials[questionIndex];

  const nextTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const prepareCurrentTrial = useCallback(() => {
    setIsAnswerLocked(false);
    setIsTapCorrect(null);
    setAnswerMarkerRatio(null);
    trialStartAtRef.current = Date.now();
    setIsTimerRunning(true);
  }, []);

  const finalizeQuestion = useCallback(
    (didTap: boolean) => {
      if (!currentTrial || isAnswerLocked) {
        return;
      }

      const latencyMs = Math.max(0, Date.now() - trialStartAtRef.current);
      const ratio = Math.min(1, Math.max(0, latencyMs / (TRIAL_TIME_SEC * 1000)));
      const isCorrect = currentTrial.isGo ? didTap : !didTap;
      const nextCorrectCount = correctCount + (isCorrect ? 1 : 0);
      const { nextAnsweredCount, nextAvgLatencyMs } = latencyTracker.recordAnswer(latencyMs);
      setIsTapCorrect(isCorrect);
      setIsAnswerLocked(true);
      setIsTimerRunning(false);
      setAnswerMarkerRatio(ratio);
      setCorrectCount(nextCorrectCount);

      emitAssessmentEvent({
        gameKey: GONO_GAME_KEY,
        sessionId: sessionIdRef.current,
        eventType: "response_submitted",
        difficultyTier: GONO_DIFFICULTY,
        blockIndex: 0,
        trialIndex: questionIndex,
        latencyMs,
        isCorrect,
      });
      emitAssessmentEvent({
        gameKey: GONO_GAME_KEY,
        sessionId: sessionIdRef.current,
        eventType: "trial_scored",
        difficultyTier: GONO_DIFFICULTY,
        blockIndex: 0,
        trialIndex: questionIndex,
        latencyMs,
        isCorrect,
      });

      if (questionIndex + 1 >= totalTrials) {
        const scoring = buildSessionCompletionScoringPayload({
          gameKey: GONO_GAME_KEY,
          difficultyTier: GONO_DIFFICULTY,
          totalQuestions: totalTrials,
          correctCount: nextCorrectCount,
          answeredCount: nextAnsweredCount,
          avgLatencyMs: nextAvgLatencyMs,
        });
        setPhase("finished");
        hasCompletedRef.current = true;
        emitAssessmentEvent({
          gameKey: GONO_GAME_KEY,
          sessionId: sessionIdRef.current,
          eventType: "session_completed",
          difficultyTier: GONO_DIFFICULTY,
          blockIndex: 0,
          trialIndex: questionIndex,
          latencyMs: null,
          isCorrect: null,
          payload: {
            correctCount: nextCorrectCount,
            totalQuestions: totalTrials,
            ...scoring,
          },
        });
        return;
      }

      nextTimerRef.current = setTimeout(() => {
        setQuestionIndex((prev) => prev + 1);
        prepareCurrentTrial();
      }, TRIAL_GAP_MS);
    },
    [
      currentTrial,
      isAnswerLocked,
      latencyTracker,
      prepareCurrentTrial,
      questionIndex,
      totalTrials,
    ]
  );

  const handleTap = useCallback(() => {
    if (phase !== "playing" || isAnswerLocked) {
      return;
    }
    finalizeQuestion(true);
  }, [finalizeQuestion, isAnswerLocked, phase]);

  const handleTimeUp = useCallback(() => {
    if (phase !== "playing" || isAnswerLocked) {
      return;
    }
    finalizeQuestion(false);
  }, [finalizeQuestion, isAnswerLocked, phase]);

  const handleCountdownComplete = useCallback(() => {
    setShowCountdown(false);
    setPhase("playing");
    prepareCurrentTrial();
    if (!hasStartedRef.current) {
      hasStartedRef.current = true;
      emitAssessmentEvent({
        gameKey: GONO_GAME_KEY,
        sessionId: sessionIdRef.current,
        eventType: "session_started",
        difficultyTier: GONO_DIFFICULTY,
        blockIndex: 0,
        trialIndex: null,
        latencyMs: null,
        isCorrect: null,
        payload: buildFixedDifficultySessionStartPayload(GONO_DIFFICULTY),
      });
    }
  }, [prepareCurrentTrial]);

  useEffect(() => {
    if (phase !== "playing" || currentTrial == null) return;

    if (presentedTrialRef.current === questionIndex) {
      return;
    }

    presentedTrialRef.current = questionIndex;
    emitAssessmentEvent({
      gameKey: GONO_GAME_KEY,
      sessionId: sessionIdRef.current,
      eventType: "trial_presented",
      difficultyTier: GONO_DIFFICULTY,
      blockIndex: 0,
      trialIndex: questionIndex,
      latencyMs: null,
      isCorrect: null,
    });
  }, [currentTrial, phase, questionIndex]);

  useEffect(() => {
    const sessionId = sessionIdRef.current;
    return () => {
      if (nextTimerRef.current) {
        clearTimeout(nextTimerRef.current);
      }

      emitSessionAbandonedIfNeeded({
        gameKey: GONO_GAME_KEY,
        sessionId,
        difficultyTier: GONO_DIFFICULTY,
        blockIndex: 0,
        trialIndex: latestTrialIndexRef.current,
        hasStarted: hasStartedRef.current,
        hasCompleted: hasCompletedRef.current,
        payload: {
          reason: "hook_unmount",
          phase: latestPhaseRef.current,
        },
      });
    };
  }, []);

  return {
    phase,
    currentTrial: currentTrial ?? null,
    currentIndex: questionIndex,
    totalTrials,
    showCountdown,
    isTimerRunning,
    answerMarkerRatio,
    isAnswerLocked,
    isTapCorrect,
    isFinished: phase === "finished",
    trialTimeSec: TRIAL_TIME_SEC,
    accuracyPercent:
      totalTrials === 0 ? 0 : Math.round((correctCount / totalTrials) * 100),
    handleTap,
    handleCountdownComplete,
    handleTimeUp,
  };
};
