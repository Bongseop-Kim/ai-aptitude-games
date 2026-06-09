import { Box } from '../../design-system/components/Box';
import { HStack, VStack } from '../../design-system/components/Stack';
import { Text } from '../../design-system/components/Text';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Icon } from '../ui/Icon';
import { ListItem } from '../ui/ListItem';
import { Switch } from '../ui/Switch';

export type ProfileSummaryProps = {
  name: string;
  description: string;
  pushEnabled: boolean;
  soundEnabled: boolean;
};

export function ProfileSummary({ name, description, pushEnabled, soundEnabled }: ProfileSummaryProps) {
  return (
    <Card gap="x4">
      <HStack align="center" gap="x3">
        <Box
          alignItems="center"
          bg="bg.brandWeak"
          borderRadius="full"
          height="x14"
          justifyContent="center"
          width="x14"
        >
          <Icon name="profile" color="fg.brand" />
        </Box>
        <VStack flex={1} gap="x1">
          <Text textStyle="t7Bold">{name}</Text>
          <Text color="fg.neutralMuted" textStyle="t4Regular">
            {description}
          </Text>
        </VStack>
        <Button label="편집" size="small" variant="outline" />
      </HStack>
      <ListItem title="푸시 알림" trailing={pushEnabled ? '켜짐' : '꺼짐'} />
      <HStack align="center" justify="spaceBetween">
        <Text textStyle="t4Medium">효과음</Text>
        <Switch label="효과음" value={soundEnabled} />
      </HStack>
    </Card>
  );
}
