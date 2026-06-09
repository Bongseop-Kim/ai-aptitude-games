import { ListItem } from '../ui/ListItem';

export type RankingRowProps = {
  rank: number;
  name: string;
  score: number;
  current?: boolean;
};

export function RankingRow({ rank, name, score, current = false }: RankingRowProps) {
  return (
    <ListItem
      leadingIcon="rank"
      title={`${rank}위 · ${name}`}
      description={current ? '내 순위' : undefined}
      trailing={`${score}점`}
    />
  );
}
