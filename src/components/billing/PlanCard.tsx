import { HStack } from '../../design-system/components/Stack';
import { Text } from '../../design-system/components/Text';
import type { SubscriptionPlan } from '../../domain/types';
import { Badge } from '../ui/Badge';
import { Card } from '../ui/Card';

export type PlanCardProps = {
  plan: SubscriptionPlan;
};

export function PlanCard({ plan }: PlanCardProps) {
  return (
    <Card borderColor={plan.recommended ? 'stroke.brandWeak' : 'stroke.neutralSubtle'} gap="x3">
      <HStack align="center" justify="spaceBetween">
        <Text textStyle="t5Bold">{plan.name}</Text>
        {plan.recommended ? <Badge label="추천" tone="brand" /> : null}
      </HStack>
      <Text color="fg.brand" textStyle="t7Bold">
        {plan.priceLabel}
      </Text>
      <Text color="fg.neutralMuted" textStyle="t4Regular">
        {plan.description}
      </Text>
    </Card>
  );
}
