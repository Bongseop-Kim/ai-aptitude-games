import { Pressable } from 'react-native';
import { useRouter } from 'expo-router';

import { Logo } from '../components/app/Logo';
import { SectionHead } from '../components/app/SectionHead';
import { TabScreen } from '../components/app/TabScreen';
import { GameTile } from '../components/games/GameTile';
import { ReadinessGauge } from '../components/readiness/ReadinessGauge';
import { Badge } from '../components/ui/Badge';
import { Card } from '../components/ui/Card';
import { Icon, type IconName } from '../components/ui/Icon';
import { Tag } from '../components/ui/Tag';
import { Box } from '../design-system/components/Box';
import { Grid } from '../design-system/components/Grid';
import { HStack, VStack } from '../design-system/components/Stack';
import { Text } from '../design-system/components/Text';
import { games } from '../data/games';
import { useGamesWithProgress } from '../data/local/useGameResults';
import { useInterviewSessions } from '../data/local/useInterviewSessions';
import { useActiveMockExamSession } from '../data/local/useMockExamSession';
import { useProfile } from '../data/server/useProfile';
import { user } from '../data/user';
import { jobFamilyLabel } from '../domain/jobFamily';
import { toneColors } from '../domain/tone';
import type { GameId } from '../domain/types';
import type { BadgeTone } from '../shared/types';

const challengeGame = games.find((game) => game.id === 'potion') ?? games[0];

export function HomeScreen() {
  return (
    <TabScreen header={<HomeHeader />}>
      <Greeting />
      <ReadinessSummary />
      <MockExamCard />
      <Grid columns={2} gap="x3">
        <DailyChallenge />
        <InterviewHero />
      </Grid>
      <AllGamesSection />
      <RankingTeaser />
    </TabScreen>
  );
}

function HomeHeader() {
  return (
    <HStack align="center" gap="x2" justify="spaceBetween">
      <Logo />
      <HStack align="center" gap="x1">
        <HeaderChip
          accessibilityLabel={`스트릭 ${user.streakDays}일`}
          icon="Flame"
          label={String(user.streakDays)}
          tone="critical"
        />
        <HeaderChip
          accessibilityLabel={`보석 ${user.gems}개`}
          icon="Gem"
          label={String(user.gems)}
          tone="informative"
        />
        <Pressable accessibilityLabel="알림" accessibilityRole="button">
          <Box alignItems="center" height="x10" justifyContent="center" position="relative" width="x10">
            <Icon name="Bell" color="fg.neutral" />
            <Box bg="palette.red700" borderRadius="full" height="x1_5" position="absolute" right="x1_5" top="x1" width="x1_5" />
          </Box>
        </Pressable>
      </HStack>
    </HStack>
  );
}

function HeaderChip({
  accessibilityLabel,
  icon,
  label,
  tone,
}: {
  accessibilityLabel: string;
  icon: IconName;
  label: string;
  tone: BadgeTone;
}) {
  const colors = toneColors[tone];

  return (
    <Pressable accessibilityLabel={accessibilityLabel} accessibilityRole="button">
      <HStack align="center" bg="bg.neutralWeak" borderRadius="full" gap="x1" px="x2_5" py="x1_5">
        <Icon name={icon} color={colors.fg} size="small" />
        <Text textStyle="t4Bold" maxLines={1}>
          {label}
        </Text>
      </HStack>
    </Pressable>
  );
}

function Greeting() {
  return (
    <VStack gap="x0_5" mt="x1">
      <Text textStyle="t9Bold">{user.name}님,</Text>
      <Text color="fg.neutralMuted" textStyle="t4Regular">
        오늘도 한 판 해볼까요?
      </Text>
    </VStack>
  );
}

