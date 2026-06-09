// game-flows.jsx — 9개 게임의 "전체 플로우" 스토리보드
// 각 게임: 인트로 → 플레이(주요 상태) → 결과 를 iOS 프레임에 정적 스냅샷으로 배치.
// 실제 앱 컴포넌트(GameIntro/GameResult/GameStage)와 동일한 토큰·프리미티브를 재사용.

// ── mock ctx (정적 렌더용 — nav는 no-op) ───────────────────────
const _completed = (() => { const s = {}; GAMES.forEach(g => { if (g.done) s[g.id] = g.score; }); return s; })();
function mkCtx(params) {
  return {
    params, route: { name: 'flow', params }, completedGames: _completed,
    nav: () => {}, back: () => {}, replace: () => {}, resetTo: () => {},
    isPro: false, setPro: () => {}, showToast: () => {}, completeGame: () => {}, streak: 4,
  };
}

// ── 디바이스 래퍼 (앱과 동일한 IOSDevice 마운트) ────────────────
function FlowDevice({ children }) {
  return (
    <IOSDevice width={390} height={844}>
      <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}>
        {children}
      </div>
    </IOSDevice>
  );
}

// ════════════════════════════════════════════════════════════════
// 게임별 플레이 스냅샷 (정적 — 결정적 상태)
// ════════════════════════════════════════════════════════════════
const RPS_ICON = { scissors: { l: '가위', icon: 'content_cut' }, rock: { l: '바위', icon: 'sports_mma' }, paper: { l: '보', icon: 'front_hand' } };

