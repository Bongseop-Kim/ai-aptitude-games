import { Pressable } from 'react-native';

import { Sheet } from '../app/Sheet';
import { Icon } from '../ui/Icon';
import { useUpdateProfile } from '../../data/server/useProfile';
import { Box } from '../../design-system/components/Box';
import { HStack, VStack } from '../../design-system/components/Stack';
import { Text } from '../../design-system/components/Text';
import { BIRTH_YEAR_BAND_OPTIONS, type BirthYearBand } from '../../domain/birthYearBand';

export type BirthYearBandSheetProps = {
  visible: boolean;
  current: BirthYearBand | null;
  onClose: () => void;
};

export function BirthYearBandSheet({ visible, current, onClose }: BirthYearBandSheetProps) {
  const updateProfile = useUpdateProfile();

  function handleSelect(band: BirthYearBand) {
    if (updateProfile.isPending) return;
    if (band === current) {
      onClose();
      return;
    }
    updateProfile.mutate(
      { birthYearBand: band, birthYearBandConsentAt: new Date().toISOString() },
      { onSuccess: onClose },
    );
  }

  function handleClear() {
    if (updateProfile.isPending) return;
    if (current == null) {
      onClose();
      return;
    }
    updateProfile.mutate(
      { birthYearBand: null, birthYearBandConsentAt: null },
      { onSuccess: onClose },
    );
  }

  return (
    <Sheet
      visible={visible}
      title="출생 연도"
      subtitle="또래와 비교한 리포트를 보여드릴 때 사용해요. 언제든 비공개로 바꿀 수 있어요."
      onClose={onClose}
    >
      <VStack gap="x2">
        {BIRTH_YEAR_BAND_OPTIONS.map((option) => {
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

        <Pressable
          accessibilityRole="radio"
          accessibilityState={{ selected: current == null, disabled: updateProfile.isPending }}
          disabled={updateProfile.isPending}
          onPress={handleClear}
        >
          <HStack
            align="center"
            bg={current == null ? 'bg.brandWeak' : 'bg.layerFloating'}
            borderColor={current == null ? 'stroke.brandWeak' : 'stroke.neutralWeak'}
            borderRadius="r3"
            borderWidth="thin"
            gap="x3"
            p="x3"
          >
            <Box flex={1}>
              <Text color={current == null ? 'fg.brand' : 'fg.neutral'} textStyle="t4Bold">
                선택 안 함 (비공개)
              </Text>
            </Box>
            <Icon
              name={current == null ? 'CircleDot' : 'Circle'}
              color={current == null ? 'fg.brand' : 'fg.neutralSubtle'}
            />
          </HStack>
        </Pressable>
      </VStack>
    </Sheet>
  );
}
