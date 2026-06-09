// games-play-b.jsx — 게임 6~9 인터랙티브 플레이
const { useState: usePB, useEffect: usePBE, useRef: usePBR } = React;

// ═══ 6. NUMBERS — 숫자 누르기 (Digit Span 역순) ═══
function Play_numbers({ ctx, g, mock, idx, finish }) {
  const total = 4;
  const [round, setRound] = usePB(1);
  const [correct, setCorrect] = usePB(0);
  const len = 3 + round; // 4,5,6,7
  const [seq, setSeq] = usePB(() => Array.from({ length: 4 }, () => Math.floor(Math.random() * 10)));
  const [phase, setPhase] = usePB('memorize'); // memorize | recall
  const [input, setInput] = usePB([]);
  const [flash, setFlash] = usePB(null);

  usePBE(() => {
    setSeq(Array.from({ length: len }, () => Math.floor(Math.random() * 10)));
    setPhase('memorize'); setInput([]);
    const t = setTimeout(() => setPhase('recall'), 900 + len * 600);
    return () => clearTimeout(t);
  }, [round]);

  const target = [...seq].reverse();
  const press = (n) => {
    if (phase !== 'recall' || input.length >= len) return;
    setInput(i => [...i, n]);
  };
  const submit = () => {
    const ok = input.join('') === target.join('');
    if (ok) setCorrect(c => c + 1);
    setFlash(ok ? 'right' : 'wrong');
    setTimeout(() => {
      setFlash(null);
      if (round >= total) finish(scoreFrom(correct + (ok ? 1 : 0), total));
      else setRound(r => r + 1);
    }, 800);
  };

  return (
    <GameStage ctx={ctx} g={g} round={round} total={total} score={correct * 25} mock={mock} idx={idx}
      instruction="숫자가 사라지면 순서를 거꾸로 입력하세요.">
      {/* sequence display */}
      <Card pad={14} bg={g.bg} border={false} style={{ marginBottom: 12 }}>
        <div style={{ fontSize: 11, color: T.fgMuted, marginBottom: 8 }}>{phase === 'memorize' ? '제시되는 숫자 — 외우세요' : '제시된 숫자 (사라짐)'}</div>
        <div style={{ display: 'flex', gap: 6, justifyContent: 'center', flexWrap: 'wrap' }}>
          {seq.map((n, i) => (
            <div key={i} style={{ width: 38, height: 46, borderRadius: T.r2, background: T.layer, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 700, color: T.fg, opacity: phase === 'memorize' ? 1 : 0.18 }}>
              {phase === 'memorize' ? n : '?'}
            </div>
          ))}
        </div>
      </Card>

      {/* input */}
      <div style={{ marginBottom: 10 }}>
        <div style={{ fontSize: 11, color: T.fgSubtle, marginBottom: 6 }}>역순 입력</div>
        <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
          {Array.from({ length: len }).map((_, i) => (
            <div key={i} style={{ width: 38, height: 46, borderRadius: T.r2, border: `1.5px ${input[i] != null ? 'solid' : 'dashed'} ${flash === 'right' ? T.positive : flash === 'wrong' ? T.critical : input[i] != null ? g.ink : T.lineWeak}`, background: input[i] != null ? g.bg : T.layer, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 700, color: T.fg }}>
              {input[i] ?? ''}
            </div>
          ))}
        </div>
      </div>

      {/* keypad */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8, marginTop: 'auto' }}>
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => (
          <button key={n} onClick={() => press(n)} disabled={phase !== 'recall'} style={keyStyle(phase !== 'recall')}>{n}</button>
        ))}
        <button onClick={() => setInput(i => i.slice(0, -1))} disabled={phase !== 'recall'} style={keyStyle(phase !== 'recall', T.neutralWeak)}><Sym name="backspace" size={22} color={T.fg} /></button>
        <button onClick={() => press(0)} disabled={phase !== 'recall'} style={keyStyle(phase !== 'recall')}>0</button>
        <button onClick={submit} disabled={phase !== 'recall' || input.length !== len} style={keyStyle(phase !== 'recall' || input.length !== len, T.brandSolid, '#fff')}><Sym name="check" size={24} color="#fff" /></button>
      </div>
    </GameStage>
  );
}
function keyStyle(disabled, bg, color) {
  return { aspectRatio: '1.7', borderRadius: T.r3, border: bg ? 'none' : `1px solid ${T.line}`, background: disabled ? T.disabled : (bg || T.layer), color: disabled ? T.placeholder : (color || T.fg), fontFamily: T.font, fontSize: 22, fontWeight: 700, cursor: disabled ? 'default' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', WebkitTapHighlightColor: 'transparent' };
}

// ═══ 7. MEMORY — 도형 순서 기억 (N-back) ═══
const SHAPES = ['change_history', 'square', 'circle', 'pentagon'];
function Play_memory({ ctx, g, mock, idx, finish }) {
  const total = 6;
  const [round, setRound] = usePB(1);
  const [correct, setCorrect] = usePB(0);
  const [hist, setHist] = usePB([]);
  const [cur, setCur] = usePB(() => SHAPES[Math.floor(Math.random() * SHAPES.length)]);
  const [picked, setPicked] = usePB(null);

  const ans = () => {
    const h = hist;
    if (h.length >= 2 && h[h.length - 2] === cur) return 'n2';
    if (h.length >= 3 && h[h.length - 3] === cur) return 'n3';
    return 'diff';
  };
  const choose = (val) => {
    if (picked) return;
    const ok = val === ans();
    setPicked(val);
    if (ok) setCorrect(c => c + 1);
    setTimeout(() => {
      const nh = [...hist, cur];
      if (round >= total) { finish(scoreFrom(correct + (ok ? 1 : 0), total)); return; }
      setHist(nh);
      setCur(SHAPES[Math.floor(Math.random() * SHAPES.length)]);
      setPicked(null); setRound(r => r + 1);
    }, 700);
  };
  const opts = [{ v: 'diff', l: '다름' }, { v: 'n2', l: '2번째 전과 같음' }, { v: 'n3', l: '3번째 전과 같음' }];
  return (
    <GameStage ctx={ctx} g={g} round={round} total={total} score={correct * 16} mock={mock} idx={idx}
      instruction="지금 도형이 2번째 전 / 3번째 전 도형과 같은지 판단하세요.">
      <Center>
        {/* card stack */}
        <div style={{ position: 'relative', width: 120, height: 130 }}>
          {[2, 1].map(o => (
            <div key={o} style={{ position: 'absolute', top: o * 4, left: o * 5, width: 104, height: 116, borderRadius: T.r3, background: T.layer, border: `1px solid ${T.line}`, transform: `rotate(${-o * 2}deg)` }} />
          ))}
          <div style={{ position: 'absolute', top: 0, left: 0, width: 104, height: 116, borderRadius: T.r3, background: g.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: T.s1 }}>
            <Sym name={cur} size={56} fill={1} color={g.ink} />
          </div>
        </div>
      </Center>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {opts.map(o => (
          <RespBtn key={o.v} ink={g.ink} state={picked ? (o.v === ans() ? 'right' : o.v === picked ? 'wrong' : 'idle') : 'idle'} onClick={() => choose(o.v)} disabled={!!picked}>
            <span style={{ fontSize: 14, fontWeight: 700, color: T.fg }}>{o.l}</span>
          </RespBtn>
        ))}
      </div>
    </GameStage>
  );
}

// ═══ 8. CAT — 고양이 찾기 (메타인지) ═══
function Play_cat({ ctx, g, mock, idx, finish }) {
  const N = 36;
  const mice = usePBR(new Set([4, 10, 15, 22, 28, 33])).current;
  const catCell = 15; // overlaps a mouse → found
  const [phase, setPhase] = usePB('mice'); // mice | judge
  const [conf, setConf] = usePB(null);
  usePBE(() => { const t = setTimeout(() => setPhase('judge'), 2600); return () => clearTimeout(t); }, []);
  const labels = ['매우 확실', '확실', '조금', '불확실', '불확실', '조금', '확실', '매우 확실']; // left=놓쳤다 ... right=찾았다
  const found = mice.has(catCell);
  const pick = (i) => {
    if (conf != null) return;
    setConf(i);
    const saysFound = i >= 4;
    const strength = i >= 4 ? i - 3 : 4 - i; // 1..4
    const ok = saysFound === found;
    const sc = ok ? 70 + strength * 6 : 60 - strength * 6;
    setTimeout(() => finish(Math.max(30, Math.min(95, sc))), 900);
  };
  return (
    <GameStage ctx={ctx} g={g} round={1} total={1} score={0} mock={mock} idx={idx}
      instruction="생쥐가 숨은 위치를 외우고, 고양이가 찾았는지 판단하세요.">
      <div style={{ textAlign: 'center', fontSize: 15, fontWeight: 700, color: T.fg, margin: '4px 0 10px' }}>
        {phase === 'mice' ? '생쥐들이 숨습니다 — 위치를 외우세요' : '이 칸의 고양이는 생쥐를 찾았을까요?'}
      </div>
      <Card pad={12} style={{ marginBottom: 12 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6,1fr)', gap: 4 }}>
          {Array.from({ length: N }).map((_, i) => {
            const showMouse = phase === 'mice' && mice.has(i);
            const isCat = phase === 'judge' && i === catCell;
            return (
              <div key={i} style={{ aspectRatio: '1', borderRadius: T.r1, background: isCat ? 'var(--mossy-color-bg-critical-weak)' : T.basement, border: isCat ? `2px solid ${T.critical}` : `1px solid ${T.line}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {showMouse && <Sym name="cruelty_free" size={16} color={T.fgMuted} fill={1} />}
                {isCat && <Sym name="pets" size={18} color={T.critical} fill={1} />}
              </div>
            );
          })}
        </div>
      </Card>
      {phase === 'judge' && (
        <div style={{ animation: 'saeum-fade-up .3s' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0 2px 6px', fontSize: 12, fontWeight: 700 }}>
            <span style={{ color: T.critical }}>← 놓쳤다</span><span style={{ color: T.positive }}>찾았다 →</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8,1fr)', gap: 4 }}>
            {labels.map((l, i) => {
              const sel = conf === i;
              const side = i >= 4 ? T.positive : T.critical;
              return (
                <button key={i} onClick={() => pick(i)} disabled={conf != null} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, cursor: 'pointer', border: 'none', background: 'transparent', fontFamily: T.font, WebkitTapHighlightColor: 'transparent' }}>
                  <span style={{ width: '100%', aspectRatio: '1', borderRadius: T.full, border: `2px solid ${sel ? side : T.lineWeak}`, background: sel ? side : T.layer }} />
                  <span style={{ fontSize: 8, color: sel ? side : T.fgSubtle, fontWeight: sel ? 700 : 400, lineHeight: 1.1, textAlign: 'center' }}>{l}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </GameStage>
  );
}

// ═══ 9. COMPARE — 개수 비교 (Subitizing) ═══
function Play_compare({ ctx, g, mock, idx, finish }) {
  const total = 8;
  const [round, setRound] = usePB(1);
  const [correct, setCorrect] = usePB(0);
  const [picked, setPicked] = usePB(null);
  const gen = () => {
    const l = 6 + Math.floor(Math.random() * 10);
    let r = 6 + Math.floor(Math.random() * 10);
    if (r === l) r += 1;
    return { l, r, big: l > r ? 'l' : 'r' };
  };
  const [q, setQ] = usePB(gen);
  const dots = (n, big) => Array.from({ length: n }).map((_, i) => {
    const sz = big ? 16 : 9;
    return <span key={i} style={{ position: 'absolute', left: `${8 + (i * 37) % 78}%`, top: `${10 + ((i * 53) % 76)}%`, width: sz, height: sz, borderRadius: T.full, background: T.fg, transform: 'translate(-50%,-50%)' }} />;
  });
  const choose = (side) => {
    if (picked) return;
    const ok = side === q.big;
    setPicked(side);
    if (ok) setCorrect(c => c + 1);
    setTimeout(() => {
      if (round >= total) finish(scoreFrom(correct + (ok ? 1 : 0), total));
      else { setRound(r => r + 1); setQ(gen()); setPicked(null); }
    }, 450);
  };
  return (
    <GameStage ctx={ctx} g={g} round={round} total={total} score={correct * 12} mock={mock} idx={idx}
      instruction={<span><b style={{ color: g.ink }}>개수가 더 많은</b> 쪽을 빠르게 탭하세요. 크기에 속지 마세요.</span>}>
      <Center style={{ flex: 'none', paddingTop: 8 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, width: '100%' }}>
          {[{ s: 'l', n: q.l, big: false }, { s: 'r', n: q.r, big: true }].map(side => (
            <button key={side.s} onClick={() => choose(side.s)} disabled={!!picked} style={{
              position: 'relative', height: 230, borderRadius: T.r4, cursor: 'pointer', WebkitTapHighlightColor: 'transparent',
              background: picked === side.s ? (side.s === q.big ? T.positiveWeak : 'var(--mossy-color-bg-critical-weak)') : T.layer,
              border: `1.5px solid ${picked === side.s ? (side.s === q.big ? T.positive : T.critical) : T.line}`, overflow: 'hidden',
            }}>
              {dots(side.n, side.big)}
              <span style={{ position: 'absolute', top: 6, left: 8, fontSize: 11, color: T.fgSubtle }}>{side.s === 'l' ? '왼쪽' : '오른쪽'}</span>
            </button>
          ))}
        </div>
      </Center>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 10 }}>
        <Button variant="outline" size="large" leadingIcon="arrow_back" onClick={() => choose('l')} disabled={!!picked}>왼쪽</Button>
        <Button variant="outline" size="large" trailingIcon="arrow_forward" onClick={() => choose('r')} disabled={!!picked}>오른쪽</Button>
      </div>
    </GameStage>
  );
}

Object.assign(window, { Play_numbers, Play_memory, Play_cat, Play_compare });
