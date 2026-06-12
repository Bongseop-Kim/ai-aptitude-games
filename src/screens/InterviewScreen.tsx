import { useRouter } from 'expo-router';

import { Header } from '../components/app/Header';
import { SectionHead } from '../components/app/SectionHead';
import { TabScreen } from '../components/app/TabScreen';
import { ReadinessGauge } from '../components/readiness/ReadinessGauge';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Icon, type IconName } from '../components/ui/Icon';
import { IconButton } from '../components/ui/IconButton';
import { List } from '../components/ui/List';
import { Skeleton } from '../components/ui/Skeleton';
import { Tag } from '../components/ui/Tag';
import { useInterviewSessions } from '../data/local/useInterviewSessions';
import { Box } from '../design-system/components/Box';
import { HStack, VStack } from '../design-system/components/Stack';
import { Text } from '../design-system/components/Text';
import { ncsJob } from '../data/interview';
import type { InterviewSessionRecord } from '../domain/types';

export function InterviewScreen() {
  const router = useRouter();
  const { data: sessions = [], isLoading } = useInterviewSessions();

  return (
    <TabScreen
      header={
        <Header
          title="실전 면접"
          subtitle="이력서·채용공고로 맞춤 영상 면접"
          rightAction={{
            icon: 'Info',
            label: '면접 정보',
          }}
        />
      }
    >
      <NcsJobCard />
      <StartInterviewCard />
      <Button
        label="이력서로 시작하기"
        variant="solid"
        tone="brand"
        iconLeft="Zap"
        fullWidth
        onPress={() => router.push('/interview/new' as never)}
      />
      <VStack gap="x2">
        <SectionHead
          title="지난 면접"
          actionLabel="전체"
          actionAccessibilityLabel="지난 면접 전체 보기"
          onActionPress={() => router.push('/reports')}
        />
        <Box minHeight={156}>
          {isLoading ? <InterviewSessionSkeletonList /> : null}
          {!isLoading && sessions.length === 0 ? <EmptyInterviewSessions /> : null}
          {!isLoading && sessions.length > 0 ? (
            <List.Root>
              {sessions.map((session, index) => (
                <Box key={session.id}>
                  {index > 0 ? <List.Divider /> : null}
                  <InterviewSessionCard
                    session={session}
                    onPress={() => router.push({ pathname: '/interview/[id]', params: { id: session.id } } as never)}
                  />
                </Box>
              ))}
            </List.Root>
          ) : null}
        </Box>
      </VStack>
    </TabScreen>
  );
}

function NcsJobCard() {
  return (
    <Card bg="bg.brandWeak" borderColor="stroke.brandWeak" gap="x3" p="x4">
      <HStack align="center" gap="x2">
        <Badge label="국가직무능력표준(NCS) 기반" tone="brand" size="small" />
      </HStack>
      <HStack align="flexStart" gap="x3">
        <IconTile icon="Award" bg="bg.layerDefault" color="fg.brand" />
        <VStack flex={1} gap="x0_5">
          <Text color="fg.neutralMuted" textStyle="t2Medium" maxLines={1}>
            {ncsJob.standard} 기반 분류
          </Text>
          <Text textStyle="t7Bold" maxLines={1}>
            {ncsJob.name}
          </Text>
          <Text color="fg.neutralMuted" textStyle="t2Regular" maxLines={1}>
            지원 공고에 맞춰 자동 분류했어요
          </Text>
        </VStack>
        <IconButton name="Pencil" label="직무 변경" variant="weak" disabled />
      </HStack>
      <HStack align="center" gap="x1_5">
        <Icon name="CircleCheck" color="fg.positive" size="small" />
        <Text textStyle="t3Bold" maxLines={1}>
          매핑 신뢰도 {ncsJob.confidence}%
        </Text>
      </HStack>
      <HStack gap="x1_5" wrap>
        {ncsJob.units.map((unit) => (
          <Tag key={unit} label={unit} tone="brand" />
        ))}
      </HStack>
    </Card>
  );
}

function StartInterviewCard() {
  return (
    <Card p="x3">
      <HStack align="center" gap="x3">
        <IconTile icon="Video" bg="bg.brandWeak" color="fg.brand" />
        <VStack flex={1} gap="x0_5">
          <Text textStyle="t5Bold" maxLines={1}>
            이 직무로 면접 시작
          </Text>
          <Text color="fg.neutralMuted" textStyle="t2Regular" maxLines={1}>
            능력단위 기반 맞춤 질문 8개 · 8만 건 분석
          </Text>
        </VStack>
      </HStack>
    </Card>
  );
}

function InterviewSessionCard({ session, onPress }: { session: InterviewSessionRecord; onPress: () => void }) {
  return (
    <List.Item accessibilityLabel={`${session.company} ${session.role} 면접 기록`} onPress={onPress}>
      <List.Prefix>
        <ReadinessGauge score={session.score} size={52} strokeWidth={5} />
      </List.Prefix>
      <List.Content>
        <HStack align="center" gap="x1_5">
          <List.Title>{session.company}</List.Title>
          <Text color="fg.neutralMuted" textStyle="t3Regular" maxLines={1}>
            {session.role}
          </Text>
        </HStack>
        <HStack align="center" gap="x2">
          <List.Detail>{session.dateLabel}</List.Detail>
          <List.Detail>{`질문 ${session.questionCount}개`}</List.Detail>
          {session.delta === null ? null : (
            <Text color={session.delta >= 0 ? 'fg.positive' : 'fg.warning'} textStyle="t3Regular" maxLines={1}>
              {session.delta >= 0 ? '▲' : '▼'} {Math.abs(session.delta)}
            </Text>
          )}
        </HStack>
      </List.Content>
    </List.Item>
  );
}

function InterviewSessionSkeletonList() {
  return (
    <VStack>
      <InterviewSessionRowSkeleton />
      <List.Divider />
      <InterviewSessionRowSkeleton />
    </VStack>
  );
}

function InterviewSessionRowSkeleton() {
  return (
    <HStack align="center" gap="x3" py="x3">
      <Skeleton borderRadius="full" height="x13" width="x13" />
      <VStack flex={1} gap="x2">
        <Skeleton height="x4" width="x16" />
        <Skeleton height="x3" width="full" />
      </VStack>
    </HStack>
  );
}

function EmptyInterviewSessions() {
  return (
    <Card minHeight={132}>
      <VStack align="center" flex={1} gap="x2" justify="center">
        <Icon name="Video" color="fg.neutralSubtle" />
        <Text align="center" color="fg.neutralMuted" textStyle="t4Regular">
          아직 면접 기록이 없어요
        </Text>
      </VStack>
    </Card>
  );
}

function IconTile({ icon, bg, color }: { icon: IconName; bg: 'bg.brandWeak' | 'bg.layerDefault'; color: 'fg.brand' }) {
  return (
    <Box alignItems="center" bg={bg} borderRadius="r3" height="x12" justifyContent="center" width="x12">
      <Icon name={icon} color={color} size="large" />
    </Box>
  );
}
