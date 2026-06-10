# Iconography

아이콘 크기, 터치 영역, 색상, 타입 선택을 위한 가이드.

## 원칙

- **공용 스케일 사용** - 아이콘 전용 숫자를 만들지 않고 `dimension.x` 스케일을 사용한다.
- **시맨틱 색상 사용** - 아이콘 색상은 텍스트와 같은 `fg.*` 토큰을 따른다.
- **프로젝트 Icon 컴포넌트 우선** - 앱 UI에서는 `src/components/ui/Icon.tsx`의 `Icon`을 우선 사용한다. 현재 구현은 `@expo/vector-icons/MaterialIcons`를 감싼다.

## Size

| Icon prop | Token | 값 |
| --- | --- | --- |
| `small` | `x5` | 20 |
| `medium` | `x6` | 24 |
| `large` | `x8` | 32 |

기본 크기는 `medium`이다. 본문 텍스트와 함께 쓰는 아이콘은 `small` 또는 `medium`을 우선 검토한다.

## Touch Area

아이콘을 단독 버튼으로 사용할 때는 시각 크기와 별개로 터치 영역을 확보한다.

| 규칙 | 값 |
| --- | --- |
| 최소 터치 영역 | `x10`(40) |
| 권장 터치 영역 | `x12`(48) 이상 |

단독 액션은 `IconButton` 같은 버튼 컴포넌트를 사용하고, 직접 `Pressable`을 만들 때는 `hitSlop` 또는 Layout 크기 토큰으로 터치 영역을 보장한다.

## Color

- 기본 아이콘은 `fg.neutralMuted`를 사용한다.
- 본문 텍스트와 나란히 배치된 아이콘은 해당 텍스트의 색상 토큰과 맞춘다.
- 비활성화 상태는 `fg.disabled`를 사용한다.
- 위험, 성공, 경고, 정보 의미가 있을 때만 `fg.critical`, `fg.positive`, `fg.warning`, `fg.informative`를 사용한다.

## Variants

현재 공용 `Icon`은 제한된 앱 아이콘 이름만 받는다. 새 아이콘이 필요하면 `IconName`과 `materialIconName` 매핑을 함께 추가한다.

- 네비게이션과 툴바에서는 선형에 가까운 Material icon을 우선한다.
- 선택됨, 완료, 즐겨찾기처럼 상태가 강한 아이콘은 채워진 형태를 사용할 수 있다.
- 작은 크기에서 복잡한 아이콘을 쓰지 않는다.

## Typography와 함께 쓰기

아이콘과 텍스트는 `HStack`으로 배치하고 `gap`은 토큰을 사용한다.

```tsx
<HStack align="center" gap="x2">
  <Icon name="clock" size="small" color="fg.neutralSubtle" />
  <Text variant="caption" color="fg.neutralSubtle">
    3분
  </Text>
</HStack>
```
