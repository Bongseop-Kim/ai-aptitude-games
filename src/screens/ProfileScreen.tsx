import { useState, type Dispatch, type SetStateAction } from 'react';
import { Alert } from 'react-native';

import { Header } from '../components/app/Header';
import { SectionHead } from '../components/app/SectionHead';
import { TabScreen } from '../components/app/TabScreen';
import { JobFamilySheet } from '../components/profile/JobFamilySheet';
import { ProfileSummary } from '../components/profile/ProfileSummary';
import { StatTile } from '../components/profile/StatTile';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Icon, type IconName } from '../components/ui/Icon';
import { List } from '../components/ui/List';
import { Switch } from '../components/ui/Switch';
import { games } from '../data/games';
import { useGamesWithProgress } from '../data/local/useGameResults';
import { useProfile } from '../data/server/useProfile';
import { useClearDevData, useSeedDevData } from '../data/seed/useSeedDevData';
import { user } from '../data/user';
import { HStack, VStack } from '../design-system/components/Stack';
import { Text } from '../design-system/components/Text';
import { jobFamilyLabel } from '../domain/jobFamily';
import { IdentityConflictError, linkKakao } from '../lib/auth';
import { supabase } from '../lib/supabase';
import { useAuth } from '../providers/AuthProvider';

export function ProfileScreen() {
  const { isAnonymous } = useAuth();
  const [pushEnabled, setPushEnabled] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isLinking, setIsLinking] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [jobFamilyVisible, setJobFamilyVisible] = useState(false);
  const { data: profile } = useProfile();
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

  async function handleSignOut() {
    if (isSigningOut) {
      return;
    }

    setIsSigningOut(true);

    try {
      const { error } = await supabase.auth.signOut();

      if (error) {
        throw error;
      }
    } catch {
      Alert.alert('로그아웃에 실패했어요', '잠시 후 다시 시도해주세요.');
    } finally {
      setIsSigningOut(false);
    }
  }

  return (
    <TabScreen header={<Header title="내 정보" />}>
      <ProfileSummary
        name={user.name}
        subtitle={`${user.jobLabel} · ${user.handle}`}
        readinessScore={user.readiness.score}
      />

      <HStack gap="x2">
        <StatTile icon="Flame" value={`${user.streakDays}일`} label="연속" />
        <StatTile icon="Gamepad2" value={`${doneCount}/${games.length}`} label="완료 게임" />
        <StatTile icon="Trophy" value={`${user.mockExamCount}회`} label="모의고사" />
      </HStack>

      <SectionHead title="구독" />
      <ProBanner />

      <SectionHead title="면접" />
      <Card py="x1">
        <List.Root>
          <List.Item onPress={() => setJobFamilyVisible(true)}>
            <List.Prefix>
              <Icon name="Building2" color="fg.brand" />
            </List.Prefix>
            <List.Content>
              <List.Title>목표 직무</List.Title>
            </List.Content>
            <List.Suffix>
              <HStack align="center" gap="x1">
                <Text color="fg.neutralMuted" textStyle="t3Medium" maxLines={1}>
                  {jobFamilyLabel(profile?.field) ?? '미설정'}
                </Text>
                <Icon name="ChevronRight" size="small" />
              </HStack>
            </List.Suffix>
          </List.Item>
        </List.Root>
      </Card>
      <JobFamilySheet
        visible={jobFamilyVisible}
        current={profile?.field ?? null}
        onClose={() => setJobFamilyVisible(false)}
      />

      <SectionHead title="설정" />
      <Card py="x1">
        <List.Root>
          <SwitchListItem
            leadingIcon="Bell"
            title="푸시 알림"
            value={pushEnabled}
            setValue={setPushEnabled}
          />
          <SwitchListItem
            leadingIcon="Volume2"
            title="효과음"
            value={soundEnabled}
            setValue={setSoundEnabled}
          />
          <List.Item>
            <List.Prefix>
              <Icon name="Clock" color="fg.brand" />
            </List.Prefix>
            <List.Content>
              <List.Title>리마인드 시간</List.Title>
            </List.Content>
            <List.Suffix>
              <Text color="fg.neutralMuted" textStyle="t3Medium" maxLines={1}>
                오후 9:00
              </Text>
            </List.Suffix>
          </List.Item>
          <List.Item>
            <List.Prefix>
              <Icon name="Trophy" color="fg.brand" />
            </List.Prefix>
            <List.Content>
              <List.Title>주간 랭킹</List.Title>
            </List.Content>
            <List.Suffix>
              <Text color="fg.neutralMuted" textStyle="t3Medium" maxLines={1}>
                친구
              </Text>
            </List.Suffix>
          </List.Item>
          <List.Item>
            <List.Prefix>
              <Icon name="UserRoundPlus" color="fg.brand" />
            </List.Prefix>
            <List.Content>
              <List.Title>친구 초대</List.Title>
            </List.Content>
          </List.Item>
        </List.Root>
      </Card>

      <SectionHead title="기타" />
      <Card py="x1">
        <List.Root>
          <List.Item>
            <List.Prefix>
              <Icon name="CircleHelp" color="fg.brand" />
            </List.Prefix>
            <List.Content>
              <List.Title>도움말 · 자주 묻는 질문</List.Title>
            </List.Content>
          </List.Item>
          <List.Item>
            <List.Prefix>
              <Icon name="FileText" color="fg.brand" />
            </List.Prefix>
            <List.Content>
              <List.Title>이용약관 · 개인정보처리방침</List.Title>
            </List.Content>
          </List.Item>
          {isAnonymous ? (
            // Signing out an anonymous session would orphan its server data,
            // so the only exit for anonymous users is upgrading the account.
            <List.Item onPress={handleLinkKakao} disabled={isLinking}>
              <List.Prefix>
                <Icon name="User" color="fg.brand" />
              </List.Prefix>
              <List.Content>
                <List.Title>{isLinking ? '연동 중...' : '카카오 계정 연동하기'}</List.Title>
              </List.Content>
              <List.Suffix>
                {isLinking ? null : <Icon name="ChevronRight" size="small" />}
              </List.Suffix>
            </List.Item>
          ) : (
            <List.Item onPress={() => void handleSignOut()} disabled={isSigningOut}>
              <List.Prefix>
                <Icon name="LogOut" color="fg.brand" />
              </List.Prefix>
              <List.Content>
                <List.Title>{isSigningOut ? '로그아웃 중...' : '로그아웃'}</List.Title>
              </List.Content>
            </List.Item>
          )}
        </List.Root>
      </Card>

      {__DEV__ ? <DevSeedSection /> : null}

      <Text align="center" color="fg.neutralSubtle" textStyle="t2Regular">
        역검 · 버전 1.0.0
      </Text>
    </TabScreen>
  );
}

