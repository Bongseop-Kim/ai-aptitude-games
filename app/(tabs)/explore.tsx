import { ScrollView, StyleSheet, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";

export default function ExploreScreen() {
  return (
    <ScrollView style={styles.container}>
      <ThemedView style={styles.section}>
        <ThemedText type="title1" style={styles.sectionTitle}>
          면접 역량 검사 가이드
        </ThemedText>
        <ThemedText type="body2" style={styles.sectionDescription}>
          기업 AI 역량 검사를 잘하기 위한 실전 팁과 전략을 확인하세요
        </ThemedText>
      </ThemedView>

      {/* 기본 준비 */}
      <ThemedView style={styles.section}>
        <ThemedText type="title2">기본 준비 사항</ThemedText>
        <View style={styles.tipItem}>
          <ThemedText type="body1" style={styles.tipTitle}>
            • 충분한 휴식
          </ThemedText>
          <ThemedText type="body2" style={styles.tipContent}>
            검사 전날 충분한 수면을 취하고, 검사 당일 아침 식사를 꼭 챙기세요.
            집중력과 인지 능력은 신체 상태에 큰 영향을 받습니다.
          </ThemedText>
        </View>
        <View style={styles.tipItem}>
          <ThemedText type="body1" style={styles.tipTitle}>
            • 환경 준비
          </ThemedText>
          <ThemedText type="body2" style={styles.tipContent}>
            조용하고 방해받지 않는 공간에서 검사를 받으세요. 스마트폰 알림을
            끄고, 집중할 수 있는 환경을 미리 준비하세요.
          </ThemedText>
        </View>
        <View style={styles.tipItem}>
          <ThemedText type="body1" style={styles.tipTitle}>
            • 반복 연습
          </ThemedText>
          <ThemedText type="body2" style={styles.tipContent}>
            각 게임 유형을 반복적으로 연습하여 패턴에 익숙해지세요. 연습이
            많을수록 실제 검사에서 더 좋은 성과를 낼 수 있습니다.
          </ThemedText>
        </View>
      </ThemedView>

      {/* 작업기억 역량 */}
      <ThemedView style={styles.section}>
        <ThemedText type="title2">작업기억 역량 향상 팁</ThemedText>
        <View style={styles.tipItem}>
          <ThemedText type="body1" style={styles.tipTitle}>
            도형 순서 기억 (N-back)
          </ThemedText>
          <ThemedText type="body2" style={styles.tipContent}>
            현재 도형을 보면서 동시에 n번째 이전 도형을 기억해야 합니다. 처음엔
            2-back부터 시작해 점진적으로 난이도를 높이며 연습하세요. 패턴을
            외우기보다는 순간순간의 판단에 집중하는 것이 중요합니다.
          </ThemedText>
        </View>
        <View style={styles.tipItem}>
          <ThemedText type="body1" style={styles.tipTitle}>
            약속 정하기
          </ThemedText>
          <ThemedText type="body2" style={styles.tipContent}>
            여러 번 제시된 정보 중 공통점이나 차이점을 찾아야 합니다. 각
            정보를 시각적으로 그룹화하거나 간단한 키워드로 정리하는 습관을
            기르세요.
          </ThemedText>
        </View>
      </ThemedView>

      {/* 공간지각 역량 */}
      <ThemedView style={styles.section}>
        <ThemedText type="title2">공간지각 역량 향상 팁</ThemedText>
        <View style={styles.tipItem}>
          <ThemedText type="body1" style={styles.tipTitle}>
            도형 회전 / 반전
          </ThemedText>
          <ThemedText type="body2" style={styles.tipContent}>
            도형의 특징적인 부분(예: 돌출부, 각도)을 먼저 파악하고, 이를
            기준으로 회전 방향을 판단하세요. 실제로 손으로 그려보는 것처럼
            머릿속에서 회전시켜 보는 연습이 도움이 됩니다.
          </ThemedText>
        </View>
      </ThemedView>

      {/* 억제 및 주의 역량 */}
      <ThemedView style={styles.section}>
        <ThemedText type="title2">억제 및 주의 역량 향상 팁</ThemedText>
        <View style={styles.tipItem}>
          <ThemedText type="body1" style={styles.tipTitle}>
            Stroop Test
          </ThemedText>
          <ThemedText type="body2" style={styles.tipContent}>
            단어의 의미가 아닌 글자 색상에만 집중하세요. 자동적으로 단어를
            읽으려는 습관을 억제하고, 색상 인식에만 집중하는 연습을 반복하세요.
          </ThemedText>
        </View>
        <View style={styles.tipItem}>
          <ThemedText type="body1" style={styles.tipTitle}>
            Go / No-Go
          </ThemedText>
          <ThemedText type="body2" style={styles.tipContent}>
            반응해야 할 자극과 반응하지 말아야 할 자극을 명확히 구분하세요.
            처음엔 정확도를 우선시하고, 점차 속도를 높여가는 방식으로
            연습하세요.
          </ThemedText>
        </View>
        <View style={styles.tipItem}>
          <ThemedText type="body1" style={styles.tipTitle}>
            숫자 누르기
          </ThemedText>
          <ThemedText type="body2" style={styles.tipContent}>
            활성 숫자와 비활성 숫자를 빠르게 구분하는 연습이 중요합니다. 주변
            방해 요소를 무시하고 목표 숫자에만 집중하는 훈련을 하세요.
          </ThemedText>
        </View>
      </ThemedView>

      {/* 규칙 전환 역량 */}
      <ThemedView style={styles.section}>
        <ThemedText type="title2">규칙 전환 역량 향상 팁</ThemedText>
        <View style={styles.tipItem}>
          <ThemedText type="body1" style={styles.tipTitle}>
            가위바위보
          </ThemedText>
          <ThemedText type="body2" style={styles.tipContent}>
            라운드마다 규칙이 바뀌므로, 항상 현재 라운드의 규칙을 명확히
            파악하세요. 이전 라운드의 규칙에 얽매이지 말고, 새로운 규칙에
            빠르게 적응하는 것이 핵심입니다.
          </ThemedText>
        </View>
      </ThemedView>

      {/* 확률 추론 역량 */}
      <ThemedView style={styles.section}>
        <ThemedText type="title2">확률 추론 역량 향상 팁</ThemedText>
        <View style={styles.tipItem}>
          <ThemedText type="body1" style={styles.tipTitle}>
            마법약 만들기
          </ThemedText>
          <ThemedText type="body2" style={styles.tipContent}>
            각 조합에서 나타난 색상의 빈도를 기억하고 통계적으로 분석하세요.
            직관보다는 데이터를 기반으로 판단하는 습관을 기르는 것이
            중요합니다.
          </ThemedText>
        </View>
      </ThemedView>

      {/* 실전 전략 */}
      <ThemedView style={styles.section}>
        <ThemedText type="title2">실전 검사 전략</ThemedText>
        <View style={styles.tipItem}>
          <ThemedText type="body1" style={styles.tipTitle}>
            시간 관리
          </ThemedText>
          <ThemedText type="body2" style={styles.tipContent}>
            각 문제에 너무 오래 머물지 마세요. 어려운 문제는 일단 넘어가고,
            풀 수 있는 문제를 먼저 해결한 후 남은 시간에 다시 도전하세요.
          </ThemedText>
        </View>
        <View style={styles.tipItem}>
          <ThemedText type="body1" style={styles.tipTitle}>
            정확도 vs 속도
          </ThemedText>
          <ThemedText type="body2" style={styles.tipContent}>
            처음엔 정확도를 우선시하고, 패턴에 익숙해지면 점차 속도를 높이세요.
            실수로 인한 감점을 피하는 것이 중요합니다.
          </ThemedText>
        </View>
        <View style={styles.tipItem}>
          <ThemedText type="body1" style={styles.tipTitle}>
            집중력 유지
          </ThemedText>
          <ThemedText type="body2" style={styles.tipContent}>
            검사 중간에 집중력이 떨어질 수 있습니다. 깊게 숨을 쉬거나 간단한
            스트레칭으로 긴장을 풀고, 다시 집중하세요. 한 문제에 실망하지
            말고 다음 문제에 집중하는 것이 중요합니다.
          </ThemedText>
        </View>
      </ThemedView>

      {/* 마무리 */}
      <ThemedView style={styles.footer}>
        <ThemedText type="body2" style={styles.footerText}>
          꾸준한 연습과 긍정적인 마음가짐으로 좋은 결과를 만들어가세요!
        </ThemedText>
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
  tipItem: {
    gap: 8,
    marginBottom: 12,
  },
  tipTitle: {
    fontWeight: "600",
  },
  tipContent: {
    opacity: 0.8,
    lineHeight: 20,
  },
  footer: {
    padding: 20,
    paddingBottom: 40,
    alignItems: "center",
  },
  footerText: {
    opacity: 0.7,
    textAlign: "center",
    lineHeight: 20,
  },
});
