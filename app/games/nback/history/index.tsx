import { Badge } from "@/components/badge";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { HStack, VStack } from "@/components/ui/stack";
import { BorderWidth, getAliasTokens, Padding } from "@/constants/theme";
import {
  getNbackHistoryHeaderData,
  getNbackHistoryList,
} from "@/db/services/nback";
import { NbackHistoryHeaderData, NbackHistoryItem } from "@/types/nback/nback";
import { useEffect, useState } from "react";
import { FlatList, StyleSheet, useColorScheme } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";

export default function NBackHistoryScreen() {
  const [historyList, setHistoryList] = useState<NbackHistoryItem[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const data = await getNbackHistoryList();
      setHistoryList(data);
    };
    fetchData();
  }, []);

  return (
    <ThemedView style={styles.flex1}>
      <FlatList
        data={historyList}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => <ListItemComponent item={item} />}
        ListHeaderComponent={<HeaderComponent />}
        ListEmptyComponent={<EmptyStateComponent />}
      />
    </ThemedView>
  );
}

const HeaderComponent = () => {
  const colorScheme = useColorScheme();
  const colors = getAliasTokens(colorScheme ?? "light");
  const [data, setData] = useState<NbackHistoryHeaderData | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const data = await getNbackHistoryHeaderData();
      setData(data);
    };
    fetchData();
  }, []);

  return (
    <VStack
      spacing="spacing12"
      style={[
        styles.headerContainer,
        { borderBottomColor: colors.border.base },
      ]}
    >
      <VStack>
        <HStack align="flex-end" spacing="spacing4">
          <ThemedText type="headlineL">
            {data?.todayAvgAccuracy ?? 0}%
          </ThemedText>
          <TrendIconComponent trend={data?.trend ?? "same"} />
        </HStack>
        <ThemedText>오늘 평균 정확도</ThemedText>
      </VStack>
      <HStack justify="space-between" spacing="spacing4">
        <VStack style={styles.flex1}>
          <ThemedText type="title1">
            {data?.sevenDayAvgAccuracy ? data.sevenDayAvgAccuracy * 100 : 0}%
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
    </VStack>
  );
};

const TrendIconComponent = ({ trend }: { trend: "up" | "down" | "same" }) => {
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

  const renderTrendIcon = (trend: "up" | "down" | "same") => {
    switch (trend) {
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

const formatTimeAgo = (date: Date): string => {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) {
    return "방금 전";
  } else if (diffMins < 60) {
    return `${diffMins}분전`;
  } else if (diffHours < 24) {
    return `${diffHours}시간전`;
  } else if (diffDays < 7) {
    return `${diffDays}일전`;
  } else {
    return date.toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }
};

const ListItemComponent = ({ item }: { item: NbackHistoryItem }) => {
  const colorScheme = useColorScheme();
  const colors = getAliasTokens(colorScheme ?? "light");
  const accuracy =
    item.totalQuestions > 0
      ? (item.correctCount / item.totalQuestions) * 100
      : 0;

  return (
    <ThemedView style={[styles.itemContainer]}>
      <HStack align="center" justify="space-between" spacing="spacing12">
        <HStack align="center" spacing="spacing12" style={styles.flex1}>
          <ThemedView>
            <Badge variant="color" kind="text">
              {item.type === "real" ? "실전" : "연습"}
            </Badge>
          </ThemedView>
          <VStack spacing="spacing4" style={styles.flex1}>
            <HStack align="center" spacing="spacing4">
              <IconSymbol name="clock" size={14} color={colors.text.tertiary} />
              <ThemedText type="body2" lightColor={colors.text.secondary}>
                {formatTimeAgo(item.createdAt)}
              </ThemedText>
            </HStack>
            <HStack align="center" spacing="spacing4">
              <IconSymbol
                name="checkmark.circle"
                size={14}
                color={colors.text.tertiary}
              />
              <ThemedText type="body2">
                {item.correctCount}/{item.totalQuestions}
              </ThemedText>
            </HStack>
          </VStack>
        </HStack>
        <VStack align="flex-end" spacing="spacing4">
          <ThemedText type="title3">{Math.round(accuracy)}%</ThemedText>
          <ThemedText type="captionM" lightColor={colors.text.tertiary}>
            정확도
          </ThemedText>
        </VStack>
      </HStack>
    </ThemedView>
  );
};

const EmptyStateComponent = () => {
  const colorScheme = useColorScheme();
  const colors = getAliasTokens(colorScheme ?? "light");
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
    borderBottomWidth: BorderWidth.s,
  },
  itemContainer: {
    paddingHorizontal: Padding.m,
    paddingVertical: Padding.s,
  },
  emptyContainer: {
    paddingVertical: Padding.xxl,
    paddingHorizontal: Padding.m,
  },
});