type SwitchListItemProps = {
  leadingIcon: IconName;
  title: string;
  value: boolean;
  setValue: Dispatch<SetStateAction<boolean>>;
};

function SwitchListItem({ leadingIcon, title, value, setValue }: SwitchListItemProps) {
  return (
    <List.Item>
      <List.Prefix>
        <Icon name={leadingIcon} color="fg.brand" />
      </List.Prefix>
      <List.Content>
        <List.Title>{title}</List.Title>
      </List.Content>
      <List.Suffix>
        <Switch label={title} value={value} onPress={() => setValue((enabled) => !enabled)} />
      </List.Suffix>
    </List.Item>
  );
}

function DevSeedSection() {
  const seedDevData = useSeedDevData();
  const clearDevData = useClearDevData();
  const [feedback, setFeedback] = useState<
    | { type: 'seed'; gameResults: number; mockExams: number; interviews: number }
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
              ? `게임 결과 ${feedback.gameResults}개 · 모의고사 ${feedback.mockExams}회차 · 면접 ${feedback.interviews}회 추가됨.`
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
        <Icon name="Leaf" color="fg.brand" size="large" />
        <VStack flex={1} gap="x0_5">
          <Text color="fg.neutralInverted" textStyle="t4Bold" maxLines={1}>
            역검 Pro 시작하기
          </Text>
          <Text color="fg.neutralSubtle" textStyle="t2Regular" maxLines={1}>
            전체 리포트 · 7일 무료
          </Text>
        </VStack>
        <Icon name="ArrowRight" color="fg.neutralInverted" />
      </HStack>
    </Card>
  );
}
