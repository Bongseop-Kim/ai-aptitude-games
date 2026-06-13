export type MediaKind = 'audio' | 'video';

export type MediaSpec = {
  kind: MediaKind;
  extension: 'm4a' | 'mp4';
  contentType: string;
};

export const AUDIO_SPEC: MediaSpec = { kind: 'audio', extension: 'm4a', contentType: 'audio/mp4' };
export const VIDEO_SPEC: MediaSpec = { kind: 'video', extension: 'mp4', contentType: 'video/mp4' };

// Resolves a media spec from a stored file path/uri: '.mp4' → video, else audio.
export function mediaSpecForExtension(path: string): MediaSpec {
  return path.endsWith('.mp4') ? VIDEO_SPEC : AUDIO_SPEC;
}
