import { Directory, File, Paths } from 'expo-file-system';

const ROOT_DIR = 'interview-media';

function sessionDirectory(sessionDraftId: string) {
  return new Directory(Paths.document, ROOT_DIR, sessionDraftId);
}

// Moves a cache recording into a stable per-question path that survives OS cache
// purges. Overwrites the existing file on retake. Returns the persistent uri.
export async function persistRecording(
  sessionDraftId: string,
  questionId: string,
  cacheUri: string,
) {
  const directory = sessionDirectory(sessionDraftId);
  directory.create({ intermediates: true, idempotent: true });

  const target = new File(directory, `${questionId}.m4a`);
  if (target.exists) {
    target.delete();
  }

  const source = new File(cacheUri);
  await source.move(target, { overwrite: true });

  return target.uri;
}

export function deleteRecording(localUri: string) {
  try {
    const file = new File(localUri);
    if (file.exists) {
      file.delete();
    }
  } catch (error) {
    if (__DEV__) {
      console.warn('[interviewRecordingFiles] deleteRecording failed:', error);
    }
  }
}

export function deleteSessionRecordings(sessionDraftId: string) {
  try {
    const directory = sessionDirectory(sessionDraftId);
    if (directory.exists) {
      directory.delete();
    }
  } catch (error) {
    if (__DEV__) {
      console.warn('[interviewRecordingFiles] deleteSessionRecordings failed:', error);
    }
  }
}
