import { Box } from '../../design-system/components/Box';
import { Text } from '../../design-system/components/Text';

export type GameStatBoxProps = {
  label: string;
  value: string;
};

export function GameStatBox({ label, value }: GameStatBoxProps) {
  return (
    <Box
      alignItems="center"
      borderColor="stroke.neutralWeak"
      borderRadius="r3"
      borderWidth="thin"
      flex={1}
      gap="x0_5"
      px="x2"
      py="x3"
    >
      <Text textStyle="t6Bold" maxLines={1}>
        {value}
      </Text>
      <Text color="fg.neutralSubtle" textStyle="t2Regular" maxLines={1}>
        {label}
      </Text>
    </Box>
  );
}
