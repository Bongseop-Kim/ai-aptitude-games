import * as Crypto from 'expo-crypto';
import type { SQLiteDatabase } from 'expo-sqlite';

import { clamp } from '../../domain/games/random';
import { games } from '../games';
import { insertGameResult } from '../local/gameResults';
import { insertInterviewSession } from '../local/interviewSessions';
import { getMockExamResultCount, insertMockExamResult } from '../local/mockExamResults';
import { mockJobPosting } from '../interviewFlow';

export type DevSeedSummary = {
  gameResults: number;
  mockExams: number;
  interviews: number;
};

const DAY_MS = 24 * 60 * 60 * 1000;
const MINUTE_MS = 60 * 1000;

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomFloat(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

function roundToTwoDecimals(value: number) {
  return Math.round(value * 100) / 100;
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

export async function seedDevData(db: SQLiteDatabase, userId: string): Promise<DevSeedSummary> {
  if (!__DEV__) {
    return { gameResults: 0, mockExams: 0, interviews: 0 };
  }

  let gameResults = 0;
  for (const game of games) {
    const resultCount = randomInt(2, 4);
    for (let index = 0; index < resultCount; index += 1) {
      await insertGameResult(
        db,
        userId,
        {
          gameId: game.id,
          score: randomInt(45, 100),
          accuracy: roundToTwoDecimals(randomFloat(0.5, 1)),
          avgResponseMs: randomInt(600, 2500),
        },
        { createdAt: formatSqliteUtc(randomDateWithinPastDays(21)) },
      );
      gameResults += 1;
    }
  }

  const interviewSessions = [
    {
      company: mockJobPosting.company,
      role: mockJobPosting.role,
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
    await insertInterviewSession(db, userId, session, {
      createdAt: formatSqliteUtc(recentInterviewDate(index)),
    });
  }
  const interviews = interviewSessions.length;

  const existingMockExamCount = await getMockExamResultCount(db, userId);
  if (existingMockExamCount > 0) {
    const proExamScore = randomInt(55, 95);
    const proExamCreatedAt = formatSqliteUtc(new Date());
    const proMockExamId = Crypto.randomUUID();

    await insertMockExamResult(
      db,
      userId,
      {
        score: proExamScore,
        durationMs: randomInt(19, 27) * MINUTE_MS,
        pro: true,
      },
      { id: proMockExamId, createdAt: proExamCreatedAt },
    );
    await insertInterviewSession(
      db,
      userId,
      {
        company: mockJobPosting.company,
        role: mockJobPosting.role,
        score: clamp(proExamScore + randomInt(-8, 8), 40, 100),
        questionCount: 8,
        durationMs: randomInt(6, 10) * MINUTE_MS + randomInt(0, 45) * 1000,
      },
      { createdAt: proExamCreatedAt, mockExamId: proMockExamId },
    );
    return { gameResults, mockExams: 1, interviews: interviews + 1 };
  }

  let score = randomInt(58, 65);
  for (let round = 0; round < 6; round += 1) {
    if (round > 0) {
      score = clamp(score + randomInt(-3, 8), 40, 100);
    }

    const createdAt = formatSqliteUtc(weeklyMockExamDate(round));
    const mockExamId = Crypto.randomUUID();

    await insertMockExamResult(
      db,
      userId,
      {
        score,
        durationMs: randomInt(19, 27) * MINUTE_MS,
        pro: round >= 4,
      },
      { id: mockExamId, createdAt },
    );
    await insertInterviewSession(
      db,
      userId,
      {
        company: mockJobPosting.company,
        role: mockJobPosting.role,
        score: clamp(score + randomInt(-8, 8), 40, 100),
        questionCount: 8,
        durationMs: randomInt(6, 10) * MINUTE_MS + randomInt(0, 45) * 1000,
      },
      { createdAt, mockExamId },
    );
  }

  return { gameResults, mockExams: 6, interviews: interviews + 6 };
}

export async function clearAllLocalData(db: SQLiteDatabase) {
  if (!__DEV__) {
    return;
  }

  // This only clears local records. Rows already pushed to Supabase remain on the
  // server because client deletes are intentionally unsupported by append-only RLS.
  await db.withTransactionAsync(async () => {
    await db.runAsync('DELETE FROM game_results');
    await db.runAsync('DELETE FROM interview_sessions');
    await db.runAsync('DELETE FROM mock_exam_results');
  });
}
