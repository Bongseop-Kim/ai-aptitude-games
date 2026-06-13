import { Pressable } from 'react-native';

import { Sheet } from '../app/Sheet';
import { Icon } from '../ui/Icon';
import { useUpdateProfile } from '../../data/server/useProfile';
import { Box } from '../../design-system/components/Box';
import { HStack, VStack } from '../../design-system/components/Stack';
import { Text } from '../../design-system/components/Text';
import { JOB_FAMILY_OPTIONS } from '../../domain/jobFamily';
import type { JobFamily } from '../../domain/report';

export type JobFamilySheetProps = {
  visible: boolean;
  current: JobFamily | null;
  onClose: () => void;
};

export function JobFamilySheet({ visible, current, onClose }: JobFamilySheetProps) {
  const updateProfile = useUpdateProfile();

  function handleSelect(field: JobFamily) {
    if (updateProfile.isPending) return;
    if (field === current) {
      onClose();
      return;
    }
    updateProfile.mutate({ field }, { onSuccess: onClose });
  }

  return (
    <Sheet
      visible={visible}
      title="목표 직무 변경"
      subtitle="준비하는 직무에 맞춰 질문과 리포트가 달라져요."
      onClose={onClose}
    >
      <VStack gap="x2">
        {JOB_FAMILY_OPTIONS.map((option) => {
          const selected = option.value === current;
          return (
            <Pressable
              key={option.value}
              accessibilityRole="radio"
              accessibilityState={{ selected, disabled: updateProfile.isPending }}
              disabled={updateProfile.isPending}
              onPress={() => handleSelect(option.value)}
            >
              <HStack
                align="center"
                bg={selected ? 'bg.brandWeak' : 'bg.layerFloating'}
                borderColor={selected ? 'stroke.brandWeak' : 'stroke.neutralWeak'}
                borderRadius="r3"
                borderWidth="thin"
                gap="x3"
                p="x3"
              >
                <Box flex={1}>
                  <Text color={selected ? 'fg.brand' : 'fg.neutral'} textStyle="t4Bold">
                    {option.label}
                  </Text>
                </Box>
                <Icon
                  name={selected ? 'CircleDot' : 'Circle'}
                  color={selected ? 'fg.brand' : 'fg.neutralSubtle'}
                />
              </HStack>
            </Pressable>
          );
        })}
      </VStack>
    </Sheet>
  );
}
