import { useState } from 'react';
import * as DocumentPicker from 'expo-document-picker';

import { Sheet } from '../app/Sheet';
import { ActionButton } from '../ui/ActionButton';
import { TextField } from '../ui/TextField';
import { useUploadResume } from '../../data/server/useResumes';
import { Box } from '../../design-system/components/Box';
import { VStack } from '../../design-system/components/Stack';
import { Text } from '../../design-system/components/Text';
import { UploadOrPasteCard, type UploadMode } from './InterviewFlowParts';

type PickedFile = { uri: string; name: string; mimeType: string };

const RESUME_DOC_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'image/*',
];

export function AddResumeSheet({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const uploadResume = useUploadResume();
  const [title, setTitle] = useState('');
  const [mode, setMode] = useState<UploadMode>('file');
  const [file, setFile] = useState<PickedFile | null>(null);
  const [pasteValue, setPasteValue] = useState('');
  const [hasError, setHasError] = useState(false);

  function reset() {
    setTitle('');
    setMode('file');
    setFile(null);
    setPasteValue('');
    setHasError(false);
  }

  function handleClose() {
    if (uploadResume.isPending) return;
    reset();
    onClose();
  }

  async function handlePickFile() {
    const result = await DocumentPicker.getDocumentAsync({
      type: RESUME_DOC_TYPES,
      copyToCacheDirectory: true,
      multiple: false,
    });
    if (result.canceled) return;
    const asset = result.assets[0];
    if (!asset) return;
    setFile({ uri: asset.uri, name: asset.name, mimeType: asset.mimeType ?? 'application/octet-stream' });
    if (title.trim().length === 0) {
      setTitle(asset.name.replace(/\.[^.]+$/, ''));
    }
  }

  const trimmedTitle = title.trim();
  const hasContent = mode === 'file' ? file != null : pasteValue.trim().length > 0;
  const canSubmit = trimmedTitle.length > 0 && hasContent && !uploadResume.isPending;

  function handleSubmit() {
    if (!canSubmit) return;
    setHasError(false);
    const input =
      mode === 'file' && file != null
        ? { fileUri: file.uri, fileName: file.name, mimeType: file.mimeType, title: trimmedTitle }
        : { pastedText: pasteValue, title: trimmedTitle };
    uploadResume.mutate(input, {
      onSuccess: () => {
        reset();
        onClose();
      },
      onError: () => setHasError(true),
    });
  }

  return (
    <Sheet
      visible={visible}
      title="이력서 추가"
      subtitle="파일을 올리거나 내용을 붙여넣으면 분석을 시작해요."
      onClose={handleClose}
    >
      <VStack gap="x3">
        <VStack gap="x1_5">
          <Text textStyle="t3Bold">제목</Text>
          <TextField
            value={title}
            onChangeText={setTitle}
            placeholder="예: 신입 개발 이력서"
            editable={!uploadResume.isPending}
          />
        </VStack>
        <UploadOrPasteCard
          mode={mode}
          onModeChange={setMode}
          fileName={file?.name ?? null}
          onFilePress={() => void handlePickFile()}
          onFileClear={() => setFile(null)}
          pasteValue={pasteValue}
          onPasteChange={setPasteValue}
          placeholder="이력서 내용을 붙여넣어주세요."
          accept="PDF · DOCX · 이미지"
        />
        <Box minHeight="x5" justifyContent="center">
          {hasError ? (
            <Text color="fg.critical" textStyle="t3Regular">
              이력서를 추가하지 못했어요. 잠시 후 다시 시도해주세요.
            </Text>
          ) : null}
        </Box>
        <ActionButton
          label={uploadResume.isPending ? '추가하는 중...' : '이력서 추가'}
          disabled={!canSubmit}
          onPress={handleSubmit}
        />
      </VStack>
    </Sheet>
  );
}
