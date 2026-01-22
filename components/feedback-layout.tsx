import Flame from "@/assets/images/flame.svg";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Padding, Spacing, getAliasTokens } from "@/constants/theme";
import { SessionFeedback } from "@/types/nback/generate";
import React, { useEffect } from "react";
import { StyleSheet, View, useColorScheme, type StyleProp, type ViewStyle } from "react-native";
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
      <ThemedView style={styles.heroSection}>
        <Animated.View style={animatedStyle}>
          <Flame width={72} height={72} />
        </Animated.View>
        {sessionFeedback?.headline && (
          <ThemedText type="headlineM" style={styles.headline}>
            {sessionFeedback.headline}
          </ThemedText>
        )}
      </ThemedView>

      {/* Summary Section */}
      {sessionFeedback?.summaryLines && sessionFeedback.summaryLines.length > 0 && (
        <View style={styles.summaryBlock}>
          <View style={styles.summaryList}>
            {sessionFeedback.summaryLines.map((line, index) =>
              renderSummaryLine(line, index)
            )}
          </View>
        </View>
      )}

      {/* Highlights Section */}
      {sessionFeedback?.highlights && sessionFeedback.highlights.length > 0 && (
        <View style={[styles.subSection, { borderTopColor: colors.border.muted }]}>
          <ThemedText
            type="labelM"
            style={[styles.subSectionTitle, { color: colors.text.secondary }]}
          >
            주요 포인트
          </ThemedText>
          {sessionFeedback.highlights.map((highlight, index) => (
            <ThemedText
              key={index}
              type="body2"
              style={[
                styles.subSectionText,
                index === sessionFeedback.highlights.length - 1 &&
                styles.subSectionTextLast,
              ]}
            >
              {highlight}
            </ThemedText>
          ))}
        </View>
      )}

      {/* Tip Section */}
      {sessionFeedback?.tip && (
        <View style={[styles.subSection, { borderTopColor: colors.border.muted }]}>
          <ThemedText
            type="labelM"
            style={[styles.subSectionTitle, { color: colors.text.secondary }]}
          >
            💡 팁
          </ThemedText>
          <ThemedText type="body2" style={styles.subSectionText}>
            {sessionFeedback.tip}
          </ThemedText>
        </View>
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
    alignItems: "center",
    marginBottom: Spacing.spacing32,
  },
  headline: {
    marginTop: Spacing.spacing20,
    textAlign: "center",
    paddingHorizontal: Spacing.spacing8,
  },
  summaryBlock: {
    width: "100%",
    marginBottom: Spacing.spacing32,
  },
  summaryList: {
    gap: Spacing.spacing12,
  },
  subSection: {
    width: "100%",
    marginBottom: Spacing.spacing24,
    paddingTop: Spacing.spacing16,
    borderTopWidth: 1,
  },
  subSectionTitle: {
    marginBottom: Spacing.spacing8,
  },
  subSectionText: {
    marginBottom: Spacing.spacing8,
  },
  subSectionTextLast: {
    marginBottom: 0,
  },
});
