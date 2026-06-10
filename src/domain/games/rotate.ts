import type { IconName } from '../../shared/types';

export const ROTATE_TOTAL_ROUNDS = 4;
export const ROTATE_CLICK_LIMIT = 8;
export const ROTATE_FEEDBACK_MS = 900;

export type RotateOpId = 'rotateLeft' | 'rotateRight' | 'flipH' | 'flipV';

export type RotateOp = {
  id: RotateOpId;
  label: string;
  icon: IconName;
  iconRotation?: number;
};

export type RotateState = {
  rotation: number;
  flipX: boolean;
  flipY: boolean;
};

export type CanonicalRotation = 0 | 45 | 90 | 135 | 180 | 225 | 270 | 315;

export type CanonicalRotateState = {
  rotation: CanonicalRotation;
  mirrored: boolean;
};

export const initialRotateState: RotateState = {
  rotation: 0,
  flipX: false,
  flipY: false,
};

export const rotateOps: readonly RotateOp[] = [
  { id: 'rotateLeft', label: '왼쪽 45°', icon: 'rotate-left' },
  { id: 'rotateRight', label: '오른쪽 45°', icon: 'rotate' },
  { id: 'flipH', label: '좌우 반전', icon: 'flip' },
  { id: 'flipV', label: '상하 반전', icon: 'flip', iconRotation: 90 },
];

const canonicalRotations: readonly CanonicalRotation[] = [0, 45, 90, 135, 180, 225, 270, 315];

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function normalizeRotation(rotation: number): CanonicalRotation {
  const normalized = ((rotation % 360) + 360) % 360;
  return canonicalRotations[Math.round(normalized / 45) % canonicalRotations.length];
}

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function stateKey(state: CanonicalRotateState) {
  return `${state.rotation}:${state.mirrored ? 1 : 0}`;
}

export function applyRotateOp(state: RotateState, opId: RotateOpId): RotateState {
  if (opId === 'rotateLeft') {
    return { ...state, rotation: state.rotation - 45 };
  }

  if (opId === 'rotateRight') {
    return { ...state, rotation: state.rotation + 45 };
  }

  if (opId === 'flipH') {
    return { ...state, rotation: -state.rotation, flipX: !state.flipX };
  }

  return { ...state, rotation: -state.rotation, flipY: !state.flipY };
}

export function canonicalize(state: RotateState): CanonicalRotateState {
  if (state.flipX && state.flipY) {
    return { rotation: normalizeRotation(state.rotation + 180), mirrored: false };
  }

  if (state.flipY) {
    return { rotation: normalizeRotation(state.rotation + 180), mirrored: true };
  }

  return { rotation: normalizeRotation(state.rotation), mirrored: state.flipX };
}

export function statesMatch(a: RotateState | CanonicalRotateState, b: RotateState | CanonicalRotateState) {
  const first = 'mirrored' in a ? a : canonicalize(a);
  const second = 'mirrored' in b ? b : canonicalize(b);
  return first.rotation === second.rotation && first.mirrored === second.mirrored;
}

export function createRotateTarget(): CanonicalRotateState {
  let target = canonicalize(initialRotateState);

  while (statesMatch(target, canonicalize(initialRotateState))) {
    const transformCount = randomInt(2, 4);
    let state = initialRotateState;

    for (let index = 0; index < transformCount; index += 1) {
      const op = rotateOps[randomInt(0, rotateOps.length - 1)];
      state = applyRotateOp(state, op.id);
    }

    target = canonicalize(state);
  }

  return target;
}

export function minClicksFor(target: CanonicalRotateState): number {
  const queue: Array<{ state: RotateState; clicks: number }> = [
    { state: initialRotateState, clicks: 0 },
  ];
  const visited = new Set<string>([stateKey(canonicalize(initialRotateState))]);

  while (queue.length > 0) {
    const current = queue.shift();
    if (!current) break;

    if (statesMatch(current.state, target)) {
      return current.clicks;
    }

    for (const op of rotateOps) {
      const nextState = applyRotateOp(current.state, op.id);
      const key = stateKey(canonicalize(nextState));

      if (!visited.has(key)) {
        visited.add(key);
        queue.push({ state: nextState, clicks: current.clicks + 1 });
      }
    }
  }

  return 0;
}

export function rotateRoundScore(correct: boolean, clicks: number, minClicks: number): number {
  if (!correct) return 40;
  return clamp(95 - (clicks - minClicks) * 8, 55, 95);
}

export function computeRotateScore(roundScores: readonly number[]): number {
  if (roundScores.length === 0) return 20;
  const average = roundScores.reduce((sum, score) => sum + score, 0) / roundScores.length;
  return clamp(Math.round(average), 20, 100);
}
