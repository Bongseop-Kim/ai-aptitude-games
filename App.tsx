import { StatusBar } from 'expo-status-bar';

import { Box } from './src/design-system/components/Box';
import { Flex } from './src/design-system/components/Flex';
import { Float } from './src/design-system/components/Float';
import { Grid } from './src/design-system/components/Grid';
import { HStack, VStack } from './src/design-system/components/Stack';
import { Text } from './src/design-system/components/Text';
import { DesignSystemProvider, useDesignSystemTheme } from './src/design-system/provider';

export default function App() {
  return (
    <DesignSystemProvider>
      <AppContent />
    </DesignSystemProvider>
  );
}

function AppContent() {
  const { mode } = useDesignSystemTheme();

  return (
    <VStack
      bg="bg.layerDefault"
      flex={1}
      p="spacingX.globalGutter"
      align="center"
      justify="center"
    >
      <VStack
        bg="bg.layerFloating"
        borderColor="stroke.neutralWeak"
        borderRadius="r4"
        borderWidth="thin"
        boxShadow="surface"
        gap="x4"
        p="spacingX.globalGutter"
        position="relative"
        width="full"
      >
        <VStack gap="spacingY.betweenText">
          <Text align="center" textStyle="t8Bold">
            AI Aptitude Games
          </Text>
          <Text align="center" color="fg.neutralMuted" textStyle="t5Regular">
            Design system foundation is ready.
          </Text>
        </VStack>

        <Grid columns={2} gap="x2">
          <Box bg="bg.brandWeak" borderRadius="r2" px="x3" py="x2">
            <Text color="fg.brand" textStyle="t4Medium">
              Box
            </Text>
          </Box>
          <Box bg="bg.neutralWeak" borderRadius="r2" px="x3" py="x2">
            <Text color="fg.neutralMuted" textStyle="t4Medium">
              Grid
            </Text>
          </Box>
        </Grid>

        <HStack gap="x2" justify="center">
          <Text color="fg.neutralSubtle" textStyle="t3Regular">
            VStack
          </Text>
          <Text color="fg.neutralSubtle" textStyle="t3Regular">
            HStack
          </Text>
          <Text color="fg.neutralSubtle" textStyle="t3Regular">
            Flex
          </Text>
        </HStack>

        <Flex direction="row" gap="x2" justify="center">
          <Text color="fg.neutralMuted" maxLines={1} textStyle="t3Regular">
            Flex composes the same token props.
          </Text>
        </Flex>

        <Float placement="bottom-end" offsetX="x2" offsetY="x2">
          <Box bg="bg.brandSolid" borderRadius="full" px="x3" py="x1_5">
            <Text color="fg.neutralInverted" textStyle="t3Bold">
              Float
            </Text>
          </Box>
        </Float>

        <Text maxLines={1} color="fg.neutralMuted" textStyle="t3Regular">
          Built with foundation tokens only.
        </Text>
      </VStack>
      <StatusBar style={mode === 'dark' ? 'light' : 'dark'} />
    </VStack>
  );
}
