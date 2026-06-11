import { Box } from '../../design-system/components/Box';
import { HStack, VStack } from '../../design-system/components/Stack';
import { Text } from '../../design-system/components/Text';
import { ReadinessChip } from '../readiness/ReadinessChip';
import { Card } from '../ui/Card';
import { IconButton } from '../ui/IconButton';

export type ProfileSummaryProps = {
  name: string;
  subtitle: string;
  readinessScore: number;
};

export function ProfileSummary({ name, subtitle, readinessScore }: ProfileSummaryProps) {
  return (
    <Card>
      <HStack align="center" gap="x3">
        <Box
          alignItems="center"
          bg="bg.brandWeak"
          borderColor="stroke.brandSolid"
          borderRadius="full"
          borderWidth="thin"
          height="x14"
          justifyContent="center"
          width="x14"
        >
          <Text color="fg.brand" textStyle="t6Bold">
            {name.charAt(0)}
          </Text>
        </Box>
        <VStack flex={1} gap="x1">
          <Text textStyle="t7Bold" maxLines={1}>
            {name}
          </Text>
          <Text color="fg.neutralMuted" textStyle="t3Regular" maxLines={1}>
            {subtitle}
          </Text>
          <HStack>
            <ReadinessChip score={readinessScore} />
          </HStack>
        </VStack>
        <IconButton name="Pencil" label="프로필 편집" variant="weak" />
      </HStack>
    </Card>
  );
}