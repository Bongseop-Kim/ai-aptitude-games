import { type ReactNode, type RefObject } from 'react';
import { Linking, Pressable } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useVideoPlayer, VideoView } from 'expo-video';

import { ActionButton } from '../ui/ActionButton';
import { Card } from '../ui/Card';
import { Icon } from '../ui/Icon';
import { Tabs } from '../ui/Tabs';
import { TextArea } from '../ui/TextArea';
import { Box } from '../../design-system/components/Box';
import { Grid } from '../../design-system/components/Grid';
import { HStack, VStack } from '../../design-system/components/Stack';
import { Text } from '../../design-system/components/Text';
import { useDesignSystemTheme } from '../../design-system/provider';
import { INTERVIEW_STEPS, STAR_GUIDE } from '../../data/interviewFlow';
import type { InterviewStepKey } from '../../data/interviewFlow';
import type { MediaKind } from '../../domain/interviewMedia';
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
const cameraPreviewHeight = 'x37_5';
const cameraPreviewWidth = 'x29';

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
                <ActionButton label="삭제" variant="ghost" size="small" iconLeft="X" onPress={onFileClear} />
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
  reviewing,
  elapsed,
  kind,
  cameraRef,
  reviewUri,
}: {
  active: boolean;
  recording: boolean;
  reviewing: boolean;
  elapsed: number;
  kind: MediaKind;
  cameraRef: RefObject<CameraView | null>;
  reviewUri: string | null;
}) {
  const [permission, requestPermission] = useCameraPermissions();
  const canShowCamera = active && permission?.granted;
  const showVideoReview = kind === 'video' && reviewing && reviewUri != null;

  return (
    <Box bg="bg.neutralSolid" borderRadius="r3" height={cameraPreviewHeight} overflow="hidden" width={cameraPreviewWidth}>
      {showVideoReview ? (
        <VideoReviewView uri={reviewUri} />
      ) : canShowCamera ? (
        <Box flex={1}>
          <CameraView
            ref={cameraRef}
            facing="front"
            mode={kind === 'video' ? 'video' : 'picture'}
            videoQuality={kind === 'video' ? '720p' : undefined}
            active={active}
          />
        </Box>
      ) : (
        <VStack align="center" flex={1} gap="x2" justify="center" p="x2">
          <Icon name="Video" color="fg.neutralInverted" />
          <Text align="center" color="fg.neutralInverted" textStyle="t1Regular">
            {kind === 'video' ? '카메라·마이크 권한이 필요해요' : '카메라 권한이 필요해요'}
          </Text>
          {permission?.canAskAgain ? (
            <ActionButton label="허용" size="small" variant="neutralWeak" onPress={requestPermission} />
          ) : (
            <ActionButton label="설정" size="small" variant="neutralWeak" onPress={() => Linking.openSettings()} />
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

function VideoReviewView({ uri }: { uri: string }) {
  const { theme } = useDesignSystemTheme();
  const player = useVideoPlayer(uri, (instance) => {
    instance.loop = false;
  });
  const width = theme.dimension.x[cameraPreviewWidth];
  const height = theme.dimension.x[cameraPreviewHeight];

  return <VideoView player={player} style={{ width, height }} />;
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
        <ActionButton label="다시 답하기" variant="neutralOutline" iconLeft="RotateCcw" onPress={onRetake} />
        <ActionButton label={isLast ? '면접 종료' : '다음 질문'} iconRight={isLast ? undefined : 'ArrowRight'} onPress={onNext} />
      </Grid>
    );
  }

  if (mode === 'rec') {
    return <ActionButton label="답변 종료" variant="criticalSolid" iconLeft="CircleStop" onPress={onStop} />;
  }

  return <ActionButton label="답변 시작" iconLeft="Mic" onPress={onStart} />;
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
