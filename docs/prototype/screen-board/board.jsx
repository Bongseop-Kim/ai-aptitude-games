// board.jsx — Figma-style 화면 보드: 모든 화면을 캔버스에 펼쳐 놓기.
// 같은 스크린 컴포넌트를 정적 ctx(board:true)로 렌더해 아트보드에 담는다.

const W = 390, H = 844;

function boardCtx(params = {}, opts = {}) {
  const noop = () => {};
  return {
    nav: noop, back: noop, replace: noop, resetTo: noop, showToast: noop,
    completeGame: noop, setPro: noop, setStreak: noop,
    params, route: { name: '', params },
    isPro: !!opts.isPro, streak: 4, board: true,
    completedGames: Object.fromEntries(GAMES.filter(g => g.done).map(g => [g.id, g.score])),
  };
}

// minimal status bar so each frame reads like a phone screen
function BoardStatusBar() {
  return (
    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 46, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px 0 26px', pointerEvents: 'none', zIndex: 40 }}>
      <span style={{ fontSize: 15, fontWeight: 600, color: T.fg, fontFamily: T.font }}>9:41</span>
      <span style={{ display: 'flex', gap: 6, alignItems: 'center', color: T.fg }}>
        <Sym name="signal_cellular_alt" size={16} fill={1} />
        <Sym name="wifi" size={16} fill={1} />
        <Sym name="battery_full" size={18} fill={1} style={{ transform: 'rotate(90deg)' }} />
      </span>
    </div>
  );
}

function Frame({ children }) {
  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden', background: 'var(--mossy-color-bg-layer-default)' }}>
      {children}
      <BoardStatusBar />
    </div>
  );
}

const ab = (id, label, node) => (
  <DCArtboard key={id} id={id} label={label} width={W} height={H}><Frame>{node}</Frame></DCArtboard>
);

const BILL = { landing: '① 프리미엄 랜딩', compare: '② 플랜 비교', checkout: '③ 결제', success: '④ 결제 성공', manage: '⑤ 구독 관리', cancel: '⑥ 구독 해지' };
const RET = { streak: '스트릭 캘린더', ranking: '주간 랭킹', invite: '친구 초대', event: '주간 대회', push: '알림 센터' };
const REP = ['① 표지', '② 5대 역량', '③ 강·약점 Top 3', '④ 스트레스 복원력', '⑤ 응답 패턴', '⑥ 또래 비교', '⑦ AI 코치'];

function SaeumBoard() {
  return (
    <DesignCanvas>
      <DCSection id="onb" title="온보딩" subtitle="첫 실행 · 5단계">
        {[0, 1, 2, 3, 4].map(s => ab('onb-' + s, `${s + 1}. ${['스플래시', '가치 제안', 'AI 리포트', '분야 선택', '연습 시간'][s]}`, <Onboarding ctx={boardCtx()} initialStep={s} />))}
        <DCPostIt top={-28} left={2030} rotate={-2} width={230}>이모지·돌출 그림자를 걷어내고 Mossy 차분한 톤으로. 마크는 잎새(eco) + 새움.</DCPostIt>
      </DCSection>

      <DCSection id="tabs" title="메인 탭" subtitle="홈 · 게임 · 기록 · 내 정보">
        {ab('home', '홈', <HomeScreen ctx={boardCtx()} />)}
        {ab('games', '게임 목록', <GamesTab ctx={boardCtx()} />)}
        {ab('records', '기록 · 리포트 아카이브', <RecordsTab ctx={boardCtx()} />)}
        {ab('me', '내 정보 (Pro)', <MeTab ctx={boardCtx({}, { isPro: true })} />)}
        <DCPostIt top={-28} left={2} rotate={-2} width={220}>매너온도 → 면접 준비도 게이지로 재해석. 홈·리포트 상단에 배치.</DCPostIt>
      </DCSection>

      <DCSection id="play" title="게임 플레이" subtitle="9개 역량 게임 · 인터랙티브 화면">
        {GAMES.map((g, i) => ab('play-' + g.id, `${i + 1}. ${g.name}`, <GamePlay ctx={boardCtx({ id: g.id })} />))}
      </DCSection>

      <DCSection id="introresult" title="게임 인트로 · 결과" subtitle="9게임 공통 템플릿 (인트로 → 플레이 → 결과)">
        {ab('intro-rps', '인트로 · 가위바위보', <GameIntro ctx={boardCtx({ id: 'rps' })} />)}
        {ab('result-rps', '결과 · 가위바위보', <GameResult ctx={boardCtx({ id: 'rps', score: 81 })} />)}
        {ab('intro-potion', '인트로 · 마법약', <GameIntro ctx={boardCtx({ id: 'potion' })} />)}
        {ab('result-compare', '결과 · 개수 비교', <GameResult ctx={boardCtx({ id: 'compare', score: 88 })} />)}
      </DCSection>

      <DCSection id="report" title="모의고사 & 리포트" subtitle="완주 → AI 분석 → 7섹션 리포트">
        {ab('mockfinish', '모의고사 완주', <MockFinish ctx={boardCtx()} />)}
        {ab('loading', 'AI 분석 로딩', <ReportLoading ctx={boardCtx()} />)}
        {[0, 1, 2, 3, 4, 5, 6].map(s => ab('rep-' + s, `리포트 ${REP[s]}`, <ReportScreen ctx={boardCtx({}, { isPro: true })} initialSec={s} />))}
        <DCPostIt top={-28} left={2} rotate={-2} width={220}>④⑤⑦은 Pro 잠금 섹션. 무료에선 블러 + 잠금 해제 CTA가 덮어요.</DCPostIt>
      </DCSection>

      <DCSection id="billing" title="결제 · 구독" subtitle="Pro 전환 6화면">
        {['landing', 'compare', 'checkout', 'success', 'manage', 'cancel'].map(st => ab('bill-' + st, BILL[st], <BillingScreen ctx={boardCtx({ step: st })} />))}
      </DCSection>

      <DCSection id="retention" title="리텐션 · 성장" subtitle="스트릭 · 랭킹 · 초대 · 대회 · 알림">
        {['streak', 'ranking', 'invite', 'event', 'push'].map(v => ab('ret-' + v, RET[v], <RetentionScreen ctx={boardCtx({ view: v })} />))}
      </DCSection>
    </DesignCanvas>
  );
}

Object.assign(window, { SaeumBoard, boardCtx, Frame });
