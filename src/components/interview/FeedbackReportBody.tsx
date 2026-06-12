import { useState, type ReactNode } from 'react';
import { Pressable } from 'react-native';

import { SectionHead } from '../app/SectionHead';
import { ProgressBar } from '../readiness/ProgressBar';
import { ReadinessGauge } from '../readiness/ReadinessGauge';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Icon } from '../ui/Icon';
import { Tag } from '../ui/Tag';
import { Box } from '../../design-system/components/Box';
import { Grid } from '../../design-system/components/Grid';
import { HStack, VStack } from '../../design-system/components/Stack';
import { Text } from '../../design-system/components/Text';
import { resolveColor, type ColorToken } from '../../design-system/components/style-props';
import { useDesignSystemTheme } from '../../design-system/provider';
import { INTERVIEW_AXES, QUESTION_CATEGORY_TONE, mockJobPosting } from '../../data/interviewFlow';
import type { InterviewAxisKey } from '../../data/interviewFlow';
import {
  deliveryDetails,
  getAxisAverages,
  getOverallInterviewScore,
  getQuestionOverall,
  interviewQuestions,
  interviewTopFixes,
  ncsUnitScores,
  peerAxisScores,
  type InterviewQuestion,
} from '../../data/interviewSession';
import { NCS_PRIMARY, SRC_AIHUB, SRC_NCS } from '../../data/ncs';
import type { InterviewSessionRecord } from '../../domain/types';
import {
  Canvas,
  Circle,
  Path,
  Skia,
} from '../../lib/native-motion';

type Point = { x: number; y: number };

type FeedbackReportBodyProps = {
  session?: InterviewSessionRecord | null;
  onRetryQuestion?: (questionId: number) => void;
};

const axisToneBg = {
  brand: 'bg.brandWeak',
  informative: 'palette.blue100',
  neutral: 'bg.neutralWeak',
  warning: 'palette.yellow100',
  critical: 'palette.red100',
  positive: 'palette.green100',
} as const;

function buildPolygonPath(points: Point[]) {
  const builder = Skia.PathBuilder.Make();

  points.forEach((point, index) => {
    if (index === 0) {
      builder.moveTo(point.x, point.y);
      return;
    }

    builder.lineTo(point.x, point.y);
  });

  builder.close();
  return builder.detach();
}

function axisByKey(key: InterviewAxisKey) {
  return INTERVIEW_AXES.find((axis) => axis.key === key) ?? INTERVIEW_AXES[0];
}

function axisIconColor(tone: (typeof INTERVIEW_AXES)[number]['tone']): ColorToken {
  return tone === 'neutral' ? 'fg.neutralMuted' : `fg.${tone}`;
}

export function FeedbackReportBody({ session, onRetryQuestion }: FeedbackReportBodyProps) {
  const averages = getAxisAverages();
  const score = session?.score ?? getOverallInterviewScore();

  return (
    <VStack gap="x4">
      <NcsUnitChips />
      <SummaryCard score={score} session={session} />

      <VStack gap="x2">
        <SectionHead title="5가지 항목 분석" />
        <AxisRadarCard scores={averages} />
        <VStack gap="x2">
          {INTERVIEW_AXES.map((axis) => (
            <AxisBar
              key={axis.key}
              axisKey={axis.key}
              score={averages[axis.key]}
              locked={axis.pro}
            />
          ))}
        </VStack>
      </VStack>

      <VStack gap="x2">
        <SectionHead title="능력단위 기반 평가" />
        <Card gap="x2">
          {ncsUnitScores.map((unit) => (
            <HStack key={unit.label} align="center" gap="x3">
              <Box width="x16">
                <Text textStyle="t3Medium" maxLines={1}>
                  {unit.label}
                </Text>
              </Box>
              <ProgressBar value={unit.score} tone={unit.score >= 75 ? 'brand' : 'warning'} layout="inline" />
              <Box width="x7">
                <Text align="right" textStyle="t3Bold">
                  {unit.score}
                </Text>
              </Box>
            </HStack>
          ))}
        </Card>
      </VStack>

      <VStack gap="x2">
        <SectionHead title="시선 · 전달력 심층" actionLabel="Pro" />
        <ProLock locked>
          <DeepAnalysisSection />
        </ProLock>
      </VStack>

      <VStack gap="x2">
        <SectionHead title="가장 먼저 고칠 점" />
        {interviewTopFixes.map((fix, index) => (
          <TopFixCard key={fix.title} index={index + 1} fix={fix} />
        ))}
      </VStack>

      <QuestionAccordion onRetryQuestion={onRetryQuestion} />
      <SourceFootnote />
    </VStack>
  );
}

