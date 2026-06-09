import { HStack } from '../../design-system/components/Stack';
import { Text } from '../../design-system/components/Text';
import { Badge } from '../ui/Badge';
import { Card } from '../ui/Card';
import { Icon } from '../ui/Icon';

export type ReportSectionProps = {
  title: string;
  description: string;
  locked?: boolean;
};

export function ReportSection({ title, description, locked = false }: ReportSectionProps) {
  return (
    <Card gap="x2">
      <HStack align="center" justify="spaceBetween">
        <Text color={locked ? 'fg.disabled' : 'fg.neutral'} textStyle="t5Bold">
          {title}
        </Text>
        {locked ? <Icon name="lock" color="fg.disabled" /> : <Badge label="열림" tone="positive" />}
      </HStack>
      <Text color="fg.neutralMuted" textStyle="t4Regular">
        {description}
      </Text>
    </Card>
  );
}
