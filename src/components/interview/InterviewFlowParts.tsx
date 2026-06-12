import { useEffect, useState, type ReactNode } from 'react';
import { Linking, Pressable } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';

import { Sheet } from '../app/Sheet';
import { ReadinessGauge } from '../readiness/ReadinessGauge';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Icon } from '../ui/Icon';
import { Tabs } from '../ui/Tabs';
import { Tag } from '../ui/Tag';
import { TextArea } from '../ui/TextArea';
import { Box } from '../../design-system/components/Box';
import { Grid } from '../../design-system/components/Grid';
import { HStack, VStack } from '../../design-system/components/Stack';
import { Text } from '../../design-system/components/Text';
import {
  ANALYSIS_LOADING_STEPS,
  INTERVIEW_STEPS,
  QUESTION_CATEGORY_TONE,
  STAR_GUIDE,
  matchLabel,
  mockMatch,
} from '../../data/interviewFlow';
import type { InterviewStepKey } from '../../data/interviewFlow';
import { NCS_CANDIDATES, NCS_PRIMARY } from '../../data/ncs';
import type { IconName } from '../../shared/types';

export type UploadMode = 'file' | 'paste';

export type StepProgressProps = {
  stepKey: InterviewStepKey;
  children?: ReactNode;
};

export function StepProgress({ stepKey, children }: StepProgressProps) {
  const current = INTERVIEW_STEPS.find((step) => step.key === stepKey);

  return (
    <VStack gap="x2">
      {children}
      <HStack gap="x1">
        {INTERVIEW_STEPS.map((step) => (
          <Box
            key={step.key}
            bg={current && step.n <= current.n ? 'bg.brandSolid' : 'stroke.neutralWeak'}
            borderRadius="full"
            flex={1}
            height="x1"
          />
        ))}
      </HStack>
    </VStack>
  );
}

type UploadOrPasteCardProps = {
  mode: UploadMode;
  onModeChange: (mode: UploadMode) => void;
  fileName: string | null;
  onFilePress: () => void;
  onFileClear: () => void;
  pasteValue: string;
  onPasteChange: (value: string) => void;
  placeholder: string;
  accept?: string;
};

const uploadTabs = [
  { label: '파일 업로드', value: 'file' },
  { label: '직접 붙여넣기', value: 'paste' },
] as const;

const uploadCardHeight = 'x42_5';
const gaugeSize = {
  medium: 92,
  large: 110,
} as const;
const gaugeStroke = {
  default: 9,
} as const;
const cameraPreviewHeight = 'x37_5';
const cameraPreviewWidth = 'x29';
const MIN_BAR_HEIGHT = 6;
const MAX_BAR_HEIGHT = 28;

export function UploadOrPasteCard({
  mode,
  onModeChange,
  fileName,
  onFilePress,
  onFileClear,
  pasteValue,
  onPasteChange,
  placeholder,
  accept = 'PDF · 이미지',
}: UploadOrPasteCardProps) {
  return (
    <Card gap="x3" p="x3">
      <Tabs items={uploadTabs} value={mode} onChange={onModeChange} />
      <Box minHeight={uploadCardHeight}>
        {mode === 'file' ? (
          fileName ? (
            <Card bg="bg.brandWeak" borderColor="stroke.brandWeak" p="x3">
              <HStack align="center" gap="x3">
                <Box alignItems="center" bg="bg.layerDefault" borderRadius="r2" height="x10" justifyContent="center" width="x10">
                  <Icon name="FileText" color="fg.brand" />
                </Box>
                <VStack flex={1} gap="x0_5">
                  <Text textStyle="t4Bold" maxLines={1}>{fileName}</Text>
                  <HStack align="center" gap="x1">
                    <Icon name="CircleCheck" color="fg.positive" size="small" />
                    <Text color="fg.brand" textStyle="t2Bold">업로드 완료</Text>
                  </HStack>
                </VStack>
                <Button label="삭제" variant="ghost" size="small" iconLeft="X" onPress={onFileClear} />
              </HStack>
            </Card>
          ) : (
            <Pressable accessibilityRole="button" onPress={onFilePress}>
              <Box
                alignItems="center"
                bg="bg.neutralWeak"
                borderColor="stroke.neutralWeak"
                borderRadius="r3"
                borderWidth="thin"
                gap="x2"
                justifyContent="center"
                minHeight={uploadCardHeight}
                p="x4"
              >
                <Box alignItems="center" bg="bg.layerFloating" borderRadius="full" height="x12" justifyContent="center" width="x12">
                  <Icon name="CloudUpload" color="fg.brand" size="large" />
                </Box>
                <Text align="center" textStyle="t4Bold">
                  파일을 눌러서 첨부
                </Text>
                <Text align="center" color="fg.neutralSubtle" textStyle="t2Regular">
                  {accept} · 최대 10MB
                </Text>
              </Box>
            </Pressable>
          )
        ) : (
          <TextArea
            height={uploadCardHeight}
            onChangeText={onPasteChange}
            placeholder={placeholder}
            value={pasteValue}
          />
        )}
      </Box>
    </Card>
  );
}

