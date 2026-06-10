export type PathCellType = 'empty' | 'wall' | 'person' | 'car';

export type PathPuzzle = {
  cols: number;
  rows: number;
  cells: PathCellType[];
  fenceLimit: number;
};

export const PATH_TOTAL_ROUNDS = 4;
export const PATH_FEEDBACK_MS = 900;

const cellByLayoutChar: Record<string, PathCellType> = {
  '.': 'empty',
  '#': 'wall',
  P: 'person',
  C: 'car',
};

function parsePathPuzzle(layout: readonly string[], fenceLimit: number): PathPuzzle {
  const rows = layout.length;
  const cols = layout[0]?.length ?? 0;
  const cells = layout.flatMap((row) => {
    if (row.length !== cols) {
      throw new Error('Path puzzle rows must all have the same width.');
    }

    return [...row].map((char) => {
      const cell = cellByLayoutChar[char];
      if (!cell) {
        throw new Error(`Unsupported path puzzle cell: ${char}`);
      }
      return cell;
    });
  });

  return { cols, rows, cells, fenceLimit };
}

const pathPuzzleBank: readonly PathPuzzle[] = [
  parsePathPuzzle(['P....', '.....', '###..', '.....', '....C'], 2),
  parsePathPuzzle(['P.#.C', '..#..', '.....', '..#..', 'P...C'], 2),
  parsePathPuzzle(['P....P', '......', '##.#..', '...#..', '....CC'], 3),
  parsePathPuzzle(['P.#..C', '..#...', '#.#..#', '..#...', 'C.#..P'], 3),
];

function adjacentCellIndexes(index: number, puzzle: PathPuzzle) {
  const col = index % puzzle.cols;
  const row = Math.floor(index / puzzle.cols);
  const indexes: number[] = [];

  if (row > 0) indexes.push(index - puzzle.cols);
  if (row < puzzle.rows - 1) indexes.push(index + puzzle.cols);
  if (col > 0) indexes.push(index - 1);
  if (col < puzzle.cols - 1) indexes.push(index + 1);

  return indexes;
}

function canWalkThrough(puzzle: PathPuzzle, fences: ReadonlySet<number>, index: number) {
  return puzzle.cells[index] !== 'wall' && !fences.has(index);
}

export function createPathSession(): PathPuzzle[] {
  return pathPuzzleBank.map((puzzle) => ({
    ...puzzle,
    cells: [...puzzle.cells],
  }));
}

export function isPathSeparated(puzzle: PathPuzzle, fences: ReadonlySet<number>): boolean {
  const visited = new Set<number>();
  const queue: number[] = [];

  puzzle.cells.forEach((cell, index) => {
    if (cell === 'person' && canWalkThrough(puzzle, fences, index)) {
      visited.add(index);
      queue.push(index);
    }
  });

  for (let cursor = 0; cursor < queue.length; cursor += 1) {
    const index = queue[cursor];
    if (puzzle.cells[index] === 'car') return false;

    for (const nextIndex of adjacentCellIndexes(index, puzzle)) {
      if (visited.has(nextIndex) || !canWalkThrough(puzzle, fences, nextIndex)) continue;

      visited.add(nextIndex);
      queue.push(nextIndex);
    }
  }

  return true;
}
