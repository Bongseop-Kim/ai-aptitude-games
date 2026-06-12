import { Fragment, useState, type ReactNode } from 'react';
import { Alert, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { BottomActionBar } from '../components/app/BottomActionBar';
import { Header } from '../components/app/Header';
import { SectionHead } from '../components/app/SectionHead';
import { Screen } from '../components/app/Screen';
import {
  CompetencyRadarChart,
  GrowthTrendChart,
  PercentileBar,
  ResponsePatternChart,
  StressResilienceChart,
} from '../components/reports/ReportCharts';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Icon } from '../components/ui/Icon';
import { List } from '../components/ui/List';
import { Badge } from '../components/ui/Badge';
import { Skeleton } from '../components/ui/Skeleton';
import { ProgressBar } from '../components/readiness/ProgressBar';
import { ReadinessGauge } from '../components/readiness/ReadinessGauge';
import {
  peerPercentiles,
  reportCompetencies,
  reportDetailSections,
  reportGrowthAreas,
  reportStrengths,
  type ReportHighlight,
} from '../data/reports';
import { useMockExamRecord, useMockExamRecords } from '../data/local/useMockExamResults';
import { Box } from '../design-system/components/Box';
import { Grid } from '../design-system/components/Grid';
import { HStack, VStack } from '../design-system/components/Stack';
import { Text } from '../design-system/components/Text';
import type { MockExamRecord, ReportCompetency, ReportSectionKey } from '../domain/types';

const stressValues = [72, 78, 82, 75, 74, 76, 80, 82, 78, 85, 84, 88, 78, 70, 58, 65, 55, 48, 72, 66, 58, 82, 80, 78, 90, 88, 85];
const responseScales = [
  { left: '신중함', right: '직관', value: 72 },
  { left: '속도', right: '정확도', value: 40 },
  { left: '리스크 회피', right: '리스크 감수', value: 65 },
  { left: '고정관념', right: '유연성', value: 78 },
];
const coachPlan = [
  { day: '1-3일', game: '숫자 누르기', level: '5자리', duration: '10분/일' },
  { day: '4-6일', game: '도형 순서', level: '2-back', duration: '12분/일' },
  { day: '7-9일', game: '길 만들기', level: '난이도 중', duration: '15분/일' },
  { day: '10-14일', game: '모의고사 재도전', level: '전 9게임', duration: '22분' },
];
const coverFeatureSections = reportDetailSections.slice(1);

function showShareNotice() {
  Alert.alert('공유 준비 중', '공유 카드는 다음 업데이트에서 저장할 수 있어요.');
}

function showProNotice() {
  Alert.alert('Pro 준비 중', '구독 화면은 다음 업데이트에서 연결할 예정이에요.');
}

