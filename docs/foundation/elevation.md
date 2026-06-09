# Elevation

UI 요소 간 깊이와 쌓임 계층 표현을 위한 가이드.

## 원칙

- **표면색 우선** - 고도는 먼저 `bg.layerBasement`, `bg.layerDefault`, `bg.layerFloating` 같은 배경 토큰으로 표현한다.
- **스트로크 다음, 그림자는 마지막** - 구분이 더 필요하면 `stroke.*` 토큰을 쓰고, 그림자는 주목도가 높은 표면에만 제한한다.
- **쌓임은 구조로 해결** - 화면 전체를 덮는 흐름은 네비게이션, 모달, 시트 같은 프레젠테이션 구조로 처리한다. `zIndex`는 같은 React Native 레이아웃 트리 안에서만 사용한다.

## Global Level

| Level | 역할 | 표현 |
| --- | --- | --- |
| 0 | 화면 최하단 배경 | `bg.layerBasement` |
| 1 | 페이지 기본 표면 | `bg.layerDefault` |
| 2 | 화면 위에 뜨는 시트, 메뉴, 오버레이 | 네비게이션/모달 프레젠테이션 + `bg.layerFloating` |
| 3 | 최상위 알림, 확인 다이얼로그 | 네이티브 모달 프레젠테이션 |

Level 2 이상의 표면 안에 놓이는 콘텐츠는 그 표면을 새 기준으로 삼고 Local Level을 다시 적용한다.

## Local Level

| Level | 역할 | 대표 요소 |
| --- | --- | --- |
| 1 | 페이지 안의 기본 콘텐츠 | Card, ListItem, Tabs, Section |
| 2 | 기본 콘텐츠 위에 뜨는 플로팅 표면 | Floating action, sticky control |
| 3 | 일시적 피드백 | Toast, Snackbar |

같은 레벨 안에서 겹침이 생기면 레벨을 올리지 말고 표면색, 스트로크, 그림자로 구분한다.

## 표현 수단

| 수단 | 토큰 | 적용 경로 |
| --- | --- | --- |
| Surface color | `bg.layerBasement`, `bg.layerDefault`, `bg.layerFloating`, `bg.neutralWeak` | Layout `bg`/`background` prop |
| Stroke | `stroke.neutralSubtle`, `stroke.neutralWeak`, `stroke.neutralMuted`, `stroke.brandWeak` | Layout `borderColor`, `borderWidth` props |
| Shadow | `surface`, `floating` | Layout `boxShadow` prop |

## Shadow 토큰

| Token | 용도 |
| --- | --- |
| `surface` | 카드, 고정 헤더처럼 기본 표면에서 살짝 떠 있는 요소 |
| `floating` | 시트, 메뉴, 플로팅 컨트롤처럼 더 높은 표면 |

그림자는 다크 모드에서 대비가 약해질 수 있으므로 표면색과 스트로크를 먼저 검토한다.

## 구현

Layout 컴포넌트 props로 표현한다. `app/**`와 `pages/**`에서는 스타일 객체로 고도를 직접 만들지 않는다.

```tsx
<Box bg="bg.layerDefault" borderColor="stroke.neutralSubtle" borderWidth="thin" borderRadius="r3">
  {children}
</Box>

<Box bg="bg.layerFloating" boxShadow="floating" borderRadius="r4">
  {children}
</Box>
```
