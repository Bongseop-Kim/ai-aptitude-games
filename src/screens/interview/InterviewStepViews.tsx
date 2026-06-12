import { ScrollView } from 'react-native';

import { Body } from '../../components/app/Body';
import { BottomActionBar } from '../../components/app/BottomActionBar';
import { SectionHead } from '../../components/app/SectionHead';
import {
  AnalysisLoading,
  GeneratedQuestionCard,
  InterviewCameraView,
  MatchRequirementRow,
  MatchScoreCard,
  NcsClassCard,
  NcsSelectSheet,
  ParsingCard,
  QuestionDots,
  RecordControls,
  type RecordMode,
  StarGuide,
  StatCard,
  UploadOrPasteCard,
  type UploadMode,
  WaveformBars,
  formatRecordTime,
} from '../../components/interview/InterviewFlowParts';
import { ProgressBar } from '../../components/readiness/ProgressBar';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Icon } from '../../components/ui/Icon';
import { Box } from '../../design-system/components/Box';
import { Grid } from '../../design-system/components/Grid';
import { HStack, VStack } from '../../design-system/components/Stack';
import { Text } from '../../design-system/components/Text';
import { mockJobPosting, mockMatch, mockResume } from '../../data/interviewFlow';
import { getWeakInterviewQuestions, interviewQuestions, type InterviewQuestion } from '../../data/interviewSession';

export type ResumeStepViewProps = {
  mode: UploadMode;
  fileName: string | null;
  paste: string;
  parsing: boolean;
  parsed: boolean;
  onModeChange: (mode: UploadMode) => void;
  onFilePress: () => void;
  onFileClear: () => void;
  onPasteChange: (value: string) => void;
  onNext: () => void;
};

export function ResumeStepView({
  mode,
  fileName,
  paste,
  parsing,
  parsed,
  onModeChange,
  onFilePress,
  onFileClear,
  onPasteChange,
  onNext,
}: ResumeStepViewProps) {
  const ready = parsed || (mode === 'paste' && paste.trim().length > 20);

  return (
    <>
      <Body bottomPad="x4">
        <VStack gap="x3">
          <Text color="fg.neutralMuted" textStyle="t4Regular">
            이력서를 올리면 AI가 경력·역량을 읽어 맞춤 질문을 만들어요.
          </Text>
          <UploadOrPasteCard
            mode={mode}
            onModeChange={onModeChange}
            fileName={fileName}
            onFilePress={onFilePress}
            onFileClear={onFileClear}
            pasteValue={paste}
            onPasteChange={onPasteChange}
            placeholder="이력서 내용을 붙여넣어 주세요. 경력, 프로젝트, 보유 기술 등을 적으면 더 정확해요."
          />
          {parsing ? <ParsingCard label="이력서를 읽고 있어요…" /> : null}
          {parsed ? <ResumeParsedCard /> : null}
        </VStack>
      </Body>
      <BottomActionBar
        primary={{ label: '채용공고 등록하기', iconRight: 'ArrowRight', disabled: !ready, onPress: onNext }}
      />
    </>
  );
}

function ResumeParsedCard() {
  return (
    <VStack gap="x2">
      <Card bg="palette.green100" borderColor="stroke.neutralSubtle" p="x3">
        <HStack align="center" gap="x2">
          <Icon name="Sparkles" color="fg.positive" size="small" />
          <Text textStyle="t3Bold">이력서에서 핵심 정보를 읽었어요.</Text>
        </HStack>
      </Card>
      <Card gap="x3">
        <HStack align="center" gap="x3">
          <Box alignItems="center" bg="bg.brandWeak" borderRadius="full" height="x11" justifyContent="center" width="x11">
            <Text color="fg.brand" textStyle="t5Bold">{mockResume.name.slice(0, 1)}</Text>
          </Box>
          <VStack gap="x0_5">
            <Text textStyle="t5Bold">{mockResume.name}</Text>
            <Text color="fg.neutralMuted" textStyle="t3Regular">
              {mockResume.role} · {mockResume.years}
            </Text>
          </VStack>
        </HStack>
        <VStack gap="x2">
          <Text color="fg.neutralSubtle" textStyle="t2Bold">보유 기술</Text>
          <HStack gap="x1_5" wrap>
            {mockResume.skills.map((skill) => (
              <Badge key={skill} label={skill} tone="brand" size="small" />
            ))}
          </HStack>
        </VStack>
        <VStack gap="x2">
          <Text color="fg.neutralSubtle" textStyle="t2Bold">핵심 경험</Text>
          {mockResume.highlights.map((highlight) => (
            <HStack key={highlight} align="flexStart" gap="x2">
              <Icon name="TrendingUp" color="fg.positive" size="small" />
              <Box flex={1}>
                <Text textStyle="t3Regular">{highlight}</Text>
              </Box>
            </HStack>
          ))}
        </VStack>
      </Card>
    </VStack>
  );
}

