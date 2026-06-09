// games.jsx — 게임 인트로 / 진행(인터랙티브) / 결과 + 모의고사 진행 로직
// Per-game play components live on window as Play_<id> (defined here & in games-b.jsx).
const { useState: useS, useEffect: useE, useRef: useR } = React;

// ── shared game shell (HUD) ────────────────────────────────────
function GameStage({ ctx, g, round, total, score, mock, idx, children, footer, instruction }) {
  const [secs, setSecs] = useS(ctx && ctx.board ? 8 : 0);
  useE(() => { if (ctx && ctx.board) return; const t = setInterval(() => setSecs(s => s + 1), 1000); return () => clearInterval(t); }, []);
  const mm = String(Math.floor(secs / 60)).padStart(1, '0');
  const ss = String(secs % 60).padStart(2, '0');
  const exit = () => {
    if (mock) ctx.resetTo('home'); else ctx.nav('games');
  };
  return (
    <Screen bg={T.layer}>
      <div style={{ flex: 'none', paddingTop: 50, background: T.layer }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '4px 12px 10px' }}>
          <button onClick={exit} aria-label="닫기" style={iconBtn}><Sym name="close" size={24} color={T.fg} /></button>
          <div style={{ flex: 1 }}><Progress value={(round / total) * 100} color={g.ink} height={8} /></div>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: 13, fontWeight: 700, color: T.fgMuted }}>
            <Sym name="timer" size={16} color={T.fgSubtle} />{mm}:{ss}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px 8px' }}>
          <span style={{ fontSize: 12, color: T.fgSubtle, fontWeight: 500 }}>
            {mock != null ? `모의고사 ${idx + 1}/9 · ` : ''}{g.name} · {round}/{total}
          </span>
          <span style={{ fontSize: 12, fontWeight: 700, color: g.ink }}>SCORE {score}</span>
        </div>
        {instruction && (
          <div style={{ margin: '0 16px 4px', padding: '10px 12px', background: g.bg, borderRadius: T.r3, fontSize: 13, color: T.fg, lineHeight: 1.45 }}>{instruction}</div>
        )}
      </div>
      <div className="saeum-scroll" style={{ flex: 1, overflowY: 'auto', padding: '8px 16px 16px', display: 'flex', flexDirection: 'column' }}>
        {children}
      </div>
      {footer && <div style={{ flex: 'none', padding: '10px 16px 30px', borderTop: `1px solid ${T.line}`, background: T.layer }}>{footer}</div>}
    </Screen>
  );
}

// ── Intro ──────────────────────────────────────────────────────
function GameIntro({ ctx }) {
  const { id, mock, idx = 0 } = ctx.params;
  const g = gameById(id);
  const best = ctx.completedGames[id];
  const steps = INTRO_STEPS[id] || [];
  return (
    <Screen bg={T.layer}>
      <Header onBack={mock ? () => ctx.resetTo('home') : ctx.back} sub={mock != null ? `모의고사 ${idx + 1} / 9` : '게임'} title="" border={false}
        right={<IconButton icon="volume_up" aria-label="소리" variant="ghost" />} />
      <Body bottomPad={120}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', paddingTop: 8 }}>
          <span style={{ width: 84, height: 84, borderRadius: T.r5, background: g.bg, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
            <Sym name={g.icon} size={48} fill={1} color={g.ink} />
          </span>
          <div style={{ fontSize: 25, fontWeight: 700, letterSpacing: '-0.02em', color: T.fg }}>{g.name}</div>
          <div style={{ marginTop: 6, display: 'inline-flex' }}><Tag selected leadingIcon="psychology">{g.cog}</Tag></div>
        </div>

        <div style={{ marginTop: 20, display: 'flex', gap: 10 }}>
          <StatBox label="최고 점수" value={best ? best : '—'} />
          <StatBox label="예상 시간" value={`${g.min}분`} />
          <StatBox label="문항" value={`${ROUNDS[id] || 10}`} />
        </div>

        <SectionHead title="이렇게 진행돼요" />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {steps.map((s, i) => (
            <Card key={i} pad={12} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ width: 26, height: 26, borderRadius: T.full, background: g.bg, color: g.ink, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, flex: 'none' }}>{i + 1}</span>
              <span style={{ fontSize: 14, color: T.fg, lineHeight: 1.4 }}>{s}</span>
            </Card>
          ))}
        </div>

        <Banner tone="neutral" icon="lightbulb" style={{ marginTop: 14 }}>
          {COG_TIP[id] || '점수보다 응답의 일관성이 더 중요하게 평가돼요.'}
        </Banner>
      </Body>
      <div style={{ flex: 'none', padding: '10px 16px 30px', borderTop: `1px solid ${T.line}`, background: T.layer }}>
        <Button variant="brand" size="large" fullWidth trailingIcon="play_arrow"
          onClick={() => ctx.nav('gamePlay', { id, mock, idx })}>{mock != null ? '시작' : '연습 시작'}</Button>
      </div>
    </Screen>
  );
}

