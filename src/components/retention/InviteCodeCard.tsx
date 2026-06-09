import { HStack } from '../../design-system/components/Stack';
import { Text } from '../../design-system/components/Text';
import { SectionHead } from '../app/SectionHead';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';

export type InviteCodeCardProps = {
  code: string;
};

export function InviteCodeCard({ code }: InviteCodeCardProps) {
  return (
    <Card gap="x3">
      <SectionHead title="내 초대 코드" />
      <HStack align="center" bg="bg.neutralWeak" borderRadius="r3" justify="spaceBetween" p="x3">
        <Text textStyle="t6Bold">{code}</Text>
        <Button label="복사" size="small" variant="outline" />
      </HStack>
    </Card>
  );
}