function NcsUnitChips() {
  return (
    <Card bg="bg.brandWeak" borderColor="stroke.brandWeak" gap="x2" p="x3">
      <HStack align="center" gap="x2">
        <Icon name="BadgeCheck" color="fg.brand" size="small" />
        <Text color="fg.brand" textStyle="t3Bold">
          {NCS_PRIMARY.name} · {NCS_PRIMARY.code}
        </Text>
      </HStack>
      <HStack gap="x1_5" wrap>
        {NCS_PRIMARY.units.map((unit) => (
          <Tag key={unit} label={unit} tone="brand" selected />
        ))}
      </HStack>
    </Card>
  );
}

function SummaryCard({ score, session }: { score: number; session?: InterviewSessionRecord | null }) {
  return (
    <Card bg="bg.brandWeak" borderColor="stroke.brandWeak">
      <HStack align="center" gap="x4">
        <ReadinessGauge score={score} size={108} />
        <VStack flex={1} gap="x1">
          <Text color="fg.neutralMuted" textStyle="t2Regular">
            {(session?.company ?? mockJobPosting.company)} 모의 면접 종합
          </Text>
          <HStack align="center" gap="x1_5">
            <Text textStyle="t10Bold">{score}</Text>
            <Text color="fg.neutralSubtle" textStyle="t3Regular">/ 100</Text>
          </HStack>
          <Badge label="동일 직군 상위 31%" tone="positive" />
          {session ? (
            <Text color="fg.neutralMuted" textStyle="t2Regular">
              {session.dateLabel} · 질문 {session.questionCount}개 · {session.duration}
            </Text>
          ) : null}
        </VStack>
      </HStack>
    </Card>
  );
}

type AxisRadarCardProps = {
  scores: Record<InterviewAxisKey, number>;
};

const RADAR_SIZE = 220;
const RADAR_CENTER = RADAR_SIZE / 2;
const RADAR_RADIUS = 76;
const RADAR_ANGLES = INTERVIEW_AXES.map(
  (_, index) => -Math.PI / 2 + (Math.PI * 2 * index) / INTERVIEW_AXES.length,
);