function StatBox({ label, value }) {
  return (
    <div style={{ flex: 1, padding: '12px 8px', borderRadius: T.r3, border: `1px solid ${T.line}`, textAlign: 'center' }}>
      <div style={{ fontSize: 20, fontWeight: 700, color: T.fg }}>{value}</div>
      <div style={{ fontSize: 11, color: T.fgSubtle, marginTop: 2 }}>{label}</div>
    </div>
  );
}

// ── Play dispatcher ────────────────────────────────────────────
function GamePlay({ ctx }) {
  const { id, mock, idx = 0 } = ctx.params;
  const g = gameById(id);
  const finish = (score) => {
    ctx.completeGame(id, score);
    ctx.nav('gameResult', { id, score, mock, idx });
  };
  const Comp = window['Play_' + id];
  if (!Comp) return <GameStage ctx={ctx} g={g} round={1} total={1} score={0} mock={mock} idx={idx} footer={<Button variant="brand" fullWidth onClick={() => finish(g.score)}>결과 보기</Button>}><div style={{ color: T.fgSubtle, margin: 'auto' }}>준비 중인 게임이에요.</div></GameStage>;
  return <Comp ctx={ctx} g={g} mock={mock} idx={idx} finish={finish} />;
}

// ── Result ─────────────────────────────────────────────────────
function GameResult({ ctx }) {
  const { id, score = 0, mock, idx = 0 } = ctx.params;
  const g = gameById(id);
  const grade = score >= 85 ? 'A' : score >= 75 ? 'A-' : score >= 65 ? 'B+' : score >= 55 ? 'B' : 'C';
  const completed = Object.keys(ctx.completedGames).length;
  const isMock = mock != null;
  const last = isMock && idx >= 8;

  const nextMock = () => {
    if (last) { ctx.nav('mockFinish'); }
    else { const ng = GAMES[idx + 1]; ctx.nav('gameIntro', { id: ng.id, mock: true, idx: idx + 1 }); }
  };

  return (
    <Screen bg={T.layer}>
      <Header onBack={() => ctx.nav(isMock ? 'home' : 'games')} title="" sub={isMock ? `모의고사 ${idx + 1} / 9` : '결과'}
        right={<IconButton icon="ios_share" aria-label="공유" variant="ghost" />} />
      <Body bottomPad={120}>
        <div style={{ textAlign: 'center', paddingTop: 4 }}>
          <span style={{ width: 56, height: 56, borderRadius: T.r4, background: g.bg, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
            <Sym name={g.icon} size={32} fill={1} color={g.ink} />
          </span>
          <div style={{ fontSize: 13, color: T.fgSubtle, marginTop: 8 }}>{g.name}</div>
        </div>

        <Card pad={18} bg={T.bnGreen} border={false} style={{ marginTop: 14, textAlign: 'center', animation: 'saeum-pop .4s var(--mossy-timing-function-enter)' }}>
          <div style={{ fontSize: 13, color: T.fgMuted }}>최종 점수</div>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: 6, marginTop: 2 }}>
            <span style={{ fontSize: 52, fontWeight: 700, lineHeight: 1, color: T.fg, letterSpacing: '-0.02em' }}>{score}</span>
            <span style={{ fontSize: 16, color: T.fgSubtle }}>/ 100</span>
          </div>
          <div style={{ marginTop: 8 }}><Badge variant="positive" style={{ fontSize: 13, height: 24, padding: '0 12px' }}>{grade}</Badge></div>
        </Card>

        <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
          <StatBox label="정답률" value={`${Math.round(60 + score * 0.35)}%`} />
          <StatBox label="평균 응답" value={RESP_TIME[id] || '1.2s'} />
          <StatBox label="또래 대비" value={`상위 ${Math.max(8, 100 - score)}%`} />
        </div>

        <Card pad={12} bg={T.bnYellow} border={false} style={{ marginTop: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Sym name="psychology" size={18} fill={1} color={T.yellowDeep} />
            <span style={{ fontSize: 13, fontWeight: 700, color: T.fg }}>{g.cog}</span>
          </div>
          <div style={{ fontSize: 13, color: T.fgMuted, marginTop: 4, lineHeight: 1.45 }}>{COG_DESC[id]}</div>
        </Card>

        {/* teaser → mock/report */}
        {!isMock && (
          <Card pad={12} bg={T.inverted} border={false} style={{ marginTop: 12 }} onClick={() => ctx.nav('gameIntro', { id: 'rps', mock: true, idx: 0 })}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Sym name="lock" size={22} color="var(--mossy-color-palette-mossy-500)" />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: T.fgInv }}>전체 리포트는 모의고사 완료 시 열려요</div>
                <div style={{ fontSize: 11, color: 'var(--mossy-color-palette-gray-600)', marginTop: 2 }}>9게임 완주 · {completed}/9 완료</div>
                <div style={{ marginTop: 6 }}><Progress value={(completed / 9) * 100} color={T.brandSolid} height={4} track="var(--mossy-color-palette-gray-700)" /></div>
              </div>
              <Pill tone="brand">모의고사</Pill>
            </div>
          </Card>
        )}
      </Body>
      <div style={{ flex: 'none', padding: '10px 16px 30px', borderTop: `1px solid ${T.line}`, background: T.layer, display: 'grid', gridTemplateColumns: isMock ? '1fr' : '1fr 1.4fr', gap: 8 }}>
        {!isMock && <Button variant="outline" size="large" onClick={() => ctx.nav('gamePlay', { id })}>다시</Button>}
        <Button variant="brand" size="large" trailingIcon="arrow_forward" onClick={isMock ? nextMock : () => ctx.nav('games')}>
          {isMock ? (last ? '결과 종합하기' : '다음 게임') : '게임 목록'}
        </Button>
      </div>
    </Screen>
  );
}

