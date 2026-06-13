import { HStack } from '../../design-system/components/Stack';
import type { ResumeRow as ResumeRowData } from '../../data/server/useResumes';
import { IconButton } from '../ui/IconButton';
import { List } from '../ui/List';
import { AnalysisStatusChip } from './AnalysisStatusChip';

const KST_OFFSET_MS = 9 * 60 * 60 * 1000;

function toShortDateLabel(isoDatetime: string) {
  const kstDate = new Date(new Date(isoDatetime).getTime() + KST_OFFSET_MS);
  return `${kstDate.getUTCMonth() + 1}월 ${kstDate.getUTCDate()}일`;
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
