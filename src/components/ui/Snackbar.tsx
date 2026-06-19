import {
  createContext,
  use,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type PropsWithChildren,
} from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { Box } from '../../design-system/components/Box';
import { HStack } from '../../design-system/components/Stack';
import { Text } from '../../design-system/components/Text';
import { useDesignSystemTheme } from '../../design-system/provider';
import { Icon, type IconName } from './Icon';

export type SnackbarAction = {
  label: string;
  onPress: () => void;
  accessibilityLabel?: string;
};

export type SnackbarProps = {
  message: string;
  visible?: boolean;
  prefixIcon?: IconName;
  action?: SnackbarAction;
  accessibilityLabel?: string;
};

export type SnackbarDuration = number | 'persist';

export type SnackbarOptions = {
  message: string;
  prefixIcon?: IconName;
  action?: SnackbarAction & {
    dismissOnPress?: boolean;
  };
  duration?: SnackbarDuration;
  accessibilityLabel?: string;
};

export type SnackbarContextValue = {
  show: (options: SnackbarOptions) => number;
  dismiss: (id?: number) => void;
  visible: boolean;
};

export type SnackbarProviderProps = PropsWithChildren<{
  defaultDuration?: number;
}>;

type ActiveSnackbar = SnackbarOptions & {
  id: number;
};

const DEFAULT_SNACKBAR_DURATION = 4000;
const SnackbarContext = createContext<SnackbarContextValue | null>(null);

export function Snackbar({
  message,
  visible = true,
  prefixIcon,
  action,
  accessibilityLabel,
}: SnackbarProps) {
  const { theme } = useDesignSystemTheme();
  const progress = useSharedValue(visible ? 1 : 0);
  const hiddenTranslateY = theme.dimension.x.x3;
  const animatedStyle = useAnimatedStyle(() => {
    const currentProgress = progress.get();

    return {
      opacity: currentProgress,
      transform: [{ translateY: (1 - currentProgress) * hiddenTranslateY }],
    };
  });

  useLayoutEffect(() => {
    progress.set(
      withTiming(visible ? 1 : 0, {
        duration: visible ? theme.duration.d3 : theme.duration.d2,
      }),
    );
  }, [progress, theme.duration.d2, theme.duration.d3, visible]);

  return (
    <Animated.View
      accessibilityElementsHidden={!visible}
      accessibilityLabel={accessibilityLabel ?? message}
      accessibilityLiveRegion="polite"
      accessibilityRole="alert"
      importantForAccessibility={visible ? 'auto' : 'no-hide-descendants'}
      pointerEvents={visible ? 'auto' : 'none'}
      style={[styles.animatedFrame, animatedStyle]}
    >
      <HStack
        align="center"
        bg="bg.neutralSolid"
        borderColor="stroke.neutralContrast"
        borderRadius="r3"
        borderWidth="thin"
        boxShadow="floating"
        gap="x2_5"
        minHeight="x14"
        px="x3"
        py="x2_5"
        width="full"
      >
        {prefixIcon ? <Icon name={prefixIcon} color="fg.neutralInverted" size="medium" /> : null}
        <Box flex={1}>
          <Text color="fg.neutralInverted" maxLines={2} textStyle="t4Regular">
            {message}
          </Text>
        </Box>
        {action ? (
          <Pressable
            accessibilityLabel={action.accessibilityLabel ?? action.label}
            accessibilityRole="button"
            hitSlop={8}
            onPress={action.onPress}
          >
            <Box borderRadius="full" maxWidth="x29" px="x1_5" py="x1">
              <Text color="fg.neutralInverted" maxLines={1} style={styles.actionLabel} textStyle="t4Bold">
                {action.label}
              </Text>
            </Box>
          </Pressable>
        ) : null}
      </HStack>
    </Animated.View>
  );
}

export function SnackbarProvider({
  children,
  defaultDuration = DEFAULT_SNACKBAR_DURATION,
}: SnackbarProviderProps) {
  const { theme } = useDesignSystemTheme();
  const insets = useSafeAreaInsets();
  const [activeSnackbar, setActiveSnackbar] = useState<ActiveSnackbar | null>(null);
  const nextId = useRef(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const bottomOffset = insets.bottom + theme.dimension.spacingY.screenBottom;

  function show(options: SnackbarOptions) {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    const id = nextId.current + 1;
    nextId.current = id;
    setActiveSnackbar({ id, ...options });

    return id;
  }

  function dismiss(id?: number) {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    setActiveSnackbar((currentSnackbar) => {
      if (id !== undefined && currentSnackbar?.id !== id) return currentSnackbar;
      return null;
    });
  }

  function handleActionPress() {
    const action = activeSnackbar?.action;
    if (!action) return;

    action.onPress();
    if (action.dismissOnPress !== false) dismiss(activeSnackbar.id);
  }

  useEffect(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    if (!activeSnackbar || activeSnackbar.duration === 'persist') {
      return;
    }

    const activeId = activeSnackbar.id;
    const duration = activeSnackbar.duration ?? defaultDuration;

    timeoutRef.current = setTimeout(() => {
      setActiveSnackbar((currentSnackbar) => (currentSnackbar?.id === activeId ? null : currentSnackbar));
    }, duration);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [activeSnackbar, defaultDuration]);

  return (
    <SnackbarContext value={{ show, dismiss, visible: Boolean(activeSnackbar) }}>
      {children}
      <Box bottom={0} left={0} pointerEvents="box-none" position="absolute" right={0} top={0} zIndex={10}>
        <Box
          bottom={bottomOffset}
          left="spacingX.globalGutter"
          pointerEvents="box-none"
          position="absolute"
          right="spacingX.globalGutter"
        >
          <Snackbar
            action={
              activeSnackbar?.action
                ? {
                    accessibilityLabel: activeSnackbar.action.accessibilityLabel,
                    label: activeSnackbar.action.label,
                    onPress: handleActionPress,
                  }
                : undefined
            }
            accessibilityLabel={activeSnackbar?.accessibilityLabel}
            message={activeSnackbar?.message ?? ''}
            prefixIcon={activeSnackbar?.prefixIcon}
            visible={Boolean(activeSnackbar)}
          />
        </Box>
      </Box>
    </SnackbarContext>
  );
}

export function useSnackbar() {
  const value = use(SnackbarContext);

  if (!value) {
    throw new Error('useSnackbar must be used within SnackbarProvider.');
  }

  return value;
}

const styles = StyleSheet.create({
  actionLabel: {
    flexShrink: 1,
  },
  animatedFrame: {
    width: '100%',
  },
});
