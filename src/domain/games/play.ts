import type { Game } from '../types';
import type { GameResultInput } from './results';

export type GamePlayProps = {
  game: Game;
  onFinish: (result: GameResultInput) => void;
  onClose: () => void;
};
