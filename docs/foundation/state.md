# State

컴포넌트 상태 표현을 위한 가이드.

## 상태 유형

| 유형 | 정의 | 상태 |
| --- | --- | --- |
| 기본 상태 | 상호작용이 없는 상태 | Enabled |
| 상호작용 상태 | 사용자의 입력에 반응하는 상태 | Pressed, Focused |
| 옵션 상태 | 컴포넌트 사용 가능 여부 | Disabled |

## 상태 표현

| 상태 | 표현 |
| --- | --- |
| Enabled | 기본 시맨틱 토큰을 그대로 사용한다. |
| Pressed | `*Pressed` 배경 토큰 또는 시스템 press feedback을 사용한다. |
| Focused | 키보드/TV 포커스 환경에서 명확한 stroke를 제공한다. 현재 별도 focus-ring 토큰이 없으므로 새 토큰이 필요하면 먼저 합의한다. |
| Disabled | `fg.disabled`, `bg.disabled`를 사용하고 상호작용을 차단한다. |

## 조합 규칙

- Pressed는 Enabled 스타일 위에 덮어쓴다.
- Focused는 Pressed와 동시에 보일 수 있어야 한다.
- Disabled는 Pressed, Focused와 조합하지 않는다.
- Disabled 요소는 가능한 경우 포커스 대상에서 제외한다.

## 구현

React Native 컴포넌트는 `disabled`, `accessibilityState`, 이벤트 차단을 함께 고려한다.

```tsx
<Pressable disabled accessibilityState={{ disabled: true }}>
  {children}
</Pressable>
```

Layout과 UI 컴포넌트에서는 직접 색상 값을 넣지 말고 상태별 토큰을 사용한다.

```tsx
<Box bg={disabled ? 'bg.disabled' : 'bg.layerDefault'}>
  <Text color={disabled ? 'fg.disabled' : 'fg.neutral'}>다음</Text>
</Box>
```
