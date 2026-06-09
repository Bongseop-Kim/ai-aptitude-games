import { StatusBar } from 'expo-status-bar';

import { useDesignSystemTheme } from './src/design-system/provider';
import { Grid } from './src/design-system/components/Grid';
import { HStack } from './src/design-system/components/Stack';
import { Body } from './src/components/app/Body';
import { Header } from './src/components/app/Header';
import { bottomNavItems } from './src/components/app/navigation';
import { Screen } from './src/components/app/Screen';
import { SectionHead } from './src/components/app/SectionHead';
import { PlanCard } from './src/components/billing/PlanCard';
import { GameIntroCard } from './src/components/games/GameIntroCard';
import { GameTile } from './src/components/games/GameTile';
import { ProfileSummary } from './src/components/profile/ProfileSummary';
import { MiniStat } from './src/components/readiness/MiniStat';
import { ReadinessGauge } from './src/components/readiness/ReadinessGauge';
import { RadarChart } from './src/components/reports/RadarChart';
import { ReportSection } from './src/components/reports/ReportSection';
import { InviteCodeCard } from './src/components/retention/InviteCodeCard';
import { StreakCard } from './src/components/retention/StreakCard';
import { BottomNav } from './src/components/ui/BottomNav';
import { Tabs } from './src/components/ui/Tabs';
import { games } from './src/data/games';
import { reportCompetencies } from './src/data/reports';
import { subscriptionPlans } from './src/data/subscriptions';
import { LoginScreen } from './src/components/auth/LoginScreen';
import { AppProviders } from './src/providers/AppProviders';
import { useAuth } from './src/providers/AuthProvider';
import { useAppStore } from './src/state/app-store';

const smokeTabs = [
  { label: '홈', value: 'home' },
  { label: '게임', value: 'games' },
  { label: '리포트', value: 'reports' },
] as const;

export default function App() {
  return (
    <AppProviders>
      <AuthGate />
    </AppProviders>
  );
}

function AuthGate() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return null;
  }

  return isAuthenticated ? <AppContent /> : <LoginScreen />;
}

function AppContent() {
  const { mode } = useDesignSystemTheme();
  const tab = useAppStore((state) => state.tab);
  const setTab = useAppStore((state) => state.setTab);

  return (
    <Screen>
      <Header title="역검" subtitle="AI 면접 게임 연습" rightIcon="bell" />
      <Body>
        <Tabs items={smokeTabs} value={tab} onChange={setTab} />

        {tab === 'home' ? <HomeSmoke /> : null}
        {tab === 'games' ? <GamesSmoke /> : null}
        {tab === 'reports' ? <ReportsSmoke /> : null}
        {tab === 'me' ? <ProfileSmoke /> : null}
      </Body>

      <BottomNav items={bottomNavItems} value={tab} onChange={setTab} />
      <StatusBar style={mode === 'dark' ? 'light' : 'dark'} />
    </Screen>
  );
}

function HomeSmoke() {
  return (
    <>
      <ReadinessGauge score={82} />
      <HStack gap="x2">
        <MiniStat label="강한 역량" value="신뢰 · 82" tone="positive" />
        <MiniStat label="보완 역량" value="관계 · 68" tone="warning" />
      </HStack>
      <SectionHead title="오늘의 챌린지" actionLabel="전체" />
      <GameIntroCard game={games[3]} />
      <StreakCard days={4} />
    </>
  );
}

function GamesSmoke() {
  return (
    <>
      <SectionHead title="모든 게임" actionLabel="진행도순" />
      <Grid columns={2} gap="x2">
        {games.map((game) => (
          <GameTile key={game.id} game={game} />
        ))}
      </Grid>
    </>
  );
}

function ReportsSmoke() {
  return (
    <>
      <RadarChart competencies={reportCompetencies} />
      <ReportSection title="강점 · 약점 Top 3" description="메타인지와 지속 주의가 강하고 관계 영역의 편차가 커요." />
      <InviteCodeCard code="SAEUM-82" />
      <PlanCard plan={subscriptionPlans[1]} />
      <ProfileSummary
        name="김준비"
        description="개발 준비 · 무료 체험 6일 남음"
        pushEnabled
        soundEnabled
      />
    </>
  );
}

function ProfileSmoke() {
  return (
    <ProfileSummary
      name="김준비"
      description="개발 준비 · 무료 체험 6일 남음"
      pushEnabled
      soundEnabled
    />
  );
}