// ── 1. 가위바위보 ──────────────────────────────────────────────
function Rps_play({ g, reveal }) {
  const ai = 'rock', answer = 'paper';
  return (
    <GameStage ctx={mkCtx({ id: g.id })} g={g} round={reveal ? 3 : 2} total={5} score={reveal ? 40 : 20} fixedSecs={reveal ? 6 : 4}
      instruction={<span>현재 규칙: AI 손을 <b style={{ color: g.ink }}>이기기</b></span>}>
      <Center style={{ gap: 18 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 12, color: T.fgSubtle, marginBottom: 6 }}>AI</div>
            <div style={{ width: 96, height: 96, borderRadius: T.r4, background: g.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Sym name={RPS_ICON[ai].icon} size={52} fill={1} color={g.ink} />
            </div>
          </div>
          <Sym name="swords" size={26} color={T.fgSubtle} />
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 12, color: T.fgSubtle, marginBottom: 6 }}>나</div>
            <div style={{ width: 96, height: 96, borderRadius: T.r4, border: `2px dashed ${T.lineWeak}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {reveal ? <Sym name={RPS_ICON[answer].icon} size={52} fill={1} color={T.positive} /> : <span style={{ fontSize: 30, color: T.placeholder }}>?</span>}
            </div>
          </div>
        </div>
      </Center>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8 }}>
        {Object.keys(RPS_ICON).map(k => (
          <RespBtn key={k} ink={g.ink} state={reveal ? (k === answer ? 'right' : 'idle') : 'idle'}>
            <Sym name={RPS_ICON[k].icon} size={30} fill={1} color={T.fg} />
            <span style={{ fontSize: 13, fontWeight: 700, color: T.fg }}>{RPS_ICON[k].l}</span>
          </RespBtn>
        ))}
      </div>
    </GameStage>
  );
}

// ── 2. 도형 회전 ───────────────────────────────────────────────
const RShape = ({ rotate = 0, sx = 1, sy = 1, size = 64 }) => (
  <div style={{ width: size, height: size, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Georgia, serif', fontWeight: 800, fontSize: size * 0.82, color: T.fg, transform: `rotate(${rotate}deg) scale(${sx},${sy})`, lineHeight: 1 }}>R</div>
);
function Rotate_play({ g }) {
  const ops = [
    { id: 'l', label: '왼쪽 45°', icon: 'rotate_left' },
    { id: 'r', label: '오른쪽 45°', icon: 'rotate_right' },
    { id: 'h', label: '좌우 반전', icon: 'flip' },
    { id: 'v', label: '상하 반전', icon: 'flip' },
  ];
  const seq = ['r', 'h']; // 오른쪽45 + 좌우반전 → rot45, fx-1
  return (
    <GameStage ctx={mkCtx({ id: g.id })} g={g} round={1} total={1} score={0} fixedSecs={28}
      instruction="왼쪽(전) 도형을 오른쪽(후) 모양으로 만들어 보세요."
      footer={<Button variant="brand" size="large" fullWidth>답안 제출</Button>}>
      <Card pad={0} style={{ overflow: 'hidden', display: 'grid', gridTemplateColumns: '1fr 1fr', marginBottom: 14 }}>
        <div style={{ padding: 18, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, borderRight: `1px solid ${T.line}` }}>
          <RShape /><span style={{ fontSize: 11, color: T.fgSubtle }}>전</span>
        </div>
        <div style={{ padding: 18, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, background: g.bg }}>
          <RShape rotate={90} sx={-1} /><span style={{ fontSize: 11, color: g.ink, fontWeight: 700 }}>후</span>
        </div>
      </Card>
      <div style={{ textAlign: 'center', marginBottom: 8 }}>
        <span style={{ fontSize: 12, color: T.fgSubtle }}>내 도형 (남은 클릭 6)</span>
      </div>
      <Card pad={16} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
        <RShape rotate={45} sx={-1} size={72} />
      </Card>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 6, marginBottom: 10 }}>
        {ops.map(o => (
          <div key={o.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, padding: '10px 4px', borderRadius: T.r2_5, background: T.layer, border: `1.5px solid ${g.ink}` }}>
            <Sym name={o.icon} size={22} color={g.ink} style={o.id === 'v' ? { transform: 'rotate(90deg)' } : null} />
            <span style={{ fontSize: 10, fontWeight: 700, color: T.fg }}>{o.label}</span>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
        {seq.map((s, i) => <Pill key={i} tone="neutral">{i + 1}. {ops.find(o => o.id === s).label}</Pill>)}
        <span style={{ marginLeft: 'auto', color: T.fgSubtle, fontSize: 12 }}>초기화</span>
      </div>
    </GameStage>
  );
}

// ── 3. 약속 정하기 ─────────────────────────────────────────────
function Promise_play({ g, reveal }) {
  const clues = [
    { who: '철수', icon: 'directions_bus', text: '"16번 버스를 타고 편의점 앞에서 내렸어"' },
    { who: '영희', icon: 'map', text: '"사거리 북동쪽 블록, 편의점과 한 블록 떨어진 곳"' },
    { who: '미미', icon: 'restaurant', text: '"가운데 가게에서 스테이크를 먹었어"' },
  ];
  const options = ['북동 카페', '편의점 옆 분식', '사거리 스테이크집', '남쪽 베이커리'];
  const answer = 2;
  return (
    <GameStage ctx={mkCtx({ id: g.id })} g={g} round={1} total={1} score={0} fixedSecs={reveal ? 14 : 9}
      instruction="세 친구의 단서를 종합해 약속 장소를 추론하세요.">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {clues.map((c, i) => (
          <Card key={i} pad={12} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
            <span style={{ width: 38, height: 38, borderRadius: T.r2_5, background: g.bg, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}>
              <Sym name={c.icon} size={22} fill={1} color={g.ink} />
            </span>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: T.fg }}>{c.who}</div>
              <div style={{ fontSize: 13, color: T.fgMuted, marginTop: 2, lineHeight: 1.4 }}>{c.text}</div>
            </div>
          </Card>
        ))}
      </div>
      <div style={{ fontSize: 13, fontWeight: 700, color: T.fg, margin: '16px 2px 8px' }}>약속 장소는 어디일까요?</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        {options.map((o, i) => (
          <RespBtn key={i} ink={g.ink} state={reveal ? (i === answer ? 'right' : 'idle') : 'idle'}>
            <span style={{ fontSize: 14, fontWeight: 700, color: T.fg }}>{o}</span>
          </RespBtn>
        ))}
      </div>
    </GameStage>
  );
}

// ── 4. 마법약 만들기 ───────────────────────────────────────────
function Potion_play({ g, reveal }) {
  const items = ['eco', 'water_drop', 'grass', 'spa'];
  const red = true; // water_drop → 빨간약
  return (
    <GameStage ctx={mkCtx({ id: g.id })} g={g} round={reveal ? 3 : 2} total={5} score={reveal ? 40 : 20} fixedSecs={reveal ? 7 : 5}
      instruction="네 재료의 조합으로 어떤 약이 될지 예측해요. 결과를 보며 규칙을 찾아요.">
      <Center>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, width: 200 }}>
          {items.map((h, i) => (
            <div key={i} style={{ aspectRatio: '1.3', borderRadius: T.r3, background: g.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Sym name={h} size={30} fill={1} color={g.ink} />
            </div>
          ))}
        </div>
        {reveal && (
          <div style={{ marginTop: 14, textAlign: 'center' }}>
            <Sym name="science" size={40} fill={1} color={T.critical} />
            <div style={{ fontSize: 15, fontWeight: 700, color: T.critical, marginTop: 2 }}>빨간약 완성</div>
            <div style={{ fontSize: 12, color: T.fgSubtle }}>예측 성공!</div>
          </div>
        )}
      </Center>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 8 }}>
        <div style={potBtn(T.info, false)}>파란약</div>
        <div style={potBtn(T.critical, reveal)}>빨간약</div>
      </div>
    </GameStage>
  );
}
function potBtn(color, sel) {
  return { padding: '16px', borderRadius: T.full, border: `2px solid ${color}`, background: sel ? color : T.layer, color: sel ? '#fff' : color, fontFamily: T.font, fontSize: 16, fontWeight: 700, textAlign: 'center' };
}

// ── 5. 길 만들기 ───────────────────────────────────────────────
function Path_play({ g }) {
  const cols = 6, rows = 5, limit = 3;
  const fences = new Set([8, 14, 20]); // 중앙 세로 울타리 라인
  return (
    <GameStage ctx={mkCtx({ id: g.id })} g={g} round={1} total={1} score={0} fixedSecs={42}
      instruction="울타리를 놓아 사람과 자동차의 길을 분리하세요."
      footer={<Button variant="brand" size="large" fullWidth>제출 (3/3)</Button>}>
      <div style={{ display: 'flex', justifyContent: 'space-around', marginBottom: 8 }}>
        <Sym name="directions_walk" size={28} color={T.fg} /><Sym name="escalator_warning" size={28} color={T.fg} />
      </div>
      <Card pad={12}>
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols},1fr)`, gap: 4 }}>
          {Array.from({ length: rows * cols }).map((_, i) => {
            const has = fences.has(i);
            return (
              <div key={i} style={{ aspectRatio: '1', borderRadius: T.r1, background: has ? g.bg : T.layer, border: `1.5px solid ${has ? g.ink : T.line}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {has ? <Sym name="fence" size={18} color={g.ink} fill={1} /> : <Sym name="close" size={14} color={T.placeholder} />}
              </div>
            );
          })}
        </div>
      </Card>
      <div style={{ display: 'flex', justifyContent: 'center', gap: 18, marginTop: 8 }}>
        <Sym name="local_taxi" size={28} color={T.fg} /><Sym name="directions_car" size={28} color={T.fg} />
      </div>
    </GameStage>
  );
}

// ── 6. 숫자 누르기 ─────────────────────────────────────────────
function Numbers_play({ g, recall }) {
  const seq = [7, 2, 9, 4, 1];
  const len = seq.length;
  const target = [...seq].reverse(); // 1,4,9,2,7
  const input = recall ? [1, 4, 9] : [];
  return (
    <GameStage ctx={mkCtx({ id: g.id })} g={g} round={2} total={4} score={25} fixedSecs={recall ? 11 : 6}
      instruction="숫자가 사라지면 순서를 거꾸로 입력하세요.">
      <Card pad={14} bg={g.bg} border={false} style={{ marginBottom: 12 }}>
        <div style={{ fontSize: 11, color: T.fgMuted, marginBottom: 8 }}>{recall ? '제시된 숫자 (사라짐)' : '제시되는 숫자 — 외우세요'}</div>
        <div style={{ display: 'flex', gap: 6, justifyContent: 'center', flexWrap: 'wrap' }}>
          {seq.map((n, i) => (
            <div key={i} style={{ width: 38, height: 46, borderRadius: T.r2, background: T.layer, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 700, color: T.fg, opacity: recall ? 0.18 : 1 }}>
              {recall ? '?' : n}
            </div>
          ))}
        </div>
      </Card>
      <div style={{ marginBottom: 10 }}>
        <div style={{ fontSize: 11, color: T.fgSubtle, marginBottom: 6 }}>역순 입력</div>
        <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
          {Array.from({ length: len }).map((_, i) => (
            <div key={i} style={{ width: 38, height: 46, borderRadius: T.r2, border: `1.5px ${input[i] != null ? 'solid' : 'dashed'} ${input[i] != null ? g.ink : T.lineWeak}`, background: input[i] != null ? g.bg : T.layer, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 700, color: T.fg }}>
              {input[i] ?? ''}
            </div>
          ))}
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8, marginTop: 'auto' }}>
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => (
          <div key={n} style={keyStyle(!recall)}>{n}</div>
        ))}
        <div style={keyStyle(!recall, T.neutralWeak)}><Sym name="backspace" size={22} color={recall ? T.fg : T.placeholder} /></div>
        <div style={keyStyle(!recall)}>0</div>
        <div style={keyStyle(true, T.brandSolid, '#fff')}><Sym name="check" size={24} color="#fff" /></div>
      </div>
    </GameStage>
  );
}
function keyStyle(disabled, bg, color) {
  return { aspectRatio: '1.7', borderRadius: T.r3, border: bg ? 'none' : `1px solid ${T.line}`, background: disabled ? T.disabled : (bg || T.layer), color: disabled ? T.placeholder : (color || T.fg), fontFamily: T.font, fontSize: 22, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' };
}

// ── 7. 도형 순서 (N-back) ──────────────────────────────────────
function Memory_play({ g }) {
  const opts = [{ v: 'diff', l: '다름' }, { v: 'n2', l: '2번째 전과 같음' }, { v: 'n3', l: '3번째 전과 같음' }];
  return (
    <GameStage ctx={mkCtx({ id: g.id })} g={g} round={3} total={6} score={32} fixedSecs={8}
      instruction="지금 도형이 2번째 전 / 3번째 전 도형과 같은지 판단하세요.">
      <Center>
        <div style={{ position: 'relative', width: 120, height: 130 }}>
          {[2, 1].map(o => (
            <div key={o} style={{ position: 'absolute', top: o * 4, left: o * 5, width: 104, height: 116, borderRadius: T.r3, background: T.layer, border: `1px solid ${T.line}`, transform: `rotate(${-o * 2}deg)` }} />
          ))}
          <div style={{ position: 'absolute', top: 0, left: 0, width: 104, height: 116, borderRadius: T.r3, background: g.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: T.s1 }}>
            <Sym name="pentagon" size={56} fill={1} color={g.ink} />
          </div>
        </div>
      </Center>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {opts.map(o => <RespBtn key={o.v} ink={g.ink} state="idle"><span style={{ fontSize: 14, fontWeight: 700, color: T.fg }}>{o.l}</span></RespBtn>)}
      </div>
    </GameStage>
  );
}

// ── 8. 고양이 찾기 (메타인지) ──────────────────────────────────
function Cat_play({ g, judge }) {
  const N = 36, mice = new Set([4, 10, 15, 22, 28, 33]), catCell = 15;
  const labels = ['매우 확실', '확실', '조금', '불확실', '불확실', '조금', '확실', '매우 확실'];
  const conf = judge ? 6 : null; // 확실 · 찾았다
  return (
    <GameStage ctx={mkCtx({ id: g.id })} g={g} round={1} total={1} score={0} fixedSecs={judge ? 7 : 3}
      instruction="생쥐가 숨은 위치를 외우고, 고양이가 찾았는지 판단하세요.">
      <div style={{ textAlign: 'center', fontSize: 15, fontWeight: 700, color: T.fg, margin: '4px 0 10px' }}>
        {judge ? '이 칸의 고양이는 생쥐를 찾았을까요?' : '생쥐들이 숨습니다 — 위치를 외우세요'}
      </div>
      <Card pad={12} style={{ marginBottom: 12 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6,1fr)', gap: 4 }}>
          {Array.from({ length: N }).map((_, i) => {
            const showMouse = !judge && mice.has(i);
            const isCat = judge && i === catCell;
            return (
              <div key={i} style={{ aspectRatio: '1', borderRadius: T.r1, background: isCat ? 'var(--mossy-color-bg-critical-weak)' : T.basement, border: isCat ? `2px solid ${T.critical}` : `1px solid ${T.line}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {showMouse && <Sym name="cruelty_free" size={16} color={T.fgMuted} fill={1} />}
                {isCat && <Sym name="pets" size={18} color={T.critical} fill={1} />}
              </div>
            );
          })}
        </div>
      </Card>
      {judge && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0 2px 6px', fontSize: 12, fontWeight: 700 }}>
            <span style={{ color: T.critical }}>← 놓쳤다</span><span style={{ color: T.positive }}>찾았다 →</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8,1fr)', gap: 4 }}>
            {labels.map((l, i) => {
              const sel = conf === i, side = i >= 4 ? T.positive : T.critical;
              return (
                <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
                  <span style={{ width: '100%', aspectRatio: '1', borderRadius: T.full, border: `2px solid ${sel ? side : T.lineWeak}`, background: sel ? side : T.layer }} />
                  <span style={{ fontSize: 8, color: sel ? side : T.fgSubtle, fontWeight: sel ? 700 : 400, lineHeight: 1.1, textAlign: 'center' }}>{l}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </GameStage>
  );
}

// ── 9. 개수 비교 (Subitizing) ──────────────────────────────────
function Compare_play({ g }) {
  const dots = (n, big) => Array.from({ length: n }).map((_, i) => {
    const sz = big ? 16 : 9;
    return <span key={i} style={{ position: 'absolute', left: `${8 + (i * 37) % 78}%`, top: `${10 + ((i * 53) % 76)}%`, width: sz, height: sz, borderRadius: T.full, background: T.fg, transform: 'translate(-50%,-50%)' }} />;
  });
  return (
    <GameStage ctx={mkCtx({ id: g.id })} g={g} round={4} total={8} score={48} fixedSecs={3}
      instruction={<span><b style={{ color: g.ink }}>개수가 더 많은</b> 쪽을 빠르게 탭하세요. 크기에 속지 마세요.</span>}>
      <Center style={{ flex: 'none', paddingTop: 8 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, width: '100%' }}>
          {[{ s: 'l', n: 13, big: false }, { s: 'r', n: 8, big: true }].map(side => (
            <div key={side.s} style={{ position: 'relative', height: 230, borderRadius: T.r4, background: T.layer, border: `1.5px solid ${T.line}`, overflow: 'hidden' }}>
              {dots(side.n, side.big)}
              <span style={{ position: 'absolute', top: 6, left: 8, fontSize: 11, color: T.fgSubtle }}>{side.s === 'l' ? '왼쪽' : '오른쪽'}</span>
            </div>
          ))}
        </div>
      </Center>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 10 }}>
        <Button variant="outline" size="large" leadingIcon="arrow_back">왼쪽</Button>
        <Button variant="outline" size="large" trailingIcon="arrow_forward">오른쪽</Button>
      </div>
    </GameStage>
  );
}

// ════════════════════════════════════════════════════════════════
// 게임별 플레이 프레임 정의
// ════════════════════════════════════════════════════════════════
const PLAY_FRAMES = {
  rps: [
    { key: 'q', label: '플레이 · 문제', node: g => <Rps_play g={g} /> },
    { key: 'a', label: '플레이 · 정답', node: g => <Rps_play g={g} reveal /> },
  ],
  rotate: [
    { key: 'p', label: '플레이 · 변환', node: g => <Rotate_play g={g} /> },
  ],
  promise: [
    { key: 'c', label: '플레이 · 단서', node: g => <Promise_play g={g} /> },
    { key: 'a', label: '플레이 · 정답', node: g => <Promise_play g={g} reveal /> },
  ],
  potion: [
    { key: 'p', label: '플레이 · 예측', node: g => <Potion_play g={g} /> },
    { key: 'r', label: '플레이 · 결과', node: g => <Potion_play g={g} reveal /> },
  ],
  path: [
    { key: 'p', label: '플레이 · 배치', node: g => <Path_play g={g} /> },
  ],
  numbers: [
    { key: 'm', label: '플레이 · 암기', node: g => <Numbers_play g={g} /> },
    { key: 'r', label: '플레이 · 역순 입력', node: g => <Numbers_play g={g} recall /> },
  ],
  memory: [
    { key: 'p', label: '플레이 · 판단', node: g => <Memory_play g={g} /> },
  ],
  cat: [
    { key: 'm', label: '플레이 · 암기', node: g => <Cat_play g={g} /> },
    { key: 'j', label: '플레이 · 확신도', node: g => <Cat_play g={g} judge /> },
  ],
  compare: [
    { key: 'p', label: '플레이 · 비교', node: g => <Compare_play g={g} /> },
  ],
};

function buildFrames(g) {
  const frames = [{ key: 'intro', label: '인트로', node: <GameIntro ctx={mkCtx({ id: g.id })} /> }];
  (PLAY_FRAMES[g.id] || []).forEach(f => frames.push({ key: f.key, label: f.label, node: f.node(g) }));
  frames.push({ key: 'result', label: '결과', node: <GameResult ctx={mkCtx({ id: g.id, score: g.score })} /> });
  return frames;
}

// ════════════════════════════════════════════════════════════════
// 캔버스
// ════════════════════════════════════════════════════════════════
function FlowCanvas() {
  return (
    <DesignCanvas>
      {GAMES.map((g, gi) => (
        <DCSection key={g.id} id={g.id} title={`${gi + 1}. ${g.name}`} subtitle={`${g.cog} · 인트로 → 플레이 → 결과`}>
          {buildFrames(g).map(f => (
            <DCArtboard key={f.key} id={`${g.id}-${f.key}`} label={f.label} width={390} height={844}>
              <FlowDevice>{f.node}</FlowDevice>
            </DCArtboard>
          ))}
        </DCSection>
      ))}
    </DesignCanvas>
  );
}

Object.assign(window, { FlowCanvas });
