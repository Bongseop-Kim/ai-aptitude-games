import { Alert } from 'react-native';

import { Sheet } from '../app/Sheet';
import { ActionButton } from '../ui/ActionButton';
import { Icon } from '../ui/Icon';
import { List } from '../ui/List';
import { VStack } from '../../design-system/components/Stack';

export type ProIntroSheetProps = {
  visible: boolean;
  onClose: () => void;
};

const proBenefits = [
  '스트레스 복원력',
  '응답 패턴 프로필',
  'AI 코치·개선 플랜',
  'AI 면접 영상 분석(시선·전달력)',
] as const;

export function ProIntroSheet({ visible, onClose }: ProIntroSheetProps) {
  function handleNotify() {
    Alert.alert('준비되면 알려드릴게요.');
    onClose();
  }

  return (
    <Sheet
      visible={visible}
      title="Pro 리포트"
      subtitle="전체 리포트와 영상 면접 분석을 준비하고 있어요."
      onClose={onClose}
    >
      <VStack gap="x3">
        <List.Root>
          {proBenefits.map((benefit) => (
            <List.Item key={benefit}>
              <List.Prefix>
                <Icon name="CircleCheck" color="fg.positive" />
              </List.Prefix>
              <List.Content>
                <List.Title>{benefit}</List.Title>
              </List.Content>
            </List.Item>
          ))}
        </List.Root>
        <VStack gap="x2">
          <ActionButton label="출시 알림 받기" iconLeft="Bell" onPress={handleNotify} />
          <ActionButton label="나중에" variant="neutralOutline" onPress={onClose} />
        </VStack>
      </VStack>
    </Sheet>
  );
}
