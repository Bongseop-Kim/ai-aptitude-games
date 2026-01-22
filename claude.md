# AI 역량 검사 게임 앱 - Claude 가이드

## 프로젝트 개요

이 프로젝트는 **기업 AI 역량 검사 대비용 훈련 게임 앱**입니다. React Native와 Expo를 사용하여 iOS, Android, Web을 지원하는 크로스 플랫폼 앱입니다.

### 주요 목표

- 기업 AI 역량 검사 유형을 게임화하여 반복 훈련 가능
- 자동 채점 및 성능 추적
- 다양한 인지 능력 측정 (작업기억, 공간지각, 억제, 주의 등)

## 기술 스택

- **프레임워크**: Expo ~54.0.31
- **라우팅**: Expo Router ~6.0.21 (파일 기반 라우팅)
- **언어**: TypeScript ~5.9.2
- **React**: 19.1.0
- **React Native**: 0.81.5
- **폰트**: Pretendard (다양한 weight 지원)

### 주요 라이브러리

- `expo-haptics`: 햅틱 피드백
- `expo-image`: 이미지 최적화
- `react-native-reanimated`: 애니메이션
- `react-native-gesture-handler`: 제스처 처리

## 프로젝트 구조

```text
ai-aptitude-games/
├── app/                    # Expo Router 파일 기반 라우팅
│   ├── (tabs)/            # 탭 네비게이션
│   │   ├── index.tsx      # 홈 화면 (게임 목록)
│   │   └── explore.tsx    # 탐색 화면
│   ├── pre-game/[id]/     # 게임 시작 전 화면
│   └── in-game/[id]/      # 게임 진행 화면
│       └── nback/         # N-back 게임 구현
├── components/             # 재사용 가능한 컴포넌트
│   ├── badge.tsx          # 배지 컴포넌트
│   ├── block-button.tsx   # 블록 버튼
│   ├── countdown.tsx      # 카운트다운
│   ├── difficulty-stars.tsx # 난이도 표시
│   ├── segmented-picker.tsx # 세그먼트 선택기
│   ├── themed-text.tsx    # 테마 적용 텍스트
│   ├── themed-view.tsx    # 테마 적용 뷰
│   └── ui/                # UI 컴포넌트
├── constants/
│   ├── games.ts           # 게임 목록 및 메타데이터
│   ├── games/
│   │   └── nback.ts       # N-back 게임 설정
│   └── theme.ts           # 디자인 시스템 (색상, 타이포그래피)
├── hooks/                 # 커스텀 훅
│   ├── use-color-scheme.ts
│   └── use-theme-color.ts
└── types/
    └── game.ts            # Game 타입 정의
```

## 디자인 시스템

### 색상 토큰 구조 (3단계)

1. **Primitive Colors**: 기본 색상 팔레트 (red, orange, yellow, green, teal, blue, purple, neutral)
2. **Alias Tokens**: 의미적 그룹핑 (brand, border, feedback, surface, text, overlay)
3. **Semantic Tokens**: 실제 UI 컴포넌트용 (icon, button, field, interactive)

### 사용 방법

```typescript
import { getAliasTokens, getSemanticTokens } from "@/constants/theme";

// Alias 토큰 사용
const tokens = getAliasTokens(colorScheme);
const brandColor = tokens.brand.primary;

// Semantic 토큰 사용 (권장)
const semanticTokens = getSemanticTokens(colorScheme);
const buttonColor = semanticTokens.button.primaryBgDefault;
```

### 타이포그래피

- **Display**: 120px (대형 제목)
- **Headline**: L(36px), M(32px), S(28px)
- **Title**: 1(24px), 2(20px), 3(18px)
- **Label**: L(16px), M(14px), S(12px)
- **Body**: 1(16px), 2(14px)
- **Button**: 1(16px), 2(14px), 3(12px)
- **Caption**: L(16px), M(14px), S(12px)

### 라이트/다크 모드

모든 컴포넌트는 `ThemedView`, `ThemedText`를 사용하여 자동으로 라이트/다크 모드를 지원합니다.

```typescript
<ThemedView>
  <ThemedText type="title1">제목</ThemedText>
</ThemedView>
```

## 게임 시스템

### 게임 타입 정의

```typescript
interface Game {
  id: string; // 고유 식별자
  name: string; // 게임 이름
  image: any; // 썸네일 이미지
  difficulty: number; // 난이도 (1-5)
  description: string; // 설명
  measuredSkills: string[]; // 측정 역량
  images: any[]; // 게임 이미지 배열
  numberOfQuestions: number | null; // 문항수 (null이면 무제한)
  numberOfRounds: number; // 라운드 수
  timeLimit: number; // 제한 시간 (초)
}
```

### 현재 구현된 게임

1. **N-back (도형 순서 기억)**: 작업기억, 업데이트 측정
2. **도형 회전 / 반전**: 공간지각, 정신 회전
3. **Stroop Test**: 억제, 선택적 주의
4. **Go / No-Go**: 충동 억제, 반응 통제
5. **가위바위보**: 규칙 전환, 억제, 반응속도
6. **약속 정하기**: 작업기억, 정보 갱신
7. **숫자 누르기**: 선택적 주의, 작업기억
8. **마법약 만들기**: 확률 추론, 통계적 학습

### 게임 추가 방법

