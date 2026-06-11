import { Box } from '../../design-system/components/Box';
import { HStack } from '../../design-system/components/Stack';
import { Text } from '../../design-system/components/Text';
import { Icon } from '../ui/Icon';

export type LogoProps = {
  showText?: boolean;
};

export function Logo({ showText = true }: LogoProps) {
  return (
    <HStack align="center" gap="x2">
      <Box
        alignItems="center"
        bg="bg.brandSolid"
        borderRadius="r3"
        height="x9"
        justifyContent="center"
        width="x9"
      >
        <Icon name="Leaf" color="fg.neutralInverted" />
      </Box>
      {showText ? <Text textStyle="t7Bold">역검</Text> : null}
    </HStack>
  );
}
