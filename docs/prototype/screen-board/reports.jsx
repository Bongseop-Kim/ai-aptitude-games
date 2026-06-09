// reports.jsx — 모의고사 완주 → 로딩 → 7섹션 리포트 → 아카이브(기록 탭) + 공유 시트
const { useState: useRp, useEffect: useRpE } = React;

const FIVE = [
  { key: 'trust', name: '신뢰', score: 82, pct: 88, color: T.mossy600, desc: '책임감·윤리 판단', r: 0.38 },
  { key: 'strategy', name: '전략', score: 74, pct: 72, color: T.blue, desc: '다중 조건·문제 해결', r: 0.32 },
  { key: 'relation', name: '관계', score: 68, pct: 55, color: T.red, desc: '협업·갈등 조율', r: 0.30 },
  { key: 'value', name: '가치', score: 77, pct: 78, color: T.purple, desc: '내재 동기·가치 수용', r: 0.28 },
  { key: 'fit', name: '조직적합', score: 71, pct: 66, color: T.green, desc: '유연성·융화 속도', r: 0.31 },
];

// ── A. 모의고사 완주 ───────────────────────────────────────────
function MockFinish({ ctx }) {
  const scores = GAMES.map(g => ({ g, s: g.score }));
  return (
    <Screen bg={T.layer}>
      <Header onBack={() => ctx.resetTo('home')} title="" sub="모의고사 · 1회차" center
        right={<IconButton icon="close" aria-label="닫기" variant="ghost" onClick={() => ctx.resetTo('home')} />} />
      <Body bottomPad={150}>
        <div style={{ textAlign: 'center', paddingTop: 8, animation: 'saeum-pop .5s var(--mossy-timing-function-enter)' }}>
          <span style={{ width: 76, height: 76, borderRadius: T.full, background: T.brandWeak, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
            <Sym name="emoji_events" size={44} fill={1} color={T.brand} />
          </span>
          <div style={{ fontSize: 26, fontWeight: 700, color: T.fg, marginTop: 12, letterSpacing: '-0.02em' }}>완주했어요!</div>
          <div style={{ fontSize: 14, color: T.fgMuted, marginTop: 4 }}>9개 게임, 240문항을 모두 풀었어요</div>
        </div>

        <Card pad={14} style={{ marginTop: 18 }}>
          <div style={{ display: 'flex' }}>
            {[['소요 시간', '22:14'], ['평균 점수', '76'], ['완료율', '100%']].map(([l, v], i) => (
              <div key={i} style={{ flex: 1, textAlign: 'center', borderRight: i < 2 ? `1px solid ${T.line}` : 'none' }}>
                <div style={{ fontSize: 20, fontWeight: 700, color: i === 1 ? T.brand : T.fg }}>{v}</div>
                <div style={{ fontSize: 11, color: T.fgSubtle, marginTop: 2 }}>{l}</div>
              </div>
            ))}
          </div>
        </Card>

        <SectionHead title="게임별 점수" />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8 }}>
          {scores.map(({ g, s }) => (
            <div key={g.id} style={{ padding: 10, borderRadius: T.r3, border: `1px solid ${T.line}`, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Sym name={g.icon} size={18} fill={1} color={g.ink} />
              <div>
                <div style={{ fontSize: 10, color: T.fgSubtle }}>G{GAMES.indexOf(g) + 1}</div>
                <div style={{ fontSize: 15, fontWeight: 700, color: s >= 80 ? T.positive : s >= 70 ? T.fg : 'var(--mossy-color-manner-temp-l7-text)' }}>{s}</div>
              </div>
            </div>
          ))}
        </div>

        <Banner tone="positive" icon="workspace_premium" style={{ marginTop: 14 }}>신규 뱃지 · 첫 완주를 획득했어요!</Banner>
      </Body>
      <div style={{ flex: 'none', padding: '10px 16px 30px', borderTop: `1px solid ${T.line}`, background: T.layer }}>
        <Button variant="brand" size="large" fullWidth leadingIcon="auto_awesome" onClick={() => ctx.nav('reportLoading')}>AI 리포트 생성하기</Button>
        <div style={{ textAlign: 'center', marginTop: 8 }}>
          <button onClick={() => ctx.resetTo('home')} style={{ border: 'none', background: 'transparent', color: T.fgSubtle, fontFamily: T.font, fontSize: 13, cursor: 'pointer' }}>나중에 · 홈으로</button>
        </div>
      </div>
    </Screen>
  );
}

// ── B. AI 분석 로딩 ────────────────────────────────────────────
function ReportLoading({ ctx }) {
  const steps = ['240개 응답 수집', '인지 기제별 점수 산출', '5대 역량 매핑', '또래 집단 비교 (N=12,400)', '스트레스 패턴 추출', 'AI 코치 플랜 생성'];
  const [done, setDone] = useRp(ctx.board ? 3 : 0);
  useRpE(() => {
    if (ctx.board) return;
    const iv = setInterval(() => setDone(d => d + 1), 600);
    const t = setTimeout(() => ctx.replace('report'), 4200);
    return () => { clearInterval(iv); clearTimeout(t); };
  }, []);
  const pct = Math.min(100, Math.round((done / steps.length) * 100));
  return (
    <Screen bg={T.layer}>
      <div style={{ flex: 'none', paddingTop: 50 }}><div style={{ padding: '8px 16px', fontSize: 13, color: T.fgSubtle }}>AI 분석 중</div></div>
      <Body>
        <div style={{ textAlign: 'center', paddingTop: 28 }}>
          <div style={{ width: 110, height: 110, margin: '0 auto', position: 'relative' }}>
            <svg width="110" height="110" style={{ transform: 'rotate(-90deg)' }}>
              <circle cx="55" cy="55" r="48" fill="none" stroke={T.neutralWeak} strokeWidth="8" />
              <circle cx="55" cy="55" r="48" fill="none" stroke={T.brandSolid} strokeWidth="8" strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 48 * (pct / 100)} ${2 * Math.PI * 48}`} style={{ transition: 'stroke-dasharray .5s' }} />
            </svg>
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, fontWeight: 700, color: T.fg }}>{pct}%</div>
          </div>
          <div style={{ fontSize: 18, fontWeight: 700, color: T.fg, marginTop: 16 }}>리포트를 만들고 있어요</div>
          <div style={{ fontSize: 13, color: T.fgSubtle, marginTop: 2 }}>약 3~5초 소요</div>
        </div>
        <div style={{ marginTop: 28, display: 'flex', flexDirection: 'column', gap: 12 }}>
          {steps.map((s, i) => {
            const isDone = i < done, active = i === done;
            return (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ width: 22, height: 22, borderRadius: T.full, flex: 'none', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: isDone ? T.brandSolid : T.layer, border: `2px solid ${isDone ? T.brandSolid : active ? T.fg : T.lineWeak}` }}>
                  {isDone ? <Sym name="check" size={14} color="#fff" /> : active ? <span style={{ width: 6, height: 6, borderRadius: T.full, background: T.fg }} /> : null}
                </span>
                <span style={{ fontSize: 14, fontWeight: active ? 700 : 400, color: isDone || active ? T.fg : T.fgSubtle }}>{s}</span>
                {active && <span style={{ marginLeft: 'auto', fontSize: 12, color: T.fgSubtle }}>분석 중…</span>}
              </div>
            );
          })}
        </div>
        <Banner tone="warning" icon="lightbulb" style={{ marginTop: 22 }}>
          AI 면접에서는 점수보다 <b>응답 일관성·변동 폭</b>이 더 중요하게 평가돼요.
        </Banner>
      </Body>
    </Screen>
  );
}

// ── Radar chart ────────────────────────────────────────────────
function Radar({ data = FIVE, size = 250 }) {
  const cx = size / 2, cy = size / 2 + 4, r = size * 0.32;
  const pt = (i, ratio) => { const a = -Math.PI / 2 + (i * 2 * Math.PI) / 5; return [cx + Math.cos(a) * r * ratio, cy + Math.sin(a) * r * ratio]; };
  const poly = (fn) => data.map((d, i) => pt(i, fn(d, i)).join(',')).join(' ');
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {[0.25, 0.5, 0.75, 1].map(rr => <polygon key={rr} points={poly(() => rr)} fill="none" stroke="var(--mossy-color-stroke-neutral-subtle)" strokeWidth="1" />)}
      {data.map((_, i) => { const [x, y] = pt(i, 1); return <line key={i} x1={cx} y1={cy} x2={x} y2={y} stroke="var(--mossy-color-stroke-neutral-subtle)" strokeWidth="1" />; })}
      <polygon points={poly((_, i) => 0.62 + (i % 3) * 0.03)} fill="var(--mossy-color-palette-gray-400)" fillOpacity="0.3" stroke="var(--mossy-color-palette-gray-500)" strokeWidth="1.5" strokeDasharray="3 3" />
      <polygon points={poly(d => d.score / 100)} fill="var(--mossy-color-bg-brand-solid)" fillOpacity="0.22" stroke="var(--mossy-color-bg-brand-solid)" strokeWidth="2.5" />
      {data.map((d, i) => { const [x, y] = pt(i, d.score / 100); return <circle key={i} cx={x} cy={y} r="4" fill="var(--mossy-color-bg-layer-default)" stroke="var(--mossy-color-bg-brand-solid)" strokeWidth="2" />; })}
      {data.map((d, i) => { const [x, y] = pt(i, 1.22); return (<g key={i}><text x={x} y={y - 1} textAnchor="middle" fontFamily="var(--mossy-font-family-base)" fontWeight="700" fontSize="13" fill="var(--mossy-color-fg-neutral)">{d.name}</text><text x={x} y={y + 13} textAnchor="middle" fontFamily="var(--mossy-font-family-base)" fontSize="11" fill="var(--mossy-color-fg-neutral-subtle)">{d.score}</text></g>); })}
    </svg>
  );
}

// ── 7-section report ───────────────────────────────────────────
function ReportScreen({ ctx, initialSec = 0 }) {
  const [sec, setSec] = useRp(initialSec);
  const [share, setShare] = useRp(false);
  const SECTIONS = [
    { t: '종합 리포트', locked: false, render: RCover },
    { t: '5대 역량 프로필', locked: false, render: RRadar },
    { t: '강점 · 약점 Top 3', locked: false, render: RHighlights },
    { t: '스트레스 복원력', locked: true, render: RResilience },
    { t: '응답 패턴 프로필', locked: true, render: RPattern },
    { t: '또래 비교 · 성장 추이', locked: false, render: RPeer },
    { t: 'AI 코치 · 개선 플랜', locked: true, render: RCoach },
  ];
  const cur = SECTIONS[sec];
  const locked = cur.locked && !ctx.isPro;
  const Body_ = cur.render;
  return (
    <Screen bg={T.layer}>
      <div style={{ flex: 'none', paddingTop: 50, background: T.layer, borderBottom: `1px solid ${T.line}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 8px 8px' }}>
          <button onClick={() => sec === 0 ? ctx.nav('records') : setSec(s => s - 1)} style={iconBtn}><Sym name="arrow_back_ios_new" size={22} color={T.fg} /></button>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, color: T.fgSubtle }}>모의고사 · 1회차 리포트</div>
            <div style={{ fontSize: 15, fontWeight: 700, color: T.fg }}>{cur.t}</div>
          </div>
          <button onClick={() => setShare(true)} style={iconBtn}><Sym name="ios_share" size={22} color={T.fg} /></button>
        </div>
        <div style={{ display: 'flex', gap: 3, padding: '0 16px 10px' }}>
          {SECTIONS.map((_, i) => <div key={i} style={{ flex: 1, height: 3, borderRadius: 2, background: i <= sec ? T.fg : T.neutralWeak }} />)}
        </div>
      </div>

      <div className="saeum-scroll" style={{ flex: 1, overflowY: 'auto', padding: '14px 16px 16px', position: 'relative' }}>
        <div style={{ filter: locked ? 'blur(5px)' : 'none', pointerEvents: locked ? 'none' : 'auto' }}>
          <Body_ ctx={ctx} />
        </div>
        {locked && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10, padding: 24, textAlign: 'center' }}>
            <span style={{ width: 60, height: 60, borderRadius: T.full, background: T.layer, boxShadow: T.s2, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}><Sym name="lock" size={30} color={T.brand} fill={1} /></span>
            <div style={{ fontSize: 17, fontWeight: 700, color: T.fg }}>프리미엄 전용 섹션</div>
            <div style={{ fontSize: 13, color: T.fgMuted, maxWidth: 240 }}>복원력·응답 패턴·AI 코치는 Pro에서 열려요.</div>
            <Button variant="brand" size="medium" leadingIcon="bolt" onClick={() => ctx.nav('billing', { step: 'landing' })} style={{ marginTop: 6 }}>Pro로 잠금 해제</Button>
          </div>
        )}
      </div>

      <div style={{ flex: 'none', padding: '10px 16px 30px', borderTop: `1px solid ${T.line}`, background: T.layer, display: 'grid', gridTemplateColumns: '1fr 1.6fr', gap: 8 }}>
        <Button variant="outline" size="large" onClick={() => setShare(true)} leadingIcon="ios_share">공유</Button>
        {sec < SECTIONS.length - 1
          ? <Button variant="brand" size="large" trailingIcon="arrow_forward" onClick={() => setSec(s => s + 1)}>다음</Button>
          : <Button variant="brand" size="large" trailingIcon="check" onClick={() => ctx.nav('records')}>완료</Button>}
      </div>

      {share && <ShareSheet onClose={() => setShare(false)} ctx={ctx} />}
    </Screen>
  );
}

