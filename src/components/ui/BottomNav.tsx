import { Pressable } from 'react-native';

import { HStack, VStack } from '../../design-system/components/Stack';
import { Text } from '../../design-system/components/Text';
import { Icon, type IconName } from './Icon';

export type BottomNavItem<Value extends string> = {
  icon: IconName;
  label: string;
  value: Value;
};

export type BottomNavProps<Value extends string> = {
  items: ReadonlyArray<BottomNavItem<Value>>;
  value: Value;
  onChange: (value: Value) => void;
};

export function BottomNav<Value extends string>({ items, value, onChange }: BottomNavProps<Value>) {
  return (
    <HStack
      bg="bg.layerFloating"
      borderColor="stroke.neutralSubtle"
      borderTopWidth="thin"
      gap="x1"
      justify="spaceAround"
      px="x2"
      py="x2"
    >
      {items.map((item) => {
        const selected = item.value === value;

        return (
          <Pressable
            key={item.value}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            onPress={() => onChange(item.value)}
          >
            <VStack align="center" gap="x0_5" px="x3">
              <Icon name={item.icon} color={selected ? 'fg.brand' : 'fg.neutralSubtle'} size="small" />
              <Text color={selected ? 'fg.brand' : 'fg.neutralSubtle'} textStyle="t2Medium" maxLines={1}>
                {item.label}
              </Text>
            </VStack>
          </Pressable>
        );
      })}
    </HStack>
  );
}
