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

type ShapeMatrix = number[][];

type RotationPuzzle = {
  baseShape: ShapeMatrix;
  targetShape: ShapeMatrix;
};

type Transform = {
  rotation: 0 | 1 | 2 | 3;
  flipH: boolean;
  flipV: boolean;
};

type Phase = "countdown" | "playing" | "finished";

const SHAPE_LIBRARY: ShapeMatrix[] = [
  [
    [0, 1, 1, 1, 0],
    [0, 0, 1, 0, 0],
    [0, 0, 1, 0, 0],
    [0, 0, 1, 0, 0],
    [0, 0, 1, 0, 0],
  ],
  [
    [0, 0, 1, 0, 0],
    [0, 1, 1, 1, 0],
    [1, 1, 1, 1, 1],
    [0, 1, 1, 1, 0],
    [0, 0, 1, 0, 0],
  ],
  [
    [0, 1, 0, 0, 0],
    [1, 1, 1, 0, 0],
    [0, 1, 0, 0, 0],
    [0, 1, 1, 1, 0],
    [0, 0, 0, 0, 1],
  ],
  [
    [0, 0, 0, 0, 0],
    [0, 1, 1, 1, 0],
    [1, 1, 1, 0, 1],
    [1, 0, 1, 0, 0],
    [0, 1, 1, 1, 0],
  ],
  [
    [0, 0, 1, 0, 0],
    [0, 1, 0, 1, 0],
    [1, 0, 1, 0, 1],
    [0, 1, 0, 1, 0],
    [0, 0, 1, 0, 0],
  ],
  [
    [0, 1, 1, 1, 0],
    [1, 0, 1, 0, 1],
    [1, 1, 1, 1, 1],
    [1, 0, 1, 0, 1],
    [0, 1, 1, 1, 0],
  ],
];

const TOTAL_QUESTIONS = 15;
const QUESTION_TIME_SEC = 6;
const INTER_QUESTION_DELAY_MS = 600;
const ROTATION_GAME_KEY: AssessmentGameKey = "rotation";
const ROTATION_DIFFICULTY: AssessmentDifficultyTier = "normal";

const EMPTY_MATRIX: ShapeMatrix = Array.from({ length: 5 }, () =>
  Array.from({ length: 5 }, () => 0)
);

function cloneMatrix(matrix: ShapeMatrix): ShapeMatrix {
  return matrix.map((row) => [...row]);
}

function rotateRight(matrix: ShapeMatrix): ShapeMatrix {
  const next = Array.from({ length: 5 }, () => Array.from({ length: 5 }, () => 0));

  for (let row = 0; row < 5; row += 1) {
    for (let col = 0; col < 5; col += 1) {
      next[col][4 - row] = matrix[row][col];
    }
  }
  return next;
}

function flipHorizontal(matrix: ShapeMatrix): ShapeMatrix {
  const next = cloneMatrix(matrix);
  for (let row = 0; row < 5; row += 1) {
    next[row].reverse();
  }
  return next;
}

function flipVertical(matrix: ShapeMatrix): ShapeMatrix {
  const next = cloneMatrix(matrix);
  next.reverse();
  return next;
}

function applyTransform(matrix: ShapeMatrix, transform: Transform): ShapeMatrix {
  let result = cloneMatrix(matrix);

  if (transform.flipH) {
    result = flipHorizontal(result);
  }
  if (transform.flipV) {
    result = flipVertical(result);
  }

  for (let i = 0; i < transform.rotation; i += 1) {
    result = rotateRight(result);
  }

  return result;
}

function isSameShape(a: ShapeMatrix, b: ShapeMatrix): boolean {
  if (a.length !== b.length) {
    return false;
  }

  for (let row = 0; row < a.length; row += 1) {
    for (let col = 0; col < a[row].length; col += 1) {
      if (a[row][col] !== b[row][col]) {
        return false;
      }
    }
  }

  return true;
}

function randomInt(maxExclusive: number) {
  return Math.floor(Math.random() * maxExclusive);
}

function generatePuzzleSet(): RotationPuzzle[] {
  return Array.from({ length: TOTAL_QUESTIONS }, () => {
    const baseShape = cloneMatrix(
      SHAPE_LIBRARY[randomInt(SHAPE_LIBRARY.length)] ?? SHAPE_LIBRARY[0]
    );
    const transform = {
      rotation: randomInt(4) as Transform["rotation"],
      flipH: randomInt(2) === 1,
      flipV: randomInt(2) === 1,
    };

    return {
      baseShape,
      targetShape: applyTransform(baseShape, transform),
    };
  });
}