// section bodies
function RCover() {
  const items = [['①', '5대 역량 레이더', 'Free'], ['②', '강·약점 Top 3', 'Free'], ['③', '스트레스 복원력', 'Pro'], ['④', '응답 패턴 프로필', 'Pro'], ['⑤', '또래 비교 · 추이', 'Free'], ['⑥', 'AI 코치 · 2주 플랜', 'Pro']];
  return (
    <div>
      <div style={{ fontSize: 12, color: T.fgSubtle }}>2026년 1월 12일 · 22분 소요</div>
      <div style={{ fontSize: 24, fontWeight: 700, color: T.fg, marginTop: 2, letterSpacing: '-0.02em' }}>오늘의 역량 지도</div>
      <div style={{ fontSize: 13, color: T.fgMuted }}>9개 게임 · 240문항 · 5대 역량 분석</div>
      <Card pad={16} bg={T.bnGreen} border={false} style={{ marginTop: 14, display: 'flex', alignItems: 'center', gap: 16 }}>
        <ReadinessGauge score={74} size={108} label={false} />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 12, color: T.fgMuted }}>종합 준비도</div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}><span style={{ fontSize: 36, fontWeight: 700, color: T.fg }}>74</span><span style={{ fontSize: 13, color: T.fgSubtle }}>/ 100</span></div>
          <Badge variant="positive" style={{ marginTop: 4 }}>또래 대비 상위 28%</Badge>
        </div>
      </Card>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 10 }}>
        <Card pad={12} bg={T.bnGreen} border={false}><div style={{ fontSize: 11, color: T.fgMuted }}>강한 영역</div><div style={{ fontSize: 16, fontWeight: 700, color: T.mossy700 }}>신뢰 · 82</div><div style={{ fontSize: 10, color: T.fgSubtle }}>메타인지 + 지속 주의</div></Card>
        <Card pad={12} bg={T.bnOrange} border={false}><div style={{ fontSize: 11, color: T.fgMuted }}>보완 영역</div><div style={{ fontSize: 16, fontWeight: 700, color: 'var(--mossy-color-manner-temp-l7-text)' }}>관계 · 68</div><div style={{ fontSize: 10, color: T.fgSubtle }}>응답 일관성 편차 큼</div></Card>
      </div>
      <SectionHead title="이 리포트에는" />
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {items.map(([n, t, tag], i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 2px', borderBottom: i < items.length - 1 ? `1px solid ${T.line}` : 'none' }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: T.fgSubtle, width: 16 }}>{n}</span>
            <span style={{ flex: 1, fontSize: 14, color: T.fg }}>{t}</span>
            {tag === 'Pro' ? <Badge variant="brand">Pro</Badge> : <span style={{ fontSize: 11, color: T.fgSubtle }}>Free</span>}
          </div>
        ))}
      </div>
    </div>
  );
}
function RRadar() {
  return (
    <div>
      <div style={{ fontSize: 12, color: T.fgSubtle }}>검증된 역량 모델 (r=0.28~0.38)</div>
      <div style={{ fontSize: 20, fontWeight: 700, color: T.fg }}>당신의 역량 지도</div>
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: 4 }}><Radar size={250} /></div>
      <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginBottom: 10 }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: T.fgMuted }}><span style={{ width: 16, height: 3, background: T.brandSolid }} />나</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: T.fgSubtle }}><span style={{ width: 16, height: 0, borderTop: '2px dashed var(--mossy-color-palette-gray-500)' }} />또래 평균</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {FIVE.map(d => (
          <div key={d.key} style={{ display: 'grid', gridTemplateColumns: '64px 1fr 36px', gap: 10, alignItems: 'center' }}>
            <div><div style={{ fontSize: 13, fontWeight: 700, color: T.fg }}>{d.name}</div><div style={{ fontSize: 10, color: T.fgSubtle }}>{d.desc}</div></div>
            <Progress value={d.score} color={d.color} height={8} />
            <div style={{ textAlign: 'right', fontSize: 15, fontWeight: 700, color: T.fg }}>{d.score}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
function RHighlights() {
  const S = [['개수 비교', 'Subitizing', 88, '크기 착시를 억제하고 개수만 추정. 상위 15%.'], ['마법약 만들기', '귀납 추론', 85, '실패 후 가설 전환이 빠름. 3회로 규칙 발견 72%.'], ['고양이 찾기', '메타인지', 82, '확신도와 정답률 일치도 높음.']];
  const W = [['숫자 누르기', 'Digit Span 역순', 63, '6자리 이상에서 정답률 급락.'], ['도형 순서', 'N-back', 66, '3-back 정답률 42%. 갱신 부하에 취약.'], ['길 만들기', '계획력', 69, '전체 조망 없이 국지적으로 해결.']];
  const row = (arr, tone) => arr.map(([g, c, s, n], i) => (
    <Card key={i} pad={11} bg={tone === 'pos' ? T.bnGreen : T.bnOrange} border={false}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}><span style={{ fontSize: 13, fontWeight: 700, color: T.fg }}>#{i + 1} {g}</span><span style={{ fontSize: 16, fontWeight: 700, color: tone === 'pos' ? T.positive : 'var(--mossy-color-manner-temp-l7-text)' }}>{s}</span></div>
      <div style={{ fontSize: 10, color: T.fgSubtle }}>{c}</div>
      <div style={{ fontSize: 11, color: T.fgMuted, marginTop: 3, lineHeight: 1.4 }}>{n}</div>
    </Card>
  ));
  return (
    <div>
      <div style={{ fontSize: 20, fontWeight: 700, color: T.fg }}>뭘 잘하고, 뭘 보완할까</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, margin: '12px 0 8px' }}><Sym name="trending_up" size={18} fill={1} color={T.positive} /><span style={{ fontSize: 14, fontWeight: 700, color: T.fg }}>강점 Top 3</span></div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>{row(S, 'pos')}</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, margin: '14px 0 8px' }}><Sym name="adjust" size={18} fill={1} color="var(--mossy-color-manner-temp-l7-text)" /><span style={{ fontSize: 14, fontWeight: 700, color: T.fg }}>보완 Top 3</span></div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>{row(W, 'warn')}</div>
    </div>
  );
}
function RResilience() {
  const pts = [72, 78, 82, 75, 74, 76, 80, 82, 78, 85, 84, 88, 78, 70, 58, 65, 55, 48, 72, 66, 58, 82, 80, 78, 90, 88, 85];
  const w = 310, h = 110;
  const xy = (p, i) => [10 + (i / (pts.length - 1)) * (w - 20), h - 10 - (p / 100) * (h - 20)];
  const path = pts.map((p, i) => (i ? 'L' : 'M') + xy(p, i).join(' ')).join(' ');
  return (
    <div>
      <div style={{ fontSize: 20, fontWeight: 700, color: T.fg }}>압박 상황의 나</div>
      <div style={{ fontSize: 12, color: T.fgMuted, marginBottom: 8 }}>난이도 상승·오답 후·타임 프레셔 구간의 수행 변화</div>
      <Card pad={12}>
        <svg width="100%" height={h} viewBox={`0 0 ${w} ${h}`}><rect x={10 + (14 / 27) * (w - 20)} y="8" width={(5 / 27) * (w - 20)} height={h - 16} fill="var(--mossy-color-banner-orange)" /><path d={path} fill="none" stroke={T.brandSolid} strokeWidth="2.5" /></svg>
        <div style={{ textAlign: 'center', fontSize: 11, color: T.fgSubtle }}>G1 → G9 난이도 구간별 수행도</div>
      </Card>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 10 }}>
        <Card pad={11} bg={T.bnOrange} border={false}><div style={{ fontSize: 13, fontWeight: 700, color: 'var(--mossy-color-manner-temp-l7-text)' }}>수행 하락 구간</div><div style={{ fontSize: 12, color: T.fgMuted, marginTop: 2 }}>G5~G7에서 15점 하락. 고난이도 스트레스에 취약한 신호.</div></Card>
        <Card pad={11} bg={T.bnGreen} border={false}><div style={{ fontSize: 13, fontWeight: 700, color: T.positive }}>복원력</div><div style={{ fontSize: 12, color: T.fgMuted, marginTop: 2 }}>G8부터 빠르게 페이스 회복. 메타인지를 통한 자기 조절이 작동했어요.</div></Card>
      </div>
    </div>
  );
}
function RPattern() {
  return (
    <div>
      <div style={{ fontSize: 20, fontWeight: 700, color: T.fg }}>나의 사고 스타일</div>
      <Card pad={14} style={{ marginTop: 10 }}>
        <div style={{ position: 'relative', height: 200, borderRadius: T.r2, background: T.basement }}>
          <div style={{ position: 'absolute', left: '50%', top: 8, bottom: 8, width: 1, background: T.lineWeak }} />
          <div style={{ position: 'absolute', top: '50%', left: 8, right: 8, height: 1, background: T.lineWeak }} />
          <div style={{ position: 'absolute', top: 6, left: 0, right: 0, textAlign: 'center', fontSize: 10, color: T.fgSubtle }}>정확도 ↑</div>
          <div style={{ position: 'absolute', top: '47%', left: 6, fontSize: 10, color: T.fgSubtle }}>◀ 신중</div>
          <div style={{ position: 'absolute', top: '47%', right: 6, fontSize: 10, color: T.fgSubtle }}>직관 ▶</div>
          {[[45, 60], [52, 55], [58, 48], [48, 52], [55, 50], [50, 57]].map(([x, y], i) => <span key={i} style={{ position: 'absolute', left: x + '%', top: y + '%', width: 6, height: 6, borderRadius: T.full, background: 'var(--mossy-color-palette-gray-400)' }} />)}
          <span style={{ position: 'absolute', left: '68%', top: '28%', width: 18, height: 18, borderRadius: T.full, background: T.brandSolid, border: '2px solid #fff', boxShadow: T.s1, transform: 'translate(-50%,-50%)' }} />
        </div>
        <div style={{ textAlign: 'center', marginTop: 8, fontSize: 14, fontWeight: 700, color: T.brand }}>통찰형 직관 결정가</div>
      </Card>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 10 }}>
        {[['신중함', '직관', 72], ['속도', '정확도', 40], ['리스크 회피', '리스크 감수', 65], ['고정관념', '유연성', 78]].map(([l, r, v], i) => (
          <div key={i} style={{ display: 'grid', gridTemplateColumns: '64px 1fr 64px', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 11, color: T.fgSubtle, textAlign: 'right' }}>{l}</span>
            <div style={{ position: 'relative', height: 8, background: T.neutralWeak, borderRadius: T.full }}><span style={{ position: 'absolute', left: v + '%', top: -2, width: 4, height: 12, background: T.fg, borderRadius: 2, transform: 'translateX(-50%)' }} /></div>
            <span style={{ fontSize: 11, color: T.fg }}>{r}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
function RPeer() {
  const trend = [62, 68, 71, 69, 74, 78];
  return (
    <div>
      <div style={{ fontSize: 20, fontWeight: 700, color: T.fg }}>어디쯤 와 있을까</div>
      <Card pad={14} style={{ marginTop: 10 }}>
        <div style={{ fontSize: 11, color: T.fgSubtle }}>또래 (취업준비생 20-30대 · N=12,400)</div>
        <div style={{ position: 'relative', height: 26, marginTop: 16, borderRadius: T.r1, background: 'linear-gradient(90deg, var(--mossy-color-banner-green), var(--mossy-color-banner-yellow), var(--mossy-color-banner-orange))' }}>
          <div style={{ position: 'absolute', left: '72%', top: -7, bottom: -7, width: 3, background: T.fg, borderRadius: 2 }} />
          <div style={{ position: 'absolute', left: '72%', top: -22, transform: 'translateX(-50%)', fontSize: 11, fontWeight: 700, color: T.fg }}>나 28%</div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4, fontSize: 10, color: T.fgSubtle }}><span>상위 1%</span><span>50%</span><span>하위 1%</span></div>
      </Card>
      <SectionHead title="역량별 백분위" />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {FIVE.map(d => (
          <div key={d.key} style={{ display: 'grid', gridTemplateColumns: '56px 1fr 54px', gap: 8, alignItems: 'center' }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: T.fg }}>{d.name}</span>
            <Progress value={d.pct} color={d.color} height={9} />
            <span style={{ fontSize: 10, color: T.fgSubtle, textAlign: 'right' }}>상위 {100 - d.pct}%</span>
          </div>
        ))}
      </div>
      <SectionHead title="회차별 성장" />
      <Card pad={12}>
        <svg width="100%" height="90" viewBox="0 0 300 90">
          {trend.map((v, i, a) => { const x = 16 + i * 54, y = 80 - (v - 55) * 2.4; return (<g key={i}>{i > 0 && <line x1={16 + (i - 1) * 54} y1={80 - (a[i - 1] - 55) * 2.4} x2={x} y2={y} stroke={T.brandSolid} strokeWidth="2.5" />}<circle cx={x} cy={y} r="4" fill="#fff" stroke={T.brandSolid} strokeWidth="2" /><text x={x} y={y - 8} textAnchor="middle" fontSize="10" fontWeight="700" fill={T.brand} fontFamily="var(--mossy-font-family-base)">{v}</text><text x={x} y="89" textAnchor="middle" fontSize="9" fill="var(--mossy-color-fg-neutral-subtle)" fontFamily="var(--mossy-font-family-base)">{i + 1}회</text></g>); })}
        </svg>
        <Banner tone="positive" icon="trending_up">첫 회차 대비 +16점 성장했어요</Banner>
      </Card>
    </div>
  );
}
function RCoach() {
  const plan = [['1~3일', '숫자 누르기', '5자리', '10분/일'], ['4~6일', '도형 순서', '2-back', '12분/일'], ['7~9일', '길 만들기', '난이도 중', '15분/일'], ['10~14일', '모의고사 재도전', '전 9게임', '22분']];
  return (
    <div>
      <div style={{ fontSize: 20, fontWeight: 700, color: T.fg }}>이번 회차 인사이트</div>
      <Card pad={12} style={{ marginTop: 10, display: 'flex', gap: 10 }}>
        <span style={{ width: 40, height: 40, borderRadius: T.full, background: T.brandWeak, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}><Sym name="psychology_alt" size={24} fill={1} color={T.brand} /></span>
        <div><div style={{ fontSize: 13, fontWeight: 700, color: T.fg }}>메타인지·귀납 추론이 강하고, 정보 갱신 부하에 약해요.</div><div style={{ fontSize: 12, color: T.fgMuted, marginTop: 3, lineHeight: 1.45 }}>불확실성 속 규칙 발견형. 숫자·N-back은 연습 효과가 빠른 영역이라 2주 훈련을 권장해요.</div></div>
      </Card>
      <SectionHead title="2주 훈련 플랜" />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {plan.map(([d, g, lv, t], i) => (
          <div key={i} style={{ display: 'grid', gridTemplateColumns: '60px 1fr 56px', gap: 8, alignItems: 'center', padding: '10px 12px', borderRadius: T.r3, border: `1px solid ${T.line}` }}>
            <Badge variant={i === 3 ? 'positive' : 'brand'}>{d}</Badge>
            <div><div style={{ fontSize: 13, fontWeight: 700, color: T.fg }}>{g}</div><div style={{ fontSize: 11, color: T.fgSubtle }}>{lv}</div></div>
            <span style={{ fontSize: 11, color: T.fgSubtle, textAlign: 'right' }}>{t}</span>
          </div>
        ))}
      </div>
      <Card pad={12} style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 10 }}>
        <Sym name="notifications_active" size={22} color={T.brand} fill={1} />
        <div style={{ flex: 1 }}><div style={{ fontSize: 13, fontWeight: 700, color: T.fg }}>매일 오후 9시 리마인드</div><div style={{ fontSize: 11, color: T.fgSubtle }}>카카오톡 알림</div></div>
        <Switch checked onChange={() => { }} />
      </Card>
    </div>
  );
}