export function ParsingCard({ label }: { label: string }) {
  return (
    <Card p="x3">
      <HStack align="center" gap="x3">
        <Box
          alignItems="center"
          bg="bg.brandWeak"
          borderRadius="full"
          height="x8"
          justifyContent="center"
          width="x8"
        >
          <Icon name="Sparkles" color="fg.brand" size="small" />
        </Box>
        <Text color="fg.neutralMuted" textStyle="t4Regular">
          {label}
        </Text>
      </HStack>
    </Card>
  );
}

type AnalysisLoadingProps = {
  onDone: () => void;
};

export function AnalysisLoading({ onDone }: AnalysisLoadingProps) {
  const [done, setDone] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setDone((current) => Math.min(ANALYSIS_LOADING_STEPS.length, current + 1));
    }, 560);
    const timeout = setTimeout(onDone, 3000);
    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [onDone]);

  const progress = Math.min(100, Math.round((done / ANALYSIS_LOADING_STEPS.length) * 100));

  return (
    <VStack flex={1} gap="x5" justify="center">
      <VStack align="center" gap="x3">
        <ReadinessGauge score={progress} size={gaugeSize.large} strokeWidth={gaugeStroke.default} />
        <VStack align="center" gap="x0_5">
          <Text align="center" textStyle="t7Bold">맞춤 면접을 설계하고 있어요</Text>
          <Text align="center" color="fg.neutralSubtle" textStyle="t3Regular">
            이력서와 공고를 대조하는 중
          </Text>
        </VStack>
      </VStack>
      <VStack gap="x3">
        {ANALYSIS_LOADING_STEPS.map((step, index) => {
          const isDone = index < done;
          const active = index === done;
          return (
            <HStack key={step} align="center" gap="x3">
              <Box
                alignItems="center"
                bg={isDone ? 'bg.brandSolid' : 'bg.layerFloating'}
                borderColor={active ? 'stroke.neutralContrast' : 'stroke.neutralWeak'}
                borderRadius="full"
                borderWidth="thin"
                height="x6"
                justifyContent="center"
                width="x6"
              >
                {isDone ? <Icon name="Check" color="fg.neutralInverted" size="small" /> : null}
              </Box>
              <Text
                color={isDone || active ? 'fg.neutral' : 'fg.neutralSubtle'}
                textStyle={active ? 't4Bold' : 't4Regular'}
              >
                {step}
              </Text>
              {active ? (
                <Text color="fg.neutralSubtle" textStyle="t2Regular">처리 중…</Text>
              ) : null}
            </HStack>
          );
        })}
      </VStack>
    </VStack>
  );
}

export function MatchScoreCard() {
  return (
    <Card bg="bg.brandWeak" borderColor="stroke.brandWeak">
      <HStack align="center" gap="x4">
        <ReadinessGauge score={mockMatch.score} size={gaugeSize.medium} strokeWidth={gaugeStroke.default} />
        <VStack flex={1} gap="x1">
          <Text color="fg.neutralMuted" textStyle="t2Regular">이력서 × 리플로우 적합도</Text>
          <Text color="fg.brand" textStyle="t7Bold">{matchLabel(mockMatch.score)}</Text>
          <Text color="fg.neutralMuted" textStyle="t2Regular">
            요건 5개 중 3개 충족 · 2개 보완하면 합격선에 가까워요
          </Text>
        </VStack>
      </HStack>
    </Card>
  );
}

export function MatchRequirementRow({ item }: { item: (typeof mockMatch.matched)[number] }) {
  return (
    <Card p="x3">
      <HStack align="flexStart" gap="x2">
        <Icon name={item.hit ? 'CircleCheck' : 'CircleHelp'} color={item.hit ? 'fg.positive' : 'fg.warning'} />
        <VStack flex={1} gap="x0_5">
          <Text textStyle="t3Bold">{item.key}</Text>
          <Text color="fg.neutralMuted" textStyle="t2Regular">{item.note}</Text>
        </VStack>
      </HStack>
    </Card>
  );
}

