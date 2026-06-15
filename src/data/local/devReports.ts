import type { SQLiteDatabase } from 'expo-sqlite';

import type { MockExamReport } from '../../domain/report';

// Dev-only local store for seeded dummy reports. The real report body lives in the
// server-only `mock_exam_reports` table, which the client cannot populate; this
// table lets the dev seed render every report section locally. Guarded by __DEV__
// at the call sites (useMockExamReport, devSeed).

type DevReportRow = {
  report: string;
};

export async function insertDevReport(
  db: SQLiteDatabase,
  mockExamId: string,
  report: MockExamReport,
): Promise<void> {
  await db.runAsync(
    'INSERT OR REPLACE INTO dev_mock_exam_reports (mock_exam_id, report) VALUES (?, ?)',
    mockExamId,
    JSON.stringify(report),
  );
}

export async function getDevReport(
  db: SQLiteDatabase,
  mockExamId: string,
): Promise<MockExamReport | null> {
  const row = await db.getFirstAsync<DevReportRow>(
    'SELECT report FROM dev_mock_exam_reports WHERE mock_exam_id = ?',
    mockExamId,
  );
  if (row == null) {
    return null;
  }
  return JSON.parse(row.report) as MockExamReport;
}