// ── 공유 시트 ──────────────────────────────────────────────────
function ShareSheet({ onClose, ctx }) {
  const channels = [['chat', '카톡', 'var(--mossy-color-palette-yellow-400)'], ['photo_camera', '인스타', 'var(--mossy-color-palette-purple-700)'], ['close', 'X', 'var(--mossy-color-fg-neutral)'], ['link', '링크', T.fgMuted]];
  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 70 }}>
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'var(--mossy-color-bg-overlay)' }} />
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, background: T.floating, borderRadius: `${'20px'} 20px 0 0`, padding: '12px 16px 30px', animation: 'saeum-sheet-up .3s var(--mossy-timing-function-enter)', boxShadow: T.s3 }}>
        <div style={{ width: 40, height: 4, borderRadius: 2, background: T.neutralWeak, margin: '0 auto 12px' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}><span style={{ fontSize: 17, fontWeight: 700, color: T.fg }}>공유 카드</span><span style={{ fontSize: 12, color: T.fgSubtle }}>· 3가지 스타일</span><IconButton icon="close" aria-label="닫기" variant="ghost" onClick={onClose} style={{ marginLeft: 'auto' }} /></div>
        <div className="saeum-scroll" style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 4 }}>
          <ShareCard><div style={{ fontSize: 10, color: T.fgSubtle }}>새움 · AI 면접</div><div style={{ fontSize: 12, fontWeight: 700, color: T.fg }}>내 종합 준비도</div><div style={{ textAlign: 'center', margin: '14px 0' }}><div style={{ fontSize: 46, fontWeight: 700, color: T.fg, lineHeight: 1 }}>74</div><Badge variant="positive">상위 28%</Badge></div><div style={{ marginTop: 'auto', fontSize: 9, color: T.fgSubtle }}>@saeum</div></ShareCard>
          <ShareCard><div style={{ fontSize: 10, color: T.fgSubtle }}>5대 역량</div><div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Radar size={150} /></div></ShareCard>
          <ShareCard bg={T.bnGreen}><div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4 }}><Sym name="emoji_events" size={34} fill={1} color={T.brand} /><div style={{ fontSize: 13, fontWeight: 700, color: T.fg }}>통찰형 결정가</div><div style={{ fontSize: 10, color: T.fgSubtle }}>귀납 추론 85점</div></div></ShareCard>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8, marginTop: 14 }}>
          {channels.map(([ic, l, c]) => (
            <button key={l} onClick={() => { onClose(); ctx.showToast('공유 카드를 저장했어요', { icon: 'download' }); }} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, border: 'none', background: 'transparent', cursor: 'pointer', fontFamily: T.font }}>
              <span style={{ width: 48, height: 48, borderRadius: T.full, background: T.neutralWeak, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}><Sym name={ic} size={22} color={c} fill={1} /></span>
              <span style={{ fontSize: 11, color: T.fgMuted }}>{l}</span>
            </button>
          ))}
        </div>
        <Button variant="brand" size="large" fullWidth leadingIcon="download" style={{ marginTop: 14 }} onClick={() => { onClose(); ctx.showToast('이미지를 저장했어요', { icon: 'check_circle' }); }}>이미지 저장</Button>
      </div>
    </div>
  );
}
function ShareCard({ children, bg = T.layer }) {
  return <div style={{ flex: '0 0 150px', height: 210, background: bg, border: `1px solid ${T.line}`, borderRadius: T.r3, padding: 12, display: 'flex', flexDirection: 'column' }}>{children}</div>;
}