// ── shared content tables ──────────────────────────────────────
const ROUNDS = { rps: 5, rotate: 4, promise: 4, potion: 5, path: 4, numbers: 5, memory: 6, cat: 4, compare: 8 };
const RESP_TIME = { rps: '0.9s', rotate: '3.2s', promise: '12s', potion: '—', path: '18s', numbers: '—', memory: '1.8s', cat: '6.4s', compare: '0.45s' };
const COG_DESC = {
  rps: '지시와 반대로 반응하는 능력. 습관적 반응을 억누르는 전두엽 기능이에요.',
  rotate: '머릿속에서 도형을 돌려보는 시공간 작업기억. 설계·공간 직무와 연관돼요.',
  promise: '흩어진 단서를 통합해 결론을 끌어내는 논리적 추론 능력이에요.',
  potion: '결과를 보고 숨은 규칙을 찾아내는 귀납 추론. 실패에서 배우는 속도가 중요해요.',
  path: '전체를 조망하며 순서를 세우는 계획력. 자원이 제한된 상황의 의사결정이에요.',
  numbers: '정보를 잠깐 붙잡아 거꾸로 다루는 작업기억(Digit Span)이에요.',
  memory: '계속 바뀌는 정보를 갱신·유지하는 N-back 능력. 멀티태스킹과 연관돼요.',
  cat: '자기 판단의 정확성을 아는 메타인지. 확신과 실제가 얼마나 일치하는지 봐요.',
  compare: '세지 않고 수량을 직관적으로 어림하는 수 감각(Subitizing)이에요.',
};
const COG_TIP = {
  rps: '규칙이 매 라운드 바뀌어요. 손이 먼저 나가지 않게 한 박자 참아요.',
  potion: '오답도 학습 신호예요. 틀린 조합이 다음 판의 힌트가 돼요.',
  compare: '크기 착시에 속지 마세요. 점의 개수만 보세요.',
};
const INTRO_STEPS = {
  rps: ['매 라운드 규칙이 바뀌어요 (이기기/지기/비기기)', 'AI가 낸 손을 보고', '규칙에 맞는 손을 빠르게 골라요'],
  rotate: ['왼쪽(전) 도형을 오른쪽(후) 모양으로 만들어요', '회전·반전 버튼을 순서대로 눌러', '최소 클릭으로 답안을 제출해요'],
  promise: ['세 친구의 단서를 하나씩 확인하고', '겹치는 조건을 머릿속에서 통합해', '약속 장소를 추론해 골라요'],
  potion: ['네 가지 재료의 조합을 보고', '파란약·빨간약 중 무엇이 될지 예측해요', '결과를 확인하며 규칙을 찾아가요'],
  path: ['격자에 울타리를 놓아', '사람과 자동차의 길을 분리해요', '정해진 울타리 수 안에서 완성해요'],
  numbers: ['숫자가 잠깐 나타났다 사라져요', '순서를 거꾸로 떠올려', '키패드로 역순 입력해요'],
  memory: ['도형이 하나씩 제시돼요', '2번째·3번째 전 도형과 같은지', '매번 빠르게 판단해요'],
  cat: ['생쥐가 숨은 위치를 외우고', '고양이가 그 자리를 찾았는지', '확신하는 만큼 표시해요'],
  compare: ['양쪽 점이 0.4초간 번쩍여요', '어느 쪽이 더 많은지', '직관적으로 빠르게 탭해요'],
};

