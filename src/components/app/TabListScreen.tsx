import type { ReactNode } from 'react';
import { FlatList, type FlatListProps } from 'react-native';

import { Box } from '../../design-system/components/Box';
import { useDesignSystemTheme } from '../../design-system/provider';
import { resolveLength, type TokenLength } from '../../design-system/components/style-props';
import { Screen } from './Screen';

export type TabListScreenProps<ItemT> = Omit<
  FlatListProps<ItemT>,
  'contentInset' | 'scrollIndicatorInsets' | 'showsVerticalScrollIndicator'
> & {
  bottomPad?: TokenLength;
  header?: ReactNode;
};

export function TabListScreen<ItemT>({
  bottomPad = 'spacingY.screenBottom',
  contentContainerStyle,
  header,
  ...listProps
}: TabListScreenProps<ItemT>) {
  const { theme } = useDesignSystemTheme();
  const resolvedBottomPad = resolveLength(theme, bottomPad);
  const bottomPadding = typeof resolvedBottomPad === 'number' ? resolvedBottomPad : 0;

  return (
    <Screen safeEdges={['top', 'left', 'right']}>
      {header}
      <Box flex={1}>
        <FlatList
          {...listProps}
          contentContainerStyle={[
            {
              flexGrow: 1,
              paddingTop: theme.dimension.spacingY.componentDefault,
              paddingBottom: bottomPadding,
            },
            contentContainerStyle,
          ]}
          contentInsetAdjustmentBehavior="automatic"
          scrollIndicatorInsets={{ bottom: bottomPadding }}
          showsVerticalScrollIndicator={false}
        />
      </Box>
    </Screen>
  );
}
