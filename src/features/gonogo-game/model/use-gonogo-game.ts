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
  emitAssessmentEvent,
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
  const [showCountdown, setShowCountdown] = useState(true);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [isAnswerLocked, setIsAnswerLocked] = useState(false);
  const [answerMarkerRatio, setAnswerMarkerRatio] = useState<number | null>(null);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [isTapCorrect, setIsTapCorrect] = useState<boolean | null>(null);
  const [trialStartAt, setTrialStartAt] = useState<number>(Date.now());
  const sessionIdRef = useRef(
    `gonogo-${Date.now()}-${Math.floor(Math.random() * 1_000_000)}`
  );
  const hasStartedRef = useRef(false);
  const presentedTrialRef = useRef<number | null>(null);

  const trials = useMemo(() => createTrials(), []);
  const totalTrials = trials.length;
  const currentTrial = trials[questionIndex];

  const nextTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const prepareCurrentTrial = useCallback(() => {
    setIsAnswerLocked(false);
    setIsTapCorrect(null);
    setAnswerMarkerRatio(null);
    setTrialStartAt(Date.now());
    setIsTimerRunning(true);
  }, []);

  const finalizeQuestion = useCallback(
    (didTap: boolean) => {
      if (!currentTrial || isAnswerLocked) {
        return;
      }

      const latencyMs = Math.max(0, Date.now() - trialStartAt);
      const ratio = Math.min(1, Math.max(0, latencyMs / (TRIAL_TIME_SEC * 1000)));
      const isCorrect = currentTrial.isGo ? didTap : !didTap;

      setIsTapCorrect(isCorrect);
      setIsAnswerLocked(true);
      setIsTimerRunning(false);
      setAnswerMarkerRatio(ratio);
      setCorrectCount((prev) => prev + (isCorrect ? 1 : 0));

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
        setPhase("finished");
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
            correctCount: isCorrect ? correctCount + 1 : correctCount,
            totalQuestions: totalTrials,
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
      prepareCurrentTrial,
      questionIndex,
      totalTrials,
      trialStartAt,
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
    return () => {
      if (nextTimerRef.current) {
        clearTimeout(nextTimerRef.current);
      }
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
      totalTrials === 0 ? 0 : Math.round((correctCount / (questionIndex + 1)) * 100),
    handleTap,
    handleCountdownComplete,
    handleTimeUp,
  };
};
