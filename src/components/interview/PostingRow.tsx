import { HStack } from '../../design-system/components/Stack';
import { Text } from '../../design-system/components/Text';
import type { JobPostingRow as JobPostingRowData } from '../../data/server/useJobPostings';
import { jobFamilyLabel } from '../../domain/jobFamily';
import { Button } from '../ui/Button';
import { List } from '../ui/List';
import { AnalysisStatusChip } from './AnalysisStatusChip';

export type PostingRowProps = {
  posting: JobPostingRowData;
  showStatus: boolean;
  onPress?: () => void;
  onPasteFallback?: () => void;
};

export function PostingRow({ posting, showStatus, onPress, onPasteFallback }: PostingRowProps) {
  const companyLabel = posting.company ?? '분석 중인 공고';
  const familyLabel = jobFamilyLabel(posting.jobFamily);
  const showPasteFallback = showStatus && posting.status === 'failed' && onPasteFallback != null;

  return (
    <List.Item accessibilityLabel={`${companyLabel} 공고`} onPress={onPress}>
      <List.Content>
        <HStack align="center" gap="x1_5">
          <List.Title>{companyLabel}</List.Title>
          {showStatus ? <AnalysisStatusChip status={posting.status} /> : null}
        </HStack>
        {posting.role ? <List.Detail>{posting.role}</List.Detail> : null}
        {familyLabel ? (
          <Text color="fg.neutralSubtle" textStyle="t2Regular" maxLines={1}>
            {familyLabel}
          </Text>
        ) : null}
        {showPasteFallback ? (
          <Button label="본문 붙여넣기" variant="outline" size="small" iconLeft="ClipboardPaste" onPress={onPasteFallback} />
        ) : null}
      </List.Content>
    </List.Item>
  );
}
