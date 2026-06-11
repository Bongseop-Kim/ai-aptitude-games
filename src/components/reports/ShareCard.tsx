import { Text } from '../../design-system/components/Text';
import { Logo } from '../app/Logo';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';

export type ShareCardProps = {
  title: string;
  summary: string;
};

export function ShareCard({ title, summary }: ShareCardProps) {
  return (
    <Card bg="bg.brandWeak" borderColor="stroke.brandWeak" gap="x3">
      <Logo />
      <Text textStyle="t7Bold">{title}</Text>
      <Text color="fg.neutralMuted" textStyle="t4Regular">
        {summary}
      </Text>
      <Button label="공유" iconLeft="Share" variant="outline" />
    </Card>
  );
}
