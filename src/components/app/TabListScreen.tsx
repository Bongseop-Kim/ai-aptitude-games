import type { ReactNode } from 'react';
import { FlatList, type FlatListProps } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

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
  pinnedContent?: ReactNode;
};

export function TabListScreen<ItemT>({
  bottomPad = 'spacingY.screenBottom',
  contentContainerStyle,
  header,
  pinnedContent,
  ...listProps
}: TabListScreenProps<ItemT>) {
  const insets = useSafeAreaInsets();
  const { theme } = useDesignSystemTheme();
  const resolvedBottomPad = resolveLength(theme, bottomPad);
  const bottomPadding = typeof resolvedBottomPad === 'number' ? resolvedBottomPad : 0;
  const bottomPaddingWithInset = bottomPadding + insets.bottom;

  return (
    <Screen safeEdges={['top', 'left', 'right']}>
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
          contentInsetAdjustmentBehavior="automatic"
          scrollIndicatorInsets={{ bottom: bottomPaddingWithInset }}
          showsVerticalScrollIndicator={false}
        />
      </Box>
    </Screen>
  );
}
