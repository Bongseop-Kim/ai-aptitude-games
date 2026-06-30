import type { ReactNode } from 'react';
import { FlatList, type FlatListProps } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Box } from '../../design-system/components/Box';
import { useDesignSystemTheme } from '../../design-system/provider';
import { resolveLength, type TokenLength } from '../../design-system/components/style-props';
import { Screen } from './Screen';
import { useTabFloatingActionLayout } from './tabsFloatingActionLayout';

export type TabListScreenProps<ItemT> = Omit<
  FlatListProps<ItemT>,
  'contentInset' | 'scrollIndicatorInsets' | 'showsVerticalScrollIndicator'
> & {
  bottomPad?: TokenLength;
  floatingAction?: ReactNode;
  header?: ReactNode;
  pinnedContent?: ReactNode;
};

export function TabListScreen<ItemT>({
  bottomPad = 'spacingY.screenBottom',
  contentContainerStyle,
  floatingAction,
  header,
  pinnedContent,
  ...listProps
}: TabListScreenProps<ItemT>) {
  const insets = useSafeAreaInsets();
  const { theme } = useDesignSystemTheme();
  const { bottomOffset, contentBottomReserve } = useTabFloatingActionLayout(Boolean(floatingAction));
  const resolvedBottomPad = resolveLength(theme, bottomPad);
  const bottomPadding = Math.max(
    typeof resolvedBottomPad === 'number' ? resolvedBottomPad : 0,
    contentBottomReserve,
  );
  const bottomPaddingWithInset = bottomPadding + insets.bottom;

  return (
    <Screen
      safeEdges={['top', 'left', 'right']}
      floatingAction={floatingAction}
      floatingActionOffsetY={floatingAction ? bottomOffset : undefined}
    >
      {header}
      {pinnedContent}
      <Box flex={1}>
        <FlatList
          {...listProps}
          contentContainerStyle={[
            {
              flexGrow: 1,
              paddingTop: theme.dimension.spacingY.componentDefault,
              paddingBottom: bottomPaddingWithInset,
            },
            contentContainerStyle,
          ]}
          contentInsetAdjustmentBehavior="never"
          scrollIndicatorInsets={{ bottom: bottomPaddingWithInset }}
          showsVerticalScrollIndicator={false}
        />
      </Box>
    </Screen>
  );
}
