import { useState } from 'react';
import { Pressable } from 'react-native';

import { Screen } from '../components/app/Screen';
import { Button } from '../components/ui/Button';
import { Icon } from '../components/ui/Icon';
import { useUpdateProfile } from '../data/server/useProfile';
import { Box } from '../design-system/components/Box';
import { Grid } from '../design-system/components/Grid';
import { VStack } from '../design-system/components/Stack';
import { Text } from '../design-system/components/Text';
import { JOB_FAMILY_OPTIONS } from '../domain/jobFamily';
import type { JobFamily } from '../domain/report';

export function OnboardingScreen() {
  const [selected, setSelected] = useState<JobFamily | null>(null);
  const [hasError, setHasError] = useState(false);
  const updateProfile = useUpdateProfile();

  function handleStart() {
    if (selected == null || updateProfile.isPending) return;
    setHasError(false);
    updateProfile.mutate(
      { field: selected, onboardedAt: new Date().toISOString() },
      { onError: () => setHasError(true) },
    );
  }

  return (
    <Screen bg="bg.layerDefault">
      <VStack flex={1} gap="x6">
        <VStack flex={1} gap="x5">
          <VStack gap="x2">
            <Text textStyle="screenTitle">어떤 직무를{'\n'}준비하고 있나요?</Text>
            <Text color="fg.neutralMuted" textStyle="t4Regular">
              선택한 직무에 맞춰 면접 질문과 리포트를 준비해 드려요.
            </Text>
          </VStack>

          <Grid columns={2} gap="x2">
            {JOB_FAMILY_OPTIONS.map((option) => {
              const isSelected = option.value === selected;
              return (
                <Pressable
                  key={option.value}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: isSelected }}
                  onPress={() => setSelected(option.value)}
                >
                  <VStack
                    align="flexStart"
                    bg={isSelected ? 'bg.brandWeak' : 'bg.layerFloating'}
                    borderColor={isSelected ? 'stroke.brandWeak' : 'stroke.neutralWeak'}
                    borderRadius="r4"
                    borderWidth="thin"
                    gap="x3"
                    minHeight="x23"
                    p="x4"
                  >
                    <Icon
                      name={isSelected ? 'CircleCheck' : 'Circle'}
                      color={isSelected ? 'fg.brand' : 'fg.neutralSubtle'}
                    />
                    <Text color={isSelected ? 'fg.brand' : 'fg.neutral'} textStyle="t5Bold" maxLines={2}>
                      {option.label}
                    </Text>
                  </VStack>
                </Pressable>
              );
            })}
          </Grid>
        </VStack>

        <VStack gap="x2" pb="x4">
          <Box minHeight="x6" justifyContent="center">
            {hasError ? (
              <Text color="fg.critical" textStyle="t3Regular">
                저장하지 못했어요. 잠시 후 다시 시도해주세요.
              </Text>
            ) : null}
          </Box>
          <Button
            label={updateProfile.isPending ? '저장하는 중...' : '시작하기'}
            variant="solid"
            tone="brand"
            fullWidth
            disabled={selected == null || updateProfile.isPending}
            onPress={handleStart}
          />
        </VStack>
      </VStack>
    </Screen>
  );
}
