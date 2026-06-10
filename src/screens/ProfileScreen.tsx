import { useState } from 'react';

import { Header } from '../components/app/Header';
import { SectionHead } from '../components/app/SectionHead';
import { TabScreen } from '../components/app/TabScreen';
import { ProfileSummary } from '../components/profile/ProfileSummary';
import { StatTile } from '../components/profile/StatTile';
import { Card } from '../components/ui/Card';
import { Icon } from '../components/ui/Icon';
import { ListItem } from '../components/ui/ListItem';
import { Switch } from '../components/ui/Switch';
import { games } from '../data/games';
import { user } from '../data/user';
import { HStack, VStack } from '../design-system/components/Stack';
import { Text } from '../design-system/components/Text';
import { supabase } from '../lib/supabase';

export function ProfileScreen() {
  const [pushEnabled, setPushEnabled] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const doneCount = games.filter((game) => game.status === 'done').length;

  return (
    <TabScreen header={<Header title="내 정보" />}>
      <ProfileSummary
        name={user.name}
        subtitle={`${user.jobLabel} · ${user.handle}`}
        readinessScore={user.readiness.score}
      />

      <HStack gap="x2">
        <StatTile icon="fire" value={`${user.streakDays}일`} label="연속" />
        <StatTile icon="controller" value={`${doneCount}/${games.length}`} label="완료 게임" />
        <StatTile icon="trophy" value={`${user.mockExamCount}회`} label="모의고사" />
      </HStack>

      <SectionHead title="구독" />
      <ProBanner />

      <SectionHead title="설정" />
      <Card py="x1">
        <ListItem
          leadingIcon="bell"
          title="푸시 알림"
          trailing={
            <Switch
              label="푸시 알림"
              value={pushEnabled}
              onPress={() => setPushEnabled((enabled) => !enabled)}
            />
          }
        />
        <ListItem
          leadingIcon="volume"
          title="효과음"
          trailing={
            <Switch
              label="효과음"
              value={soundEnabled}
              onPress={() => setSoundEnabled((enabled) => !enabled)}
            />
          }
        />
        <ListItem leadingIcon="clock" title="리마인드 시간" trailing="오후 9:00" showChevron />
        <ListItem leadingIcon="rank" title="주간 랭킹" trailing="친구" showChevron />
        <ListItem leadingIcon="group-add" title="친구 초대" showChevron />
      </Card>

      <SectionHead title="기타" />
      <Card py="x1">
        <ListItem leadingIcon="help" title="도움말 · 자주 묻는 질문" showChevron />
        <ListItem leadingIcon="doc" title="이용약관 · 개인정보처리방침" showChevron />
        <ListItem
          leadingIcon="logout"
          title="로그아웃"
          onPress={() => void supabase.auth.signOut()}
        />
      </Card>

      <Text align="center" color="fg.neutralSubtle" textStyle="t2Regular">
        역검 · 버전 1.0.0
      </Text>
    </TabScreen>
  );
}

function ProBanner() {
  return (
    <Card bg="bg.neutralSolid" borderColor="stroke.neutralContrast" borderRadius="r5" p="x4">
      <HStack align="center" gap="x3">
        <Icon name="eco" color="fg.brand" size="large" />
        <VStack flex={1} gap="x0_5">
          <Text color="fg.neutralInverted" textStyle="t4Bold" maxLines={1}>
            역검 Pro 시작하기
          </Text>
          <Text color="fg.neutralSubtle" textStyle="t2Regular" maxLines={1}>
            전체 리포트 · 7일 무료
          </Text>
        </VStack>
        <Icon name="arrow-forward" color="fg.neutralInverted" />
      </HStack>
    </Card>
  );
}