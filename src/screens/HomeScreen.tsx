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
import { Box } from '../design-system/components/Box';
import { Grid } from '../design-system/components/Grid';
import { HStack, VStack } from '../design-system/components/Stack';
import { Text } from '../design-system/components/Text';
import { games } from '../data/games';
import { useGamesWithProgress } from '../data/local/useGameResults';
import { user } from '../data/user';
import { readinessLabel } from '../domain/readiness';
import { toneColors } from '../domain/tone';
import type { GameId } from '../domain/types';
import type { BadgeTone } from '../shared/types';

const challengeGame = games.find((game) => game.id === 'potion') ?? games[0];

export function HomeScreen() {
  return (
    <TabScreen header={<HomeHeader />}>
      <Greeting />
      <ReadinessSummary />
      <DailyChallenge />
      <AllGamesSection />
      <MockExamCard />
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
          <Text color="fg.brand" textStyle="t5Bold" maxLines={1}>
            {readinessLabel(user.readiness.score)}
          </Text>
          <MetricRow icon="TrendingUp" iconTone="positive" label="강한 역량" value={user.readiness.strength} />
          <MetricRow icon="CircleDot" iconTone="critical" label="보완 역량" value={user.readiness.weakness} />
        </VStack>
      </HStack>
      <Box bg="stroke.neutralWeak" height="x0_5" />
      <Pressable accessibilityLabel="지난 리포트 보기" accessibilityRole="button" onPress={() => router.push('/reports')}>
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

function MetricRow({
  icon,
  iconTone,
  label,
  value,
}: {
  icon: IconName;
  iconTone: 'positive' | 'critical';
  label: string;
  value: string;
}) {
  return (
    <HStack align="center" gap="x2">
      <Icon name={icon} color={toneColors[iconTone].fg} size="small" />
      <Box flex={1}>
        <Text color="fg.neutralSubtle" textStyle="t2Regular" maxLines={1}>
          {label}
        </Text>
      </Box>
      <Box flexShrink={0}>
        <Text textStyle="t3Bold" maxLines={1}>
          {value}
        </Text>
      </Box>
    </HStack>
  );
}

function DailyChallenge() {
  const colors = toneColors[challengeGame.tone];
  const router = useRouter();
  const openChallenge = () => router.push({ pathname: '/games/[id]', params: { id: challengeGame.id } });

  return (
    <VStack gap="x2">
      <SectionHead
        icon="Flame"
        title="오늘의 챌린지"
        actionLabel="전체"
        actionAccessibilityLabel="오늘의 챌린지 전체 보기"
        onActionPress={() => router.push('/games')}
      />
      <Pressable accessibilityLabel={`${challengeGame.name} 오늘의 챌린지 시작`} accessibilityRole="button" onPress={openChallenge}>
        <Card bg="bg.brandWeak" borderColor="stroke.brandWeak" gap="x3" p="x3">
          <HStack align="center" gap="x3">
            <Box alignItems="center" bg="bg.layerDefault" borderRadius="r3" height="x12" justifyContent="center" width="x12">
              <Icon name={challengeGame.icon} color={colors.fg} size="large" />
            </Box>
            <VStack flex={1} gap="x1">
              <Text textStyle="t5Bold" maxLines={1}>
                {challengeGame.name} · 75점 이상
              </Text>
              <Text color="fg.neutralMuted" textStyle="t2Regular" maxLines={1}>
                {challengeGame.skill} · 예상 {challengeGame.minutes}분
              </Text>
              <HStack gap="x1_5">
                <Badge label="+20 XP" tone="brand" size="small" />
                <Badge label="스트릭 +1일" tone="critical" size="small" />
              </HStack>
            </VStack>
          </HStack>
          <HStack
            align="center"
            bg="bg.brandSolid"
            borderColor="stroke.brandSolid"
            borderRadius="r3"
            borderWidth="thin"
            gap="x2"
            justify="center"
            px="x4"
            py="x3"
            width="full"
          >
            <Text color="fg.neutralInverted" textStyle="t5Bold" maxLines={1}>
              지금 도전하기
            </Text>
            <Icon name="Play" color="fg.neutralInverted" size="small" />
          </HStack>
        </Card>
      </Pressable>
    </VStack>
  );
}

function AllGamesSection() {
  const router = useRouter();
  const gamesWithProgress = useGamesWithProgress();
  const openGame = (id: GameId) => router.push({ pathname: '/games/[id]', params: { id } });

  return (
    <VStack gap="x2">
      <SectionHead title="모든 게임" actionLabel="진행도순" />
      <Grid columns={3} gap="x3">
        {gamesWithProgress.map((game) => (
          <GameTile key={game.id} game={game} onPress={() => openGame(game.id)} />
        ))}
      </Grid>
    </VStack>
  );
}

function MockExamCard() {
  return (
    <Pressable accessibilityLabel="모의고사 시작" accessibilityRole="button">
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
              9게임 연속 · 22분
            </Text>
            <Text color="fg.neutralSubtle" textStyle="t2Regular" maxLines={1}>
              완주하면 5대 역량 리포트가 열려요
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
