import HeaderIcon from "@/components/header-icon";
import { ThemedModal } from "@/components/themed-modal";
import { IconSymbolName } from "@/components/ui/icon-symbol";
import { useFocusEffect } from "@react-navigation/native";
import { Stack, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { BackHandler } from "react-native";

export type GameExitGuardProps = {
  title?: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  iconName?: IconSymbolName;
  /**
   * 종료 확인 시 실행할 동작.
   * 지정하지 않으면 기본으로 router.back()을 호출합니다.
   */
  onExit?: () => void;
};

/**
 * 게임 진행 중 뒤로가기를 막고, 상단 뒤로가기/안드로이드 네이티브 뒤로가기에
 * 공통 종료 확인 모달을 띄워주는 가드 컴포넌트입니다.
 *
 * 사용 예시:
 * <GameExitGuard />
 */
export function GameExitGuard({
  title = "게임 종료",
  description = "게임을 종료하시겠어요? 진행 중인 내용은 저장되지 않을 수 있어요.",
  confirmLabel = "종료하기",
  cancelLabel = "계속하기",
  iconName = "chevron.left",
  onExit,
}: GameExitGuardProps) {
  const [isExitModalVisible, setIsExitModalVisible] = useState(false);
  const router = useRouter();

  const handleConfirmExit = useCallback(() => {
    setIsExitModalVisible(false);
    if (onExit) {
      onExit();
    } else {
      router.back();
    }
  }, [onExit, router]);

  const openExitModal = useCallback(() => {
    setIsExitModalVisible(true);
  }, []);

  // 안드로이드 하드웨어 뒤로가기 버튼 막기
  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        openExitModal();
        // 기본 네이티브 뒤로가기 동작을 막는다.
        return true;
      };

      const subscription = BackHandler.addEventListener(
        "hardwareBackPress",
        onBackPress
      );

      return () => {
        subscription.remove();
      };
    }, [openExitModal])
  );

  return (
    <>
      <Stack.Screen
        options={{
          // iOS 제스처(스와이프) 뒤로가기 비활성화
          gestureEnabled: false,
          // 헤더 왼쪽 뒤로가기 버튼을 눌렀을 때 게임 종료 확인 모달 표시
          headerLeft: () => (
            <HeaderIcon name={iconName} onPress={openExitModal} />
          ),
        }}
      />

      <ThemedModal
        visible={isExitModalVisible}
        title={title}
        description={description}
        onRequestClose={() => setIsExitModalVisible(false)}
        secondaryAction={{
          label: cancelLabel,
          variant: "tertiary",
          onPress: () => setIsExitModalVisible(false),
        }}
        primaryAction={{
          label: confirmLabel,
          onPress: handleConfirmExit,
        }}
      />
    </>
  );
}