function AxisRadarCard({ scores }: AxisRadarCardProps) {
  const { theme } = useDesignSystemTheme();
  const brand = resolveColor(theme, 'bg.brandSolid');
  const brandWeak = resolveColor(theme, 'bg.brandWeak');
  const peerColor = resolveColor(theme, 'fg.neutralSubtle');
  const gridColor = resolveColor(theme, 'stroke.neutralWeak');
  const gridPaths = [0.25, 0.5, 0.75, 1].map((scale) => buildPolygonPath(
    RADAR_ANGLES.map((angle) => ({
      x: RADAR_CENTER + Math.cos(angle) * RADAR_RADIUS * scale,
      y: RADAR_CENTER + Math.sin(angle) * RADAR_RADIUS * scale,
    })),
  ));
  const userPath = buildPolygonPath(
    INTERVIEW_AXES.map((axis, index) => ({
      x: RADAR_CENTER + Math.cos(RADAR_ANGLES[index]) * RADAR_RADIUS * (scores[axis.key] / 100),
      y: RADAR_CENTER + Math.sin(RADAR_ANGLES[index]) * RADAR_RADIUS * (scores[axis.key] / 100),
    })),
  );
  const peerPath = buildPolygonPath(
    INTERVIEW_AXES.map((axis, index) => ({
      x: RADAR_CENTER + Math.cos(RADAR_ANGLES[index]) * RADAR_RADIUS * (peerAxisScores[axis.key] / 100),
      y: RADAR_CENTER + Math.sin(RADAR_ANGLES[index]) * RADAR_RADIUS * (peerAxisScores[axis.key] / 100),
    })),
  );

  return (
    <Card gap="x2" p="x3">
      <Box alignItems="center" height={236} justifyContent="center" width="full">
        <Canvas style={{ width: RADAR_SIZE, height: RADAR_SIZE }}>
          {gridPaths.map((path, index) => (
            <Path key={index} path={path} color={gridColor} style="stroke" strokeWidth={1} />
          ))}
          <Path path={peerPath} color={peerColor} style="stroke" strokeWidth={1.5} />
          <Path path={userPath} color={brandWeak} />
          <Path path={userPath} color={brand} style="stroke" strokeWidth={2.5} />
          {INTERVIEW_AXES.map((axis, index) => (
            <Circle
              key={axis.key}
              cx={RADAR_CENTER + Math.cos(RADAR_ANGLES[index]) * RADAR_RADIUS * (scores[axis.key] / 100)}
              cy={RADAR_CENTER + Math.sin(RADAR_ANGLES[index]) * RADAR_RADIUS * (scores[axis.key] / 100)}
              r={4}
              color={brand}
            />
          ))}
        </Canvas>
      </Box>
      <HStack align="center" justify="center" gap="x4">
        <Legend label="나" bg="bg.brandSolid" />
        <Legend label="동일 직군 지원자 평균" bg="bg.neutralWeak" />
      </HStack>
    </Card>
  );
}

function Legend({ label, bg }: { label: string; bg: 'bg.brandSolid' | 'bg.neutralWeak' }) {
  return (
    <HStack align="center" gap="x1_5">
      <Box bg={bg} borderRadius="full" height="x1" width="x4" />
      <Text color="fg.neutralMuted" textStyle="t2Regular">{label}</Text>
    </HStack>
  );
}

type AxisBarProps = {
  axisKey: InterviewAxisKey;
  score: number;
  locked?: boolean;
  showSub?: boolean;
};

function AxisBar({ axisKey, score, locked = false, showSub = true }: AxisBarProps) {
  const axis = axisByKey(axisKey);
  return (
    <HStack align="center" gap="x2">
      <Box
        alignItems="center"
        bg={axisToneBg[axis.tone]}
        borderRadius="r2"
        height="x8"
        justifyContent="center"
        width="x8"
      >
        <Icon name={axis.icon} color={axisIconColor(axis.tone)} size="small" />
      </Box>
      <VStack flex={1} gap="x0_5">
        <HStack align="center" gap="x1">
          <Text textStyle="t3Bold">{axis.name}</Text>
          {axis.pro ? <Icon name="Lock" size="small" color="fg.neutralSubtle" /> : null}
        </HStack>
        {showSub ? (
          <Text color="fg.neutralSubtle" textStyle="t1Regular" maxLines={1}>
            {axis.sub}
          </Text>
        ) : null}
        <ProgressBar value={locked ? 45 : score} tone={locked ? 'neutral' : axis.tone} />
      </VStack>
      <Box width="x8">
        <Text align="right" color={locked ? 'fg.neutralSubtle' : 'fg.neutral'} textStyle="t4Bold">
          {locked ? '-' : score}
        </Text>
      </Box>
    </HStack>
  );
}

type ProLockProps = {
  locked: boolean;
  children: ReactNode;
};

