import { File } from 'expo-file-system';
import type { SQLiteDatabase } from 'expo-sqlite';

import { supabase } from '../../lib/supabase';
import { mediaSpecForExtension } from '../../domain/interviewMedia';
import {
  getInterviewAnswerById,
  getPendingMediaAnswers,
  markInterviewAnswerMediaFailed,
  markInterviewAnswerMediaUploaded,
  markInterviewAnswerMediaUploading,
  type InterviewAnswerRow,
} from '../local/interviewAnswers';
import { pushUnsyncedInterviewAnswers } from '../sync/interviewAnswersSync';
import { deleteRecording } from './interviewRecordingFiles';

const MEDIA_BUCKET = 'interview-media';

const inFlightAnswerIds = new Set<string>();

async function uploadSingle(db: SQLiteDatabase, userId: string, row: InterviewAnswerRow) {
  if (inFlightAnswerIds.has(row.id)) {
    return;
  }
  inFlightAnswerIds.add(row.id);

  try {
    if (row.mediaLocalUri == null) {
      await markInterviewAnswerMediaFailed(db, row.id, { fileLost: true });
      return;
    }

    const file = new File(row.mediaLocalUri);
    if (!file.exists) {
      await markInterviewAnswerMediaFailed(db, row.id, { fileLost: true });
      return;
    }

    const bytes = await file.bytes();
    const spec = mediaSpecForExtension(row.mediaLocalUri ?? row.mediaPath ?? '');
    const path = `${userId}/${row.sessionId}/${row.questionId}.${spec.extension}`;

    const { error: uploadError } = await supabase.storage
      .from(MEDIA_BUCKET)
      .upload(path, bytes.buffer as ArrayBuffer, { contentType: spec.contentType, upsert: true });
    if (uploadError) {
      if (__DEV__) {
        console.warn('[interviewMediaUpload] storage upload failed:', row.id, uploadError.message);
      }
      await markInterviewAnswerMediaFailed(db, row.id);
      return;
    }

    const { data: updated, error: updateError } = await supabase
      .from('interview_answers')
      .update({ media_path: path, media_status: 'uploaded' })
      .eq('id', row.id)
      .select('id');

    if (updateError || (updated?.length ?? 0) === 0) {
      // Server row may not exist yet — upsert the full payload as a fallback.
      const { error: upsertError } = await supabase.from('interview_answers').upsert(
        {
          id: row.id,
          session_id: row.sessionId,
          user_id: userId,
          question_id: row.questionId,
          question_text: row.questionText,
          answer_text: row.answerText,
          category: row.category,
          question_source: row.questionSource,
          prep_ms: row.prepMs,
          answer_ms: row.answerMs,
          retake_count: row.retakeCount,
          media_path: path,
          media_status: 'uploaded',
        },
        { onConflict: 'id' },
      );
      if (upsertError) {
        if (__DEV__) {
          console.warn('[interviewMediaUpload] confirm failed:', row.id, upsertError.message);
        }
        await markInterviewAnswerMediaFailed(db, row.id);
        return;
      }
    }

    await markInterviewAnswerMediaUploaded(db, row.id, path);
    deleteRecording(row.mediaLocalUri);
  } catch (error) {
    if (__DEV__) {
      console.warn('[interviewMediaUpload] upload failed:', row.id, error);
    }
    await markInterviewAnswerMediaFailed(db, row.id);
  } finally {
    inFlightAnswerIds.delete(row.id);
  }
}

// Uploads recordings for answers still marked 'uploading' (auto-resume). 'failed'
// answers wait for an explicit retry. server-confirmed: never throws to caller.
export async function uploadPendingInterviewMedia(db: SQLiteDatabase, userId: string) {
  try {
    const rows = (await getPendingMediaAnswers(db, userId)).filter(
      (row) => row.mediaStatus === 'uploading',
    );
    if (rows.length === 0) {
      return;
    }

    // Ensure server rows exist before attaching media.
    await pushUnsyncedInterviewAnswers(db, userId);

    for (const row of rows) {
      await uploadSingle(db, userId, row);
    }
  } catch (error) {
    if (__DEV__) {
      console.warn('[interviewMediaUpload] uploadPendingInterviewMedia failed:', error);
    }
  }
}

export async function retryInterviewMediaUpload(
  db: SQLiteDatabase,
  userId: string,
  answerId: string,
) {
  try {
    await markInterviewAnswerMediaUploading(db, answerId);
    await pushUnsyncedInterviewAnswers(db, userId);

    const row = await getInterviewAnswerById(db, answerId);
    if (row == null) {
      return;
    }
    await uploadSingle(db, userId, row);
  } catch (error) {
    if (__DEV__) {
      console.warn('[interviewMediaUpload] retryInterviewMediaUpload failed:', answerId, error);
    }
  }
}

// Login / foreground recovery entry point.
export function resumePendingInterviewMediaUploads(db: SQLiteDatabase, userId: string) {
  return uploadPendingInterviewMedia(db, userId);
}
