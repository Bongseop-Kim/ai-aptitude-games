import type { ReactNode } from 'react';
import { Pressable, StyleSheet, type PressableProps } from 'react-native';

import { Box } from '../../design-system/components/Box';
import { HStack, VStack, type StackProps } from '../../design-system/components/Stack';
import { Text } from '../../design-system/components/Text';

function ListRoot(props: StackProps) {
  return <VStack {...props} />;
}

type ListItemProps = Omit<PressableProps, 'children'> & { children: ReactNode };

function ListItem({ children, ...props }: ListItemProps) {
  return (
    <Pressable accessibilityRole={props.onPress ? 'button' : undefined} {...props}>
      <HStack align="center" gap="x3" py="x3">
        {children}
      </HStack>
    </Pressable>
  );
}

function ListPrefix({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

function ListContent({ children }: { children: ReactNode }) {
  return (
    <VStack flex={1} gap="x0_5">
      {children}
    </VStack>
  );
}

function ListTitle({ children }: { children: ReactNode }) {
  return (
    <Text textStyle="t4Medium" maxLines={1}>
      {children}
    </Text>
  );
}

function ListDetail({ children }: { children: ReactNode }) {
  return (
    <Text color="fg.neutralMuted" textStyle="t3Regular" maxLines={2}>
      {children}
    </Text>
  );
}

function ListSuffix({ children }: { children: ReactNode }) {
  return (
    <HStack align="center" gap="x3">
      {children}
    </HStack>
  );
}

function ListDivider() {
  return <Box bg="stroke.neutralWeak" height={StyleSheet.hairlineWidth} />;
}

export const List = {
  Root: ListRoot,
  Item: ListItem,
  Prefix: ListPrefix,
  Content: ListContent,
  Title: ListTitle,
  Detail: ListDetail,
  Suffix: ListSuffix,
  Divider: ListDivider,
};