function ProLock({ locked, children }: ProLockProps) {
  if (!locked) {
    return <>{children}</>;
  }

  return (
    <Box minHeight={170} position="relative">
      <Box style={{ opacity: 0.18 }}>
        {children}
      </Box>
      <Box alignItems="center" bottom={0} justifyContent="center" left={0} position="absolute" right={0} top={0}>
        <VStack align="center" gap="x2">
          <Box
            alignItems="center"
            bg="bg.layerFloating"
            borderRadius="full"
            boxShadow="surface"
            height="x12"
            justifyContent="center"
            width="x12"
          >
            <Icon name="Lock" color="fg.brand" size="medium" />
          </Box>
          <Text align="center" textStyle="t4Bold">
            시선·전달력 심층 분석
          </Text>
          <Text align="center" color="fg.neutralMuted" textStyle="t2Regular">
            Pro에서 세부 분석을 확인할 수 있어요.
          </Text>
        </VStack>
      </Box>
    </Box>
  );
}

function DeepAnalysisSection() {
  return (
    <Grid columns={2} gap="x2">
      <Card p="x3" gap="x2">
        <HStack align="center" gap="x1_5">
          <Icon name="Eye" color="fg.warning" size="small" />
          <Text textStyle="t3Bold">시선 분포</Text>
        </HStack>
        <Box bg="bg.neutralWeak" borderRadius="r3" height={96} overflow="hidden">
          <Box bg="palette.yellow100" borderRadius="full" height="x10" left="x12" position="absolute" top="x3" width="x10" />
          <Box bg="palette.red100" borderRadius="full" bottom="x5" height="x8" left="x6" position="absolute" width="x8" />
        </Box>
        <Text color="fg.neutralMuted" textStyle="t2Regular">
          카메라 응시 68% · 화면 아래 22%
        </Text>
      </Card>
      <Card p="x3" gap="x2">
        <HStack align="center" gap="x1_5">
          <Icon name="Smile" color="fg.critical" size="small" />
          <Text textStyle="t3Bold">전달력</Text>
        </HStack>
        {deliveryDetails.map((item) => (
          <HStack key={item.label} align="center" gap="x2">
            <Box width="x12">
              <Text color="fg.neutralSubtle" textStyle="t1Regular" maxLines={1}>
                {item.label}
              </Text>
            </Box>
            <ProgressBar value={item.value} tone="critical" layout="inline" />
            <Box width="x6">
              <Text align="right" textStyle="t2Bold">
                {item.value}
              </Text>
            </Box>
          </HStack>
        ))}
      </Card>
    </Grid>
  );
}

type TopFixCardProps = {
  index: number;
  fix: (typeof interviewTopFixes)[number];
};

function TopFixCard({ index, fix }: TopFixCardProps) {
  const axis = axisByKey(fix.axis);
  return (
    <Card p="x3">
      <HStack align="flexStart" gap="x3">
        <Box
          alignItems="center"
          bg={axisToneBg[axis.tone]}
          borderRadius="r2"
          height="x9"
          justifyContent="center"
          width="x9"
        >
          <Icon name={axis.icon} color={axisIconColor(axis.tone)} size="small" />
        </Box>
        <VStack flex={1} gap="x1">
          <HStack align="center" gap="x1_5">
            <Text textStyle="t4Bold">{index}. {fix.title}</Text>
            {fix.pro ? <Badge label="Pro" tone="brand" size="small" /> : null}
          </HStack>
          <Text color="fg.neutralMuted" textStyle="t3Regular">
            {fix.body}
          </Text>
        </VStack>
      </HStack>
    </Card>
  );
}

