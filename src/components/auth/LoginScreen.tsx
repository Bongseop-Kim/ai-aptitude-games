import { useRef, useState } from 'react';
import { Alert } from 'react-native';

import { Box } from '../../design-system/components/Box';
import { HStack, VStack } from '../../design-system/components/Stack';
import { Text } from '../../design-system/components/Text';
import { signInAnonymously, signInWithKakao } from '../../lib/auth';
import { Screen } from '../app/Screen';
import { Button } from '../ui/Button';
import { Icon } from '../ui/Icon';

export function LoginScreen() {
  const [pending, setPending] = useState<'kakao' | 'skip' | null>(null);
  // Synchronous lock: render-time `isBusy` can be stale on fast repeated taps.
  const busyRef = useRef(false);
  const isBusy = pending != null;

  async function run(kind: 'kakao' | 'skip', action: () => Promise<unknown>) {
    if (busyRef.current) return;
    busyRef.current = true;
    setPending(kind);
    try {
      await action();
    } catch {
      Alert.alert('로그인에 실패했어요', '잠시 후 다시 시도해주세요.');
    } finally {
      busyRef.current = false;
      setPending(null);
    }
  }

  return (
    <Screen bg="bg.layerDefault">
      <VStack flex={1}>
        <VStack flex={1} align="center" justify="center" gap="x7">
          <Box
            alignItems="center"
            bg="bg.brandSolid"
            borderRadius="r6"
            boxShadow="surface"
            height="x16"
            justifyContent="center"
            width="x16"
          >
            <Icon name="Leaf" color="fg.neutralInverted" size="large" />
          </Box>

          <VStack align="center" gap="x3">
            <VStack align="center" gap="x2">
              <Text textStyle="screenTitle" align="center">
                게임으로 연습하는{'\n'}AI 면접 준비
              </Text>
              <Text textStyle="t4Regular" color="fg.neutralMuted" align="center">
                9개의 역량 게임으로 실전처럼 연습하고, 나{'\n'}만의 AI 리포트를 받아요.
              </Text>
            </VStack>

            <HStack align="center" gap="x2">
              <Box
                alignItems="center"
                bg="bg.brandSolid"
                borderRadius="r2"
                height="x6"
                justifyContent="center"
                width="x6"
              >
                <Icon name="Leaf" color="fg.neutralInverted" size="small" />
              </Box>
              <Text textStyle="t5Bold">역검</Text>
            </HStack>
          </VStack>
        </VStack>

        <VStack gap="x2" pb="x4">
          <Button
            label="카카오로 시작하기"
            variant="solid"
            tone="brand"
            iconRight="ChevronRight"
            fullWidth
            disabled={isBusy}
            onPress={() => run('kakao', signInWithKakao)}
          />
          <Button
            label="나중에 연동하기"
            variant="ghost"
            tone="neutral"
            fullWidth
            disabled={isBusy}
            onPress={() => run('skip', signInAnonymously)}
          />
        </VStack>
      </VStack>
    </Screen>
  );
}