// ── 기록 탭 (아카이브) ─────────────────────────────────────────
function RecordsTab({ ctx }) {
  const [filter, setFilter] = useRp('all');
  const reports = [
    { date: '1월 12일', no: 6, score: 78, delta: 4, dur: '22:14', pro: true, latest: true },
    { date: '1월 5일', no: 5, score: 74, delta: 5, dur: '21:48', pro: true },
    { date: '12월 29일', no: 4, score: 69, delta: -2, dur: '24:02', pro: false },
    { date: '12월 22일', no: 3, score: 71, delta: 3, dur: '23:17', pro: false },
    { date: '12월 15일', no: 2, score: 68, delta: 6, dur: '25:30', pro: false },
    { date: '12월 8일', no: 1, score: 62, delta: null, dur: '26:44', pro: false },
  ];
  const list = filter === 'pro' ? reports.filter(r => r.pro) : reports;
  return (
    <Screen bg={T.basement}>
      <div style={{ flex: 'none', paddingTop: 50, background: T.layer, borderBottom: `1px solid ${T.line}` }}>
        <div style={{ padding: '4px 16px 10px' }}>
          <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em', color: T.fg }}>기록</div>
          <div style={{ fontSize: 13, color: T.fgSubtle, marginTop: 1 }}>모의고사 회차별 리포트</div>
        </div>
      </div>
      <Body bottomPad={104}>
        <Card pad={14} bg={T.bnGreen} border={false}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
            <span style={{ fontSize: 22, fontWeight: 700, color: T.brand }}>6회차</span>
            <span style={{ fontSize: 12, color: T.fgMuted }}>완주 · 첫 회차 대비</span>
            <span style={{ marginLeft: 'auto', fontSize: 16, fontWeight: 700, color: T.positive }}>+16</span>
          </div>
          <svg width="100%" height="44" viewBox="0 0 300 44" style={{ marginTop: 6 }}>
            <polyline points="10,34 68,30 126,22 184,26 242,12 290,6" fill="none" stroke={T.brandSolid} strokeWidth="2.5" />
            {[[10, 34], [68, 30], [126, 22], [184, 26], [242, 12], [290, 6]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r="3" fill="#fff" stroke={T.brandSolid} strokeWidth="1.5" />)}
          </svg>
        </Card>
        <div style={{ display: 'flex', gap: 8, margin: '12px 0' }}>
          {[['all', '전체'], ['pro', '프리미엄']].map(([v, l]) => <Tag key={v} selected={filter === v} onClick={() => setFilter(v)}>{l}</Tag>)}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {list.map((r, i) => (
            <Card key={i} pad={12} onClick={() => ctx.nav('report')} style={{ display: 'flex', alignItems: 'center', gap: 12, position: 'relative' }}>
              {r.latest && <span style={{ position: 'absolute', top: -7, left: 12 }}><Badge variant="critical">NEW</Badge></span>}
              <div style={{ width: 42, textAlign: 'center' }}>
                <div style={{ fontSize: 10, color: T.fgSubtle }}>#{r.no}회</div>
                <div style={{ fontSize: 18, fontWeight: 700, color: r.score >= 75 ? T.positive : T.fg }}>{r.score}</div>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><span style={{ fontSize: 13, fontWeight: 700, color: T.fg }}>{r.date}</span>{r.pro && <Badge variant="brand">Pro</Badge>}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 2, fontSize: 11, color: T.fgSubtle }}>
                  <span>⏱ {r.dur}</span>
                  {r.delta != null && <span style={{ color: r.delta > 0 ? T.positive : T.critical, fontWeight: 700 }}>{r.delta > 0 ? '▲' : '▼'} {Math.abs(r.delta)}</span>}
                </div>
              </div>
              <Sym name="chevron_right" size={20} color={T.fgSubtle} />
            </Card>
          ))}
        </div>
        <Button variant="outline" size="large" fullWidth leadingIcon="add" style={{ marginTop: 14 }} onClick={() => ctx.nav('gameIntro', { id: 'rps', mock: true, idx: 0 })}>새 모의고사 시작</Button>
      </Body>
    </Screen>
  );
}

Object.assign(window, { MockFinish, ReportLoading, ReportScreen, RecordsTab, ShareSheet, FIVE, Radar });
