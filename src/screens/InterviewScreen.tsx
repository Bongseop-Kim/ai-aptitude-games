import { useState } from 'react';
import { useRouter } from 'expo-router';

import { Header } from '../components/app/Header';
import { SectionHead } from '../components/app/SectionHead';
import { TabScreen } from '../components/app/TabScreen';
import { JobFamilySheet } from '../components/profile/JobFamilySheet';
import { ReadinessGauge } from '../components/readiness/ReadinessGauge';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Icon, type IconName } from '../components/ui/Icon';
import { IconButton } from '../components/ui/IconButton';
import { List } from '../components/ui/List';
import { Skeleton } from '../components/ui/Skeleton';
import { useInterviewSessions } from '../data/local/useInterviewSessions';
import { useProfile } from '../data/server/useProfile';
import { useResumes } from '../data/server/useResumes';
import { useMyJobPostings } from '../data/server/useJobPostings';
import { Box } from '../design-system/components/Box';
import { HStack, VStack } from '../design-system/components/Stack';
import { Text } from '../design-system/components/Text';
import { jobFamilyLabel } from '../domain/jobFamily';
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
      <JobFamilyCard />
      <Button
        label="면접 시작하기"
        variant="solid"
        tone="brand"
        iconLeft="Zap"
        fullWidth
        onPress={() => router.push('/interview/new' as never)}
      />
      <InterviewPrepSection />
      <VStack gap="x2">
        <SectionHead
          title="지난 면접"
          actionLabel="전체"
          actionAccessibilityLabel="지난 면접 전체 보기"
          onActionPress={() => router.push('/reports' as never)}
        />
        <Box minHeight="x39">
          {isLoading ? (
            <Card bg="bg.layerDefault" overflow="hidden" py="x1">
              <InterviewSessionSkeletonList />
            </Card>
          ) : null}
          {!isLoading && sessions.length === 0 ? <EmptyInterviewSessions /> : null}
          {!isLoading && sessions.length > 0 ? (
            <Card bg="bg.layerDefault" overflow="hidden" py="x1">
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
            </Card>
          ) : null}
        </Box>
      </VStack>
    </TabScreen>
  );
}

function JobFamilyCard() {
  const { data: profile } = useProfile();
  const [sheetVisible, setSheetVisible] = useState(false);
  const label = jobFamilyLabel(profile?.field);

  return (
    <Card gap="x3" p="x4">
      <HStack align="center" gap="x3">
        <IconTile icon="Target" bg="bg.layerDefault" color="fg.brand" />
        <VStack flex={1} gap="x0_5">
          <Text color="fg.neutralMuted" textStyle="t2Medium" maxLines={1}>
            목표 직무
          </Text>
          <Text textStyle="t7Bold" maxLines={1}>
            {label ?? '직무를 선택해주세요'}
          </Text>
        </VStack>
        <IconButton name="Pencil" label="직무 변경" variant="weak" onPress={() => setSheetVisible(true)} />
      </HStack>
      <JobFamilySheet
        visible={sheetVisible}
        current={profile?.field ?? null}
        onClose={() => setSheetVisible(false)}
      />
    </Card>
  );
}

function InterviewPrepSection() {
  const router = useRouter();
  const { data: resumes } = useResumes();
  const { data: postings } = useMyJobPostings();
  const resumeValue = resumes != null ? `${resumes.length}개` : null;
  const postingValue = postings != null ? `${postings.length}개` : null;

  return (
    <VStack gap="x2">
      <SectionHead title="면접 준비" />
      <Card py="x1">
        <List.Root>
          <List.Item accessibilityLabel="내 이력서" onPress={() => router.push('/interview/resumes' as never)}>
            <List.Prefix>
              <Icon name="FileText" color="fg.brand" />
            </List.Prefix>
            <List.Content>
              <List.Title>내 이력서</List.Title>
            </List.Content>
            <List.Suffix>
              <Box alignItems="flexEnd" minWidth="x10">
                {resumeValue ? (
                  <Text color="fg.neutralMuted" textStyle="t3Medium" maxLines={1}>
                    {resumeValue}
                  </Text>
                ) : (
                  <Skeleton height="x4" width="x8" />
                )}
              </Box>
              <Icon name="ChevronRight" size="small" />
            </List.Suffix>
          </List.Item>
          <List.Divider />
          <List.Item accessibilityLabel="채용공고" onPress={() => router.push('/interview/postings' as never)}>
            <List.Prefix>
              <Icon name="Building2" color="fg.brand" />
            </List.Prefix>
            <List.Content>
              <List.Title>채용공고</List.Title>
            </List.Content>
            <List.Suffix>
              <Box alignItems="flexEnd" minWidth="x10">
                {postingValue ? (
                  <Text color="fg.neutralMuted" textStyle="t3Medium" maxLines={1}>
                    {postingValue}
                  </Text>
                ) : (
                  <Skeleton height="x4" width="x8" />
                )}
              </Box>
              <Icon name="ChevronRight" size="small" />
            </List.Suffix>
          </List.Item>
        </List.Root>
      </Card>
    </VStack>
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
    <Card minHeight="x34">
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
