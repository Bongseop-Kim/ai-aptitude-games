import { HStack } from '../../design-system/components/Stack';
import { Text } from '../../design-system/components/Text';
import { MiniStat } from '../readiness/MiniStat';
import { ReadinessGauge } from '../readiness/ReadinessGauge';
import { Card } from '../ui/Card';

export type GameResultSummaryProps = {
  score: number;
  accuracy: string;
  responseTime: string;
};

export function GameResultSummary({ score, accuracy, responseTime }: GameResultSummaryProps) {
  return (
    <Card gap="x4" elevated>
      <Text align="center" textStyle="t8Bold">
        결과
      </Text>
      <ReadinessGauge score={score} label="전체 리포트는 모의고사 완료 시 열려요" />
      <HStack gap="x2">
        <MiniStat label="정답률" value={accuracy} tone="positive" />
        <MiniStat label="평균 응답" value={responseTime} tone="informative" />
      </HStack>
    </Card>
  );
}
