import { useState } from 'react';

import { Sheet } from '../app/Sheet';
import { ActionButton } from '../ui/ActionButton';
import { Tabs } from '../ui/Tabs';
import { TextArea } from '../ui/TextArea';
import { TextField } from '../ui/TextField';
import { useRegisterJobPosting } from '../../data/server/useJobPostings';
import { Box } from '../../design-system/components/Box';
import { VStack } from '../../design-system/components/Stack';
import { Text } from '../../design-system/components/Text';

export type RegisterPostingMode = 'url' | 'paste';

const modeTabs = [
  { label: 'URL로 등록', value: 'url' },
  { label: '본문 붙여넣기', value: 'paste' },
] as const;

export type RegisterPostingSheetProps = {
  visible: boolean;
  onClose: () => void;
  initialMode?: RegisterPostingMode;
};

export function RegisterPostingSheet(props: RegisterPostingSheetProps) {
  const initialMode = props.initialMode ?? 'url';
  return <RegisterPostingSheetContent key={props.visible ? `open-${initialMode}` : 'closed'} {...props} />;
}

function RegisterPostingSheetContent({ visible, onClose, initialMode = 'url' }: RegisterPostingSheetProps) {
  const registerPosting = useRegisterJobPosting();
  const [mode, setMode] = useState<RegisterPostingMode>(initialMode);
  const [url, setUrl] = useState('');
  const [pasteValue, setPasteValue] = useState('');
  const [company, setCompany] = useState('');
  const [role, setRole] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  function reset() {
    setUrl('');
    setPasteValue('');
    setCompany('');
    setRole('');
    setErrorMessage(null);
  }

  function handleClose() {
    if (registerPosting.isPending) return;
    reset();
    onClose();
  }

  const canSubmit =
    !registerPosting.isPending &&
    (mode === 'url' ? url.trim().length > 0 : pasteValue.trim().length > 0);

  function handleSubmit() {
    if (!canSubmit) return;
    setErrorMessage(null);
    const input =
      mode === 'url'
        ? { url: url.trim() }
        : {
            pastedText: pasteValue.trim(),
            company: company.trim() || undefined,
            role: role.trim() || undefined,
          };
    registerPosting.mutate(input, {
      onSuccess: () => {
        reset();
        onClose();
      },
      onError: () => {
        setErrorMessage(
          mode === 'url'
            ? '올바른 채용공고 링크를 입력해주세요.'
            : '공고를 등록하지 못했어요. 잠시 후 다시 시도해주세요.',
        );
      },
    });
  }

  return (
    <Sheet
      visible={visible}
      title="채용공고 등록"
      subtitle="공고를 등록하면 분석 후 면접 질문에 반영해요."
      onClose={handleClose}
    >
      <VStack gap="x3">
        <Tabs items={modeTabs} value={mode} onChange={setMode} />
        {mode === 'url' ? (
          <VStack gap="x1_5">
            <Text textStyle="t3Bold">공고 링크</Text>
            <TextField
              value={url}
              onChangeText={setUrl}
              placeholder="https://"
              autoCapitalize="none"
              keyboardType="url"
              editable={!registerPosting.isPending}
            />
          </VStack>
        ) : (
          <VStack gap="x3">
            <VStack gap="x1_5">
              <Text textStyle="t3Bold">공고 본문</Text>
              <TextArea
                value={pasteValue}
                onChangeText={setPasteValue}
                placeholder="채용공고 본문을 붙여넣어주세요."
                editable={!registerPosting.isPending}
              />
            </VStack>
            <VStack gap="x1_5">
              <Text textStyle="t3Bold">회사 · 직무 (선택)</Text>
              <TextField
                value={company}
                onChangeText={setCompany}
                placeholder="회사명"
                editable={!registerPosting.isPending}
              />
              <TextField
                value={role}
                onChangeText={setRole}
                placeholder="직무명"
                editable={!registerPosting.isPending}
              />
            </VStack>
          </VStack>
        )}
        <Box minHeight="x5" justifyContent="center">
          {errorMessage ? (
            <Text color="fg.critical" textStyle="t3Regular">
              {errorMessage}
            </Text>
          ) : null}
        </Box>
        <ActionButton
          label={registerPosting.isPending ? '등록하는 중...' : '공고 등록'}
          disabled={!canSubmit}
          onPress={handleSubmit}
        />
      </VStack>
    </Sheet>
  );
}
