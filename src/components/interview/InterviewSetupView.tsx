import { useState } from 'react';
import { Linking, Pressable } from 'react-native';
import { useRouter } from 'expo-router';

import { Body } from '../app/Body';
import { BottomActionBar } from '../app/BottomActionBar';
import { Sheet } from '../app/Sheet';
import { Badge } from '../ui/Badge';
import { ActionButton } from '../ui/ActionButton';
import { Card } from '../ui/Card';
import { Icon } from '../ui/Icon';
import { Box } from '../../design-system/components/Box';
import { HStack, VStack } from '../../design-system/components/Stack';
import { Text } from '../../design-system/components/Text';
import { useJobPostingCatalog, useMyJobPostings, type JobPostingRow } from '../../data/server/useJobPostings';
import { useResumes, type ResumeRow } from '../../data/server/useResumes';
import { jobFamilyLabel } from '../../domain/jobFamily';
import type { MediaKind } from '../../domain/interviewMedia';

const PICKER_CARD_HEIGHT = 'x16';

export type InterviewSetupViewProps = {
  selectedPosting: JobPostingRow | null;
  selectedResume: ResumeRow | null;
  mediaKind: MediaKind;
  micDenied: boolean;
  canAskMicAgain: boolean;
  starting: boolean;
  onSelectPosting: (posting: JobPostingRow) => void;
  onSelectResume: (resume: ResumeRow | null) => void;
  onStart: () => void;
  onRequestMicAgain: () => void;
};

export function InterviewSetupView({
  selectedPosting,
  selectedResume,
  mediaKind,
  micDenied,
  canAskMicAgain,
  starting,
  onSelectPosting,
  onSelectResume,
  onStart,
  onRequestMicAgain,
}: InterviewSetupViewProps) {
  const router = useRouter();
  const [postingSheet, setPostingSheet] = useState(false);
  const [resumeSheet, setResumeSheet] = useState(false);

  const myPostings = useMyJobPostings();
  const catalogPostings = useJobPostingCatalog('');
  const resumes = useResumes();

  const donePostings = mergeDonePostings(myPostings.data, catalogPostings.data);
  const doneResumes = (resumes.data ?? []).filter((resume) => resume.status === 'done');
  const hasDonePostings = donePostings.length > 0;

  return (
    <>
      <Body bottomPad="x4">
        <VStack gap="x4">
          <VStack gap="x3">
            <SectionLabel icon="Building2" label="채용공고" required />
            {hasDonePostings ? (
              <Pressable accessibilityRole="button" onPress={() => setPostingSheet(true)}>
                <Card
                  bg={selectedPosting ? 'bg.brandWeak' : 'bg.layerFloating'}
                  borderColor={selectedPosting ? 'stroke.brandWeak' : 'stroke.neutralWeak'}
                  minHeight={PICKER_CARD_HEIGHT}
                  p="x3"
                >
                  <HStack align="center" gap="x3">
                    <Box flex={1}>
                      {selectedPosting ? (
                        <VStack gap="x0_5">
                          <Text color="fg.brand" textStyle="t4Bold" maxLines={1}>
                            {selectedPosting.company ?? '회사 미상'}
                          </Text>
                          <Text color="fg.neutralMuted" textStyle="t3Regular" maxLines={1}>
                            {selectedPosting.role ?? jobFamilyLabel(selectedPosting.jobFamily) ?? '직무 미상'}
                          </Text>
                        </VStack>
                      ) : (
                        <Text color="fg.neutralMuted" textStyle="t4Regular">
                          지원할 공고를 선택해요
                        </Text>
                      )}
                    </Box>
                    <Icon name="ChevronRight" color="fg.neutralSubtle" />
                  </HStack>
                </Card>
              </Pressable>
            ) : (
              <Card minHeight={PICKER_CARD_HEIGHT} p="x3" gap="x2">
                <Text color="fg.neutralMuted" textStyle="t3Regular">
                  분석이 끝난 공고가 있어야 시작할 수 있어요.
                </Text>
                <ActionButton
                  label="공고 등록하러 가기"
                  variant="neutralOutline"
                  iconRight="ArrowRight"
                  onPress={() => router.push('/interview/postings' as never)}
                />
              </Card>
            )}
          </VStack>

          <VStack gap="x3">
            <SectionLabel icon="FileText" label="이력서" />
            {doneResumes.length > 0 ? (
              <Pressable accessibilityRole="button" onPress={() => setResumeSheet(true)}>
                <Card
                  bg={selectedResume ? 'bg.brandWeak' : 'bg.layerFloating'}
                  borderColor={selectedResume ? 'stroke.brandWeak' : 'stroke.neutralWeak'}
                  minHeight={PICKER_CARD_HEIGHT}
                  p="x3"
                >
                  <HStack align="center" gap="x3">
                    <Box flex={1}>
                      <Text
                        color={selectedResume ? 'fg.brand' : 'fg.neutralMuted'}
                        textStyle={selectedResume ? 't4Bold' : 't4Regular'}
                        maxLines={1}
                      >
                        {selectedResume ? selectedResume.title : '이력서 없이 진행해요'}
                      </Text>
                    </Box>
                    <Icon name="ChevronRight" color="fg.neutralSubtle" />
                  </HStack>
                </Card>
              </Pressable>
            ) : (
              <Card minHeight={PICKER_CARD_HEIGHT} p="x3" gap="x2">
                <Text color="fg.neutralMuted" textStyle="t3Regular">
                  이력서 없이 직무 기반 질문으로 진행해요.
                </Text>
                <ActionButton
                  label="이력서 등록하러 가기"
                  variant="neutralOutline"
                  iconRight="ArrowRight"
                  onPress={() => router.push('/interview/resumes' as never)}
                />
              </Card>
            )}
          </VStack>

          {micDenied ? (
            <MicPermissionCard
              mediaKind={mediaKind}
              canAskAgain={canAskMicAgain}
              onRequestAgain={onRequestMicAgain}
            />
          ) : null}
        </VStack>
      </Body>

      <Sheet
        visible={postingSheet}
        title="채용공고 선택"
        subtitle="분석이 끝난 공고만 선택할 수 있어요."
        onClose={() => setPostingSheet(false)}
      >
        <VStack gap="x2">
          {donePostings.map((posting) => {
            const selected = posting.id === selectedPosting?.id;
            return (
              <PickerRow
                key={posting.id}
                selected={selected}
                title={posting.company ?? '회사 미상'}
                detail={posting.role ?? jobFamilyLabel(posting.jobFamily) ?? '직무 미상'}
                onPress={() => {
                  onSelectPosting(posting);
                  setPostingSheet(false);
                }}
              />
            );
          })}
        </VStack>
      </Sheet>

      <Sheet
        visible={resumeSheet}
        title="이력서 선택"
        subtitle="선택한 이력서를 바탕으로 질문을 더 만들어요."
        onClose={() => setResumeSheet(false)}
      >
        <VStack gap="x2">
          <PickerRow
            selected={selectedResume == null}
            title="이력서 없이 진행"
            detail="직무 기반 일반 질문으로 진행해요"
            onPress={() => {
              onSelectResume(null);
              setResumeSheet(false);
            }}
          />
          {doneResumes.map((resume) => {
            const selected = resume.id === selectedResume?.id;
            return (
              <PickerRow
                key={resume.id}
                selected={selected}
                title={resume.title}
                onPress={() => {
                  onSelectResume(resume);
                  setResumeSheet(false);
                }}
              />
            );
          })}
        </VStack>
      </Sheet>

      <BottomActionBar
        primary={{
          label: '면접 시작',
          iconLeft: 'Video',
          disabled: selectedPosting == null || starting,
          onPress: onStart,
        }}
      />
    </>
  );
}

