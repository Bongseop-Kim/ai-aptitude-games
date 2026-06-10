import { useCallback, useEffect, useRef, useState } from 'react';

import { roundScore } from '../../domain/games/results';

export function useRoundPlay<TAnswer>(options: {
  totalRounds: number;
  feedbackMs: number;
  onComplete: (summary: { correctCount: number; responseTimes: number[] }) => void;
}): {
  round: number;
  picked: TAnswer | null;
  correctCount: number;
  headerScore: number;
  choose: (value: TAnswer, isCorrect: boolean) => void;
  markQuestionShown: () => void;
} {
  const onCompleteRef = useRef(options.onComplete);
  const [round, setRound] = useState(1);
  const [picked, setPicked] = useState<TAnswer | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const responseTimesRef = useRef<number[]>([]);
  const questionShownAtRef = useRef(Date.now());
  const feedbackTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    onCompleteRef.current = options.onComplete;
  }, [options.onComplete]);

  useEffect(() => {
    questionShownAtRef.current = Date.now();
  }, [round]);

  useEffect(() => {
    return () => {
      if (feedbackTimeoutRef.current) {
        clearTimeout(feedbackTimeoutRef.current);
      }
    };
  }, []);

  const markQuestionShown = useCallback(() => {
    questionShownAtRef.current = Date.now();
  }, []);

  const choose = useCallback((value: TAnswer, isCorrect: boolean) => {
    if (picked != null) return;

    responseTimesRef.current.push(Date.now() - questionShownAtRef.current);
    const nextCorrectCount = correctCount + (isCorrect ? 1 : 0);
    setPicked(value);
    setCorrectCount(nextCorrectCount);

    feedbackTimeoutRef.current = setTimeout(() => {
      if (round >= options.totalRounds) {
        onCompleteRef.current({
          correctCount: nextCorrectCount,
          responseTimes: [...responseTimesRef.current],
        });
        return;
      }

      setRound((value) => value + 1);
      setPicked(null);
    }, options.feedbackMs);
  }, [correctCount, options.feedbackMs, options.totalRounds, picked, round]);

  return {
    round,
    picked,
    correctCount,
    headerScore: roundScore(correctCount, options.totalRounds),
    choose,
    markQuestionShown,
  };
}
