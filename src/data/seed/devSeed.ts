import * as Crypto from 'expo-crypto';
import type { SQLiteDatabase } from 'expo-sqlite';

import { numbersSequenceLength } from '../../domain/games/numbers';
import { clamp } from '../../domain/games/random';
import {
  averageResponseMs,
  clampDifficulty,
  computeGameScore,
  roundDifficulty,
  type GameRoundResult,
} from '../../domain/games/results';
import type { GameId } from '../../domain/types';
import { gameContent } from '../gameContent';
import { games } from '../games';
import { GENERIC_QUESTION_BANK } from '../interview/genericQuestionBank';
import { insertGameResult } from '../local/gameResults';
import { insertInterviewAnswers, type InterviewAnswerInput } from '../local/interviewAnswers';
import { insertInterviewSession } from '../local/interviewSessions';
import { getMockExamResultCount, insertMockExamResult } from '../local/mockExamResults';
import { insertDevReport } from '../local/devReports';
import { buildDummyReport } from './buildDummyReport';

const SEED_INTERVIEW_COMPANY = '리플로우';
const SEED_INTERVIEW_ROLE = '프론트엔드 엔지니어';

export type DevSeedSummary = {
  gameResults: number;
  mockExams: number;
  interviews: number;
  reports: number;
};

