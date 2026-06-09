// games-play.jsx — 9개 게임의 인터랙티브 플레이 (Play_<id>)
const { useState: useP, useEffect: usePE, useRef: usePR } = React;

// helper: response button used across games
function RespBtn({ children, onClick, state = 'idle', ink, disabled }) {
  const bg = state === 'right' ? T.positiveWeak : state === 'wrong' ? 'var(--mossy-color-bg-critical-weak)' : T.layer;
  const bd = state === 'right' ? T.positive : state === 'wrong' ? T.critical : (state === 'sel' ? (ink || T.brandStroke) : T.lineWeak);
  return (
    <button onClick={disabled ? undefined : onClick} style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4,
      padding: '14px 8px', borderRadius: T.r3, cursor: disabled ? 'default' : 'pointer', fontFamily: T.font,
      background: bg, border: `1.5px solid ${bd}`, WebkitTapHighlightColor: 'transparent', width: '100%',
      transition: 'background .15s, border-color .15s',
    }}>{children}</button>
  );
}
function Center({ children, style }) {
  return <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', ...style }}>{children}</div>;
}
function scoreFrom(correct, total) { return Math.max(20, Math.min(100, Math.round(45 + 55 * (correct / total)))); }

// ═══ 1. RPS — 가위바위보 (억제 제어) ═══
const RPS = { scissors: { l: '가위', icon: 'content_cut' }, rock: { l: '바위', icon: 'sports_mma' }, paper: { l: '보', icon: 'front_hand' } };
const BEATS = { rock: 'scissors', scissors: 'paper', paper: 'rock' }; // key beats value
function Play_rps({ ctx, g, mock, idx, finish }) {
  const total = 5;
  const [round, setRound] = useP(1);
  const [correct, setCorrect] = useP(0);
  const [picked, setPicked] = useP(null);
  const gen = () => {
    const ai = ['rock', 'scissors', 'paper'][Math.floor(Math.random() * 3)];
    const rule = ['이기기', '지기', '비기기'][Math.floor(Math.random() * 3)];
    return { ai, rule };
  };
  const [q, setQ] = useP(gen);
  const answer = q.rule === '비기기' ? q.ai : q.rule === '이기기' ? Object.keys(BEATS).find(k => BEATS[k] === q.ai) : BEATS[q.ai];

  const choose = (k) => {
    if (picked) return;
    const ok = k === answer;
    setPicked(k);
    if (ok) setCorrect(c => c + 1);
    setTimeout(() => {
      if (round >= total) finish(scoreFrom(correct + (ok ? 1 : 0), total));
      else { setRound(r => r + 1); setQ(gen()); setPicked(null); }
    }, 750);
  };
  return (
    <GameStage ctx={ctx} g={g} round={round} total={total} score={correct * 20} mock={mock} idx={idx}
      instruction={<span>현재 규칙: AI 손을 <b style={{ color: g.ink }}>{q.rule}</b></span>}>
      <Center style={{ gap: 18 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 12, color: T.fgSubtle, marginBottom: 6 }}>AI</div>
            <div style={{ width: 96, height: 96, borderRadius: T.r4, background: g.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Sym name={RPS[q.ai].icon} size={52} fill={1} color={g.ink} />
            </div>
          </div>
          <Sym name="swords" size={26} color={T.fgSubtle} />
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 12, color: T.fgSubtle, marginBottom: 6 }}>나</div>
            <div style={{ width: 96, height: 96, borderRadius: T.r4, border: `2px dashed ${T.lineWeak}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {picked ? <Sym name={RPS[picked].icon} size={52} fill={1} color={picked === answer ? T.positive : T.critical} /> : <span style={{ fontSize: 30, color: T.placeholder }}>?</span>}
            </div>
          </div>
        </div>
      </Center>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8 }}>
        {Object.keys(RPS).map(k => (
          <RespBtn key={k} ink={g.ink} state={picked ? (k === answer ? 'right' : k === picked ? 'wrong' : 'idle') : 'idle'} onClick={() => choose(k)} disabled={!!picked}>
            <Sym name={RPS[k].icon} size={30} fill={1} color={T.fg} />
            <span style={{ fontSize: 13, fontWeight: 700, color: T.fg }}>{RPS[k].l}</span>
          </RespBtn>
        ))}
      </div>
    </GameStage>
  );
}

// ═══ 2. ROTATE — 도형 회전 (시공간 작업기억) ═══
function Play_rotate({ ctx, g, mock, idx, finish }) {
  const target = { rot: 90, flip: true };
  const [seq, setSeq] = useP([]); // {op}
  const ops = [
    { id: 'l', label: '왼쪽 45°', icon: 'rotate_left', d: -45 },
    { id: 'r', label: '오른쪽 45°', icon: 'rotate_right', d: 45 },
    { id: 'h', label: '좌우 반전', icon: 'flip', flip: 'x' },
    { id: 'v', label: '상하 반전', icon: 'flip', flip: 'y' },
  ];
  let rot = 0, fx = 1, fy = 1;
  seq.forEach(s => { const o = ops.find(x => x.id === s); if (o.d) rot += o.d; if (o.flip === 'x') fx *= -1; if (o.flip === 'y') fy *= -1; });
  const limit = 8;
  const submit = () => finish(seq.length === 0 ? 40 : Math.max(55, 95 - (seq.length - 2) * 8));
  const Shape = ({ rotate = 0, sx = 1, sy = 1, size = 64 }) => (
    <div style={{ width: size, height: size, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Georgia, serif', fontWeight: 800, fontSize: size * 0.82, color: T.fg, transform: `rotate(${rotate}deg) scale(${sx},${sy})`, lineHeight: 1 }}>R</div>
  );
  return (
    <GameStage ctx={ctx} g={g} round={1} total={1} score={0} mock={mock} idx={idx}
      instruction="왼쪽(전) 도형을 오른쪽(후) 모양으로 만들어 보세요."
      footer={<Button variant="brand" size="large" fullWidth onClick={submit}>답안 제출</Button>}>
      <Card pad={0} style={{ overflow: 'hidden', display: 'grid', gridTemplateColumns: '1fr 1fr', marginBottom: 14 }}>
        <div style={{ padding: 18, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, borderRight: `1px solid ${T.line}` }}>
          <Shape /><span style={{ fontSize: 11, color: T.fgSubtle }}>전</span>
        </div>
        <div style={{ padding: 18, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, background: g.bg }}>
          <Shape rotate={target.rot} sx={target.flip ? -1 : 1} /><span style={{ fontSize: 11, color: g.ink, fontWeight: 700 }}>후</span>
        </div>
      </Card>

      <div style={{ textAlign: 'center', marginBottom: 8 }}>
        <span style={{ fontSize: 12, color: T.fgSubtle }}>내 도형 (남은 클릭 {limit - seq.length})</span>
      </div>
      <Card pad={16} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
        <Shape rotate={rot} sx={fx} sy={fy} size={72} />
      </Card>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 6, marginBottom: 10 }}>
        {ops.map(o => (
          <button key={o.id} disabled={seq.length >= limit} onClick={() => setSeq(s => [...s, o.id])} style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, padding: '10px 4px', borderRadius: T.r2_5,
            background: T.layer, border: `1.5px solid ${g.ink}`, cursor: 'pointer', fontFamily: T.font, WebkitTapHighlightColor: 'transparent',
          }}>
            <Sym name={o.icon} size={22} color={g.ink} style={o.flip === 'y' ? { transform: 'rotate(90deg)' } : null} />
            <span style={{ fontSize: 10, fontWeight: 700, color: T.fg }}>{o.label}</span>
          </button>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
        {seq.length === 0 && <span style={{ fontSize: 12, color: T.placeholder }}>변환 버튼을 눌러 순서를 쌓아요</span>}
        {seq.map((s, i) => <Pill key={i} tone="neutral">{i + 1}. {ops.find(o => o.id === s).label}</Pill>)}
        {seq.length > 0 && <button onClick={() => setSeq([])} style={{ marginLeft: 'auto', border: 'none', background: 'transparent', color: T.fgSubtle, fontFamily: T.font, fontSize: 12, cursor: 'pointer' }}>초기화</button>}
      </div>
    </GameStage>
  );
}

// ═══ 3. PROMISE — 약속 정하기 (논리 추론) ═══
function Play_promise({ ctx, g, mock, idx, finish }) {
  const clues = [
    { who: '철수', icon: 'directions_bus', text: '"16번 버스를 타고 편의점 앞에서 내렸어"' },
    { who: '영희', icon: 'map', text: '"사거리 북동쪽 블록, 편의점과 한 블록 떨어진 곳"' },
    { who: '미미', icon: 'restaurant', text: '"가운데 가게에서 스테이크를 먹었어"' },
  ];
  const options = ['북동 카페', '편의점 옆 분식', '사거리 스테이크집', '남쪽 베이커리'];
  const answer = 2;
  const [picked, setPicked] = useP(null);
  const pick = (i) => { if (picked != null) return; setPicked(i); setTimeout(() => finish(i === answer ? 84 : 58), 900); };
  return (
    <GameStage ctx={ctx} g={g} round={1} total={1} score={0} mock={mock} idx={idx}
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
          <RespBtn key={i} ink={g.ink} state={picked != null ? (i === answer ? 'right' : i === picked ? 'wrong' : 'idle') : 'idle'} onClick={() => pick(i)} disabled={picked != null}>
            <span style={{ fontSize: 14, fontWeight: 700, color: T.fg }}>{o}</span>
          </RespBtn>
        ))}
      </div>
    </GameStage>
  );
}

// ═══ 4. POTION — 마법약 (귀납 추론) ═══
const HERBS = ['eco', 'spa', 'grass', 'water_drop', 'local_florist', 'park'];
function Play_potion({ ctx, g, mock, idx, finish }) {
  const total = 5;
  const [round, setRound] = useP(1);
  const [correct, setCorrect] = useP(0);
  const [picked, setPicked] = useP(null);
  const gen = () => {
    const items = Array.from({ length: 4 }, () => HERBS[Math.floor(Math.random() * HERBS.length)]);
    const red = items.includes('water_drop'); // hidden rule: water → red
    return { items, red };
  };
  const [q, setQ] = useP(gen);
  const choose = (isRed) => {
    if (picked) return;
    const ok = isRed === q.red;
    setPicked(isRed ? 'red' : 'blue');
    if (ok) setCorrect(c => c + 1);
    setTimeout(() => {
      if (round >= total) finish(scoreFrom(correct + (ok ? 1 : 0), total));
      else { setRound(r => r + 1); setQ(gen()); setPicked(null); }
    }, 850);
  };
  const reveal = picked != null;
  return (
    <GameStage ctx={ctx} g={g} round={round} total={total} score={correct * 20} mock={mock} idx={idx}
      instruction="네 재료의 조합으로 어떤 약이 될지 예측해요. 결과를 보며 규칙을 찾아요.">
      <Center>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, width: 200 }}>
          {q.items.map((h, i) => (
            <div key={i} style={{ aspectRatio: '1.3', borderRadius: T.r3, background: g.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Sym name={h} size={30} fill={1} color={g.ink} />
            </div>
          ))}
        </div>
        {reveal && (
          <div style={{ marginTop: 14, textAlign: 'center', animation: 'saeum-pop .3s' }}>
            <Sym name="science" size={40} fill={1} color={q.red ? T.critical : T.info} />
            <div style={{ fontSize: 15, fontWeight: 700, color: q.red ? T.critical : T.info, marginTop: 2 }}>{q.red ? '빨간약' : '파란약'} 완성</div>
            <div style={{ fontSize: 12, color: T.fgSubtle }}>{(picked === 'red') === q.red ? '예측 성공!' : '예측 실패 — 다음 판 힌트로!'}</div>
          </div>
        )}
      </Center>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 8 }}>
        <button onClick={() => choose(false)} disabled={reveal} style={potBtn(T.info, picked === 'blue')}>파란약</button>
        <button onClick={() => choose(true)} disabled={reveal} style={potBtn(T.critical, picked === 'red')}>빨간약</button>
      </div>
    </GameStage>
  );
}
function potBtn(color, sel) {
  return { padding: '16px', borderRadius: T.full, border: `2px solid ${color}`, background: sel ? color : T.layer, color: sel ? '#fff' : color, fontFamily: T.font, fontSize: 16, fontWeight: 700, cursor: 'pointer', WebkitTapHighlightColor: 'transparent' };
}

// ═══ 5. PATH — 길 만들기 (계획력) ═══
function Play_path({ ctx, g, mock, idx, finish }) {
  const cols = 6, rows = 5, limit = 3;
  const [fences, setFences] = useP(new Set());
  const toggle = (k) => setFences(s => { const n = new Set(s); if (n.has(k)) n.delete(k); else if (n.size < limit) n.add(k); return n; });
  const submit = () => finish(fences.size === limit ? 78 : 60);
  return (
    <GameStage ctx={ctx} g={g} round={1} total={1} score={0} mock={mock} idx={idx}
      instruction="울타리를 놓아 사람과 자동차의 길을 분리하세요."
      footer={<Button variant="brand" size="large" fullWidth disabled={fences.size === 0} onClick={submit}>제출 ({fences.size}/{limit})</Button>}>
      <div style={{ display: 'flex', justifyContent: 'space-around', fontSize: 24, marginBottom: 8 }}>
        <Sym name="directions_walk" size={28} color={T.fg} /><Sym name="escalator_warning" size={28} color={T.fg} />
      </div>
      <Card pad={12}>
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols},1fr)`, gap: 4 }}>
          {Array.from({ length: rows * cols }).map((_, i) => {
            const has = fences.has(i);
            return (
              <button key={i} onClick={() => toggle(i)} style={{
                aspectRatio: '1', borderRadius: T.r1, cursor: 'pointer', WebkitTapHighlightColor: 'transparent',
                background: has ? g.bg : T.layer, border: `1.5px solid ${has ? g.ink : T.line}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {has ? <Sym name="fence" size={18} color={g.ink} fill={1} /> : <Sym name="close" size={14} color={T.placeholder} />}
              </button>
            );
          })}
        </div>
      </Card>
      <div style={{ display: 'flex', justifyContent: 'center', gap: 18, fontSize: 24, marginTop: 8 }}>
        <Sym name="local_taxi" size={28} color={T.fg} /><Sym name="directions_car" size={28} color={T.fg} />
      </div>
    </GameStage>
  );
}

Object.assign(window, { Play_rps, Play_rotate, Play_promise, Play_potion, Play_path, RespBtn, Center, scoreFrom });