export function GeneratedQuestionCard({
  id,
  cat,
  text,
  why,
}: {
  id: number;
  cat: string;
  text: string;
  why: string;
}) {
  return (
    <Card p="x3">
      <VStack gap="x2">
        <HStack align="center" gap="x2">
          <Box alignItems="center" bg="bg.brandWeak" borderRadius="full" height="x6" justifyContent="center" width="x6">
            <Text color="fg.brand" textStyle="t2Bold">{id}</Text>
          </Box>
          <Badge label={cat} tone={QUESTION_CATEGORY_TONE[cat] ?? 'neutral'} size="small" />
        </HStack>
        <Text textStyle="t4Bold">{text}</Text>
        <HStack align="flexStart" gap="x1_5">
          <Icon name="Lightbulb" color="fg.neutralSubtle" size="small" />
          <Box flex={1}>
            <Text color="fg.neutralSubtle" textStyle="t2Regular">{why}</Text>
          </Box>
        </HStack>
      </VStack>
    </Card>
  );
}

type NcsClassCardProps = {
  onEdit: () => void;
};

export function NcsClassCard({ onEdit }: NcsClassCardProps) {
  return (
    <Card bg="bg.brandWeak" borderColor="stroke.brandWeak" p="x3" gap="x3">
      <HStack align="flexStart" gap="x3">
        <Box alignItems="center" bg="bg.layerDefault" borderRadius="r3" height="x10" justifyContent="center" width="x10">
          <Icon name="BadgeCheck" color="fg.brand" />
        </Box>
        <VStack flex={1} gap="x1">
          <Text color="fg.neutralMuted" textStyle="t2Regular">{NCS_PRIMARY.group}</Text>
          <Text textStyle="t6Bold">{NCS_PRIMARY.name}</Text>
          <Text color="fg.neutralSubtle" textStyle="t2Regular">
            {NCS_PRIMARY.level} · {NCS_PRIMARY.code}
          </Text>
        </VStack>
      </HStack>
      <HStack gap="x1_5" wrap>
        {NCS_PRIMARY.units.map((unit) => (
          <Tag key={unit} label={unit} tone="brand" selected />
        ))}
      </HStack>
      <Button label="직무가 다른가요? 직접 고르기" variant="outline" iconLeft="Pencil" onPress={onEdit} />
    </Card>
  );
}

export function NcsSelectSheet({
  visible,
  selectedCode,
  onSelect,
  onClose,
}: {
  visible: boolean;
  selectedCode: string;
  onSelect: (code: string) => void;
  onClose: () => void;
}) {
  return (
    <Sheet
      visible={visible}
      title="NCS 직무 선택"
      subtitle="매핑이 정확하지 않다면 직접 골라주세요."
      onClose={onClose}
    >
      <VStack gap="x2">
        {NCS_CANDIDATES.map((candidate, index) => {
          const selected = candidate.code === selectedCode;
          return (
            <Pressable key={candidate.code} accessibilityRole="radio" accessibilityState={{ selected }} onPress={() => onSelect(candidate.code)}>
              <HStack
                align="center"
                bg={selected ? 'bg.brandWeak' : 'bg.layerFloating'}
                borderColor={selected ? 'stroke.brandWeak' : 'stroke.neutralWeak'}
                borderRadius="r3"
                borderWidth="thin"
                gap="x3"
                p="x3"
              >
                <VStack flex={1} gap="x1">
                  <HStack align="center" gap="x1_5">
                    <Text color={selected ? 'fg.brand' : 'fg.neutral'} textStyle="t4Bold">
                      {candidate.name}
                    </Text>
                    {index === 0 ? <Badge label="추천" tone="brand" size="small" /> : null}
                  </HStack>
                  <Text color="fg.neutralSubtle" textStyle="t2Regular">
                    세분류 · {candidate.code} · 유사도 {candidate.conf}%
                  </Text>
                </VStack>
                <Icon name={selected ? 'CircleDot' : 'Circle'} color={selected ? 'fg.brand' : 'fg.neutralSubtle'} />
              </HStack>
            </Pressable>
          );
        })}
        <Button label="이 직무로 분석하기" onPress={onClose} />
      </VStack>
    </Sheet>
  );
}

