import { ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BottomActionBar } from '../app/BottomActionBar';
import { Card } from '../ui/Card';
import { Icon } from '../ui/Icon';
import { List } from '../ui/List';
import { Box } from '../../design-system/components/Box';
import { VStack } from '../../design-system/components/Stack';
import { Text } from '../../design-system/components/Text';
import { useDesignSystemTheme } from '../../design-system/provider';
import { reportDetailSections } from '../../data/reports';
import type { MockExamRecord } from '../../domain/types';

export type ReportPaywallProps = {
  record: MockExamRecord;
  onUpgrade: () => void;
};

const includedSections = reportDetailSections.slice(1);

export function ReportPaywall({ onUpgrade }: ReportPaywallProps) {
  const insets = useSafeAreaInsets();
  const { theme } = useDesignSystemTheme();

  return (
    <>
      <Box flex={1} bleedBottom="spacingY.componentDefault" bleedX="spacingX.globalGutter">
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, paddingBottom: insets.bottom + theme.dimension.spacingX.globalGutter }}
          showsVerticalScrollIndicator={false}
        >
          <Box px="spacingX.globalGutter" py="x3">
            <VStack align="center" gap="x5">
              <VStack align="center" gap="x3">
                <Box
                  alignItems="center"
                  bg="bg.brandWeak"
                  borderRadius="full"
                  height="x14"
                  justifyContent="center"
                  width="x14"
                >
                  <Icon name="Lock" color="fg.brand" size="large" />
                </Box>
                <VStack align="center" gap="x1">
                  <Text align="center" textStyle="t7Bold">
                    리포트는 Pro 전용이에요
                  </Text>
                  <Text align="center" color="fg.neutralMuted" textStyle="t3Regular">
                    모의고사를 완료했어요. 종합 리포트는 Pro에서 열려요.
                  </Text>
                </VStack>
              </VStack>

              <Box width="full">
                <Card>
                  <VStack gap="x2">
                    <Text color="fg.neutralMuted" textStyle="t2Regular">
                      포함된 분석
                    </Text>
                    <List.Root>
                      {includedSections.map((section, index) => (
                        <List.Item key={section.key}>
                          <List.Prefix>
                            <Text color="fg.neutralSubtle" textStyle="t3Bold">
                              {index + 1}
                            </Text>
                          </List.Prefix>
                          <List.Content>
                            <List.Title>{section.title}</List.Title>
                          </List.Content>
                        </List.Item>
                      ))}
                    </List.Root>
                  </VStack>
                </Card>
              </Box>
            </VStack>
          </Box>
        </ScrollView>
      </Box>
      <Box px="spacingX.globalGutter" style={{ paddingBottom: insets.bottom }}>
        <BottomActionBar
          primary={{
            label: 'Pro로 리포트 보기',
            iconLeft: 'Zap',
            onPress: onUpgrade,
          }}
        />
      </Box>
    </>
  );
}
