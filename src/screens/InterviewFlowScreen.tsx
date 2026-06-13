import { useEffect, useRef, useState } from 'react';
import { Alert } from 'react-native';
import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
import * as Crypto from 'expo-crypto';
import {
  AudioModule,
  RecordingPresets,
  setAudioModeAsync,
  useAudioRecorder,
} from 'expo-audio';
import { useSQLiteContext } from 'expo-sqlite';

import { Header } from '../components/app/Header';
import { Screen } from '../components/app/Screen';
import { InterviewSetupView } from '../components/interview/InterviewSetupView';
import { StepProgress, type RecordMode } from '../components/interview/InterviewFlowParts';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { composeInterviewQuestions, type InterviewPromptQuestion } from '../domain/composeInterviewQuestions';
import { jobFamilyLabel } from '../domain/jobFamily';
import type { JobFamily } from '../domain/report';
import type { InterviewAnswerInput } from '../data/local/interviewAnswers';
import { useSaveInterviewOutcome } from '../data/local/useInterviewAnswers';
import { useCompleteMockExamInterviewItem } from '../data/local/useMockExamSession';
import { uploadPendingInterviewMedia } from '../data/media/interviewMediaUpload';
import {
  deleteSessionRecordings,
  persistRecording,
} from '../data/media/interviewRecordingFiles';
import { useProfile } from '../data/server/useProfile';
import type { JobPostingRow } from '../data/server/useJobPostings';
import type { ResumeRow } from '../data/server/useResumes';
import { useAuth } from '../providers/AuthProvider';
import { Box } from '../design-system/components/Box';
import { VStack } from '../design-system/components/Stack';
import { Text } from '../design-system/components/Text';
import { FinishView, RecordStepView } from './interview/InterviewStepViews';
import type { InterviewStepKey } from '../data/interviewFlow';

type FlowPhase = 'setup' | 'record' | 'finish';

const phaseTitles: Record<FlowPhase, string> = {
  setup: '면접 준비',
  record: '모의 면접',
  finish: '면접 완료',
};

const phaseStepKey: Record<FlowPhase, InterviewStepKey> = {
  setup: 'setup',
  record: 'record',
  finish: 'feedback',
};

type AnswerDraft = {
  question: InterviewPromptQuestion;
  prepMs: number;
  answerMs: number;
  retakeCount: number;
  mediaLocalUri: string | null;
};