1. `constants/games.ts`에 게임 메타데이터 추가
2. `constants/games/[gameId].ts`에 게임 설정 추가
3. `app/in-game/[gameId]/index.tsx`에 게임 화면 구현
4. `app/pre-game/[gameId]/index.tsx`에 게임 시작 전 화면 구현 (선택)

## 컴포넌트 가이드

### ThemedView / ThemedText

모든 뷰와 텍스트는 테마를 지원하는 컴포넌트를 사용합니다.

```typescript
import { ThemedView } from "@/components/themed-view";
import { ThemedText } from "@/components/themed-text";

<ThemedView>
  <ThemedText type="title1">제목</ThemedText>
  <ThemedText type="body1">본문</ThemedText>
</ThemedView>;
```

### Badge

배지 컴포넌트는 다양한 variant와 type을 지원합니다.

```typescript
import { Badge } from "@/components/badge";

<Badge variant="success" type="fill" kind="text">성공</Badge>
<Badge variant="error" type="ghost" kind="number">5</Badge>
```

**Props:**

- `variant`: "default" | "color" | "secondary" | "warning" | "success" | "error"
- `type`: "fill" | "ghost"
- `kind`: "number" | "text"

### SegmentedPicker

세그먼트 선택기 컴포넌트입니다.

```typescript
<SegmentedPicker
  options={[
    { label: "옵션1", value: "1" },
    { label: "옵션2", value: "2" },
  ]}
  value={selectedValue}
  onChange={setSelectedValue}
  columns={2} // 그리드 열 수
/>
```

### FixedButtonView

하단 고정 버튼이 있는 레이아웃 컴포넌트입니다.

```typescript
import { FixedButtonView } from "@/components/fixed-button-view";

<FixedButtonView>{/* 콘텐츠 */}</FixedButtonView>;
```

## 라우팅 구조

Expo Router의 파일 기반 라우팅을 사용합니다.

- `/` → 홈 화면 (게임 목록)
- `/pre-game/[id]` → 게임 시작 전 화면
- `/in-game/[id]` → 게임 진행 화면

### 네비게이션 사용

```typescript
import { useRouter } from "expo-router";

const router = useRouter();
router.push(`/pre-game/${gameId}`);
router.push(`/in-game/${gameId}`);
```

## 개발 가이드라인

### 코드 스타일

1. **TypeScript 사용**: 모든 파일은 TypeScript로 작성
2. **경로 별칭**: `@/`를 사용하여 절대 경로 참조
3. **컴포넌트 네이밍**: PascalCase 사용
4. **파일 네이밍**: kebab-case 사용 (컴포넌트는 예외)

### 컴포넌트 작성 규칙

1. **테마 지원**: 항상 `ThemedView`, `ThemedText` 사용
2. **타입 정의**: Props는 명시적으로 타입 정의
3. **스타일**: StyleSheet 사용 (인라인 스타일 지양)
4. **재사용성**: 공통 로직은 커스텀 훅으로 분리

### 게임 구현 패턴

1. **게임 상태 관리**: `useState` 또는 `useReducer` 사용
2. **타이머**: `TimerProgressBar` 컴포넌트 활용
3. **카운트다운**: `Countdown` 컴포넌트 활용
4. **햅틱 피드백**: `expo-haptics` 사용

### 예시: 게임 화면 구조

```typescript
export default function GameScreen() {
  const game = GAMES_MAP["gameId"];
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [showCountdown, setShowCountdown] = useState(true);

  const handleCountdownComplete = () => {
    setShowCountdown(false);
    setIsTimerRunning(true);
  };

  const handleTimeUp = () => {
    setIsTimerRunning(false);
    // 게임 종료 로직
  };

  return (
    <FixedButtonView>
      <TimerProgressBar
        duration={game.timeLimit}
        isRunning={isTimerRunning}
        onComplete={handleTimeUp}
      />
      <ThemedView>{/* 게임 콘텐츠 */}</ThemedView>
      <Countdown
        startCount={3}
        visible={showCountdown}
        onComplete={handleCountdownComplete}
      />
    </FixedButtonView>
  );
}
```

## 스크립트

- `npm start`: 개발 서버 시작
- `npm run android`: Android 빌드 및 실행
- `npm run ios`: iOS 빌드 및 실행
- `npm run web`: Web 빌드 및 실행
- `npm run lint`: ESLint 실행
- `npm run reset-project`: 프로젝트 초기화

## 주의사항

1. **이미지 경로**: `require()`를 사용하여 이미지 로드
2. **폰트**: Pretendard 폰트는 `app.json`에 등록되어 있음
3. **새 아키텍처**: `newArchEnabled: true` 설정됨
4. **타입 안전성**: Expo Router의 `typedRoutes` 실험 기능 사용

## 향후 개발 방향

- [ ] 게임별 점수화 및 랭킹 시스템
- [ ] 사용자 진행 상황 추적
- [ ] 리포트 및 분석 화면
- [ ] 유료화 패키지 분리
- [ ] 나머지 게임 구현 (도형 회전, Stroop, Go/No-Go 등)

## 참고 자료

- [Expo 문서](https://docs.expo.dev/)
- [Expo Router 문서](https://docs.expo.dev/router/introduction/)
- [React Native 문서](https://reactnative.dev/)
- [프로젝트 시스템 문서](./system.md)