export type JobStepViewProps = {
  mode: UploadMode;
  fileName: string | null;
  paste: string;
  parsing: boolean;
  parsed: boolean;
  sheetVisible: boolean;
  selectedNcsCode: string;
  onModeChange: (mode: UploadMode) => void;
  onFilePress: () => void;
  onFileClear: () => void;
  onPasteChange: (value: string) => void;
  onAnalyze: () => void;
  onOpenSheet: () => void;
  onCloseSheet: () => void;
  onSelectNcs: (code: string) => void;
  onNext: () => void;
};

export function JobStepView({
  mode,
  fileName,
  paste,
  parsing,
  parsed,
  sheetVisible,
  selectedNcsCode,
  onModeChange,
  onFilePress,
  onFileClear,
  onPasteChange,
  onAnalyze,
  onOpenSheet,
  onCloseSheet,
  onSelectNcs,
  onNext,
}: JobStepViewProps) {
  return (
    <>
      <Body bottomPad="x4">
        <VStack gap="x3">
          <Text color="fg.neutralMuted" textStyle="t4Regular">
            지원할 공고를 올리면 NCS 직무로 분류하고 요건과 내 이력서를 대조해요.
          </Text>
          <UploadOrPasteCard
            mode={mode}
            onModeChange={onModeChange}
            fileName={fileName}
            onFilePress={onFilePress}
            onFileClear={onFileClear}
            pasteValue={paste}
            onPasteChange={onPasteChange}
            placeholder="채용공고 URL 또는 본문을 붙여넣어 주세요. (예: reflow.team/careers/fe-senior)"
          />
          {mode === 'paste' && !parsed ? (
            <Button label="공고 분석하기" variant="outline" iconLeft="Sparkles" disabled={paste.trim().length < 10 || parsing} onPress={onAnalyze} />
          ) : null}
          {parsing ? <ParsingCard label="공고 요건을 정리하고 있어요…" /> : null}
          {parsed ? (
            <VStack gap="x3">
              <JobParsedCard />
              <NcsClassCard onEdit={onOpenSheet} />
            </VStack>
          ) : null}
        </VStack>
      </Body>
      <NcsSelectSheet
        visible={sheetVisible}
        selectedCode={selectedNcsCode}
        onSelect={onSelectNcs}
        onClose={onCloseSheet}
      />
      <BottomActionBar
        primary={{ label: 'AI 분석 시작하기', iconLeft: 'Sparkles', disabled: !parsed, onPress: onNext }}
      />
    </>
  );
}

