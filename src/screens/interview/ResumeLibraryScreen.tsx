import { useState } from 'react';
import { Alert, type ListRenderItemInfo } from 'react-native';
import { useRouter } from 'expo-router';

import { Header } from '../../components/app/Header';
import { TabListScreen } from '../../components/app/TabListScreen';
import { AddResumeSheet } from '../../components/interview/AddResumeSheet';
import { ResumeRow } from '../../components/interview/ResumeRow';
import { ActionButton } from '../../components/ui/ActionButton';
import { Card } from '../../components/ui/Card';
import { Icon } from '../../components/ui/Icon';
import { List } from '../../components/ui/List';
import { Skeleton } from '../../components/ui/Skeleton';
import { useDeleteResume, useResumes, type ResumeRow as ResumeRowData } from '../../data/server/useResumes';
import { HStack, VStack } from '../../design-system/components/Stack';
import { Text } from '../../design-system/components/Text';

type ResumeListItem =
  | { kind: 'resume'; resume: ResumeRowData }
  | { kind: 'skeleton'; id: string };

const skeletonKeys = ['first', 'second'] as const;

export function ResumeLibraryScreen() {
  const router = useRouter();
  const { data, isLoading } = useResumes();
  const deleteResume = useDeleteResume();
  const [sheetVisible, setSheetVisible] = useState(false);

  const resumes = data ?? [];
  const listData: ResumeListItem[] = isLoading
    ? skeletonKeys.map((id) => ({ kind: 'skeleton', id }))
    : resumes.map((resume) => ({ kind: 'resume', resume }));

  function confirmDelete(resume: ResumeRowData) {
    Alert.alert('이력서를 삭제할까요?', `${resume.title} 이력서를 삭제하면 되돌릴 수 없어요.`, [
      { text: '취소', style: 'cancel' },
      { text: '삭제', style: 'destructive', onPress: () => deleteResume.mutate(resume.id) },
    ]);
  }

  const renderItem = ({ item }: ListRenderItemInfo<ResumeListItem>) => {
    if (item.kind === 'skeleton') {
      return <ResumeRowSkeleton />;
    }
    return <ResumeRow resume={item.resume} onDelete={() => confirmDelete(item.resume)} />;
  };

  return (
    <>
      <TabListScreen<ResumeListItem>
        header={<Header title="내 이력서" subtitle="등록한 이력서를 분석해 질문에 반영해요" showBack onBack={() => router.back()} />}
        pinnedContent={
          <ActionButton label="이력서 추가" iconLeft="Plus" onPress={() => setSheetVisible(true)} />
        }
        data={listData}
        ItemSeparatorComponent={List.Divider}
        keyExtractor={(item) => (item.kind === 'resume' ? item.resume.id : item.id)}
        ListEmptyComponent={isLoading ? null : <EmptyResumes />}
        renderItem={renderItem}
      />
      <AddResumeSheet visible={sheetVisible} onClose={() => setSheetVisible(false)} />
    </>
  );
}

function EmptyResumes() {
  return (
    <Card minHeight="x34">
      <VStack align="center" flex={1} gap="x2" justify="center">
        <Icon name="FileText" color="fg.neutralSubtle" />
        <VStack align="center" gap="x1">
          <Text align="center" textStyle="t4Bold">
            아직 등록한 이력서가 없어요
          </Text>
          <Text align="center" color="fg.neutralSubtle" textStyle="t2Regular">
            이력서를 추가하면 면접 질문을 맞춤으로 준비해 드려요.
          </Text>
        </VStack>
      </VStack>
    </Card>
  );
}

function ResumeRowSkeleton() {
  return (
    <HStack align="center" gap="x3" py="x3">
      <VStack flex={1} gap="x2">
        <Skeleton height="x4" width="x29" />
        <Skeleton height="x3" width="x16" />
      </VStack>
      <Skeleton borderRadius="full" height="x10" width="x10" />
    </HStack>
  );
}
