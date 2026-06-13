import { useState, type ReactNode } from 'react';
import { type ListRenderItemInfo } from 'react-native';
import { useRouter } from 'expo-router';

import { Header } from '../../components/app/Header';
import { TabListScreen } from '../../components/app/TabListScreen';
import { PostingRow } from '../../components/interview/PostingRow';
import {
  RegisterPostingSheet,
  type RegisterPostingMode,
} from '../../components/interview/RegisterPostingSheet';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Icon } from '../../components/ui/Icon';
import { List } from '../../components/ui/List';
import { Skeleton } from '../../components/ui/Skeleton';
import { Tabs } from '../../components/ui/Tabs';
import { TextField } from '../../components/ui/TextField';
import {
  useJobPostingCatalog,
  useMyJobPostings,
  type JobPostingRow as JobPostingRowData,
} from '../../data/server/useJobPostings';
import { HStack, VStack } from '../../design-system/components/Stack';
import { Text } from '../../design-system/components/Text';

type PostingTab = 'mine' | 'all';
type PostingListItem =
  | { kind: 'posting'; posting: JobPostingRowData }
  | { kind: 'skeleton'; id: string };

const postingTabs = [
  { label: '내가 등록한 공고', value: 'mine' },
  { label: '전체 공고', value: 'all' },
] as const;

const skeletonKeys = ['first', 'second', 'third'] as const;

export function PostingCatalogScreen() {
  const router = useRouter();
  const [tab, setTab] = useState<PostingTab>('mine');
  const [search, setSearch] = useState('');
  const [sheetVisible, setSheetVisible] = useState(false);
  const [sheetMode, setSheetMode] = useState<RegisterPostingMode>('url');

  const mine = useMyJobPostings();
  const catalog = useJobPostingCatalog(tab === 'all' ? search : '');

  const isMine = tab === 'mine';
  const query = isMine ? mine : catalog;
  const postings = query.data ?? [];
  const isLoading = query.isLoading;

  const listData: PostingListItem[] = isLoading
    ? skeletonKeys.map((id) => ({ kind: 'skeleton', id }))
    : postings.map((posting) => ({ kind: 'posting', posting }));

  function openSheet(mode: RegisterPostingMode) {
    setSheetMode(mode);
    setSheetVisible(true);
  }

  const renderItem = ({ item }: ListRenderItemInfo<PostingListItem>) => {
    if (item.kind === 'skeleton') {
      return <PostingRowSkeleton />;
    }
    return (
      <PostingRow
        posting={item.posting}
        showStatus={isMine}
        onPasteFallback={isMine ? () => openSheet('paste') : undefined}
      />
    );
  };

  const pinnedContent: ReactNode = (
    <VStack gap="spacingY.componentDefault">
      <Tabs items={postingTabs} value={tab} onChange={(value) => setTab(value)} />
      {tab === 'all' ? (
        <TextField
          value={search}
          onChangeText={setSearch}
          placeholder="회사 또는 직무 검색"
          autoCapitalize="none"
        />
      ) : null}
      <Button label="공고 등록" iconLeft="Plus" fullWidth onPress={() => openSheet('url')} />
    </VStack>
  );

  return (
    <>
      <TabListScreen<PostingListItem>
        header={<Header title="채용공고" subtitle="공고를 등록하면 면접 질문에 반영해요" showBack onBack={() => router.back()} />}
        pinnedContent={pinnedContent}
        data={listData}
        ItemSeparatorComponent={List.Divider}
        keyExtractor={(item) => (item.kind === 'posting' ? item.posting.id : item.id)}
        ListEmptyComponent={isLoading ? null : <EmptyPostings tab={tab} />}
        renderItem={renderItem}
      />
      <RegisterPostingSheet visible={sheetVisible} initialMode={sheetMode} onClose={() => setSheetVisible(false)} />
    </>
  );
}

function EmptyPostings({ tab }: { tab: PostingTab }) {
  const title = tab === 'mine' ? '아직 등록한 공고가 없어요' : '아직 등록된 공고가 없어요';
  const description =
    tab === 'mine'
      ? '공고를 등록하면 분석 후 면접 질문에 반영해 드려요.'
      : '다른 사용자가 등록한 공고가 분석되면 여기에서 골라 쓸 수 있어요.';

  return (
    <Card minHeight={132}>
      <VStack align="center" flex={1} gap="x2" justify="center">
        <Icon name="Building2" color="fg.neutralSubtle" />
        <VStack align="center" gap="x1">
          <Text align="center" textStyle="t4Bold">
            {title}
          </Text>
          <Text align="center" color="fg.neutralSubtle" textStyle="t2Regular">
            {description}
          </Text>
        </VStack>
      </VStack>
    </Card>
  );
}

function PostingRowSkeleton() {
  return (
    <HStack align="center" gap="x3" py="x3">
      <VStack flex={1} gap="x2">
        <Skeleton height="x4" width="x29" />
        <Skeleton height="x3" width="x16" />
      </VStack>
    </HStack>
  );
}
