import { useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router';

import { Header } from '../components/app/Header';
import { Screen } from '../components/app/Screen';
import { StepProgress, type RecordMode, type UploadMode } from '../components/interview/InterviewFlowParts';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { mockJobPosting, mockResume } from '../data/interviewFlow';
import { useCompleteMockExamInterviewItem } from '../data/local/useMockExamSession';
import { useSaveInterviewSession } from '../data/local/useInterviewSessions';
import { getOverallInterviewScore, getWeakInterviewQuestions, interviewQuestions } from '../data/interviewSession';
import type { InterviewQuestion } from '../data/interviewSession';
import { Box } from '../design-system/components/Box';
import { VStack } from '../design-system/components/Stack';
import { Text } from '../design-system/components/Text';
import {
  AnalysisStepView,
  FinishView,
  JobStepView,
  RecordStepView,
  ResumeStepView,
  RetryStepView,
} from './interview/InterviewStepViews';

type FlowPhase = 'resume' | 'job' | 'analysis' | 'record' | 'finish' | 'retry';
type AnalysisPhase = 'loading' | 'result';

const phaseTitles: Record<FlowPhase, string> = {
  resume: '이력서 등록',
  job: '채용공고 등록',
  analysis: 'AI 분석 중',
  record: '모의 면접',
  finish: '면접 완료',
  retry: '약점 질문 다시 풀기',
};

const phaseStepKey: Record<FlowPhase, 'resume' | 'job' | 'analysis' | 'record' | 'feedback' | 'retry'> = {
  resume: 'resume',
  job: 'job',
  analysis: 'analysis',
  record: 'record',
  finish: 'feedback',
  retry: 'retry',
};

export function InterviewFlowScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  const { mode, mockExamSessionId } = useLocalSearchParams<{ mode?: string; mockExamSessionId?: string }>();
  const initialRetry = mode === 'retry';
  const [phase, setPhase] = useState<FlowPhase>(initialRetry ? 'retry' : 'resume');
  const [isRetryRun, setIsRetryRun] = useState(initialRetry);
  const [resumeMode, setResumeMode] = useState<UploadMode>('file');
  const [resumeFileName, setResumeFileName] = useState<string | null>(null);
  const [resumePaste, setResumePaste] = useState('');
  const [resumeParsing, setResumeParsing] = useState(false);
  const [resumeParsed, setResumeParsed] = useState(false);
  const [jobMode, setJobMode] = useState<UploadMode>('paste');
  const [jobFileName, setJobFileName] = useState<string | null>(null);
  const [jobPaste, setJobPaste] = useState('');
  const [jobParsing, setJobParsing] = useState(false);
  const [jobParsed, setJobParsed] = useState(false);
  const [ncsSheetVisible, setNcsSheetVisible] = useState(false);
  const [selectedNcsCode, setSelectedNcsCode] = useState('20010206');
  const [analysisPhase, setAnalysisPhase] = useState<AnalysisPhase>('loading');
  const [questionIndex, setQuestionIndex] = useState(0);
  const [recordMode, setRecordMode] = useState<RecordMode>('ready');
  const [elapsed, setElapsed] = useState(0);
  const [totalSeconds, setTotalSeconds] = useState(0);
  const [flowStartedAt, setFlowStartedAt] = useState(() => Date.now());
  const saveInterviewSession = useSaveInterviewSession();
  const completeMockExamInterviewItem = useCompleteMockExamInterviewItem();

  const questions: readonly InterviewQuestion[] = isRetryRun ? getWeakInterviewQuestions() : interviewQuestions;
  const currentQuestion = questions[questionIndex] ?? questions[0];
  const sessionId = typeof mockExamSessionId === 'string' ? mockExamSessionId : null;
  const isMockExamMode = sessionId != null;

  useEffect(() => {
    if (phase !== 'record') {
      return undefined;
    }

    return navigation.addListener('beforeRemove', (event) => {
      event.preventDefault();
      Alert.alert('면접을 그만둘까요?', '진행 중인 답변은 저장되지 않아요.', [
        { text: '계속하기', style: 'cancel' },
        {
          text: '그만두기',
          style: 'destructive',
          onPress: () => navigation.dispatch(event.data.action),
        },
      ]);
    });
  }, [navigation, phase]);

  useEffect(() => {
    if (phase !== 'record' || recordMode !== 'rec') {
      return undefined;
    }

    const interval = setInterval(() => {
      setElapsed((current) => current + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [phase, recordMode]);

  function close() {
    router.back();
  }

  function goBack() {
    if (phase === 'resume' || phase === 'retry') {
      close();
      return;
    }
    if (phase === 'job') {
      setPhase('resume');
      return;
    }
    if (phase === 'analysis') {
      setPhase('job');
      return;
    }
    if (phase === 'record') {
      setPhase(isRetryRun ? 'retry' : 'analysis');
      setRecordMode('ready');
      setElapsed(0);
      return;
    }
    if (phase === 'finish') {
      setPhase('record');
      setRecordMode('ready');
      setElapsed(0);
    }
  }

  function startResumeFileParse() {
    setResumeFileName(mockResume.file);
    setResumeParsing(true);
    setResumeParsed(false);
    setTimeout(() => {
      setResumeParsing(false);
      setResumeParsed(true);
    }, 900);
  }

  function clearResumeFile() {
    setResumeFileName(null);
    setResumeParsed(false);
  }

  function startJobFileParse() {
    setJobFileName('리플로우_FE_채용공고.pdf');
    startJobAnalysis();
  }

  function clearJobFile() {
    setJobFileName(null);
    setJobParsed(false);
  }

  function startJobAnalysis() {
    setJobParsing(true);
    setJobParsed(false);
    setTimeout(() => {
      setJobParsing(false);
      setJobParsed(true);
    }, 900);
  }

  function enterRecord(retry = false) {
    setIsRetryRun(retry);
    setQuestionIndex(0);
    setRecordMode('ready');
    setElapsed(0);
    setTotalSeconds(0);
    setFlowStartedAt(Date.now());
    setPhase('record');
  }

  function startRecording() {
    setElapsed(0);
    setRecordMode('rec');
  }

  function stopRecording() {
    const answerSeconds = Math.max(1, elapsed);
    setTotalSeconds((current) => current + answerSeconds);
    setRecordMode('review');
  }

  function retakeAnswer() {
    setElapsed(0);
    setRecordMode('rec');
  }

  function nextQuestion() {
    if (questionIndex >= questions.length - 1) {
      const measuredSeconds = Math.max(1, Math.ceil((Date.now() - flowStartedAt) / 1000));
      setTotalSeconds((current) => Math.max(current, measuredSeconds));
      setPhase('finish');
      return;
    }

    setQuestionIndex((current) => current + 1);
    setRecordMode('ready');
    setElapsed(0);
  }

  async function openFeedback() {
    if (isRetryRun) {
      setPhase('retry');
      return;
    }

    try {
      const durationMs = Math.max(1000, Date.now() - flowStartedAt);
      const input = {
        company: mockJobPosting.company,
        role: mockJobPosting.role,
        score: getOverallInterviewScore(),
        questionCount: interviewQuestions.length,
        durationMs,
      };

      if (isMockExamMode) {
        await completeMockExamInterviewItem.mutateAsync({ input, sessionId });
        router.back();
        return;
      }

      const id = await saveInterviewSession.mutateAsync(input);
      router.replace({ pathname: '/interview/[id]', params: { id } } as never);
    } catch {
      Alert.alert('면접을 저장하지 못했어요', '잠시 후 다시 시도해주세요.');
    }
  }

  if (!currentQuestion) {
    return (
      <Screen>
        <Header title="실전 면접" showBack onBack={close} />
        <Box flex={1} justifyContent="center" px="spacingX.globalGutter">
          <Card>
            <VStack align="center" gap="x3">
              <Text align="center" color="fg.neutralMuted" textStyle="t4Regular">
                준비된 질문을 찾지 못했어요.
              </Text>
              <Button label="면접 탭으로" variant="weak" onPress={close} />
            </VStack>
          </Card>
        </Box>
      </Screen>
    );
  }

  return (
    <Screen>
      <Header
        title={phase === 'analysis' && analysisPhase === 'result' ? 'AI 분석 결과' : phaseTitles[phase]}
        subtitle={phase === 'record' && isRetryRun ? '약점 다시 면접' : 'STEP 기반 실전 면접'}
        showBack
        onBack={goBack}
        rightAction={{
          icon: 'X',
          label: '닫기',
          onPress: close,
        }}
      >
        <StepProgress stepKey={phaseStepKey[phase]} />
      </Header>
      {phase === 'resume' ? (
        <ResumeStepView
          mode={resumeMode}
          fileName={resumeFileName}
          paste={resumePaste}
          parsing={resumeParsing}
          parsed={resumeParsed}
          onModeChange={setResumeMode}
          onFilePress={startResumeFileParse}
          onFileClear={clearResumeFile}
          onPasteChange={setResumePaste}
          onNext={() => setPhase('job')}
        />
      ) : null}
      {phase === 'job' ? (
        <JobStepView
          mode={jobMode}
          fileName={jobFileName}
          paste={jobPaste}
          parsing={jobParsing}
          parsed={jobParsed}
          sheetVisible={ncsSheetVisible}
          selectedNcsCode={selectedNcsCode}
          onModeChange={setJobMode}
          onFilePress={startJobFileParse}
          onFileClear={clearJobFile}
          onPasteChange={setJobPaste}
          onAnalyze={startJobAnalysis}
          onOpenSheet={() => setNcsSheetVisible(true)}
          onCloseSheet={() => setNcsSheetVisible(false)}
          onSelectNcs={setSelectedNcsCode}
          onNext={() => {
            setAnalysisPhase('loading');
            setPhase('analysis');
          }}
        />
      ) : null}
      {phase === 'analysis' ? (
        <AnalysisStepView
          phase={analysisPhase}
          onDone={() => setAnalysisPhase('result')}
          onNext={() => enterRecord(false)}
        />
      ) : null}
      {phase === 'record' ? (
        <RecordStepView
          question={currentQuestion}
          questionIndex={questionIndex}
          total={questions.length}
          mode={recordMode}
          elapsed={elapsed}
          onStart={startRecording}
          onStop={stopRecording}
          onRetake={retakeAnswer}
          onNext={nextQuestion}
        />
      ) : null}
      {phase === 'finish' ? (
        <FinishView
          retry={isRetryRun}
          questionCount={questions.length}
          totalSeconds={totalSeconds}
          saving={saveInterviewSession.isPending || completeMockExamInterviewItem.isPending}
          feedbackLabel={isMockExamMode ? '모의고사로 돌아가기' : undefined}
          onFeedback={openFeedback}
        />
      ) : null}
      {phase === 'retry' ? (
        <RetryStepView onStartRetry={() => enterRecord(true)} />
      ) : null}
    </Screen>
  );
}
