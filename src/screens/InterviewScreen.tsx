import { Pressable } from 'react-native';
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
import { Tag } from '../components/ui/Tag';
import { Box } from '../design-system/components/Box';
import { HStack, VStack } from '../design-system/components/Stack';
import { Text } from '../design-system/components/Text';
import { interviewSessions, ncsJob } from '../data/interview';
import type { InterviewSession } from '../data/interview';

const noop = () => {};

export function InterviewScreen() {
  const router = useRouter();

  return (
    <TabScreen
      header={
        <Header
          title="실전 면접"
          subtitle="이력서·채용공고로 맞춤 영상 면접"
          rightAction={{
            icon: 'Info',
            label: '면접 정보',
            onPress: noop,
          }}
        />
      }
    >
      <NcsJobCard />
      <StartInterviewCard />
      <Button label="이력서로 시작하기" variant="solid" tone="brand" iconLeft="Zap" fullWidth onPress={noop} />
      <VStack gap="x2">
        <SectionHead
          title="지난 면접"
          actionLabel="전체"
          actionAccessibilityLabel="지난 면접 전체 보기"
          onActionPress={() => router.push('/reports')}
        />
        <VStack gap="x2">
          {interviewSessions.map((session) => (
            <InterviewSessionCard key={`${session.company}-${session.date}`} session={session} />
          ))}
        </VStack>
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
        <IconButton name="Pencil" label="직무 변경" variant="weak" onPress={noop} />
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
    <Pressable accessibilityLabel="이 직무로 면접 시작" accessibilityRole="button" onPress={noop}>
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
    </Pressable>
  );
}

function InterviewSessionCard({ session }: { session: InterviewSession }) {
  return (
    <Pressable
      accessibilityLabel={`${session.company} ${session.role} 면접 기록`}
      accessibilityRole="button"
      onPress={noop}
    >
      <Card p="x3">
        <HStack align="center" gap="x3">
          <ReadinessGauge score={session.score} size={52} strokeWidth={5} />
          <VStack flex={1} gap="x1">
            <HStack align="center" gap="x1_5">
              <Text textStyle="t4Bold" maxLines={1}>
                {session.company}
              </Text>
              <Text color="fg.neutralSubtle" textStyle="t2Regular" maxLines={1}>
                {session.role}
              </Text>
            </HStack>
            <HStack align="center" gap="x2">
              <Text color="fg.neutralSubtle" textStyle="t2Regular" maxLines={1}>
                {session.date}
              </Text>
              <Text color="fg.neutralSubtle" textStyle="t2Regular" maxLines={1}>
                질문 {session.questionCount}개
              </Text>
              {session.delta === null ? null : (
                <Text color="fg.positive" textStyle="t2Bold" maxLines={1}>
                  ▲ {session.delta}
                </Text>
              )}
            </HStack>
          </VStack>
          <Icon name="ChevronRight" color="fg.neutralSubtle" size="small" />
        </HStack>
      </Card>
    </Pressable>
  );
}

function IconTile({ icon, bg, color }: { icon: IconName; bg: 'bg.brandWeak' | 'bg.layerDefault'; color: 'fg.brand' }) {
  return (
    <Box alignItems="center" bg={bg} borderRadius="r3" height="x12" justifyContent="center" width="x12">
      <Icon name={icon} color={color} size="large" />
    </Box>
  );
}
