import { Pressable } from 'react-native';

import { HStack } from '../../design-system/components/Stack';
import { Text } from '../../design-system/components/Text';

export type TabItem<Value extends string> = {
  label: string;
  value: Value;
};

export type TabsProps<Value extends string> = {
  items: readonly TabItem<Value>[];
  value: Value;
  onChange: (value: Value) => void;
};

export function Tabs<Value extends string>({ items, value, onChange }: TabsProps<Value>) {
  return (
    <HStack bg="bg.neutralWeak" borderRadius="r3" gap="x1" p="x1">
      {items.map((item) => {
        const selected = item.value === value;

        return (
          <Pressable
            key={item.value}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            onPress={() => onChange(item.value)}
          >
            <HStack
              bg={selected ? 'bg.layerFloating' : 'bg.transparent'}
              borderRadius="r2"
              justify="center"
              px="x3"
              py="x1_5"
            >
              <Text color={selected ? 'fg.neutral' : 'fg.neutralMuted'} textStyle="t3Bold" maxLines={1}>
                {item.label}
              </Text>
            </HStack>
          </Pressable>
        );
      })}
    </HStack>
  );
}