function ReadinessSummary() {
  const router = useRouter();
  const { data: sessions } = useInterviewSessions();
  const { data: profile } = useProfile();
  const latest = sessions?.[0] ?? null;
  const fieldLabel = jobFamilyLabel(profile?.field);
  const jobTag = fieldLabel != null ? `${fieldLabel} · NCS 기반` : 'NCS 기반';

  let interviewLine: React.ReactNode;
  if (latest == null) {
    interviewLine = (
      <Text color="fg.neutralMuted" textStyle="t3Regular">
        아직 면접 기록이 없어요
      </Text>
    );
  } else if (latest.score > 0) {
    interviewLine = (
      <Text color="fg.neutralMuted" textStyle="t3Regular">
        최근 모의 면접 <Text color="fg.neutral" textStyle="t3Bold">{latest.score}점</Text> · {latest.company}{' '}
        {latest.role}
      </Text>
    );
  } else {
    interviewLine = (
      <Text color="fg.neutralMuted" textStyle="t3Regular">
        최근 모의 면접 · {latest.company} {latest.role}
      </Text>
    );
  }

  return (
    <Card gap="x4" p="x4">
      <HStack align="center" gap="x4">
        <ReadinessGauge score={user.readiness.score} />
        <VStack flex={1} gap="x2">
          <HStack align="center" gap="x1_5">
            <Text color="fg.neutralMuted" textStyle="t3Medium" maxLines={1}>
              면접 준비도
            </Text>
            <Badge label={user.readiness.percentileLabel} tone="positive" size="small" />
          </HStack>
          <HStack>
            <Tag label={jobTag} tone="brand" selected />
          </HStack>
          {interviewLine}
        </VStack>
      </HStack>
      <Box bg="stroke.neutralWeak" height="x0_5" />
      <Pressable accessibilityLabel="지난 리포트 보기" accessibilityRole="button" onPress={() => router.push('/reports' as never)}>
        <HStack align="center" justify="spaceBetween">
          <Text color="fg.neutralMuted" textStyle="t3Medium">
            지난 리포트 보기
          </Text>
          <Icon name="ChevronRight" color="fg.neutralSubtle" size="small" />
        </HStack>
      </Pressable>
    </Card>
  );
}

function InterviewHero() {
  const router = useRouter();

  return (
    <VStack flex={1} gap="x2">
      <SectionHead title="실전 면접" />
      <Box flex={1}>
        <Pressable
          accessibilityLabel="실전 면접 시작하기"
          accessibilityRole="button"
          onPress={() => router.push('/interview' as never)}
        >
          <Card bg="bg.brandWeak" borderColor="stroke.brandWeak" flex={1} gap="x3" p="x3">
            <Box alignItems="center" bg="bg.layerDefault" borderRadius="r3" height="x12" justifyContent="center" width="x12">
              <Icon name="Video" color="fg.brand" size="large" />
            </Box>
            <VStack flex={1} gap="x1">
              <Text textStyle="t5Bold" maxLines={2}>
                내 직무에 딱 맞는{'\n'}면접을 연습해요
              </Text>
              <Text color="fg.neutralMuted" textStyle="t2Regular" maxLines={1}>
                면접 데이터 8만 건 분석
              </Text>
            </VStack>
            <HStack>
              <Badge label="NCS 기반" tone="brandSolid" size="small" />
            </HStack>
          </Card>
        </Pressable>
      </Box>
    </VStack>
  );
}

function DailyChallenge() {
  const colors = toneColors[challengeGame.tone];
  const router = useRouter();
  const openChallenge = () => router.push({ pathname: '/games/[id]', params: { id: challengeGame.id } } as never);

  return (
    <VStack flex={1} gap="x2">
      <SectionHead title="오늘의 챌린지" />
      <Box flex={1}>
        <Pressable
          accessibilityLabel={`${challengeGame.name} 오늘의 챌린지 시작`}
          accessibilityRole="button"
          onPress={openChallenge}
        >
          <Card bg="bg.layerDefault" flex={1} gap="x3" p="x3">
            <Box alignItems="center" bg={colors.bg} borderRadius="r3" height="x12" justifyContent="center" width="x12">
              <Icon name={challengeGame.icon} color={colors.fg} size="large" />
            </Box>
            <VStack flex={1} gap="x1">
              <Text textStyle="t5Bold" maxLines={2}>
                {challengeGame.name} · 75점 이상
              </Text>
              <Text color="fg.neutralMuted" textStyle="t2Regular" maxLines={1}>
                {challengeGame.skill} · 예상 {challengeGame.minutes}분
              </Text>
            </VStack>
            <HStack gap="x1_5">
              <Badge label="+20 XP" tone="brand" size="small" />
              <Badge label="스트릭 +1일" tone="critical" size="small" />
            </HStack>
          </Card>
        </Pressable>
      </Box>
    </VStack>
  );
}