function mergeDonePostings(
  mine: JobPostingRow[] | undefined,
  catalog: JobPostingRow[] | undefined,
): JobPostingRow[] {
  const byId = new Map<string, JobPostingRow>();
  for (const posting of [...(mine ?? []), ...(catalog ?? [])]) {
    if (posting.status === 'done' && !byId.has(posting.id)) {
      byId.set(posting.id, posting);
    }
  }
  return [...byId.values()];
}

function SectionLabel({
  icon,
  label,
  required,
}: {
  icon: 'Building2' | 'FileText';
  label: string;
  required?: boolean;
}) {
  return (
    <HStack align="center" gap="x1_5">
      <Icon name={icon} color="fg.neutralSubtle" size="small" />
      <Text color="fg.neutralSubtle" textStyle="t2Bold">
        {label}
      </Text>
      {required ? <Badge label="필수" tone="brand" size="small" /> : null}
    </HStack>
  );
}

function PickerRow({
  selected,
  title,
  detail,
  onPress,
}: {
  selected: boolean;
  title: string;
  detail?: string;
  onPress: () => void;
}) {
  return (
    <Pressable accessibilityRole="radio" accessibilityState={{ selected }} onPress={onPress}>
      <HStack
        align="center"
        bg={selected ? 'bg.brandWeak' : 'bg.layerFloating'}
        borderColor={selected ? 'stroke.brandWeak' : 'stroke.neutralWeak'}
        borderRadius="r3"
        borderWidth="thin"
        gap="x3"
        p="x3"
      >
        <VStack flex={1} gap="x0_5">
          <Text color={selected ? 'fg.brand' : 'fg.neutral'} textStyle="t4Bold" maxLines={1}>
            {title}
          </Text>
          {detail ? (
            <Text color="fg.neutralSubtle" textStyle="t2Regular" maxLines={1}>
              {detail}
            </Text>
          ) : null}
        </VStack>
        <Icon name={selected ? 'CircleDot' : 'Circle'} color={selected ? 'fg.brand' : 'fg.neutralSubtle'} />
      </HStack>
    </Pressable>
  );
}

function MicPermissionCard({
  mediaKind,
  canAskAgain,
  onRequestAgain,
}: {
  mediaKind: MediaKind;
  canAskAgain: boolean;
  onRequestAgain: () => void;
}) {
  const isVideo = mediaKind === 'video';
  return (
    <Card bg="palette.yellow100" borderColor="stroke.neutralSubtle" p="x3" gap="x2">
      <HStack align="center" gap="x2">
        <Icon name={isVideo ? 'Video' : 'Mic'} color="fg.warning" />
        <Text textStyle="t4Bold">{isVideo ? '카메라·마이크 권한이 필요해요' : '마이크 권한이 필요해요'}</Text>
      </HStack>
      <Text color="fg.neutralMuted" textStyle="t3Regular">
        {isVideo
          ? '영상 답변을 녹화하려면 카메라·마이크 접근을 허용해 주세요.'
          : '답변을 녹음하려면 마이크 접근을 허용해 주세요.'}
      </Text>
      <HStack gap="x2">
        {canAskAgain ? (
          <Box flex={1}>
            <ActionButton
              label="허용 다시 요청"
              variant="neutralOutline"
              iconLeft={isVideo ? 'Video' : 'Mic'}
              onPress={onRequestAgain}
            />
          </Box>
        ) : (
          <Box flex={1}>
            <ActionButton
              label="설정 열기"
              variant="neutralOutline"
              iconLeft="Settings"
              onPress={() => Linking.openSettings()}
            />
          </Box>
        )}
      </HStack>
    </Card>
  );
}
