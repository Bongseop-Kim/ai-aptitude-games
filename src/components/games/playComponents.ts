import type { ComponentType } from 'react';

import type { GamePlayProps } from '../../domain/games/play';
import type { GameId } from '../../domain/types';
import { CatPlay } from './cat/CatPlay';
import { ComparePlay } from './compare/ComparePlay';
import { MemoryPlay } from './memory/MemoryPlay';
import { NumbersPlay } from './numbers/NumbersPlay';
import { PathPlay } from './path/PathPlay';
import { PromisePlay } from './promise/PromisePlay';
import { PotionPlay } from './potion/PotionPlay';
import { RotatePlay } from './rotate/RotatePlay';
import { RpsPlay } from './rps/RpsPlay';

export const playComponents: Record<GameId, ComponentType<GamePlayProps>> = {
  cat: CatPlay,
  compare: ComparePlay,
  memory: MemoryPlay,
  numbers: NumbersPlay,
  path: PathPlay,
  potion: PotionPlay,
  promise: PromisePlay,
  rotate: RotatePlay,
  rps: RpsPlay,
};
