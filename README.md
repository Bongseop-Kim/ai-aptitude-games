# AI Aptitude Games

기업 AI 역량 검사(인지능력 테스트) 대비용 Expo + React Native 앱입니다.

## Requirements

- Node.js 20+
- npm 10+
- Expo CLI (`npx expo`)
- EAS CLI (`npm i -g eas-cli`, EAS 배포 시 필요)

## Local Development

```bash
npm install
cp .env.example .env
npm run lint
npm run test
npm start
```

## Getting Started (API Base URL)

앱 부팅 시 `EXPO_PUBLIC_API_BASE_URL` 설정을 검증합니다. 값이 없거나 URL 형식이 아니면 앱이 초기화 에러 화면을 표시합니다.

`.env.example`:

```dotenv
EXPO_PUBLIC_API_BASE_URL=http://localhost:4000
```

플랫폼 실행:

```bash
npm run ios
npm run android
npm run web
```

## CI

GitHub Actions `CI` 워크플로(`.github/workflows/ci.yml`)는 아래를 실행합니다.

- `npm ci`
- `npm run lint`
- `npm run test`
- `npx expo-doctor`

트리거:

- `pull_request`
- `push` to `main`

## EAS Build / Update

`eas.json`에 staging 채널과 수동 빌드용 프로필이 포함되어 있습니다.

- `staging`: 내부 배포 채널
- `android-internal`: Android APK internal build
- `ios-simulator`: iOS simulator build

수동 EAS 빌드 워크플로:

- 파일: `.github/workflows/eas-build-dispatch.yml`
- 트리거: `workflow_dispatch`
- 입력: `platform` (`all`, `android`, `ios`)

워크플로는 다음 명령을 실행합니다.

- `eas build --platform android --profile android-internal --non-interactive --no-wait`
- `eas build --platform ios --profile ios-simulator --non-interactive --no-wait`

수동 OTA 업데이트 워크플로:

- 파일: `.github/workflows/eas-update.yml`
- 트리거: `workflow_dispatch`
- 입력:
  - `channel` (`staging`, `production`)
  - `message` (릴리즈 메시지)

## CI Secrets

GitHub repository secrets에 아래 값을 설정해야 합니다.

- `EXPO_TOKEN`: EAS 인증 토큰 (`eas token:create`로 생성)

서명 인증서/프로비저닝은 EAS 서버 자격증명 관리 사용을 권장합니다. 민감정보(.env, keystore, p12, provisioning profile)는 저장소에 커밋하지 마세요.

## Docker Local Preview (Expo Web + Mock API)

`Dockerfile`은 Expo 웹 번들을 빌드해 정적 서버로 제공합니다.

```bash
docker compose up --build
```

서비스:

- 앱 미리보기: `http://localhost:8080`
- Mock API: `http://localhost:4000`
- Mock health: `http://localhost:4000/health`

Mock API 구현 파일: `scripts/mock-backend.mjs`

### Mock API 운영/복구 커맨드

```bash
# Mock API 단독 실행/복구 (권장)
docker compose up -d mock-api

# 상태 확인
docker compose ps mock-api
curl -sS http://localhost:4000/health
```

30분 연속 가용성 증적(기본 5분 간격)은 아래 스크립트로 수집할 수 있습니다.

```bash
bash scripts/mock-api-uptime-probe.sh 30 300
```

Data Analyst 핸드오프용 원라인:

```bash
cd /Users/gimbongseob/git/ai-aptitude-games && docker compose up -d mock-api && curl -sS http://localhost:4000/health
```

## Telemetry Extract (What's New KPI)

`ui.whatsNew.*` 이벤트의 일자별(UTC) / 환경별 KPI 집계는 아래 명령으로 추출할 수 있습니다.

```bash
bash scripts/telemetry/export-whatsnew-kpis.sh <sqlite-db-path>
```

예시:

```bash
bash scripts/telemetry/export-whatsnew-kpis.sh /tmp/db.db
bash scripts/telemetry/export-whatsnew-kpis.sh /tmp/db.db 2026-04-01 2026-04-07
```

출력 컬럼:

- `event_day_utc`
- `environment` (`payload.environment` 우선, 없으면 `device`)
- `shown_count`
- `dismissed_count`
- `clicked_count`
- `error_count`
