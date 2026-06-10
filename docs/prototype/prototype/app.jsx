// app.jsx — 역검 router, tab bar, and iOS-frame mount.
// Screen components are resolved from window at render time, so file load order is flexible
// as long as ReactDOM render runs last (it does — in the main HTML inline script).

const { useState, useCallback, useRef, useEffect } = React;

const TAB_ROUTES = ['home', 'games', 'records', 'me'];
const TABS = [
  { value: 'home', label: '홈', icon: 'home' },
  { value: 'games', label: '게임', icon: 'stadia_controller' },
  { value: 'records', label: '기록', icon: 'insights' },
  { value: 'me', label: '내 정보', icon: 'person' },
];

// route → screen component name on window
const ROUTE_COMPONENT = {
  onboarding: 'Onboarding',
  home: 'HomeScreen',
  games: 'GamesTab',
  records: 'RecordsTab',
  me: 'MeTab',
  gameIntro: 'GameIntro',
  gamePlay: 'GamePlay',
  gameResult: 'GameResult',
  mockFinish: 'MockFinish',
  reportLoading: 'ReportLoading',
  report: 'ReportScreen',
  billing: 'BillingScreen',
  retention: 'RetentionScreen',
};

function useToast() {
  const [toast, setToast] = useState(null);
  const tref = useRef(null);
  const show = useCallback((msg, opts = {}) => {
    setToast({ msg, ...opts });
    clearTimeout(tref.current);
    tref.current = setTimeout(() => setToast(null), opts.duration || 2200);
  }, []);
  return { toast, showToast: show, clearToast: () => setToast(null) };
}

function SaeumApp() {
  // history stack of {name, params}
  const [stack, setStack] = useState([{ name: 'onboarding', params: {} }]);
  const [isPro, setPro] = useState(false);
  const [completedGames, setCompletedGames] = useState(() => {
    const s = {}; GAMES.forEach(g => { if (g.done) s[g.id] = g.score; }); return s;
  });
  const [streak, setStreak] = useState(4);
  const { toast, showToast, clearToast } = useToast();
  const scrollRef = useRef(null);

  const cur = stack[stack.length - 1];

  const nav = useCallback((name, params = {}) => {
    setStack(s => {
      // tabs reset the stack to a single root (preserve no deep history between tabs)
      if (TAB_ROUTES.includes(name)) return [{ name, params }];
      return [...s, { name, params }];
    });
  }, []);
  const back = useCallback(() => {
    setStack(s => (s.length > 1 ? s.slice(0, -1) : s));
  }, []);
  const replace = useCallback((name, params = {}) => {
    setStack(s => [...s.slice(0, -1), { name, params }]);
  }, []);
  const resetTo = useCallback((name, params = {}) => setStack([{ name, params }]), []);

  // scroll to top on route change
  useEffect(() => { if (scrollRef.current) scrollRef.current.scrollTop = 0; }, [stack.length, cur.name]);

  const ctx = {
    nav, back, replace, resetTo, route: cur, params: cur.params || {},
    isPro, setPro, showToast, completedGames,
    completeGame: (id, score) => setCompletedGames(c => ({ ...c, [id]: score })),
    streak, setStreak,
  };

  const showTabs = TAB_ROUTES.includes(cur.name);
  const CompName = ROUTE_COMPONENT[cur.name];
  const Comp = window[CompName];

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px 0', background: 'var(--mossy-color-bg-layer-basement)' }}>
      <IOSDevice width={390} height={844}>
        <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}>
          {/* screen */}
          <div ref={scrollRef} style={{ position: 'absolute', inset: 0 }}>
            {Comp ? <Comp ctx={ctx} key={cur.name + JSON.stringify(cur.params)} /> : (
              <Screen><Header title="준비 중" onBack={back} /><Body><div style={{ color: T.fgSubtle }}>화면을 찾을 수 없어요: {cur.name}</div></Body></Screen>
            )}
          </div>

          {/* bottom nav */}
          {showTabs && (
            <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, zIndex: 30 }}>
              <BottomNav
                items={TABS}
                value={cur.name}
                onChange={(v) => nav(v)}
                style={{ paddingBottom: 24, background: T.floating }}
              />
            </div>
          )}

          {/* toast */}
          {toast && (
            <div style={{ position: 'absolute', left: 0, right: 0, bottom: showTabs ? 96 : 56, display: 'flex', justifyContent: 'center', padding: '0 16px', zIndex: 60, pointerEvents: 'none' }}>
              <div style={{ animation: 'saeum-toast .25s var(--mossy-timing-function-enter)' }}>
                <Toast icon={toast.icon} action={toast.action}>{toast.msg}</Toast>
              </div>
            </div>
          )}
        </div>
      </IOSDevice>
    </div>
  );
}

Object.assign(window, { SaeumApp });
