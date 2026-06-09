import { Box } from '../../design-system/components/Box';
import { HStack, VStack } from '../../design-system/components/Stack';
import { Text } from '../../design-system/components/Text';
import { Badge } from '../ui/Badge';
import { Card } from '../ui/Card';

export type GameInstructionListProps = {
  items: string[];
};

export function GameInstructionList({ items }: GameInstructionListProps) {
  return (
    <Card gap="x3">
      <Text textStyle="t5Bold">이렇게 진행돼요</Text>
      <VStack gap="x2">
        {items.map((item, index) => (
          <HStack key={`${item}-${index}`} align="flexStart" gap="x2">
            <Badge label={`${index + 1}`} tone="brand" size="small" />
            <Box flex={1}>
              <Text color="fg.neutralMuted" textStyle="t4Regular">
                {item}
              </Text>
            </Box>
          </HStack>
        ))}
      </VStack>
    </Card>
  );
}
