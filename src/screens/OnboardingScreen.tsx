import { useState } from 'react';
import { Pressable } from 'react-native';

import { Screen } from '../components/app/Screen';
import { ActionButton } from '../components/ui/ActionButton';
import { Icon } from '../components/ui/Icon';
import { Switch } from '../components/ui/Switch';
import { useUpdateProfile } from '../data/server/useProfile';
import { Box } from '../design-system/components/Box';
import { Grid } from '../design-system/components/Grid';
import { HStack, VStack } from '../design-system/components/Stack';
import { Text } from '../design-system/components/Text';
import { BIRTH_YEAR_BAND_OPTIONS, type BirthYearBand } from '../domain/birthYearBand';
import { JOB_FAMILY_OPTIONS } from '../domain/jobFamily';
import type { JobFamily } from '../domain/report';

export function OnboardingScreen() {
  const [step, setStep] = useState<'field' | 'birth'>('field');
  const [selected, setSelected] = useState<JobFamily | null>(null);
  const [band, setBand] = useState<BirthYearBand | null>(null);
  const [consent, setConsent] = useState(false);
  const [hasError, setHasError] = useState(false);
  const updateProfile = useUpdateProfile();

  function handleNext() {
    if (selected == null) return;
    setStep('birth');
  }

  function finish(includeBand: boolean) {
    if (selected == null || updateProfile.isPending) return;
    setHasError(false);
    const now = new Date().toISOString();
    const updates =
      includeBand && consent && band != null
        ? { field: selected, onboardedAt: now, birthYearBand: band, birthYearBandConsentAt: now }
        : { field: selected, onboardedAt: now };
    updateProfile.mutate(updates, { onError: () => setHasError(true) });
  }

  return (
    <Screen bg="bg.layerDefault">
      <VStack flex={1} gap="x6">
        <VStack flex={1} gap="x5">
          {step === 'field' ? (
            <>
              <VStack gap="x2">
                <Text textStyle="screenTitle">어떤 직무를{'\n'}준비하고 있나요?</Text>
                <Text color="fg.neutralMuted" textStyle="t4Regular">
                  선택한 직무에 맞춰 면접 질문과 리포트를 준비해 드려요.
                </Text>
              </VStack>

              <Grid columns={2} gap="x2">
                {JOB_FAMILY_OPTIONS.map((option) => (
                  <OnboardingOptionCard
                    key={option.value}
                    label={option.label}
                    selected={option.value === selected}
                    minHeight="x23"
                    maxLines={2}
                    onPress={() => setSelected(option.value)}
                  />
                ))}
              </Grid>
            </>
          ) : (
            <>
              <VStack gap="x2">
                <Text textStyle="screenTitle">태어난 시기를{'\n'}알려주실래요?</Text>
                <Text color="fg.neutralMuted" textStyle="t4Regular">
                  비슷한 또래와 비교한 결과를 리포트에서 보여드릴 때 사용해요. 입력하지 않아도 괜찮아요.
                </Text>
              </VStack>

              <Grid columns={2} gap="x2">
                {BIRTH_YEAR_BAND_OPTIONS.map((option) => (
                  <OnboardingOptionCard
                    key={option.value}
                    label={option.label}
                    selected={option.value === band}
                    minHeight="x16"
                    maxLines={1}
                    onPress={() => setBand(option.value)}
                  />
                ))}
              </Grid>

              <HStack align="center" gap="x3">
                <Box flex={1}>
                  <Text color="fg.neutral" textStyle="t3Regular">
                    또래 비교를 위해 출생 연도 정보를 사용하는 데 동의해요.
                  </Text>
                </Box>
                <Switch
                  label="또래 비교를 위해 출생 연도 정보를 사용하는 데 동의해요."
                  value={consent}
                  onPress={() => setConsent((enabled) => !enabled)}
                />
              </HStack>
            </>
          )}
        </VStack>

        <VStack gap="x2" pb="x4">
          <Box minHeight="x6" justifyContent="center">
            {hasError ? (
              <Text color="fg.critical" textStyle="t3Regular">
                저장하지 못했어요. 잠시 후 다시 시도해주세요.
              </Text>
            ) : null}
          </Box>
          {step === 'field' ? (
            <ActionButton
              label="다음"
              variant="brandSolid"
              disabled={selected == null}
              onPress={handleNext}
            />
          ) : (
            <VStack gap="x2">
              <ActionButton
                label="시작하기"
                variant="brandSolid"
                disabled={!consent || band == null}
                loading={updateProfile.isPending}
                onPress={() => finish(true)}
              />
              <HStack gap="x2">
                <Box flex={1}>
                  <ActionButton
                    label="이전"
                    variant="ghost"
                    disabled={updateProfile.isPending}
                    onPress={() => setStep('field')}
                  />
                </Box>
                <Box flex={1}>
                  <ActionButton
                    label="건너뛰기"
                    variant="ghost"
                    disabled={updateProfile.isPending}
                    onPress={() => finish(false)}
                  />
                </Box>
              </HStack>
            </VStack>
          )}
        </VStack>
      </VStack>
    </Screen>
  );
}

function OnboardingOptionCard({
  label,
  selected,
  minHeight,
  maxLines,
  onPress,
}: {
  label: string;
  selected: boolean;
  minHeight: 'x23' | 'x16';
  maxLines: number;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      onPress={onPress}
    >
      <VStack
        align="flexStart"
        bg={selected ? 'bg.brandWeak' : 'bg.layerFloating'}
        borderColor={selected ? 'stroke.brandWeak' : 'stroke.neutralWeak'}
        borderRadius="r4"
        borderWidth="thin"
        gap="x3"
        minHeight={minHeight}
        p="x4"
      >
        <Icon
          name={selected ? 'CircleCheck' : 'Circle'}
          color={selected ? 'fg.brand' : 'fg.neutralSubtle'}
        />
        <Text color={selected ? 'fg.brand' : 'fg.neutral'} textStyle="t5Bold" maxLines={maxLines}>
          {label}
        </Text>
      </VStack>
    </Pressable>
  );
}
