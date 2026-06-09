import { HStack } from '../../design-system/components/Stack';
import { Text } from '../../design-system/components/Text';
import { Icon } from '../ui/Icon';

export type PaymentMethodRowProps = {
  label: string;
  selected?: boolean;
};

export function PaymentMethodRow({ label, selected = false }: PaymentMethodRowProps) {
  return (
    <HStack
      align="center"
      bg={selected ? 'bg.brandWeak' : 'bg.layerDefault'}
      borderColor={selected ? 'stroke.brandWeak' : 'stroke.neutralWeak'}
      borderRadius="r3"
      borderWidth="thin"
      justify="spaceBetween"
      p="x3"
    >
      <Text color={selected ? 'fg.brand' : 'fg.neutral'} textStyle="t4Bold">
        {label}
      </Text>
      {selected ? <Icon name="check" color="fg.brand" /> : null}
    </HStack>
  );
}