// ── Games tab (list) ───────────────────────────────────────────
function GamesTab({ ctx }) {
  const [filter, setFilter] = useS('all');
  const cats = [['all', '전체'], ['done', '완료'], ['todo', '미완료']];
  const list = GAMES.filter(g => filter === 'all' ? true : filter === 'done' ? g.done : !g.done);
  return (
    <Screen bg={T.basement}>
      <div style={{ flex: 'none', paddingTop: 50, background: T.layer, borderBottom: `1px solid ${T.line}` }}>
        <div style={{ padding: '4px 16px 10px' }}>
          <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em', color: T.fg }}>게임</div>
          <div style={{ fontSize: 13, color: T.fgSubtle, marginTop: 1 }}>9개 역량 게임 · 매일 새 문항</div>
        </div>
      </div>
      <Body bottomPad={104}>
        <Card pad={14} bg={T.inverted} border={false} radius={T.r5} style={{ marginBottom: 14 }} onClick={() => ctx.nav('gameIntro', { id: 'rps', mock: true, idx: 0 })}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Sym name="emoji_events" size={28} fill={1} color="var(--mossy-color-palette-mossy-500)" />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: T.fgInv }}>모의고사 한 번에 9게임</div>
              <div style={{ fontSize: 12, color: 'var(--mossy-color-palette-gray-600)', marginTop: 1 }}>완주하면 종합 리포트가 열려요 · 22분</div>
            </div>
            <Sym name="arrow_forward" size={22} color="#fff" />
          </div>
        </Card>

        <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
          {cats.map(([v, l]) => <Tag key={v} selected={filter === v} onClick={() => setFilter(v)}>{l}</Tag>)}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {list.map(g => (
            <Card key={g.id} pad={12} onClick={() => ctx.nav('gameIntro', { id: g.id })} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ width: 44, height: 44, borderRadius: T.r3, background: g.bg, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}>
                <Sym name={g.icon} size={26} fill={1} color={g.ink} />
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: 15, fontWeight: 700, color: T.fg }}>{g.name}</span>
                  {g.done && <Sym name="check_circle" size={16} fill={1} color={T.positive} />}
                </div>
                <div style={{ fontSize: 12, color: T.fgSubtle, marginTop: 1 }}>{g.cog} · {g.min}분</div>
                <div style={{ marginTop: 6, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ flex: 1 }}><Progress value={g.score} color={g.ink} height={5} /></div>
                  <span style={{ fontSize: 12, fontWeight: 700, color: T.fg }}>{g.score}</span>
                </div>
              </div>
              <Sym name="chevron_right" size={20} color={T.fgSubtle} />
            </Card>
          ))}
        </div>
      </Body>
    </Screen>
  );
}

Object.assign(window, { GameIntro, GamePlay, GameResult, GameStage, StatBox, ROUNDS, GamesTab });
