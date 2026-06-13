import { HStack } from '../../design-system/components/Stack';
import type { ResumeRow as ResumeRowData } from '../../data/server/useResumes';
import { IconButton } from '../ui/IconButton';
import { List } from '../ui/List';
import { AnalysisStatusChip } from './AnalysisStatusChip';

function toShortDateLabel(isoDatetime: string) {
  const parts = new Intl.DateTimeFormat('ko-KR', {
    timeZone: 'Asia/Seoul',
    month: 'numeric',
    day: 'numeric',
  }).formatToParts(new Date(isoDatetime));

  const month = parts.find((part) => part.type === 'month')?.value;
  const day = parts.find((part) => part.type === 'day')?.value;

  return `${month}월 ${day}일`;
}

export function ResumeRow({ resume, onDelete }: { resume: ResumeRowData; onDelete: () => void }) {
  return (
    <List.Item>
      <List.Content>
        <HStack align="center" gap="x1_5">
          <List.Title>{resume.title}</List.Title>
          <AnalysisStatusChip status={resume.status} />
        </HStack>
        <List.Detail>{toShortDateLabel(resume.createdAt)}</List.Detail>
      </List.Content>
      <List.Suffix>
        <IconButton name="Delete" label={`${resume.title} 삭제`} variant="ghost" onPress={onDelete} />
      </List.Suffix>
    </List.Item>
  );
}
