import { Box } from '../../design-system/components/Box';
import { HStack, VStack } from '../../design-system/components/Stack';
import { Text } from '../../design-system/components/Text';
import type { TokenSize } from '../../design-system/components/style-props';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Icon } from '../ui/Icon';

export type AnalysisStatusCardProps = {
  variant: 'pending' | 'failed';
  title?: string;
  body?: string;
  minHeight?: TokenSize;
  onRetry?: () => void;
};

const DEFAULTS = {
  pending: {
    title: '결과를 분석하고 있어요',
    body: '게임 기록을 바탕으로 역량을 계산하는 중이에요. 잠시 후 다시 확인해주세요.',
  },
  failed: {
    title: '리포트를 분석하지 못했어요',
    body: '잠시 후 다시 시도해주세요. 게임 기록은 그대로 남아 있어요.',
  },
} as const;

// Analysis can take minutes, so the icon stays static — no looping spinner.
export function AnalysisStatusCard({ variant, title, body, minHeight = 'x16', onRetry }: AnalysisStatusCardProps) {
  const defaults = DEFAULTS[variant];
  const isFailed = variant === 'failed';

  return (
    <Card minHeight={minHeight}>
      <VStack gap="x3">
        <HStack align="center" gap="x3">
          <Box
            alignItems="center"
            bg={isFailed ? 'bg.layerDefaultPressed' : 'bg.brandWeak'}
            borderRadius="full"
            height="x10"
            justifyContent="center"
            width="x10"
          >
            <Icon name={isFailed ? 'Triangle' : 'Clock'} color={isFailed ? 'fg.critical' : 'fg.brand'} />
          </Box>
          <VStack flex={1} gap="x1">
            <Text textStyle="t4Bold">{title ?? defaults.title}</Text>
            <Text color="fg.neutralMuted" textStyle="t2Regular">
              {body ?? defaults.body}
            </Text>
          </VStack>
        </HStack>
        {isFailed && onRetry ? (
          <Button label="다시 시도" iconLeft="RotateCcw" variant="weak" size="small" onPress={onRetry} />
        ) : null}
      </VStack>
    </Card>
  );
}