function JobParsedCard() {
  return (
    <VStack gap="x2">
      <Card bg="palette.green100" borderColor="stroke.neutralSubtle" p="x3">
        <HStack align="center" gap="x2">
          <Icon name="Sparkles" color="fg.positive" size="small" />
          <Text textStyle="t3Bold">채용공고에서 핵심 요건을 읽었어요.</Text>
        </HStack>
      </Card>
      <Card gap="x3">
        <HStack align="center" gap="x3">
          <Box alignItems="center" bg="palette.blue100" borderRadius="r3" height="x11" justifyContent="center" width="x11">
            <Icon name="Building2" color="fg.informative" />
          </Box>
          <VStack flex={1} gap="x0_5">
            <Text textStyle="t5Bold">{mockJobPosting.company}</Text>
            <Text color="fg.neutralMuted" textStyle="t3Regular">{mockJobPosting.role}</Text>
            <Text color="fg.neutralSubtle" textStyle="t2Regular">{mockJobPosting.type}</Text>
          </VStack>
        </HStack>
        <RequirementList title="필수 요건" items={mockJobPosting.must} icon="CircleCheck" />
        <VStack gap="x2">
          <Text color="fg.neutralSubtle" textStyle="t2Bold">우대 사항</Text>
          <HStack gap="x1_5" wrap>
            {mockJobPosting.nice.map((item) => (
              <Badge key={item} label={item} tone="neutral" size="small" />
            ))}
          </HStack>
        </VStack>
      </Card>
    </VStack>
  );
}

function RequirementList({ title, items, icon }: { title: string; items: string[]; icon: 'CircleCheck' }) {
  return (
    <VStack gap="x2">
      <Text color="fg.neutralSubtle" textStyle="t2Bold">{title}</Text>
      {items.map((item) => (
        <HStack key={item} align="flexStart" gap="x2">
          <Icon name={icon} color="fg.brand" size="small" />
          <Box flex={1}>
            <Text textStyle="t3Regular">{item}</Text>
          </Box>
        </HStack>
      ))}
    </VStack>
  );
}

export function AnalysisStepView({
  phase,
  onDone,
  onNext,
}: {
  phase: 'loading' | 'result';
  onDone: () => void;
  onNext: () => void;
}) {
  if (phase === 'loading') {
    return <Body><AnalysisLoading onDone={onDone} /></Body>;
  }

  return (
    <>
      <Body bottomPad="x4">
        <VStack gap="x3">
          <MatchScoreCard />
          <SectionHead title="요건별 매칭" />
          <VStack gap="x2">
            {mockMatch.matched.map((item) => (
              <MatchRequirementRow key={item.key} item={item} />
            ))}
          </VStack>
          <SectionHead title="생성된 맞춤 질문" actionLabel={`${interviewQuestions.length}개`} />
          <VStack gap="x2">
            {interviewQuestions.map((question) => (
              <GeneratedQuestionCard
                key={question.id}
                id={question.id}
                cat={question.cat}
                text={question.text}
                why={question.why}
              />
            ))}
          </VStack>
        </VStack>
      </Body>
      <BottomActionBar primary={{ label: '모의 면접 시작하기', iconLeft: 'Video', onPress: onNext }} />
    </>
  );
}