const DAY_MS = 24 * 60 * 60 * 1000;
const MINUTE_MS = 60 * 1000;

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomFloat(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

function formatSqliteUtc(date: Date) {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  const hours = String(date.getUTCHours()).padStart(2, '0');
  const minutes = String(date.getUTCMinutes()).padStart(2, '0');
  const seconds = String(date.getUTCSeconds()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

function randomDateWithinPastDays(days: number) {
  return new Date(Date.now() - Math.random() * days * DAY_MS);
}

function buildSeedInterviewAnswerInputs(count: number): InterviewAnswerInput[] {
  return GENERIC_QUESTION_BANK.it.slice(0, count).map((question) => ({
    questionId: question.id,
    questionText: question.text,
    category: question.category,
    questionSource: 'generic',
    prepMs: 20 * 1000,
    answerMs: randomInt(60, 90) * 1000,
    retakeCount: 0,
    mediaLocalUri: null,
  }));
}

function weeklyMockExamDate(roundIndex: number) {
  const weeksAgo = 5 - roundIndex;
  const jitterMs = randomInt(0, 18) * 60 * 60 * 1000;
  return new Date(Date.now() - weeksAgo * 7 * DAY_MS - jitterMs);
}

function recentInterviewDate(sessionIndex: number) {
  const daysAgo = [18, 9, 2][sessionIndex] ?? 1;
  const jitterMs = randomInt(0, 8) * 60 * 60 * 1000;
  return new Date(Date.now() - daysAgo * DAY_MS - jitterMs);
}

function seedLevelParams(gameId: GameId, roundIndex: number): GameRoundResult['levelParams'] {
  if (gameId === 'numbers') {
    return { digits: numbersSequenceLength(roundIndex) };
  }
  if (gameId === 'memory') {
    if (roundIndex % 3 === 0) return null;
    return { n_back: roundIndex % 3 === 1 ? 2 : 3 };
  }
  return null;
}

function seedDifficulty(gameId: GameId, roundIndex: number, totalRounds: number) {
  if (gameId === 'numbers') {
    return clampDifficulty(30 + numbersSequenceLength(roundIndex) * 8);
  }
  if (gameId === 'memory') {
    return clampDifficulty(45 + (roundIndex % 3) * 12);
  }
  return roundDifficulty(roundIndex, totalRounds, 42, 24);
}

function buildSeedGameInput(gameId: GameId) {
  const totalRounds = gameContent[gameId].totalRounds;
  const targetAccuracy = randomFloat(0.45, 1);
  const rounds: GameRoundResult[] = [];
  let correctCount = 0;

  for (let roundIndex = 1; roundIndex <= totalRounds; roundIndex += 1) {
    const correct = Math.random() < targetAccuracy;
    if (correct) {
      correctCount += 1;
    }
    rounds.push({
      roundIndex,
      correct,
      responseMs: randomInt(600, 2500),
      difficulty: seedDifficulty(gameId, roundIndex, totalRounds),
      levelParams: seedLevelParams(gameId, roundIndex),
    });
  }

  return {
    gameId,
    score: computeGameScore(correctCount, totalRounds),
    accuracy: correctCount / totalRounds,
    avgResponseMs: averageResponseMs(rounds.map((round) => round.responseMs)),
    rounds,
  };
}

type SeedExamItem = {
  itemKey: GameId | 'interview';
  gameResultId?: string;
  interviewSessionId?: string;
  score: number;
  durationMs: number;
  completedAt: string;
};

async function insertSeedExamItems(
  db: SQLiteDatabase,
  userId: string,
  mockExamId: string,
  items: SeedExamItem[],
) {
  for (const item of items) {
    await db.runAsync(
      `INSERT INTO mock_exam_result_items (
        mock_exam_id,
        item_key,
        user_id,
        game_result_id,
        interview_session_id,
        score,
        duration_ms,
        completed_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      mockExamId,
      item.itemKey,
      userId,
      item.gameResultId ?? null,
      item.interviewSessionId ?? null,
      item.score,
      item.durationMs,
      item.completedAt,
    );
  }
}

async function seedMockExamRound(
  db: SQLiteDatabase,
  userId: string,
  options: { startedAt: Date },
) {
  await db.withTransactionAsync(async () => {
    const mockExamId = Crypto.randomUUID();
    const items: SeedExamItem[] = [];
    let itemTime = options.startedAt.getTime();

    for (const game of games) {
      const input = buildSeedGameInput(game.id);
      const durationMs = randomInt(60, 180) * 1000;
      itemTime += durationMs + randomInt(10, 40) * 1000;
      const completedAt = formatSqliteUtc(new Date(itemTime));
      const resultId = await insertGameResult(db, userId, input, {
        mockExamId,
        createdAt: completedAt,
      });
      items.push({ itemKey: game.id, gameResultId: resultId, score: input.score, durationMs, completedAt });
    }

    const gameScoreAverage =
      items.reduce((sum, item) => sum + item.score, 0) / items.length;
    const interviewScore = clamp(Math.round(gameScoreAverage) + randomInt(-8, 8), 40, 100);
    const interviewDurationMs = randomInt(6, 10) * MINUTE_MS + randomInt(0, 45) * 1000;
    itemTime += interviewDurationMs + randomInt(10, 40) * 1000;
    const interviewCompletedAt = formatSqliteUtc(new Date(itemTime));
    const interviewId = Crypto.randomUUID();

    await insertInterviewSession(
      db,
      userId,
      {
        company: SEED_INTERVIEW_COMPANY,
        role: SEED_INTERVIEW_ROLE,
        score: interviewScore,
        questionCount: 8,
        durationMs: interviewDurationMs,
      },
      { id: interviewId, createdAt: interviewCompletedAt, mockExamId },
    );
    await insertInterviewAnswers(db, userId, interviewId, buildSeedInterviewAnswerInputs(8));
    items.push({
      itemKey: 'interview',
      interviewSessionId: interviewId,
      score: interviewScore,
      durationMs: interviewDurationMs,
      completedAt: interviewCompletedAt,
    });

    const totalScore = items.reduce((sum, item) => sum + item.score, 0);
    const totalDurationMs = items.reduce((sum, item) => sum + item.durationMs, 0);
    const examScore = Math.round(totalScore / items.length);

    await insertMockExamResult(
      db,
      userId,
      {
        score: examScore,
        durationMs: totalDurationMs,
      },
      { id: mockExamId, createdAt: interviewCompletedAt },
    );
    await insertSeedExamItems(db, userId, mockExamId, items);

    const perGameScores: Record<string, number> = {};
    const perGameDifficulties: Record<string, number> = {};
    for (const item of items) {
      if (item.itemKey !== 'interview') {
        perGameScores[item.itemKey] = item.score;
      }
    }
    for (const game of games) {
      const rounds = await db.getAllAsync<{ difficulty: number }>(
        `SELECT game_result_rounds.difficulty
         FROM game_result_rounds
         INNER JOIN game_results ON game_results.id = game_result_rounds.result_id
         WHERE game_results.mock_exam_id = ? AND game_results.game_id = ?`,
        mockExamId,
        game.id,
      );
      perGameDifficulties[game.id] = Math.round(
        rounds.reduce((sum, round) => sum + round.difficulty, 0) / Math.max(1, rounds.length),
      );
    }
    const report = buildDummyReport({
      score: examScore,
      perGameScores,
      perGameDifficulties,
      interviewScore,
    });
    await insertDevReport(db, mockExamId, report);
  });
}

export async function seedDevData(db: SQLiteDatabase, userId: string): Promise<DevSeedSummary> {
  if (!__DEV__) {
    return { gameResults: 0, mockExams: 0, interviews: 0, reports: 0 };
  }

  let gameResults = 0;
  for (const game of games) {
    const resultCount = randomInt(1, 2);
    for (let index = 0; index < resultCount; index += 1) {
      await insertGameResult(db, userId, buildSeedGameInput(game.id), {
        createdAt: formatSqliteUtc(randomDateWithinPastDays(21)),
      });
      gameResults += 1;
    }
  }

  const interviewSessions = [
    {
      company: SEED_INTERVIEW_COMPANY,
      role: SEED_INTERVIEW_ROLE,
      score: randomInt(60, 68),
      questionCount: 8,
      durationMs: randomInt(6, 8) * MINUTE_MS + randomInt(0, 45) * 1000,
    },
    {
      company: '오월컴퍼니',
      role: '프론트엔드 엔지니어',
      score: randomInt(69, 77),
      questionCount: 6,
      durationMs: randomInt(5, 7) * MINUTE_MS + randomInt(0, 45) * 1000,
    },
    {
      company: '오월컴퍼니',
      role: '프론트엔드 엔지니어 (Web)',
      score: randomInt(78, 85),
      questionCount: 8,
      durationMs: randomInt(7, 10) * MINUTE_MS + randomInt(0, 45) * 1000,
    },
  ];

  for (const [index, session] of interviewSessions.entries()) {
    const sessionId = await insertInterviewSession(db, userId, session, {
      createdAt: formatSqliteUtc(recentInterviewDate(index)),
    });
    await insertInterviewAnswers(
      db,
      userId,
      sessionId,
      buildSeedInterviewAnswerInputs(session.questionCount),
    );
  }
  const interviews = interviewSessions.length;

  const existingMockExamCount = await getMockExamResultCount(db, userId);
  if (existingMockExamCount > 0) {
    await seedMockExamRound(db, userId, { startedAt: new Date() });
    return { gameResults: gameResults + games.length, mockExams: 1, interviews: interviews + 1, reports: 1 };
  }

  for (let round = 0; round < 6; round += 1) {
    await seedMockExamRound(db, userId, {
      startedAt: weeklyMockExamDate(round),
    });
  }

  return {
    gameResults: gameResults + games.length * 6,
    mockExams: 6,
    interviews: interviews + 6,
    reports: 6,
  };
}

export async function clearAllLocalData(db: SQLiteDatabase) {
  if (!__DEV__) {
    return;
  }

  // This only clears local records. Rows already pushed to Supabase remain on the
  // server because client deletes are intentionally unsupported by append-only RLS.
  await db.withTransactionAsync(async () => {
    await db.runAsync('DELETE FROM game_result_rounds');
    await db.runAsync('DELETE FROM game_results');
    await db.runAsync('DELETE FROM interview_answers');
    await db.runAsync('DELETE FROM interview_sessions');
    await db.runAsync('DELETE FROM mock_exam_result_items');
    await db.runAsync('DELETE FROM mock_exam_results');
    await db.runAsync('DELETE FROM dev_mock_exam_reports');
  });
}
