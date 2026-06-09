import { HStack } from '../../design-system/components/Stack';
import { Text } from '../../design-system/components/Text';

export type SectionHeadProps = {
  title: string;
  actionLabel?: string;
};

export function SectionHead({ title, actionLabel }: SectionHeadProps) {
  return (
    <HStack align="center" justify="spaceBetween">
      <Text textStyle="t6Bold">{title}</Text>
      {actionLabel ? (
        <Text color="fg.brand" textStyle="t3Bold">
          {actionLabel}
        </Text>
      ) : null}
    </HStack>
  );
}