export function RecordStepView({
  question,
  questionIndex,
  total,
  mode,
  elapsed,
  onStart,
  onStop,
  onRetake,
  onNext,
}: {
  question: InterviewQuestion;
  questionIndex: number;
  total: number;
  mode: RecordMode;
  elapsed: number;
  onStart: () => void;
  onStop: () => void;
  onRetake: () => void;
  onNext: () => void;
}) {
  const keypoints = question.why.split(' — ');
  const words = question.transcript.replace(/[“”"]/g, '').split(' ');
  const revealed = mode === 'review' ? words.length : Math.min(words.length, Math.floor(elapsed * 2.6));

  return (
    <Body bottomPad="x6">
      <VStack flex={1} gap="x3">
        <HStack align="center" gap="x2">
          <QuestionDots index={questionIndex} total={total} />
          <Text color="fg.neutralMuted" textStyle="t3Bold">{questionIndex + 1} / {total}</Text>
        </HStack>
        <Card p="x3">
          <HStack gap="x3">
            <InterviewCameraView active recording={mode === 'rec'} elapsed={elapsed} />
            <VStack flex={1} gap="x2">
              <Badge label={question.cat} tone="brand" size="small" />
              <Text textStyle="t4Bold">{question.text}</Text>
              <Text color={mode === 'rec' ? 'fg.critical' : 'fg.neutralSubtle'} textStyle="t5Bold">
                {formatRecordTime(elapsed)} <Text color="fg.neutralSubtle" textStyle="t2Regular">/ 권장 {formatRecordTime(question.limit)}</Text>
              </Text>
            </VStack>
          </HStack>
        </Card>
        <VStack gap="x2">
          <HStack align="center" gap="x1_5">
            <Icon name="Timeline" color="fg.informative" size="small" />
            <Text color="fg.neutralSubtle" textStyle="t2Bold">STAR 구조로 답해 보세요</Text>
          </HStack>
          <StarGuide />
        </VStack>
        <Card bg={mode === 'ready' ? 'bg.brandWeak' : 'bg.layerFloating'} borderColor={mode === 'ready' ? 'stroke.brandWeak' : 'stroke.neutralSubtle'} minHeight="x35_5" p="x3">
          {mode === 'ready' ? (
            <VStack gap="x2">
              <HStack align="center" gap="x1_5">
                <Icon name="Lightbulb" color="fg.brand" size="small" />
                <Text color="fg.brand" textStyle="t3Bold">이 질문 키포인트</Text>
              </HStack>
              {keypoints.map((point) => (
                <HStack key={point} align="flexStart" gap="x1_5">
                  <Icon name="ArrowRight" color="fg.brand" size="small" />
                  <Box flex={1}>
                    <Text textStyle="t3Regular">{point}</Text>
                  </Box>
                </HStack>
              ))}
            </VStack>
          ) : (
            <VStack gap="x2">
              <HStack align="center" gap="x2">
                <Icon name={mode === 'rec' ? 'Mic' : 'Captions'} color="fg.brand" size="small" />
                <Text textStyle="t3Bold">{mode === 'rec' ? '실시간 음성 인식' : '내 답변 자막'}</Text>
                <Text color="fg.neutralSubtle" textStyle="t2Regular">{revealed} / {words.length} 단어</Text>
              </HStack>
              <Text color={revealed === 0 ? 'fg.neutralSubtle' : 'fg.neutral'} textStyle="t4Regular">
                {revealed === 0 ? '말을 시작하면 자막이 실시간으로 나타나요…' : words.slice(0, revealed).join(' ')}
              </Text>
              <WaveformBars active={mode === 'rec'} />
            </VStack>
          )}
        </Card>
        <RecordControls
          mode={mode}
          isLast={questionIndex === total - 1}
          onStart={onStart}
          onStop={onStop}
          onRetake={onRetake}
          onNext={onNext}
        />
      </VStack>
    </Body>
  );
}

export function FinishView({
  feedbackLabel,
  retry,
  questionCount,
  totalSeconds,
  saving,
  onFeedback,
}: {
  feedbackLabel?: string;
  retry: boolean;
  questionCount: number;
  totalSeconds: number;
  saving: boolean;
  onFeedback: () => void;
}) {
  return (
    <>
      <Body bottomPad="x4">
        <VStack align="center" flex={1} gap="x5" justify="center">
          <Box alignItems="center" bg="bg.brandWeak" borderRadius="full" height="x16" justifyContent="center" width="x16">
            <Icon name="CircleCheck" color="fg.brand" size="large" />
          </Box>
          <VStack align="center" gap="x1">
            <Text align="center" textStyle="t9Bold">{retry ? '다시 답변했어요!' : '면접을 완주했어요!'}</Text>
            <Text align="center" color="fg.neutralMuted" textStyle="t4Regular">
              {retry ? '이전 답변과 어떻게 달라졌는지 확인해요.' : 'AI가 답변·음성·시선·전달력을 분석할게요.'}
            </Text>
          </VStack>
          <Grid columns={3} gap="x2" width="full">
            <StatCard label="질문" value={`${questionCount}개`} icon="CircleHelp" />
            <StatCard label="소요 시간" value={formatRecordTime(totalSeconds)} icon="Clock" />
            <StatCard label="완료율" value="100%" icon="Check" />
          </Grid>
        </VStack>
      </Body>
      <BottomActionBar
        primary={{
          label: feedbackLabel ?? (retry ? '비교 결과 보기' : 'AI 피드백 받기'),
          iconLeft: retry ? 'Target' : 'Sparkles',
          disabled: saving,
          onPress: onFeedback,
        }}
      />
    </>
  );
}

export function RetryStepView({
  onStartRetry,
}: {
  onStartRetry: () => void;
}) {
  const weak = getWeakInterviewQuestions();
  const focus = weak[0];
  const improved = {
    content: focus.scores.content + 12,
    star: focus.scores.star + 16,
  };

  return (
    <>
      <Body bottomPad="x4">
        <ScrollView showsVerticalScrollIndicator={false}>
          <VStack gap="x3">
            <Card bg="palette.yellow100" borderColor="stroke.neutralSubtle" p="x3">
              <HStack align="flexStart" gap="x2">
                <Icon name="Target" color="fg.warning" />
                <Box flex={1}>
                  <Text textStyle="t3Regular">
                    지난 면접에서 내용·STAR 구조가 약했던 질문 {weak.length}개만 모았어요.
                  </Text>
                </Box>
              </HStack>
            </Card>
            <SectionHead title="다시 답할 질문" />
            {weak.map((question) => (
              <Card key={question.id} p="x3" gap="x2">
                <HStack align="center" gap="x2">
                  <Badge label={question.cat} tone="warning" size="small" />
                  <Text color="fg.neutralSubtle" textStyle="t2Regular">
                    내용 {question.scores.content} · STAR {question.scores.star}
                  </Text>
                </HStack>
                <Text textStyle="t4Bold">{question.text}</Text>
              </Card>
            ))}
            <SectionHead title="이전 답변과 비교" />
            <Grid columns={2} gap="x2">
              <CompareCard title="이전 답변" content={focus.scores.content} star={focus.scores.star} transcript={focus.transcript} />
              <CompareCard title="이번 답변" content={improved.content} star={improved.star} transcript={`${focus.transcript} 결과적으로 합의 후 재작업이 30% 줄었고, 이후엔 사전 정렬 회의를 정례화했습니다.`} positive />
            </Grid>
            <Card bg="bg.brandWeak" borderColor="stroke.brandWeak" p="x3">
              <HStack align="flexStart" gap="x2">
                <Icon name="TrendingUp" color="fg.positive" />
                <Box flex={1}>
                  <Text textStyle="t3Regular">
                    결과(Result)를 수치로 마무리하니 STAR +16점. 같은 패턴을 다른 답변에도 적용해 보세요.
                  </Text>
                </Box>
              </HStack>
            </Card>
          </VStack>
        </ScrollView>
      </Body>
      <BottomActionBar primary={{ label: '약점만 다시 면접', iconRight: 'RotateCcw', onPress: onStartRetry }} />
    </>
  );
}

function CompareCard({
  title,
  content,
  star,
  transcript,
  positive,
}: {
  title: string;
  content: number;
  star: number;
  transcript: string;
  positive?: boolean;
}) {
  return (
    <Card bg={positive ? 'bg.brandWeak' : 'bg.layerFloating'} p="x3" gap="x2">
      <Text color={positive ? 'fg.brand' : 'fg.neutralMuted'} textStyle="t3Bold">{title}</Text>
      <HStack align="center" gap="x2">
        <Box width="x9">
          <Text color="fg.neutralSubtle" textStyle="t1Regular">내용</Text>
        </Box>
        <ProgressBar value={content} tone={positive ? 'brand' : 'warning'} layout="inline" />
        <Text textStyle="t2Bold">{content}</Text>
      </HStack>
      <HStack align="center" gap="x2">
        <Box width="x9">
          <Text color="fg.neutralSubtle" textStyle="t1Regular">STAR</Text>
        </Box>
        <ProgressBar value={star} tone={positive ? 'brand' : 'warning'} layout="inline" />
        <Text textStyle="t2Bold">{star}</Text>
      </HStack>
      <Text color="fg.neutralMuted" textStyle="t1Regular" maxLines={5}>
        “{transcript}”
      </Text>
    </Card>
  );
}
