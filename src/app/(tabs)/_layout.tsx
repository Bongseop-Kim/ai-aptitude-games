import { NativeTabs } from 'expo-router/unstable-native-tabs';

import { Box } from '../../design-system/components/Box';
import { useDesignSystemTheme } from '../../design-system/provider';
import { TabsFloatingAction } from '../../components/app/TabsFloatingAction';

export default function TabsLayout() {
  const { theme } = useDesignSystemTheme();

  return (
    <Box flex={1} position="relative">
      <NativeTabs
        iconColor={{
          default: theme.color.fg.neutralSubtle,
          selected: theme.color.fg.brand,
        }}
        labelStyle={{
          default: { color: theme.color.fg.neutralSubtle },
          selected: { color: theme.color.fg.brand },
        }}
      >
        <NativeTabs.Trigger name="index">
          <NativeTabs.Trigger.Icon
            src={{
              default: require('../../../assets/tab-icons/home-line.png'),
              selected: require('../../../assets/tab-icons/home-fill.png'),
            }}
          />
          <NativeTabs.Trigger.Label>홈</NativeTabs.Trigger.Label>
        </NativeTabs.Trigger>
        <NativeTabs.Trigger name="games">
          <NativeTabs.Trigger.Icon
            src={{
              default: require('../../../assets/tab-icons/games-line.png'),
              selected: require('../../../assets/tab-icons/games-fill.png'),
            }}
          />
          <NativeTabs.Trigger.Label>게임</NativeTabs.Trigger.Label>
        </NativeTabs.Trigger>
        <NativeTabs.Trigger name="interview">
          <NativeTabs.Trigger.Icon
            src={{
              default: require('../../../assets/tab-icons/interview-line.png'),
              selected: require('../../../assets/tab-icons/interview-fill.png'),
            }}
          />
          <NativeTabs.Trigger.Label>면접</NativeTabs.Trigger.Label>
        </NativeTabs.Trigger>
        <NativeTabs.Trigger name="reports">
          <NativeTabs.Trigger.Icon
            src={{
              default: require('../../../assets/tab-icons/reports-line.png'),
              selected: require('../../../assets/tab-icons/reports-fill.png'),
            }}
          />
          <NativeTabs.Trigger.Label>모의고사</NativeTabs.Trigger.Label>
        </NativeTabs.Trigger>
        <NativeTabs.Trigger name="me">
          <NativeTabs.Trigger.Icon
            src={{
              default: require('../../../assets/tab-icons/me-line.png'),
              selected: require('../../../assets/tab-icons/me-fill.png'),
            }}
          />
          <NativeTabs.Trigger.Label>내 정보</NativeTabs.Trigger.Label>
        </NativeTabs.Trigger>
      </NativeTabs>
      <TabsFloatingAction />
    </Box>
  );
}