function QuestionAccordion({ onRetryQuestion }: { onRetryQuestion?: (questionId: number) => void }) {
  const [openQuestionId, setOpenQuestionId] = useState<number | null>(interviewQuestions[0]?.id ?? null);

  return (
    <VStack gap="x2">
      <SectionHead title="질문별 다시보기" actionLabel={`${interviewQuestions.length}개`} />
      {interviewQuestions.map((question) => {
        const isOpen = openQuestionId === question.id;
        const score = getQuestionOverall(question);

        return (
          <Card key={question.id} p={0} overflow="hidden">
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ expanded: isOpen }}
              onPress={() => setOpenQuestionId(isOpen ? null : question.id)}
            >
              <HStack align="center" gap="x3" p="x3">
                <ReadinessGauge score={score} size={38} strokeWidth={4} />
                <VStack flex={1} gap="x1">
                  <HStack align="center" gap="x1_5">
                    <Badge label={question.cat} tone={QUESTION_CATEGORY_TONE[question.cat] ?? 'neutral'} size="small" />
                    <Text color="fg.neutralSubtle" textStyle="t2Regular">{question.dur}</Text>
                  </HStack>
                  <Text textStyle="t3Bold">{question.text}</Text>
                </VStack>
                <Icon name={isOpen ? 'ChevronUp' : 'ChevronDown'} color="fg.neutralSubtle" />
              </HStack>
            </Pressable>
            {isOpen ? <QuestionFeedbackDetail question={question} onRetryQuestion={onRetryQuestion} /> : null}
          </Card>
        );
      })}
    </VStack>
  );
}

function QuestionFeedbackDetail({
  question,
  onRetryQuestion,
}: {
  question: InterviewQuestion;
  onRetryQuestion?: (questionId: number) => void;
}) {
  return (
    <VStack gap="x3" px="x3" pb="x3">
      <Card bg="bg.neutralWeak" p="x3">
        <HStack align="center" gap="x2">
          <Box alignItems="center" bg="bg.neutralSolid" borderRadius="full" height="x8" justifyContent="center" width="x8">
            <Icon name="Play" color="fg.neutralInverted" size="small" />
          </Box>
          <VStack flex={1} gap="x1">
            <Text color="fg.neutralMuted" textStyle="t2Regular">내 답변 · {question.dur}</Text>
            <Box bg="stroke.neutralWeak" borderRadius="full" height="x1">
              <Box bg="bg.neutralSolid" borderRadius="full" height="x1" width="x16" />
            </Box>
          </VStack>
        </HStack>
      </Card>
      <Text color="fg.neutralMuted" textStyle="t3Regular">
        “{question.transcript}”
      </Text>
      <VStack gap="x2">
        {INTERVIEW_AXES.map((axis) => (
          <AxisBar key={axis.key} axisKey={axis.key} score={question.scores[axis.key]} locked={axis.pro} showSub={false} />
        ))}
      </VStack>
      <FeedbackNote icon="ThumbsUp" tone="positive" text={question.good} />
      <FeedbackNote icon="Lightbulb" tone="warning" text={question.fix} />
      {onRetryQuestion ? (
        <Button
          label="이 질문 다시 답하기"
          variant="outline"
          iconLeft="RotateCcw"
          onPress={() => onRetryQuestion(question.id)}
        />
      ) : null}
    </VStack>
  );
}

function FeedbackNote({ icon, tone, text }: { icon: 'ThumbsUp' | 'Lightbulb'; tone: 'positive' | 'warning'; text: string }) {
  return (
    <Box bg={tone === 'positive' ? 'palette.green100' : 'palette.yellow100'} borderRadius="r3" p="x3">
      <HStack align="flexStart" gap="x2">
        <Icon name={icon} color={tone === 'positive' ? 'fg.positive' : 'fg.warning'} size="small" />
        <Box flex={1}>
          <Text textStyle="t3Regular">
            {text}
          </Text>
        </Box>
      </HStack>
    </Box>
  );
}

function SourceFootnote() {
  return (
    <VStack borderTopWidth="thin" borderColor="stroke.neutralWeak" gap="x1" pt="x3">
      <Text color="fg.neutralSubtle" textStyle="t1Regular">
        분석 근거: 한국산업인력공단 NCS(공공데이터포털) · AI Hub 채용면접 인터뷰 데이터(NIA)
      </Text>
      <Text color="fg.neutralSubtle" textStyle="t1Regular">
        {SRC_AIHUB}
      </Text>
      <Text color="fg.neutralSubtle" textStyle="t1Regular">
        {SRC_NCS}
      </Text>
    </VStack>
  );
}
