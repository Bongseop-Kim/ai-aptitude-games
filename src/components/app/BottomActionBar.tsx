import { Box } from '../../design-system/components/Box';
import { HStack } from '../../design-system/components/Stack';
import { ActionButton, type ActionButtonProps } from '../ui/ActionButton';
import type { IconName } from '../../shared/types';

export type BottomAction = {
  disabled?: ActionButtonProps['disabled'];
  iconLeft?: IconName;
  iconRight?: IconName;
  label: string;
  onPress?: ActionButtonProps['onPress'];
  variant?: ActionButtonProps['variant'];
};

export type BottomActionBarProps = {
  primary: BottomAction;
  secondary?: BottomAction;
};

export function BottomActionBar({ primary, secondary }: BottomActionBarProps) {
  return (
    <HStack
      borderColor="stroke.neutralSubtle"
      borderTopWidth="thin"
      gap="x2"
      pt="x2"
    >
      {secondary ? (
        <Box flex={1}>
          <ActionButton variant="neutralOutline" {...secondary} />
        </Box>
      ) : null}
      <Box flex={secondary ? 1.6 : 1}>
        <ActionButton {...primary} />
      </Box>
    </HStack>
  );
}
