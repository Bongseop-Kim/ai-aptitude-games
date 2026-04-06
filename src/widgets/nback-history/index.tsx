import type { NbackHistoryHeaderData, NbackHistoryItem } from "@/entities/nback";
import { useNbackHistory } from "@/features/nback-history";
import { BorderWidth, Padding, getAliasTokens } from "@/shared/config/theme";
import { Badge } from "@/shared/ui/badge";
import { IconSymbol } from "@/shared/ui/icon-symbol";
import { HStack, VStack } from "@/shared/ui/stack";
import { ThemedText } from "@/shared/ui/themed-text";
import { ThemedView } from "@/shared/ui/themed-view";
import { formatTimeAgo } from "@/shared/lib/format-time-ago";
import { useColorScheme } from "@/shared/lib/use-color-scheme";
import { router } from "expo-router";
import { useEffect } from "react";
import { FlatList, Pressable, StyleSheet } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";

type Colors = ReturnType<typeof getAliasTokens>;

export function NbackHistoryWidget() {
  const { historyList, headerData } = useNbackHistory();
  const colorScheme = useColorScheme();
  const colors = getAliasTokens(colorScheme ?? "light");

  return (
    <ThemedView style={styles.flex1}>
      <HeaderComponent data={headerData} colors={colors} />
      <FlatList
        data={historyList}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => <ListItemComponent item={item} colors={colors} />}
        ListEmptyComponent={<EmptyStateComponent colors={colors} />}
      />
    </ThemedView>
  );
}

const HeaderComponent = ({
  data,
  colors,
}: {
  data: NbackHistoryHeaderData | null;
  colors: Colors;
}) => {
  return (
    <VStack spacing="spacing12" style={[styles.headerContainer]}>
      <VStack>
        <HStack align="flex-end" spacing="spacing4">
          <ThemedText type="headlineL">
            {data?.todayAvgAccuracy
              ? (data.todayAvgAccuracy * 100).toFixed(1)
              : 0}
            %
          </ThemedText>
          <TrendIconComponent trend={data?.trend ?? "same"} colors={colors} />
        </HStack>
        <ThemedText>오늘 평균 정확도</ThemedText>
      </VStack>
      <HStack
        justify="space-between"
        spacing="spacing4"
        style={[
          styles.headerSeparator,
          { borderBottomColor: colors.border.base },
        ]}
      >
        <VStack style={styles.flex1}>
          <ThemedText type="title1">
            {data?.sevenDayAvgAccuracy
              ? (data.sevenDayAvgAccuracy * 100).toFixed(1)
              : 0}
            %
          </ThemedText>
          <ThemedText type="body2">7일 평균</ThemedText>
        </VStack>
        <VStack style={styles.flex1}>
          <ThemedText type="title1">{data?.bestStreakDays ?? 0}</ThemedText>
          <ThemedText type="body2">최고 연속</ThemedText>
        </VStack>
        <VStack style={styles.flex1}>
          <ThemedText type="title1">{data?.totalPlays ?? 0}</ThemedText>
          <ThemedText type="body2">총 플레이</ThemedText>
        </VStack>
      </HStack>

      <HStack justify="flex-end">
        <Badge variant="default" kind="number" type="ghost">
          <ThemedText type="body2">최신순</ThemedText>
        </Badge>
      </HStack>
    </VStack>
  );
};

const TrendIconComponent = ({
  trend,
  colors,
}: {
  trend: "up" | "down" | "same";
  colors: Colors;
}) => {
  const rotation = useSharedValue(0);

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
  }, [trend]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ rotate: `${rotation.value}deg` }],
    };
  });

  const renderTrendIcon = (value: "up" | "down" | "same") => {
    switch (value) {
      case "up":
        return (
          <IconSymbol
            name="chart.line.uptrend.xyaxis"
            size={24}
            color={colors.brand.primary}
          />
        );
      case "down":
        return (
          <IconSymbol
            name="chart.line.downtrend.xyaxis"
            size={24}
            color={colors.border.layer3}
          />
        );
      case "same":
        return (
          <IconSymbol
            name="chart.line.flattrend.xyaxis"
            size={24}
            color={colors.border.layer3}
          />
        );
    }
  };

  return (
    <Animated.View style={animatedStyle}>
      {renderTrendIcon(trend)}
    </Animated.View>
  );
};

const ListItemComponent = ({
  item,
  colors,
}: {
  item: NbackHistoryItem;
  colors: Colors;
}) => {
  const accuracy =
    item.totalQuestions > 0
      ? (item.correctCount / item.totalQuestions) * 100
      : 0;

  return (
    <Pressable
      onPress={() => {
        router.push(`/games/nback/detail/${item.id}`);
      }}
      style={({ pressed }) => [
        styles.itemPressable,
        pressed && { backgroundColor: colors.surface.layer1 },
      ]}
      accessibilityRole="button"
      accessibilityLabel={`${item.type === "real" ? "실전" : "연습"} 기록, 정확도 ${Math.round(accuracy)}%, ${item.totalQuestions}문제 중 ${item.correctCount}문제 정답, ${formatTimeAgo(item.createdAt)}`}
      accessibilityHint="탭하면 기록 상세 화면으로 이동합니다"
      accessibilityState={{ disabled: false }}
    >
      <ThemedView>
        <HStack align="center" justify="space-between" spacing="spacing12">
          <HStack align="center" spacing="spacing12" style={styles.flex1}>
            <ThemedView>
              <Badge variant="color" kind="text">
                {item.type === "real" ? "실전" : "연습"}
              </Badge>
            </ThemedView>
            <VStack spacing="spacing4" style={styles.flex1}>
              <ThemedText type="labelL">{Math.round(accuracy)}%</ThemedText>
              <ThemedText type="captionM" lightColor={colors.text.tertiary}>
                {item.totalQuestions}문제 중 {item.correctCount}문제 정답
              </ThemedText>
            </VStack>
          </HStack>
          <ThemedText type="body2" lightColor={colors.text.secondary}>
            {formatTimeAgo(item.createdAt)}
          </ThemedText>
        </HStack>
      </ThemedView>
    </Pressable>
  );
};

const EmptyStateComponent = ({ colors }: { colors: Colors }) => {
  return (
    <VStack align="center" spacing="spacing16" style={styles.emptyContainer}>
      <IconSymbol
        name="chart.bar.doc.horizontal"
        size={48}
        color={colors.text.tertiary}
      />
      <VStack align="center" spacing="spacing4">
        <ThemedText type="title3">기록이 없습니다</ThemedText>
        <ThemedText type="body2" lightColor={colors.text.tertiary}>
          게임을 플레이하면 기록이 표시됩니다
        </ThemedText>
      </VStack>
    </VStack>
  );
};

const styles = StyleSheet.create({
  flex1: {
    flex: 1,
  },
  headerContainer: {
    padding: Padding.m,
  },
  headerSeparator: {
    borderBottomWidth: BorderWidth.s,
    paddingBottom: Padding.m,
  },
  itemPressable: {
    paddingHorizontal: Padding.m,
    paddingVertical: Padding.s,
    minHeight: 44,
  },
  emptyContainer: {
    paddingVertical: Padding.xxl,
    paddingHorizontal: Padding.m,
  },
});
