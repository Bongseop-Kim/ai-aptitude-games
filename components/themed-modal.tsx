import { BorderRadius, Padding } from "@/constants/theme";
import { useThemeColor } from "@/hooks/use-theme-color";
import { BlockButton, type BlockButtonVariant } from "@/components/block-button";
import { ThemedText } from "@/components/themed-text";
import { ReactNode } from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  View,
  type ModalProps,
} from "react-native";

type ModalAction = {
  label: string;
  onPress: () => void;
  variant?: BlockButtonVariant;
};

export type ThemedModalProps = {
  visible: boolean;
  title: string;
  description?: string;
  onRequestClose?: () => void;
  primaryAction?: ModalAction;
  secondaryAction?: ModalAction;
  children?: ReactNode;
  modalProps?: Omit<ModalProps, "visible" | "transparent">;
};

export function ThemedModal({
  visible,
  title,
  description,
  onRequestClose,
  primaryAction,
  secondaryAction,
  children,
  modalProps,
}: ThemedModalProps) {
  const overlayColor = useThemeColor({}, "overlay.base");
  const surfaceColor = useThemeColor({}, "surface.base");
  const borderColor = useThemeColor({}, "border.base");
  const secondaryTextColor = useThemeColor({}, "text.secondary");

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onRequestClose}
      {...modalProps}
    >
      <View style={[styles.overlay, { backgroundColor: overlayColor }]}>
        {onRequestClose && (
          <Pressable
            accessibilityRole="button"
            onPress={onRequestClose}
            style={StyleSheet.absoluteFill}
          />
        )}
        <View
          style={[
            styles.card,
            { backgroundColor: surfaceColor, borderColor },
          ]}
        >
          <ThemedText type="title2">{title}</ThemedText>
          {description ? (
            <ThemedText
              type="body2"
              style={{ color: secondaryTextColor }}
            >
              {description}
            </ThemedText>
          ) : null}
          {children}
          {(primaryAction || secondaryAction) && (
            <View style={styles.actions}>
              {secondaryAction && (
                <BlockButton
                  variant={secondaryAction.variant ?? "secondary"}
                  onPress={secondaryAction.onPress}
                >
                  {secondaryAction.label}
                </BlockButton>
              )}
              {primaryAction && (
                <BlockButton
                  variant={primaryAction.variant ?? "primary"}
                  onPress={primaryAction.onPress}
                >
                  {primaryAction.label}
                </BlockButton>
              )}
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: Padding.l,
  },
  card: {
    width: "100%",
    maxWidth: 420,
    borderRadius: BorderRadius.m,
    borderWidth: 1,
    padding: Padding.l,
    gap: Padding.s,
  },
  actions: {
    marginTop: Padding.s,
    gap: Padding.s,
  },
});
