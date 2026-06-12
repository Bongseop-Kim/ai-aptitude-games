import { Text } from '../../design-system/components/Text';
import { Icon } from '../ui/Icon';
import { List } from '../ui/List';

export type RankingRowProps = {
  rank: number;
  name: string;
  score: number;
  current?: boolean;
};

export function RankingRow({ rank, name, score, current = false }: RankingRowProps) {
  return (
    <List.Item>
      <List.Prefix>
        <Icon name="Trophy" color="fg.brand" />
      </List.Prefix>
      <List.Content>
        <List.Title>{`${rank}위 · ${name}`}</List.Title>
        {current ? <List.Detail>내 순위</List.Detail> : null}
      </List.Content>
      <List.Suffix>
        <Text color="fg.neutralMuted" textStyle="t3Medium" maxLines={1}>
          {`${score}점`}
        </Text>
      </List.Suffix>
    </List.Item>
  );
}
