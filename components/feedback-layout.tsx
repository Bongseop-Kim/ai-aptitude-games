import Flame from "@/assets/images/flame.svg";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { HStack, VStack } from "@/components/ui/stack";
import { Padding, Spacing, getAliasTokens } from "@/constants/theme";
import { SessionFeedback } from "@/types/nback/generate";
import React, { useEffect } from "react";
import {
  StyleSheet,
  useColorScheme,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";

type FeedbackLayoutProps = {
  sessionFeedback?: SessionFeedback;
  style?: StyleProp<ViewStyle>;
};

export function FeedbackLayout({
  sessionFeedback,
  style,
}: FeedbackLayoutProps) {
  const rotation = useSharedValue(0);
  const colorScheme = useColorScheme();
  const colors = getAliasTokens(colorScheme ?? "light");

  useEffect(() => {
    rotation.value = withRepeat(
      withSequence(
        withTiming(25, { duration: 150 }),
        withTiming(-25, { duration: 150 }),
        withTiming(25, { duration: 150 }),
        withTiming(0, { duration: 150 })
      ),
      1,
      false
    );
  }, [rotation]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ rotate: `${rotation.value}deg` }],
    };
  });

  const renderSummaryLine = (line: string, index: number) => {
    const parts = line.split(/\*\*([^*]+)\*\*/g);
    return (
      <ThemedText key={index} type="body1">
        {parts.map((part, partIndex) =>
          partIndex % 2 === 1 ? (
            <ThemedText
              key={`${index}-${partIndex}`}
              type="title1"
              style={{ color: colors.text.link }}
            >
              {part}
            </ThemedText>
          ) : (
            part
          )
        )}
      </ThemedText>
    );
  };

  return (
    <ThemedView style={[styles.container, style]}>
      {/* Hero Section */}
      <VStack spacing="spacing20" align="center" style={styles.heroSection}>
        <HStack justify="center">
          <Animated.View style={animatedStyle}>
            <Flame width={72} height={72} />
          </Animated.View>
        </HStack>
        {sessionFeedback?.headline && (
          <ThemedText type="headlineM" style={styles.headline}>
            {sessionFeedback.headline}
          </ThemedText>
        )}
      </VStack>

      {/* Summary Section */}
      {sessionFeedback?.summaryLines && sessionFeedback.summaryLines.length > 0 && (
        <VStack spacing="spacing12" style={styles.summaryBlock}>
          {sessionFeedback.summaryLines.map((line, index) =>
            renderSummaryLine(line, index)
          )}
        </VStack>
      )}

      {/* Highlights Section */}
      {sessionFeedback?.highlights && sessionFeedback.highlights.length > 0 && (
        <VStack
          spacing="spacing8"
          style={[styles.subSection, { borderTopColor: colors.border.muted }]}
        >
          <ThemedText type="labelM" style={{ color: colors.text.secondary }}>
            주요 포인트
          </ThemedText>
          <VStack spacing="spacing8">
            {sessionFeedback.highlights.map((highlight, index) => (
              <ThemedText key={index} type="body2">
                {highlight}
              </ThemedText>
            ))}
          </VStack>
        </VStack>
      )}

      {/* Tip Section */}
      {sessionFeedback?.tip && (
        <VStack
          spacing="spacing8"
          style={[styles.subSection, { borderTopColor: colors.border.muted }]}
        >
          <ThemedText type="labelM" style={{ color: colors.text.secondary }}>
            💡 팁
          </ThemedText>
          <ThemedText type="body2">{sessionFeedback.tip}</ThemedText>
        </VStack>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: Padding.xl,
    paddingTop: Spacing.spacing32,
    paddingBottom: Spacing.spacing56,
  },
  heroSection: {
    marginBottom: Spacing.spacing32,
  },
  headline: {
    textAlign: "center",
    paddingHorizontal: Spacing.spacing8,
  },
  summaryBlock: {
    width: "100%",
    marginBottom: Spacing.spacing32,
  },
  subSection: {
    width: "100%",
    marginBottom: Spacing.spacing24,
    paddingTop: Spacing.spacing16,
    borderTopWidth: 1,
  },
});
