import { ScrollView, StyleSheet, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";

export default function TypographyDemo() {
  return (
    <ScrollView style={styles.container}>
      <ThemedView style={styles.section}>
        <ThemedText type="title1" style={styles.sectionTitle}>
          타이포그래피 시스템
        </ThemedText>
        <ThemedText type="body2" style={styles.sectionDescription}>
          앱에서 사용하는 모든 텍스트 스타일을 확인할 수 있습니다
        </ThemedText>
      </ThemedView>

      {/* Headline */}
      <ThemedView style={styles.section}>
        <ThemedText type="title2">Headline</ThemedText>
        <View style={styles.exampleRow}>
          <ThemedText type="captionS" style={styles.label}>
            Headline L
          </ThemedText>
          <ThemedText type="headlineL">큰 헤드라인 36px</ThemedText>
        </View>
        <View style={styles.exampleRow}>
          <ThemedText type="captionS" style={styles.label}>
            Headline M
          </ThemedText>
          <ThemedText type="headlineM">중간 헤드라인 32px</ThemedText>
        </View>
        <View style={styles.exampleRow}>
          <ThemedText type="captionS" style={styles.label}>
            Headline S
          </ThemedText>
          <ThemedText type="headlineS">작은 헤드라인 28px</ThemedText>
        </View>
      </ThemedView>

      {/* Title */}
      <ThemedView style={styles.section}>
        <ThemedText type="title2">Title</ThemedText>
        <View style={styles.exampleRow}>
          <ThemedText type="captionS" style={styles.label}>
            Title 1
          </ThemedText>
          <ThemedText type="title1">타이틀 1 - 24px</ThemedText>
        </View>
        <View style={styles.exampleRow}>
          <ThemedText type="captionS" style={styles.label}>
            Title 2
          </ThemedText>
          <ThemedText type="title2">타이틀 2 - 20px</ThemedText>
        </View>
        <View style={styles.exampleRow}>
          <ThemedText type="captionS" style={styles.label}>
            Title 3
          </ThemedText>
          <ThemedText type="title3">타이틀 3 - 18px</ThemedText>
        </View>
      </ThemedView>

      {/* Label */}
      <ThemedView style={styles.section}>
        <ThemedText type="title2">Label</ThemedText>
        <View style={styles.exampleRow}>
          <ThemedText type="captionS" style={styles.label}>
            Label L
          </ThemedText>
          <ThemedText type="labelL">라벨 라지 16px</ThemedText>
        </View>
        <View style={styles.exampleRow}>
          <ThemedText type="captionS" style={styles.label}>
            Label M
          </ThemedText>
          <ThemedText type="labelM">라벨 미디엄 14px</ThemedText>
        </View>
        <View style={styles.exampleRow}>
          <ThemedText type="captionS" style={styles.label}>
            Label S
          </ThemedText>
          <ThemedText type="labelS">라벨 스몰 12px</ThemedText>
        </View>
      </ThemedView>

      {/* Body */}
      <ThemedView style={styles.section}>
        <ThemedText type="title2">Body</ThemedText>
        <View style={styles.exampleRow}>
          <ThemedText type="captionS" style={styles.label}>
            Body 1
          </ThemedText>
          <ThemedText type="body1">
            본문 텍스트 1 - 16px. 일반적인 본문에 사용됩니다. 긴 텍스트를 표시할
            때 적합한 스타일입니다.
          </ThemedText>
        </View>
        <View style={styles.exampleRow}>
          <ThemedText type="captionS" style={styles.label}>
            Body 2
          </ThemedText>
          <ThemedText type="body2">
            본문 텍스트 2 - 14px. 약간 작은 본문에 사용됩니다. 부가 설명이나
            보조 정보를 표시할 때 좋습니다.
          </ThemedText>
        </View>
      </ThemedView>

      {/* Button */}
      <ThemedView style={styles.section}>
        <ThemedText type="title2">Button</ThemedText>
        <View style={styles.exampleRow}>
          <ThemedText type="captionS" style={styles.label}>
            Button 1
          </ThemedText>
          <View style={styles.buttonExample}>
            <ThemedText type="button1">버튼 텍스트 1</ThemedText>
          </View>
        </View>
        <View style={styles.exampleRow}>
          <ThemedText type="captionS" style={styles.label}>
            Button 2
          </ThemedText>
          <View style={styles.buttonExample}>
            <ThemedText type="button2">버튼 텍스트 2</ThemedText>
          </View>
        </View>
        <View style={styles.exampleRow}>
          <ThemedText type="captionS" style={styles.label}>
            Button 3
          </ThemedText>
          <View style={styles.buttonExample}>
            <ThemedText type="button3">버튼 텍스트 3</ThemedText>
          </View>
        </View>
      </ThemedView>

      {/* Caption */}
      <ThemedView style={styles.section}>
        <ThemedText type="title2">Caption</ThemedText>
        <View style={styles.exampleRow}>
          <ThemedText type="captionS" style={styles.label}>
            Caption L
          </ThemedText>
          <ThemedText type="captionL">캡션 라지 16px</ThemedText>
        </View>
        <View style={styles.exampleRow}>
          <ThemedText type="captionS" style={styles.label}>
            Caption M
          </ThemedText>
          <ThemedText type="captionM">캡션 미디엄 14px</ThemedText>
        </View>
        <View style={styles.exampleRow}>
          <ThemedText type="captionS" style={styles.label}>
            Caption S
          </ThemedText>
          <ThemedText type="captionS">캡션 스몰 12px</ThemedText>
        </View>
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  section: {
    padding: 20,
    gap: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(128, 128, 128, 0.2)",
  },
  sectionTitle: {
    marginBottom: 4,
  },
  sectionDescription: {
    opacity: 0.7,
  },
  exampleRow: {
    gap: 8,
  },
  label: {
    opacity: 0.5,
    textTransform: "uppercase",
  },
  buttonExample: {
    alignSelf: "flex-start",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: "rgba(10, 126, 164, 0.1)",
  },
  footer: {
    padding: 20,
    alignItems: "center",
  },
  footerText: {
    opacity: 0.6,
  },
});
