import { Box } from '../../design-system/components/Box';
import { HStack } from '../../design-system/components/Stack';
import { Button, type ButtonProps } from '../ui/Button';

export type BottomAction = Pick<
  ButtonProps,
  'disabled' | 'iconLeft' | 'iconRight' | 'label' | 'onPress' | 'tone'
>;

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
          <Button {...secondary} variant="outline" fullWidth />
        </Box>
      ) : null}
      <Box flex={secondary ? 1.6 : 1}>
        <Button {...primary} fullWidth />
      </Box>
    </HStack>
  );
}
