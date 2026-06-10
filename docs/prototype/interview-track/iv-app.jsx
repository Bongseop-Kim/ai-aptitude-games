// iv-app.jsx — 실전 면접 트랙 라우터 + 하단탭 + Tweaks 패널 + 마운트
const { useState: useApp, useCallback: useAppCb, useRef: useAppRef, useEffect: useAppE } = React;

const IV_TABS = [
  { value: 'home', label: '홈', icon: 'home' },
  { value: 'games', label: '게임', icon: 'stadia_controller' },
  { value: 'interview', label: '면접', icon: 'videocam' },
  { value: 'records', label: '기록', icon: 'insights' },
  { value: 'me', label: '내 정보', icon: 'person' },
];

const IV_ROUTE = {
  ivHub: 'InterviewHub',
  ivStub: 'IVStub',
  ivResume: 'IVResume',
  ivJob: 'IVJob',
  ivAnalysis: 'IVAnalysis',
  ivInterview: 'IVInterview',
  ivFeedback: 'IVFeedback',
  ivRetry: 'IVRetry',
};
const TAB_LIKE = ['ivHub', 'ivStub'];

const IV_TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "unlockPro": false
}/*EDITMODE-END*/;

function InterviewTrackApp() {
  const [t, setTweak] = useTweaks(IV_TWEAK_DEFAULTS);
  const [stack, setStack] = useApp([{ name: 'ivHub', params: {} }]);
  const [toast, setToast] = useApp(null);
  const tref = useAppRef(null);
  const scrollRef = useAppRef(null);

  const cur = stack[stack.length - 1];

  const showToast = useAppCb((msg, opts = {}) => {
    setToast({ msg, ...opts }); clearTimeout(tref.current);
    tref.current = setTimeout(() => setToast(null), opts.duration || 2200);
  }, []);
  const nav = useAppCb((name, params = {}) => setStack(s => [...s, { name, params }]), []);
  const back = useAppCb(() => setStack(s => (s.length > 1 ? s.slice(0, -1) : s)), []);
  const replace = useAppCb((name, params = {}) => setStack(s => [...s.slice(0, -1), { name, params }]), []);
  const resetTo = useAppCb((name, params = {}) => setStack([{ name, params }]), []);

  useAppE(() => { if (scrollRef.current) scrollRef.current.scrollTop = 0; }, [stack.length, cur.name]);

  const ctx = {
    nav, back, replace, resetTo, route: cur, params: cur.params || {},
    tweaks: t, isPro: !!t.unlockPro, setPro: (v) => setTweak('unlockPro', !!v),
    showToast,
  };

  const showTabs = TAB_LIKE.includes(cur.name);
  const curTab = cur.name === 'ivStub' ? (cur.params.tab || 'home') : 'interview';
  const Comp = window[IV_ROUTE[cur.name]];

  const onTab = (v) => { if (v === 'interview') resetTo('ivHub'); else resetTo('ivStub', { tab: v }); };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px 0', background: 'var(--mossy-color-bg-layer-basement)' }}>
      <IOSDevice width={390} height={844}>
        <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}>
          <div ref={scrollRef} style={{ position: 'absolute', inset: 0 }}>
            {Comp ? <Comp ctx={ctx} key={cur.name + JSON.stringify(cur.params)} /> : (
              <Screen><Header title="준비 중" onBack={back} /><Body><div style={{ color: T.fgSubtle }}>화면을 찾을 수 없어요: {cur.name}</div></Body></Screen>
            )}
          </div>

          {showTabs && (
            <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, zIndex: 30 }}>
              <BottomNav items={IV_TABS} value={curTab} onChange={onTab} style={{ paddingBottom: 24, background: T.floating }} />
            </div>
          )}

          {toast && (
            <div style={{ position: 'absolute', left: 0, right: 0, bottom: showTabs ? 96 : 56, display: 'flex', justifyContent: 'center', padding: '0 16px', zIndex: 60, pointerEvents: 'none' }}>
              <div style={{ animation: 'saeum-toast .25s var(--mossy-timing-function-enter)' }}>
                <Toast icon={toast.icon} action={toast.action}>{toast.msg}</Toast>
              </div>
            </div>
          )}
        </div>
      </IOSDevice>

      {/* Tweaks — 디바이스 밖, 호스트 토글 시에만 표시 */}
      <TweaksPanel title="Tweaks">
        <TweakSection label="상태" />
        <TweakToggle label="Pro 잠금 해제 (시선·전달력)" value={t.unlockPro} onChange={(v) => setTweak('unlockPro', v)} />
      </TweaksPanel>
    </div>
  );
}

Object.assign(window, { InterviewTrackApp });
