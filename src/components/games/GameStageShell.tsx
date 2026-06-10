import { useEffect, useState, type ReactNode } from 'react';

import { Box } from '../../design-system/components/Box';
import { HStack, VStack } from '../../design-system/components/Stack';
import { Text } from '../../design-system/components/Text';
import { toneColors } from '../../domain/tone';
import type { Tone } from '../../domain/types';
import { Screen } from '../app/Screen';
import { ProgressBar } from '../readiness/ProgressBar';
import { Icon } from '../ui/Icon';
import { IconButton } from '../ui/IconButton';

export type GameStageShellProps = {
  gameName: string;
  tone: Tone;
  round: number;
  totalRounds: number;
  score: number;
  instruction: ReactNode;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
};

function formatElapsed(totalSecs: number) {
  const minutes = Math.floor(totalSecs / 60);
  const seconds = String(totalSecs % 60).padStart(2, '0');
  return `${minutes}:${seconds}`;
}

function ElapsedClock() {
  const [elapsedSecs, setElapsedSecs] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setElapsedSecs((secs) => secs + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <HStack align="center" gap="x1">
      <Icon name="clock" color="fg.neutralSubtle" size="small" />
      <Text color="fg.neutralMuted" textStyle="t3Bold">
        {formatElapsed(elapsedSecs)}
      </Text>
    </HStack>
  );
}

export function GameStageShell({
  gameName,
  tone,
  round,
  totalRounds,
  score,
  instruction,
  onClose,
  children,
  footer,
}: GameStageShellProps) {
  return (
    <Screen bg="bg.layerFloating">
      <VStack flex={1} gap="x3">
        <VStack gap="x2">
          <HStack align="center" gap="x3">
            <IconButton name="close" label="게임 나가기" onPress={onClose} />
            <ProgressBar value={(round / totalRounds) * 100} tone={tone} layout="inline" />
            <ElapsedClock />
          </HStack>
          <HStack align="center" justify="spaceBetween">
            <Text color="fg.neutralSubtle" textStyle="t2Regular">
              {gameName} · {round}/{totalRounds}
            </Text>
            <Text color={toneColors[tone].fg} textStyle="t2Bold">
              SCORE {score}
            </Text>
          </HStack>
          <Box bg={toneColors[tone].bg} borderRadius="r3" p="x3">
            {instruction}
          </Box>
        </VStack>
        <Box flex={1}>{children}</Box>
        {footer}
      </VStack>
    </Screen>
  );
}