function formatFullDate(sqliteUtcDatetime: string) {
  const date = new Date(`${sqliteUtcDatetime.replace(' ', 'T')}Z`);
  return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`;
}

function formatDurationLabel(durationMs: number) {
  const totalMinutes = Math.max(1, Math.round(durationMs / 60000));
  return `${totalMinutes}분 소요`;
}

function strongestCompetency(competencies: ReportCompetency[]) {
  return competencies.reduce((best, item) => (item.score > best.score ? item : best), competencies[0]);
}

function weakestCompetency(competencies: ReportCompetency[]) {
  return competencies.reduce((weakest, item) => (item.score < weakest.score ? item : weakest), competencies[0]);
}

export function ReportDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const recordId = typeof id === 'string' ? id : null;
  const [sectionIndex, setSectionIndex] = useState(0);
  const { data: record, isLoading } = useMockExamRecord(recordId);
  const { data: records = [] } = useMockExamRecords();
  const section = reportDetailSections[sectionIndex];
  const isLastSection = sectionIndex >= reportDetailSections.length - 1;
  const locked = Boolean(section.locked && !record?.pro);

  function goNext() {
    if (!isLastSection) {
      setSectionIndex((current) => current + 1);
      return;
    }

    router.back();
  }

  function goBack() {
    if (sectionIndex === 0) {
      router.back();
      return;
    }

    setSectionIndex((current) => current - 1);
  }

  return (
    <Screen>
      <Header
        title={section.title}
        subtitle={`모의고사 · ${record?.round ?? '-'}회차 리포트`}
        showBack
        onBack={goBack}
        rightAction={{
          icon: 'Share',
          label: '공유',
          onPress: showShareNotice,
        }}
      >
        <ReportDetailProgress sectionIndex={sectionIndex} />
      </Header>
      <Box flex={1} bleedX="spacingX.globalGutter">
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, paddingBottom: 16 }}
          showsVerticalScrollIndicator={false}
        >
          <Box px="spacingX.globalGutter" py="x3">
            {isLoading ? <ReportDetailSkeleton /> : null}
            {!isLoading && !record ? <MissingReport onBack={() => router.back()} /> : null}
            {!isLoading && record ? (
              <LockedReportSection locked={locked}>
                <ReportSectionBody sectionKey={section.key} record={record} records={records} />
              </LockedReportSection>
            ) : null}
          </Box>
        </ScrollView>
      </Box>
      <BottomActionBar
        secondary={{
          label: '공유',
          iconLeft: 'Share',
          onPress: showShareNotice,
        }}
        primary={{
          label: isLastSection ? '완료' : '다음',
          iconRight: isLastSection ? 'Check' : 'ArrowRight',
          onPress: goNext,
        }}
      />
    </Screen>
  );
}

type ReportDetailProgressProps = {
  sectionIndex: number;
};

function ReportDetailProgress({ sectionIndex }: ReportDetailProgressProps) {
  return (
    <HStack gap="x1">
      {reportDetailSections.map((item, index) => (
        <Box
          key={item.key}
          bg={index <= sectionIndex ? 'bg.brandSolid' : 'stroke.neutralWeak'}
          borderRadius="full"
          flex={1}
          height="x1"
        />
      ))}
    </HStack>
  );
}

function ReportDetailSkeleton() {
  return (
    <VStack gap="x3">
      <Skeleton height="x4" width="x16" />
      <Skeleton height="x8" width="full" />
      <Skeleton borderRadius="r4" height={140} width="full" />
      <Skeleton borderRadius="r4" height={90} width="full" />
    </VStack>
  );
}

type MissingReportProps = {
  onBack: () => void;
};

function MissingReport({ onBack }: MissingReportProps) {
  return (
    <Card>
      <VStack align="center" gap="x2">
        <Text align="center" textStyle="t5Bold">
          리포트를 찾지 못했어요
        </Text>
        <Text align="center" color="fg.neutralMuted" textStyle="t3Regular">
          기록 목록에서 다시 열어주세요.
        </Text>
        <Button label="기록으로 돌아가기" variant="weak" onPress={onBack} />
      </VStack>
    </Card>
  );
}

type LockedReportSectionProps = {
  locked: boolean;
  children: ReactNode;
};

function LockedReportSection({ locked, children }: LockedReportSectionProps) {
  if (!locked) {
    return <>{children}</>;
  }

  return (
    <Box minHeight={520} position="relative">
      <Box style={{ opacity: 0.18 }}>
        {children}
      </Box>
      <Box
        alignItems="center"
        bottom={0}
        justifyContent="center"
        left={0}
        position="absolute"
        right={0}
        top={0}
      >
        <VStack align="center" gap="x3">
          <Box
            alignItems="center"
            bg="bg.layerFloating"
            borderRadius="full"
            boxShadow="surface"
            height="x14"
            justifyContent="center"
            width="x14"
          >
            <Icon name="Lock" color="fg.brand" size="large" />
          </Box>
          <VStack align="center" gap="x1">
            <Text align="center" textStyle="t5Bold">
              프리미엄 전용 섹션
            </Text>
            <Text align="center" color="fg.neutralMuted" textStyle="t3Regular">
              복원력·응답 패턴·AI 코치는 Pro에서 열려요.
            </Text>
          </VStack>
          <Button
            label="Pro로 잠금 해제"
            iconLeft="Zap"
            onPress={showProNotice}
          />
        </VStack>
      </Box>
    </Box>
  );
}

type ReportSectionBodyProps = {
  sectionKey: ReportSectionKey;
  record: MockExamRecord;
  records: MockExamRecord[];
};

function ReportSectionBody({ sectionKey, record, records }: ReportSectionBodyProps) {
  switch (sectionKey) {
    case 'cover':
      return <CoverSection record={record} />;
    case 'radar':
      return <RadarSection />;
    case 'highlights':
      return <HighlightsSection />;
    case 'resilience':
      return <ResilienceSection />;
    case 'pattern':
      return <PatternSection />;
    case 'peer':
      return <PeerSection record={record} records={records} />;
    case 'coach':
      return <CoachSection />;
  }
}

type RecordSectionProps = {
  record: MockExamRecord;
};

function CoverSection({ record }: RecordSectionProps) {
  const strongest = strongestCompetency(reportCompetencies);
  const weakest = weakestCompetency(reportCompetencies);

  return (
    <VStack gap="x3">
      <VStack gap="x0_5">
        <Text color="fg.neutralSubtle" textStyle="t2Regular">
          {formatFullDate(record.createdAt)} · {formatDurationLabel(record.durationMs)}
        </Text>
        <Text textStyle="t9Bold">오늘의 역량 지도</Text>
        <Text color="fg.neutralMuted" textStyle="t3Regular">
          9개 게임 · 240문항 · 5대 역량 분석
        </Text>
      </VStack>

      <Card bg="bg.brandWeak" borderColor="stroke.brandWeak">
        <HStack align="center" gap="x4">
          <ReadinessGauge score={record.score} size={108} />
          <VStack flex={1} gap="x1">
            <Text color="fg.neutralMuted" textStyle="t2Regular">
              종합 준비도
            </Text>
            <HStack align="center" gap="x1_5">
              <Text textStyle="t10Bold">{record.score}</Text>
              <Text color="fg.neutralSubtle" textStyle="t3Regular">/ 100</Text>
            </HStack>
            <Badge label="또래 대비 상위 28%" tone="positive" />
          </VStack>
        </HStack>
      </Card>

      <Grid columns={2} gap="x2">
        <InsightTile
          label="강한 영역"
          title={`${strongest.label} · ${strongest.score}`}
          description={strongest.description}
          tone="positive"
        />
        <InsightTile
          label="보완 영역"
          title={`${weakest.label} · ${weakest.score}`}
          description={weakest.description}
          tone="warning"
        />
      </Grid>

      <SectionHead title="이 리포트에는" />
      <Card py="x1">
        <List.Root>
          {coverFeatureSections.map((section, index) => (
            <ReportFeatureRow key={section.key} index={index + 1} title={section.title} locked={section.locked} />
          ))}
        </List.Root>
      </Card>
    </VStack>
  );
}

type InsightTileProps = {
  label: string;
  title: string;
  description: string;
  tone: 'positive' | 'warning';
};

function InsightTile({ label, title, description, tone }: InsightTileProps) {
  return (
    <Card bg={tone === 'positive' ? 'palette.green100' : 'mannerTemp.l4Bg'} borderColor="stroke.neutralWeak" p="x3">
      <VStack gap="x0_5">
        <Text color="fg.neutralMuted" textStyle="t1Regular">
          {label}
        </Text>
        <Text color={tone === 'positive' ? 'fg.positive' : 'mannerTemp.l4Text'} textStyle="t5Bold" maxLines={1}>
          {title}
        </Text>
        <Text color="fg.neutralSubtle" textStyle="t1Regular" maxLines={2}>
          {description}
        </Text>
      </VStack>
    </Card>
  );
}

type ReportFeatureRowProps = {
  index: number;
  title: string;
  locked: boolean;
};

function ReportFeatureRow({ index, title, locked }: ReportFeatureRowProps) {
  return (
    <List.Item>
      <List.Prefix>
        <Text color="fg.neutralSubtle" textStyle="t3Bold">
          {index}
        </Text>
      </List.Prefix>
      <List.Content>
        <List.Title>
          {title}
        </List.Title>
      </List.Content>
      <List.Suffix>
        {locked ? (
          <Badge label="Pro" tone="brand" size="small" />
        ) : (
          <Text color="fg.neutralSubtle" textStyle="t2Regular">Free</Text>
        )}
      </List.Suffix>
    </List.Item>
  );
}

function RadarSection() {
  return (
    <VStack gap="x3">
      <VStack gap="x0_5">
        <Text color="fg.neutralSubtle" textStyle="t2Regular">
          검증된 역량 모델 (r=0.28-0.38)
        </Text>
        <Text textStyle="t8Bold">당신의 역량 지도</Text>
      </VStack>
      <Card>
        <CompetencyRadarChart competencies={reportCompetencies} />
      </Card>
      <Card gap="x3">
        {reportCompetencies.map((competency) => (
          <CompetencyRow key={competency.key} competency={competency} />
        ))}
      </Card>
    </VStack>
  );
}

type CompetencyRowProps = {
  competency: ReportCompetency;
};

function CompetencyRow({ competency }: CompetencyRowProps) {
  return (
    <HStack align="center" gap="x3">
      <VStack width="x16">
        <Text textStyle="t3Bold" maxLines={1}>
          {competency.label}
        </Text>
        <Text color="fg.neutralSubtle" textStyle="t1Regular" maxLines={2}>
          {competency.description}
        </Text>
      </VStack>
      <ProgressBar value={competency.score} tone={competency.tone} layout="inline" />
      <Text align="right" textStyle="t4Bold">
        {competency.score}
      </Text>
    </HStack>
  );
}

function HighlightsSection() {
  return (
    <VStack gap="x3">
      <Text textStyle="t8Bold">뭘 잘하고, 뭘 보완할까</Text>
      <VStack gap="x2">
        <HStack align="center" gap="x1_5">
          <Icon name="TrendingUp" color="fg.positive" size="small" />
          <Text textStyle="t4Bold">강점 Top 3</Text>
        </HStack>
        <List.Root>
          {reportStrengths.map((item, index) => (
            <Fragment key={item.game}>
              {index > 0 ? <List.Divider /> : null}
              <HighlightRow item={item} index={index} tone="positive" />
            </Fragment>
          ))}
        </List.Root>
      </VStack>
      <VStack gap="x2">
        <HStack align="center" gap="x1_5">
          <Icon name="CircleDot" color="mannerTemp.l4Text" size="small" />
          <Text textStyle="t4Bold">보완 Top 3</Text>
        </HStack>
        <List.Root>
          {reportGrowthAreas.map((item, index) => (
            <Fragment key={item.game}>
              {index > 0 ? <List.Divider /> : null}
              <HighlightRow item={item} index={index} tone="warning" />
            </Fragment>
          ))}
        </List.Root>
      </VStack>
    </VStack>
  );
}

type HighlightRowProps = {
  item: ReportHighlight;
  index: number;
  tone: 'positive' | 'warning';
};

function HighlightRow({ item, index, tone }: HighlightRowProps) {
  return (
    <List.Item>
      <List.Prefix>
        <Text color="fg.neutralSubtle" textStyle="t3Bold">{index + 1}</Text>
      </List.Prefix>
      <List.Content>
        <List.Title>{item.game}</List.Title>
        <List.Detail>{item.skill}</List.Detail>
        <List.Detail>{item.note}</List.Detail>
      </List.Content>
      <List.Suffix>
        <Text color={tone === 'positive' ? 'fg.positive' : 'mannerTemp.l4Text'} textStyle="t5Bold">
          {item.score}
        </Text>
      </List.Suffix>
    </List.Item>
  );
}

function ResilienceSection() {
  return (
    <VStack gap="x3">
      <VStack gap="x0_5">
        <Text textStyle="t8Bold">압박 상황의 나</Text>
        <Text color="fg.neutralMuted" textStyle="t2Regular">
          난이도 상승·오답 후·타임 프레셔 구간의 수행 변화
        </Text>
      </VStack>
      <Card>
        <StressResilienceChart values={stressValues} />
        <Text align="center" color="fg.neutralSubtle" textStyle="t1Regular">
          G1에서 G9까지 난이도 구간별 수행도
        </Text>
      </Card>
      <InsightTile label="수행 하락 구간" title="G5-G7에서 15점 하락" description="고난이도 스트레스에 약해지는 신호가 있었어요." tone="warning" />
      <InsightTile label="복원력" title="후반 회복" description="G8부터 페이스가 회복되며 자기 조절이 작동했어요." tone="positive" />
    </VStack>
  );
}

function PatternSection() {
  return (
    <VStack gap="x3">
      <Text textStyle="t8Bold">나의 사고 스타일</Text>
      <Card>
        <ResponsePatternChart />
      </Card>
      <Card gap="x3">
        {responseScales.map((item) => (
          <ScaleRow key={item.left} {...item} />
        ))}
      </Card>
    </VStack>
  );
}

type ScaleRowProps = {
  left: string;
  right: string;
  value: number;
};

function ScaleRow({ left, right, value }: ScaleRowProps) {
  return (
    <Grid columns={3} gap="x2">
      <Text align="right" color="fg.neutralSubtle" textStyle="t1Regular">
        {left}
      </Text>
      <Box bg="bg.neutralWeak" borderRadius="full" height="x2" position="relative">
        <Box
          bg="fg.neutral"
          borderRadius="full"
          height="x3"
          left={`${value}%`}
          position="absolute"
          top={-2}
          width="x1"
        />
      </Box>
      <Text color="fg.neutralMuted" textStyle="t1Regular">
        {right}
      </Text>
    </Grid>
  );
}

type PeerSectionProps = {
  record: MockExamRecord;
  records: MockExamRecord[];
};

function PeerSection({ record, records }: PeerSectionProps) {
  const chronologicalRecords = [...records].reverse();
  const scores = chronologicalRecords.map((item) => item.score);
  const firstScore = scores[0] ?? record.score;
  const delta = record.score - firstScore;

  return (
    <VStack gap="x3">
      <Text textStyle="t8Bold">어디쯤 와 있을까</Text>
      <Card>
        <Text color="fg.neutralSubtle" textStyle="t1Regular">
          또래 (취업준비생 20-30대 · N=12,400)
        </Text>
        <HStack align="center" justify="center" mt="x1">
          <Text textStyle="t3Bold">나 28%</Text>
        </HStack>
        <PercentileBar percentile={72} />
      </Card>
      <SectionHead title="역량별 백분위" />
      <Card gap="x3">
        {reportCompetencies.map((competency) => (
          <HStack key={competency.key} align="center" gap="x3">
            <Text textStyle="t3Bold" maxLines={1}>
              {competency.label}
            </Text>
            <ProgressBar value={peerPercentiles[competency.key]} tone={competency.tone} layout="inline" />
            <Text align="right" color="fg.neutralSubtle" textStyle="t1Regular">
              상위 {100 - peerPercentiles[competency.key]}%
            </Text>
          </HStack>
        ))}
      </Card>
      <SectionHead title="회차별 성장" />
      <Card>
        <GrowthTrendChart scores={scores.length > 0 ? scores : [record.score]} />
        <HStack bg="bg.brandWeak" borderRadius="r3" gap="x2" px="x3" py="x2">
          <Icon name="TrendingUp" color="fg.brand" size="small" />
          <Text color="fg.brand" textStyle="t3Medium">
            첫 회차 대비 {delta >= 0 ? `+${delta}` : delta}점 성장했어요
          </Text>
        </HStack>
      </Card>
    </VStack>
  );
}

function CoachSection() {
  return (
    <VStack gap="x3">
      <Text textStyle="t8Bold">이번 회차 인사이트</Text>
      <Card>
        <HStack gap="x3">
          <Box
            alignItems="center"
            bg="bg.brandWeak"
            borderRadius="full"
            height="x10"
            justifyContent="center"
            width="x10"
          >
            <Icon name="CircleHelp" color="fg.brand" />
          </Box>
          <VStack flex={1} gap="x1">
            <Text textStyle="t3Bold">
              메타인지·귀납 추론이 강하고, 정보 갱신 부하에는 연습 효과를 기대할 수 있어요.
            </Text>
            <Text color="fg.neutralMuted" textStyle="t2Regular">
              불확실성 속 규칙 발견형입니다. 숫자와 N-back은 짧게 반복하는 훈련을 권장해요.
            </Text>
          </VStack>
        </HStack>
      </Card>
      <SectionHead title="2주 훈련 플랜" />
      <List.Root>
        {coachPlan.map((item, index) => (
          <Fragment key={item.day}>
            {index > 0 ? <List.Divider /> : null}
            <List.Item>
              <List.Prefix>
                <Badge label={item.day} tone={index === coachPlan.length - 1 ? 'positive' : 'brand'} size="small" />
              </List.Prefix>
              <List.Content>
                <List.Title>{item.game}</List.Title>
                <List.Detail>{item.level}</List.Detail>
              </List.Content>
              <List.Suffix>
                <Text color="fg.neutralMuted" textStyle="t3Medium" maxLines={1}>{item.duration}</Text>
              </List.Suffix>
            </List.Item>
          </Fragment>
        ))}
      </List.Root>
      <Card>
        <HStack align="center" gap="x3">
          <Icon name="Bell" color="fg.brand" />
          <VStack flex={1}>
            <Text textStyle="t3Bold">매일 오후 9시 리마인드</Text>
            <Text color="fg.neutralSubtle" textStyle="t1Regular">훈련 시간을 잊지 않게 알려줘요.</Text>
          </VStack>
          <Badge label="준비 중" tone="neutral" size="small" />
        </HStack>
      </Card>
    </VStack>
  );
}
