Expo web is not used in this project.

## Foundation Docs

When changing UI, design-system primitives, or product copy, reference these project-adapted foundation docs:

- [Elevation](docs/foundation/elevation.md)
- [Iconography](docs/foundation/iconography.md)
- [International Design](docs/foundation/international-design.md)
- [Loading](docs/foundation/loading.md)
- [State](docs/foundation/state.md)
- [Voice and Tone](docs/foundation/voice-and-tone.md)
- [Writing](docs/foundation/writing.md)

## Data

Classify every piece of data by its source of truth:

- **Local-first records** (game results, play history): SQLite (`expo-sqlite`) is the source of truth. Write locally, read locally — never wait on the network. Supabase sync is a silent background concern (outbox pattern); sync failures must never block gameplay or surface as UI errors. Never read these from the server in the UI.
- **Server-confirmed writes** (auth/account, payments, anything the server can reject): write to Supabase in realtime with explicit loading and error states. These are never silent.
- **Server reads** (content, server-computed reports): plain Supabase queries via React Query. No special handling.

Every in-app session is authenticated: users sign in with a social provider or get an anonymous Supabase session (skip-login), so local-first records sync for everyone. Account upgrade must use `linkIdentity` (see `linkWithProvider` in `src/lib/auth.ts`) — never `signInWithOAuth` on an anonymous session, which would create a new user and detach already-synced rows.

Rules for local-first tables:

- Primary keys are client-generated UUIDs. Never use auto-increment IDs.
- Every record table has `created_at` and `synced` columns.
- Screens access data only through the repository layer, never raw SQLite.
- Sync pushes are idempotent upserts (`onConflict: 'id'`). Mark `synced` only after a confirmed server response.
- 현재는 개발 진행 중이므로 기존 로컬 데이터 유실을 고려한 마이그레이션은 고려하지 마세요. 해당 작업은 프로덕션 진입 이후에 고려해야 합니다.

Supabase migration files are append-only after `supabase db push`. Treat pushed migrations as already applied history: never edit an existing pushed migration file to change schema or grants. Create a new migration file for follow-up changes instead.

## Layout

Build layouts only with `Box`, `Flex`, `Grid`, `VStack`, `HStack`, and `Float`.

- In `components/**`, prefer Layout component props. Style overrides are allowed only for component-local visual expression that cannot be represented by tokens.
- In `app/**` and `pages/**`, do not use `style` overrides for layout or visual styling outside Layout component props.
- Use design tokens for spacing, sizing, color, radius, and shadow values. Avoid raw visual numbers such as `gap={6}`, `padding: 16`, or `borderRadius: 8`.
- Raw numbers are allowed only for structural values such as `flex={1}`, `columns={2}`, `zIndex`, and `maxLines`.

Bad:

```tsx
<View style={{ display: 'flex', gap: 8, padding: 16 }} />
<Box style={{ marginTop: 16, borderRadius: 8 }} />
```

Good:

```tsx
<VStack gap="x2" p="spacingX.globalGutter">
  <HStack justify="spaceBetween">
    <Grid columns={2} gap="x2" />
  </HStack>
</VStack>
```

If an expression is difficult with existing Layout props or tokens, ask before adding an ad hoc implementation.

## React

React Compiler is enabled (Expo SDK default, opt-out only). Do not add manual `useMemo`, `useCallback`, or `React.memo` for performance — the compiler memoizes render computations automatically, including Skia object creation. Hoist pure computations to module-level functions for readability, not memoization.

This project is on React 19. Use the modern syntax:

- `ref` is a regular prop — never use `forwardRef`.
- Render context providers as `<MyContext value={...}>`, not `<MyContext.Provider value={...}>`.
- Read context with `use(MyContext)`, not `useContext(MyContext)`. `use` may be called conditionally.

Form Actions (`useActionState`, `useOptimistic`, `<form action>`) are web-centric — do not reach for them in this React Native codebase.

## Imports

Do not use barrel files (`index.ts` re-export files). Import directly from the module that defines the symbol, e.g. `import { GameTile } from '../components/games/GameTile'`.

## Verification

Do not run `npx expo start`, `npm run start`, or other long-lived Expo dev servers unless explicitly asked.

Use fast checks like `npx tsc --noEmit`. The user runs and inspects the Expo app manually.