function AllGamesSection() {
  const router = useRouter();
  const gamesWithProgress = useGamesWithProgress();
  const openGame = (id: GameId) => router.push({ pathname: '/games/[id]', params: { id } } as never);
  const columns = 3;
  const lastRowStart = gamesWithProgress.length - (gamesWithProgress.length % columns || columns);

  return (
    <VStack gap="x2">
      <SectionHead title="모든 게임" actionLabel="진행도순" />
      <Card overflow="hidden" p="x0">
        <Grid columns={columns} gap="x0">
          {gamesWithProgress.map((game, index) => (
            <GameTile
              key={game.id}
              game={game}
              onPress={() => openGame(game.id)}
              showBottomDivider={index < lastRowStart}
              showRightDivider={(index + 1) % columns !== 0 && index < gamesWithProgress.length - 1}
              variant="sectionItem"
            />
          ))}
        </Grid>
      </Card>
    </VStack>
  );
}

function MockExamCard() {
  const router = useRouter();
  const { data: session } = useActiveMockExamSession();
  const completedCount = session?.items.length ?? 0;
  const headline = session ? `모의고사 이어하기 · ${completedCount}/10 완료` : '9게임 + AI 면접';
  const detail = session ? '완료한 항목은 다시 응시할 수 없어요' : '완주하면 5대 역량 리포트가 열려요';

  return (
    <Pressable
      accessibilityLabel={session ? '모의고사 이어하기' : '모의고사 시작'}
      accessibilityRole="button"
      onPress={() => router.push({ pathname: '/mock-exam' } as never)}
    >
      <Card bg="bg.neutralSolid" borderColor="stroke.neutralContrast" borderRadius="r5" p="x4">
        <HStack align="center" gap="x3">
          <Box alignItems="center" bg="bg.brandSolid" borderRadius="r4" height="x13" justifyContent="center" width="x13">
            <Icon name="Trophy" color="fg.neutralInverted" size="large" />
          </Box>
          <VStack flex={1} gap="x0_5">
            <Text color="fg.brand" textStyle="t3Bold" maxLines={1}>
              모의고사
            </Text>
            <Text color="fg.neutralInverted" textStyle="t6Bold" maxLines={1}>
              {headline}
            </Text>
            <Text color="fg.neutralSubtle" textStyle="t2Regular" maxLines={1}>
              {detail}
            </Text>
          </VStack>
          <Icon name="ChevronRight" color="fg.neutralInverted" />
        </HStack>
      </Card>
    </Pressable>
  );
}

function RankingTeaser() {
  return (
    <Pressable accessibilityLabel="주간 랭킹 보기" accessibilityRole="button">
      <Card p="x3">
        <HStack align="center" gap="x3">
          <Box alignItems="center" bg="bg.neutralWeak" borderRadius="full" height="x10" justifyContent="center" width="x10">
            <Text color="fg.neutralMuted" textStyle="t4Bold">
              {user.ranking.rivalInitial}
            </Text>
          </Box>
          <VStack flex={1} gap="x0_5">
            <Text textStyle="t3Regular" maxLines={1}>
              {user.ranking.message}
            </Text>
            <Text color="fg.neutralSubtle" textStyle="t2Regular" maxLines={1}>
              {user.ranking.detail}
            </Text>
          </VStack>
          <Badge label="반격" tone="critical" size="small" />
        </HStack>
      </Card>
    </Pressable>
  );
}
