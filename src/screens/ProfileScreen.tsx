import { useCallback, useMemo, useState, type Dispatch, type SetStateAction } from 'react';
import { Alert } from 'react-native';

import { Header } from '../components/app/Header';
import { SectionHead } from '../components/app/SectionHead';
import { TabScreen } from '../components/app/TabScreen';
import { ProfileSummary } from '../components/profile/ProfileSummary';
import { StatTile } from '../components/profile/StatTile';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Icon } from '../components/ui/Icon';
import { ListItem } from '../components/ui/ListItem';
import { Switch } from '../components/ui/Switch';
import { games } from '../data/games';
import { useGamesWithProgress } from '../data/local/useGameResults';
import { useClearDevData, useSeedDevData } from '../data/seed/useSeedDevData';
import { user } from '../data/user';
import { HStack, VStack } from '../design-system/components/Stack';
import { Text } from '../design-system/components/Text';
import { IdentityConflictError, linkKakao } from '../lib/auth';
import { supabase } from '../lib/supabase';
import { useAuth } from '../providers/AuthProvider';

export function ProfileScreen() {
  const { isAnonymous } = useAuth();
  const [pushEnabled, setPushEnabled] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isLinking, setIsLinking] = useState(false);
  const gamesWithProgress = useGamesWithProgress();
  const doneCount = gamesWithProgress.filter((game) => game.status === 'done').length;

  function handleLinkKakao() {
    if (isLinking) {
      return;
    }

    setIsLinking(true);
    linkKakao()
      .catch((error) => {
        if (error instanceof IdentityConflictError) {
          Alert.alert(
            '이미 다른 계정에 연결된 카카오 계정이에요',
            '지금 계정에는 이 카카오 계정을 연결할 수 없어요. 다른 카카오 계정으로 다시 시도해주세요.',
          );
          return;
        }
        Alert.alert('계정 연동에 실패했어요', '잠시 후 다시 시도해주세요.');
      })
      .finally(() => {
        setIsLinking(false);
      });
  }

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
        <SwitchListItem
          leadingIcon="bell"
          title="푸시 알림"
          value={pushEnabled}
          setValue={setPushEnabled}
        />
        <SwitchListItem
          leadingIcon="volume"
          title="효과음"
          value={soundEnabled}
          setValue={setSoundEnabled}
        />
        <ListItem leadingIcon="clock" title="리마인드 시간" trailing="오후 9:00" showChevron />
        <ListItem leadingIcon="rank" title="주간 랭킹" trailing="친구" showChevron />
        <ListItem leadingIcon="group-add" title="친구 초대" showChevron />
      </Card>

      <SectionHead title="기타" />
      <Card py="x1">
        <ListItem leadingIcon="help" title="도움말 · 자주 묻는 질문" showChevron />
        <ListItem leadingIcon="doc" title="이용약관 · 개인정보처리방침" showChevron />
        {isAnonymous ? (
          // Signing out an anonymous session would orphan its server data,
          // so the only exit for anonymous users is upgrading the account.
          <ListItem
            leadingIcon="profile"
            title={isLinking ? '연동 중...' : '카카오 계정 연동하기'}
            showChevron={!isLinking}
            onPress={handleLinkKakao}
            disabled={isLinking}
          />
        ) : (
          <ListItem
            leadingIcon="logout"
            title="로그아웃"
            onPress={() => void supabase.auth.signOut()}
          />
        )}
      </Card>

      {__DEV__ ? <DevSeedSection /> : null}

      <Text align="center" color="fg.neutralSubtle" textStyle="t2Regular">
        역검 · 버전 1.0.0
      </Text>
    </TabScreen>
  );
}

type SwitchListItemProps = {
  leadingIcon: Parameters<typeof ListItem>[0]['leadingIcon'];
  title: string;
  value: boolean;
  setValue: Dispatch<SetStateAction<boolean>>;
};

function SwitchListItem({ leadingIcon, title, value, setValue }: SwitchListItemProps) {
  const onPress = useCallback(() => {
    setValue((enabled) => !enabled);
  }, [setValue]);
  const trailing = useMemo(
    () => <Switch label={title} value={value} onPress={onPress} />,
    [onPress, title, value],
  );

  return <ListItem leadingIcon={leadingIcon} title={title} trailing={trailing} />;
}

function DevSeedSection() {
  const seedDevData = useSeedDevData();
  const clearDevData = useClearDevData();
  const [feedback, setFeedback] = useState<
    | { type: 'seed'; gameResults: number; mockExams: number }
    | { type: 'clear' }
    | null
  >(null);
  const isPending = seedDevData.isPending || clearDevData.isPending;

  function handleSeedDevData() {
    seedDevData.mutate(undefined, {
      onSuccess: (summary) => {
        setFeedback({ type: 'seed', ...summary });
      },
    });
  }

  function handleClearDevData() {
    clearDevData.mutate(undefined, {
      onSuccess: () => {
        setFeedback({ type: 'clear' });
      },
    });
  }

  return (
    <>
      <SectionHead title="개발" />
      <Card gap="x3">
        <Button
          label={seedDevData.isPending ? '넣는 중...' : '더미데이터 넣기'}
          variant="outline"
          fullWidth
          disabled={isPending}
          onPress={handleSeedDevData}
        />
        <Button
          label={clearDevData.isPending ? '초기화 중...' : '데이터 초기화'}
          variant="weak"
          tone="critical"
          fullWidth
          disabled={isPending}
          onPress={handleClearDevData}
        />
        {feedback ? (
          <Text color="fg.neutralSubtle" textStyle="t2Regular">
            {feedback.type === 'seed'
              ? `게임 결과 ${feedback.gameResults}개 · 모의고사 ${feedback.mockExams}회차 추가됨.`
              : '로컬 데이터를 모두 삭제했어요.'}
          </Text>
        ) : null}
      </Card>
    </>
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
