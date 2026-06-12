import { useCallback, useEffect, useRef, useState } from 'react';

import { roundScore, type GameRoundResult } from '../../domain/games/results';

export function useRoundPlay<TAnswer>(options: {
  totalRounds: number;
  feedbackMs: number;
  onComplete: (summary: {
    correctCount: number;
    responseTimes: number[];
    rounds: GameRoundResult[];
  }) => void;
  onAdvanceRound?: (round: number) => void;
  getLevelParams?: (answer: TAnswer, round: number) => GameRoundResult['levelParams'];
}): {
  round: number;
  picked: TAnswer | null;
  correctCount: number;
  headerScore: number;
  choose: (value: TAnswer, isCorrect: boolean) => void;
  markQuestionShown: () => void;
} {
  const onCompleteRef = useRef(options.onComplete);
  const onAdvanceRoundRef = useRef(options.onAdvanceRound);
  const [round, setRound] = useState(1);
  const [picked, setPicked] = useState<TAnswer | null>(null);
  const pickedRef = useRef<TAnswer | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const responseTimesRef = useRef<number[]>([]);
  const roundsRef = useRef<GameRoundResult[]>([]);
  const questionShownAtRef = useRef<number | null>(null);
  const feedbackTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    onCompleteRef.current = options.onComplete;
  }, [options.onComplete]);

  useEffect(() => {
    onAdvanceRoundRef.current = options.onAdvanceRound;
  }, [options.onAdvanceRound]);

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
    if (pickedRef.current != null) return;

    const answeredAt = Date.now();

    const responseMs = answeredAt - (questionShownAtRef.current ?? answeredAt);

    responseTimesRef.current.push(responseMs);
    roundsRef.current.push({
      roundIndex: round,
      correct: isCorrect,
      responseMs,
      levelParams: options.getLevelParams?.(value, round) ?? null,
    });
    const nextCorrectCount = correctCount + (isCorrect ? 1 : 0);
    pickedRef.current = value;
    setPicked(value);
    setCorrectCount(nextCorrectCount);

    feedbackTimeoutRef.current = setTimeout(() => {
      if (round >= options.totalRounds) {
        onCompleteRef.current({
          correctCount: nextCorrectCount,
          responseTimes: [...responseTimesRef.current],
          rounds: [...roundsRef.current],
        });
        return;
      }

      const nextRound = round + 1;

      onAdvanceRoundRef.current?.(nextRound);
      setRound(nextRound);
      pickedRef.current = null;
      setPicked(null);
    }, options.feedbackMs);
  }, [correctCount, options, round]);

  return {
    round,
    picked,
    correctCount,
    headerScore: roundScore(correctCount, options.totalRounds),
    choose,
    markQuestionShown,
  };
}