export function StarGuide() {
  return (
    <Grid columns={4} gap="x1_5">
      {STAR_GUIDE.map((item) => (
        <Box key={item.key} alignItems="center" bg="palette.blue100" borderRadius="r2" gap="x1" p="x2">
          <Text color="fg.informative" textStyle="t7Bold">{item.key}</Text>
          <Text textStyle="t2Bold">{item.label}</Text>
          <Text align="center" color="fg.neutralSubtle" textStyle="t1Regular">{item.hint}</Text>
        </Box>
      ))}
    </Grid>
  );
}

function mmss(seconds: number) {
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
}

export function formatRecordTime(seconds: number) {
  return mmss(seconds);
}

export function InterviewCameraView({
  active,
  recording,
  elapsed,
}: {
  active: boolean;
  recording: boolean;
  elapsed: number;
}) {
  const [permission, requestPermission] = useCameraPermissions();
  const canShowCamera = active && permission?.granted;

  return (
    <Box bg="bg.neutralSolid" borderRadius="r3" height={cameraPreviewHeight} overflow="hidden" width={cameraPreviewWidth}>
      {canShowCamera ? (
        <Box flex={1}>
          <CameraView facing="front" active={active} />
        </Box>
      ) : (
        <VStack align="center" flex={1} gap="x2" justify="center" p="x2">
          <Icon name="Video" color="fg.neutralInverted" />
          <Text align="center" color="fg.neutralInverted" textStyle="t1Regular">
            카메라 권한이 필요해요
          </Text>
          {permission?.canAskAgain ? (
            <Button label="허용" size="small" variant="weak" onPress={requestPermission} />
          ) : (
            <Button label="설정" size="small" variant="weak" onPress={() => Linking.openSettings()} />
          )}
        </VStack>
      )}
      {recording ? (
        <Box bg="bg.overlay" borderRadius="full" left="x2" px="x2" py="x1" position="absolute" top="x2">
          <HStack align="center" gap="x1">
            <Box bg="palette.red700" borderRadius="full" height="x1_5" width="x1_5" />
            <Text color="fg.neutralInverted" textStyle="t1Bold">REC {mmss(elapsed)}</Text>
          </HStack>
        </Box>
      ) : null}
    </Box>
  );
}

export type RecordMode = 'ready' | 'rec' | 'review';

export function RecordControls({
  mode,
  isLast,
  onStart,
  onStop,
  onRetake,
  onNext,
}: {
  mode: RecordMode;
  isLast: boolean;
  onStart: () => void;
  onStop: () => void;
  onRetake: () => void;
  onNext: () => void;
}) {
  if (mode === 'review') {
    return (
      <Grid columns={2} gap="x2">
        <Button label="다시 답하기" variant="outline" iconLeft="RotateCcw" onPress={onRetake} />
        <Button label={isLast ? '면접 종료' : '다음 질문'} iconRight="ArrowRight" onPress={onNext} />
      </Grid>
    );
  }

  if (mode === 'rec') {
    return <Button label="답변 종료" tone="critical" iconLeft="CircleStop" fullWidth onPress={onStop} />;
  }

  return <Button label="답변 시작" iconLeft="Mic" fullWidth onPress={onStart} />;
}

const WAVEFORM_BARS = [0.35, 0.7, 0.45, 1, 0.55, 0.82, 0.4, 0.65, 0.92, 0.5, 0.76, 0.38];

export function WaveformBars({ active }: { active: boolean }) {
  return (
    <HStack align="center" gap="x1" height="x8">
      {WAVEFORM_BARS.map((bar, index) => (
        <Box
          key={index}
          bg={active ? 'bg.brandSolid' : 'stroke.neutralWeak'}
          borderRadius="full"
          height={Math.max(MIN_BAR_HEIGHT, Math.round(MAX_BAR_HEIGHT * (active ? bar : 0.2)))}
          width="x1"
        />
      ))}
    </HStack>
  );
}

export function QuestionDots({ index, total }: { index: number; total: number }) {
  return (
    <HStack align="center" gap="x1">
      {Array.from({ length: total }).map((_, itemIndex) => (
        <Box
          key={itemIndex}
          bg={itemIndex <= index ? 'bg.brandSolid' : 'stroke.neutralWeak'}
          borderRadius="full"
          height="x1_5"
          width="x1_5"
        />
      ))}
    </HStack>
  );
}

export function StatCard({ label, value, icon }: { label: string; value: string; icon: IconName }) {
  return (
    <Card p="x3">
      <VStack align="center" gap="x1">
        <Icon name={icon} color="fg.brand" />
        <Text align="center" textStyle="t6Bold">{value}</Text>
        <Text align="center" color="fg.neutralSubtle" textStyle="t2Regular">{label}</Text>
      </VStack>
    </Card>
  );
}