export function InterviewFlowScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  const db = useSQLiteContext();
  const { userId } = useAuth();
  const { mockExamSessionId } = useLocalSearchParams<{ mockExamSessionId?: string }>();
  const mockExamId = typeof mockExamSessionId === 'string' ? mockExamSessionId : null;
  const isMockExamMode = mockExamId != null;

  const profile = useProfile();
  const saveInterviewOutcome = useSaveInterviewOutcome();
  const completeMockExamInterviewItem = useCompleteMockExamInterviewItem();
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);

  const [phase, setPhase] = useState<FlowPhase>('setup');
  const [selectedPosting, setSelectedPosting] = useState<JobPostingRow | null>(null);
  const [selectedResume, setSelectedResume] = useState<ResumeRow | null>(null);
  const [micDenied, setMicDenied] = useState(false);
  const [canAskMicAgain, setCanAskMicAgain] = useState(true);
  const [starting, setStarting] = useState(false);

  const [questions, setQuestions] = useState<InterviewPromptQuestion[]>([]);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [recordMode, setRecordMode] = useState<RecordMode>('ready');
  const [elapsed, setElapsed] = useState(0);
  const [totalSeconds, setTotalSeconds] = useState(0);

  const [sessionDraftId] = useState(() => Crypto.randomUUID());
  const flowStartedAtRef = useRef<number>(0);
  const prepStartRef = useRef<number>(0);
  const recordStartRef = useRef<number>(0);
  const answersRef = useRef<AnswerDraft[]>([]);
  const audioModeReadyRef = useRef(false);

  const currentQuestion = questions[questionIndex] ?? null;

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
          onPress: () => {
            void (async () => {
              if (recorder.isRecording) {
                try {
                  await recorder.stop();
                } catch {
                  // ignore — best effort
                }
              }
              deleteSessionRecordings(sessionDraftId);
              navigation.dispatch(event.data.action);
            })();
          },
        },
      ]);
    });
  }, [navigation, phase, recorder, sessionDraftId]);

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
    if (phase === 'record') {
      // beforeRemove guard handles the confirm + cleanup.
      close();
      return;
    }
    close();
  }

  async function handleStart() {
    if (!selectedPosting || starting) {
      return;
    }

    setStarting(true);
    try {
      const permission = await AudioModule.requestRecordingPermissionsAsync();
      if (!permission.granted) {
        setMicDenied(true);
        setCanAskMicAgain(permission.canAskAgain ?? false);
        return;
      }
      setMicDenied(false);

      const jobFamily: JobFamily =
        selectedPosting.jobFamily ?? profile.data?.field ?? 'etc';
      const composed = composeInterviewQuestions({
        jobFamily,
        postingMaterials: selectedPosting.analysis?.question_materials,
        resumeMaterials: selectedResume?.analysis?.question_materials,
      });

      answersRef.current = [];
      flowStartedAtRef.current = Date.now();
      prepStartRef.current = Date.now();
      setQuestions(composed);
      setQuestionIndex(0);
      setRecordMode('ready');
      setElapsed(0);
      setTotalSeconds(0);
      setPhase('record');
    } finally {
      setStarting(false);
    }
  }

  async function requestMicAgain() {
    const permission = await AudioModule.requestRecordingPermissionsAsync();
    if (permission.granted) {
      setMicDenied(false);
    } else {
      setCanAskMicAgain(permission.canAskAgain ?? false);
    }
  }

  async function startRecording() {
    if (!currentQuestion) {
      return;
    }

    try {
      if (!audioModeReadyRef.current) {
        await setAudioModeAsync({ allowsRecording: true, playsInSilentMode: true });
        audioModeReadyRef.current = true;
      }
      await recorder.prepareToRecordAsync();
      recorder.record();
    } catch {
      Alert.alert('녹음을 시작하지 못했어요', '잠시 후 다시 시도해주세요.');
      return;
    }

    recordStartRef.current = Date.now();
    setElapsed(0);
    setRecordMode('rec');
  }

  async function stopRecording() {
    if (!currentQuestion) {
      return;
    }

    let mediaLocalUri: string | null = null;
    try {
      await recorder.stop();
      const cacheUri = recorder.uri;
      if (cacheUri) {
        mediaLocalUri = await persistRecording(sessionDraftId, currentQuestion.id, cacheUri);
      }
    } catch {
      mediaLocalUri = null;
    }

    const answerMs = Math.max(1000, Date.now() - recordStartRef.current);
    const existing = answersRef.current.find((draft) => draft.question.id === currentQuestion.id);

    if (existing) {
      // Retake: keep frozen prepMs, bump retake count, replace media.
      existing.answerMs = answerMs;
      existing.retakeCount += 1;
      existing.mediaLocalUri = mediaLocalUri;
    } else {
      const prepMs = Math.max(0, recordStartRef.current - prepStartRef.current);
      answersRef.current.push({
        question: currentQuestion,
        prepMs,
        answerMs,
        retakeCount: 0,
        mediaLocalUri,
      });
    }

    setTotalSeconds((current) => current + Math.round(answerMs / 1000));
    setRecordMode('review');
  }

  async function retakeAnswer() {
    if (!currentQuestion) {
      return;
    }

    try {
      await recorder.prepareToRecordAsync();
      recorder.record();
    } catch {
      Alert.alert('녹음을 시작하지 못했어요', '잠시 후 다시 시도해주세요.');
      return;
    }

    recordStartRef.current = Date.now();
    setElapsed(0);
    setRecordMode('rec');
  }

  function nextQuestion() {
    if (questionIndex >= questions.length - 1) {
      const measuredSeconds = Math.max(1, Math.ceil((Date.now() - flowStartedAtRef.current) / 1000));
      setTotalSeconds((current) => Math.max(current, measuredSeconds));
      setPhase('finish');
      return;
    }

    prepStartRef.current = Date.now();
    setQuestionIndex((current) => current + 1);
    setRecordMode('ready');
    setElapsed(0);
  }

  async function openFeedback() {
    if (!selectedPosting) {
      return;
    }

    const drafts = answersRef.current;
    if (drafts.length === 0) {
      Alert.alert('녹음된 답변이 없어요', '질문에 답변한 뒤 다시 시도해주세요.');
      return;
    }

    const company = selectedPosting.company ?? '회사 미상';
    const role = selectedPosting.role ?? jobFamilyLabel(selectedPosting.jobFamily) ?? '직무 미상';
    const durationMs = Math.max(1000, Date.now() - flowStartedAtRef.current);
    const answers: InterviewAnswerInput[] = drafts.map((draft) => ({
      questionId: draft.question.id,
      questionText: draft.question.text,
      category: draft.question.category,
      questionSource: draft.question.source,
      prepMs: draft.prepMs,
      answerMs: draft.answerMs,
      retakeCount: draft.retakeCount,
      mediaLocalUri: draft.mediaLocalUri,
    }));

    const input = {
      company,
      role,
      score: 0,
      questionCount: drafts.length,
      durationMs,
    };
    const interviewSessionId = sessionDraftId;

    try {
      if (isMockExamMode) {
        await completeMockExamInterviewItem.mutateAsync({
          input,
          sessionId: mockExamId,
          answers,
          resumeId: selectedResume?.id,
          jobPostingId: selectedPosting.id,
          interviewSessionId,
        });
        if (userId) {
          void uploadPendingInterviewMedia(db, userId);
        }
        router.back();
        return;
      }

      const id = await saveInterviewOutcome.mutateAsync({
        session: input,
        answers,
        resumeId: selectedResume?.id,
        jobPostingId: selectedPosting.id,
        interviewSessionId,
      });
      if (userId) {
        void uploadPendingInterviewMedia(db, userId);
      }
      router.replace({ pathname: '/interview/[id]', params: { id } } as never);
    } catch {
      Alert.alert('면접을 저장하지 못했어요', '잠시 후 다시 시도해주세요.');
    }
  }

  const saving = saveInterviewOutcome.isPending || completeMockExamInterviewItem.isPending;

  return (
    <Screen>
      <Header
        title={phaseTitles[phase]}
        subtitle="공고 기반 실전 면접"
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
      {phase === 'setup' ? (
        <InterviewSetupView
          selectedPosting={selectedPosting}
          selectedResume={selectedResume}
          micDenied={micDenied}
          canAskMicAgain={canAskMicAgain}
          starting={starting}
          onSelectPosting={setSelectedPosting}
          onSelectResume={setSelectedResume}
          onStart={handleStart}
          onRequestMicAgain={requestMicAgain}
        />
      ) : null}
      {phase === 'record' ? (
        currentQuestion ? (
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
        ) : (
          <Box flex={1} justifyContent="center" px="spacingX.globalGutter">
            <Card>
              <VStack align="center" gap="x3">
                <Text align="center" color="fg.neutralMuted" textStyle="t4Regular">
                  준비된 질문을 찾지 못했어요.
                </Text>
                <Button label="처음으로" variant="weak" onPress={() => setPhase('setup')} />
              </VStack>
            </Card>
          </Box>
        )
      ) : null}
      {phase === 'finish' ? (
        <FinishView
          questionCount={questions.length}
          totalSeconds={totalSeconds}
          saving={saving}
          feedbackLabel={isMockExamMode ? '모의고사로 돌아가기' : undefined}
          onFeedback={openFeedback}
        />
      ) : null}
    </Screen>
  );
}
