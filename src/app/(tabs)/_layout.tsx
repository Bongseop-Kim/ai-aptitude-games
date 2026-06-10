import { NativeTabs } from 'expo-router/unstable-native-tabs';

export default function TabsLayout() {
  return (
    <NativeTabs>
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Icon
          md="home"
          sf={{ default: 'house', selected: 'house.fill' }}
        />
        <NativeTabs.Trigger.Label>홈</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="games">
        <NativeTabs.Trigger.Icon
          md="sports_esports"
          sf={{ default: 'gamecontroller', selected: 'gamecontroller.fill' }}
        />
        <NativeTabs.Trigger.Label>게임</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="reports">
        <NativeTabs.Trigger.Icon
          md="insights"
          sf="chart.line.uptrend.xyaxis"
        />
        <NativeTabs.Trigger.Label>기록</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="me">
        <NativeTabs.Trigger.Icon
          md="person"
          sf={{ default: 'person', selected: 'person.fill' }}
        />
        <NativeTabs.Trigger.Label>내 정보</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