export const useRotationGame = () => {
  const [phase, setPhase] = useState<Phase>("countdown");
  const [questionIndex, setQuestionIndex] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [currentTransform, setCurrentTransform] = useState<Transform>({
    rotation: 0,
    flipH: false,
    flipV: false,
  });
  const [isAnswerLocked, setIsAnswerLocked] = useState(false);
  const [showCountdown, setShowCountdown] = useState(true);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [answerMarkerRatio, setAnswerMarkerRatio] = useState<number | null>(null);
  const latestQuestionIndexRef = useLatestRef<number | null>(questionIndex);
  const latestPhaseRef = useLatestRef(phase);
  const transitionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const questionStartAtRef = useRef<number>(Date.now());
  const sessionIdRef = useRef(generateSessionId("rotation"));
  const hasStartedRef = useRef(false);
  const hasCompletedRef = useRef(false);
  const presentedQuestionRef = useRef<number | null>(null);
  const latencyTracker = useLatencyTracker();

  const puzzles = useMemo(() => generatePuzzleSet(), []);
  const currentPuzzle = puzzles[questionIndex];
  const totalQuestions = puzzles.length;
  const currentIndex = Math.min(questionIndex, Math.max(totalQuestions - 1, 0));

  const transformedPuzzle = useMemo(
    () =>
      currentPuzzle
        ? applyTransform(currentPuzzle.baseShape, currentTransform)
        : EMPTY_MATRIX,
    [currentPuzzle, currentTransform]
  );

  useEffect(() => {
    const sessionId = sessionIdRef.current;
    return () => {
      if (transitionTimerRef.current) {
        clearTimeout(transitionTimerRef.current);
      }

      emitSessionAbandonedIfNeeded({
        gameKey: ROTATION_GAME_KEY,
        sessionId,
        difficultyTier: ROTATION_DIFFICULTY,
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

  const prepareNextQuestion = useCallback(() => {
    setCurrentTransform({
      rotation: 0,
      flipH: false,
      flipV: false,
    });
    setIsAnswerLocked(false);
    setAnswerMarkerRatio(null);
    questionStartAtRef.current = Date.now();
    setIsTimerRunning(true);
  }, []);

  const finalizeQuestion = useCallback(
    (isCorrect: boolean) => {
      if (!currentPuzzle || isAnswerLocked || phase !== "playing") {
        return;
      }

      const elapsed = Math.max(0, Date.now() - questionStartAtRef.current);
      const nextCorrectCount = correctAnswers + (isCorrect ? 1 : 0);
      const { nextAnsweredCount, nextAvgLatencyMs } = latencyTracker.recordAnswer(elapsed);
      setCorrectAnswers(nextCorrectCount);
      setIsAnswerLocked(true);
      setIsTimerRunning(false);
      setAnswerMarkerRatio(
        Math.min(1, Math.max(0, elapsed / (QUESTION_TIME_SEC * 1000)))
      );

      emitAssessmentEvent({
        gameKey: ROTATION_GAME_KEY,
        sessionId: sessionIdRef.current,
        eventType: "response_submitted",
        difficultyTier: ROTATION_DIFFICULTY,
        blockIndex: 0,
        trialIndex: questionIndex,
        latencyMs: elapsed,
        isCorrect,
        payload: {
          transformedCount: transformedPuzzle.flat().reduce((sum, value) => sum + value, 0),
          isCorrect,
        },
      });

      emitAssessmentEvent({
        gameKey: ROTATION_GAME_KEY,
        sessionId: sessionIdRef.current,
        eventType: "trial_scored",
        difficultyTier: ROTATION_DIFFICULTY,
        blockIndex: 0,
        trialIndex: questionIndex,
        latencyMs: elapsed,
        isCorrect,
      });

      if (questionIndex + 1 >= TOTAL_QUESTIONS) {
        const scoring = buildSessionCompletionScoringPayload({
          gameKey: ROTATION_GAME_KEY,
          difficultyTier: ROTATION_DIFFICULTY,
          totalQuestions,
          correctCount: nextCorrectCount,
          answeredCount: nextAnsweredCount,
          avgLatencyMs: nextAvgLatencyMs,
        });
        setPhase("finished");
        hasCompletedRef.current = true;
        emitAssessmentEvent({
          gameKey: ROTATION_GAME_KEY,
          sessionId: sessionIdRef.current,
          eventType: "session_completed",
          difficultyTier: ROTATION_DIFFICULTY,
          blockIndex: 0,
          trialIndex: questionIndex,
          latencyMs: null,
          isCorrect: null,
          payload: {
            correctCount: nextCorrectCount,
            totalQuestions: totalQuestions,
            ...scoring,
          },
        });
        return;
      }

      transitionTimerRef.current = setTimeout(() => {
        setQuestionIndex((prev) => prev + 1);
        prepareNextQuestion();
      }, INTER_QUESTION_DELAY_MS);
    },
    [
      currentPuzzle,
      phase,
      isAnswerLocked,
      questionIndex,
      transformedPuzzle,
      correctAnswers,
      totalQuestions,
      prepareNextQuestion,
    ]
  );

  const handleSubmit = useCallback(() => {
    if (phase !== "playing" || isAnswerLocked || !currentPuzzle) {
      return;
    }
    const isCorrect = isSameShape(transformedPuzzle, currentPuzzle.targetShape);
    finalizeQuestion(isCorrect);
  }, [currentPuzzle, finalizeQuestion, isAnswerLocked, phase, transformedPuzzle]);

  const handleTimeUp = useCallback(() => {
    if (phase !== "playing" || isAnswerLocked) {
      return;
    }
    finalizeQuestion(false);
  }, [finalizeQuestion, phase, isAnswerLocked]);

  const rotateRight = useCallback(() => {
    if (phase !== "playing" || isAnswerLocked) {
      return;
    }
    setCurrentTransform((prev) => ({
      ...prev,
      rotation: (((prev.rotation + 1) % 4) as Transform["rotation"]),
    }));
  }, [phase, isAnswerLocked]);

  const flipHorizontalAxis = useCallback(() => {
    if (phase !== "playing" || isAnswerLocked) {
      return;
    }
    setCurrentTransform((prev) => ({
      ...prev,
      flipH: !prev.flipH,
    }));
  }, [phase, isAnswerLocked]);

  const flipVerticalAxis = useCallback(() => {
    if (phase !== "playing" || isAnswerLocked) {
      return;
    }
    setCurrentTransform((prev) => ({
      ...prev,
      flipV: !prev.flipV,
    }));
  }, [phase, isAnswerLocked]);

  const resetTransform = useCallback(() => {
    if (phase !== "playing") {
      return;
    }
    setCurrentTransform({
      rotation: 0,
      flipH: false,
      flipV: false,
    });
  }, [phase]);

  const handleCountdownComplete = useCallback(() => {
    setShowCountdown(false);
    setPhase("playing");
    prepareNextQuestion();
    if (!hasStartedRef.current) {
      hasStartedRef.current = true;
      emitAssessmentEvent({
        gameKey: ROTATION_GAME_KEY,
        sessionId: sessionIdRef.current,
        eventType: "session_started",
        difficultyTier: ROTATION_DIFFICULTY,
        blockIndex: 0,
        trialIndex: null,
        latencyMs: null,
        isCorrect: null,
        payload: buildFixedDifficultySessionStartPayload(ROTATION_DIFFICULTY),
      });
    }
  }, [prepareNextQuestion]);

  useEffect(() => {
    if (phase !== "playing" || !currentPuzzle) {
      return;
    }

    if (presentedQuestionRef.current === questionIndex) {
      return;
    }

    presentedQuestionRef.current = questionIndex;
    emitAssessmentEvent({
      gameKey: ROTATION_GAME_KEY,
      sessionId: sessionIdRef.current,
      eventType: "trial_presented",
      difficultyTier: ROTATION_DIFFICULTY,
      blockIndex: 0,
      trialIndex: questionIndex,
      latencyMs: null,
      isCorrect: null,
    });
  }, [currentPuzzle, phase, questionIndex]);

  return {
    currentIndex,
    totalQuestions,
    phase,
    puzzleTarget: currentPuzzle?.targetShape ?? EMPTY_MATRIX,
    transformedPuzzle,
    correctAnswers,
    rotateRight,
    flipHorizontalAxis,
    flipVerticalAxis,
    resetTransform,
    handleSubmit,
    handleTimeUp,
    handleCountdownComplete,
    answerMarkerRatio,
    showCountdown,
    isTimerRunning,
    isAnswerLocked,
    remainingTime: QUESTION_TIME_SEC,
  };
};
