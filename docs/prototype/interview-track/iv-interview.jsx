// iv-interview.jsx — Step 4. 모의 면접 (변형 A 몰입형 / B 구조형 / C 코치형)
const { useState: useIT, useEffect: useITE, useRef: useITR } = React;

const mmss = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

// 음성 파형 (녹화 중 애니메이션)
function Waveform({ active, color = T.brand, bars = 22, height = 28 }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 3, height }}>
      {Array.from({ length: bars }).map((_, i) => (
        <span key={i} style={{
          width: 3, borderRadius: 2, background: color, flex: 'none',
          height: active ? '100%' : '14%',
          animation: active ? `iv-wave 0.9s ease-in-out ${(i % 6) * 0.11}s infinite` : 'none',
          transformOrigin: 'center',
        }} />
      ))}
    </div>
  );
}

// 둥근 녹화/정지 버튼
function RecordBtn({ recording, onClick, size = 72, dark }) {
  return (
    <button onClick={onClick} aria-label={recording ? '답변 종료' : '답변 시작'} style={{
      width: size, height: size, borderRadius: T.full, cursor: 'pointer', flex: 'none',
      border: `4px solid ${dark ? 'rgba(255,255,255,0.85)' : T.layer}`, background: 'transparent',
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: 0,
      boxShadow: dark ? '0 2px 12px rgba(0,0,0,0.4)' : T.s2, WebkitTapHighlightColor: 'transparent',
    }}>
      <span style={{
        background: '#ff453a', transition: 'all .2s var(--mossy-timing-function-enter)',
        width: recording ? size * 0.34 : size * 0.7, height: recording ? size * 0.34 : size * 0.7,
        borderRadius: recording ? 6 : T.full,
      }} />
    </button>
  );
}

// 질문별 진행 점
function QDots({ idx, total, dark }) {
  return (
    <div style={{ display: 'flex', gap: 4, alignItems: 'center', justifyContent: 'center' }}>
      {Array.from({ length: total }).map((_, i) => (
        <span key={i} style={{ width: i === idx ? 18 : 6, height: 6, borderRadius: T.full, transition: 'width .3s', background: i < idx ? T.brandSolid : i === idx ? (dark ? '#fff' : T.fg) : (dark ? 'rgba(255,255,255,0.3)' : T.neutralWeak) }} />
      ))}
    </div>
  );
}

// ════════════════════════════════════════════════════════════
// 변형 A — 몰입형 (풀스크린 카메라 + 글래스 오버레이)
// ════════════════════════════════════════════════════════════
function InterviewA({ q, idx, total, mode, elapsed, onStart, onStop, onRetake, onNext, isLast }) {
  return (
    <div style={{ position: 'absolute', inset: 0, background: '#0d0e0f' }}>
      <CameraView recording={mode === 'rec'} time={mmss(elapsed)} rounded={0} style={{ position: 'absolute', inset: 0 }}>
        {/* 상단 질문 글래스 */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, paddingTop: 50 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 14px' }}>
            <QDots idx={idx} total={total} dark />
            <span style={{ marginLeft: 'auto', fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.85)' }}>{idx + 1} / {total}</span>
          </div>
          <div style={{ margin: '4px 14px', padding: 14, borderRadius: T.r4, background: 'rgba(20,22,24,0.55)', backdropFilter: 'blur(14px)', border: '1px solid rgba(255,255,255,0.12)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <CatChip cat={q.cat} small />
              <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)' }}>권장 {mmss(q.limit)}</span>
            </div>
            <div style={{ fontSize: 17, fontWeight: 700, color: '#fff', lineHeight: 1.4, letterSpacing: '-0.01em' }}>{q.text}</div>
          </div>
        </div>

        {/* 하단 컨트롤 */}
        <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, padding: '16px 16px 34px', background: 'linear-gradient(to top, rgba(0,0,0,0.6), transparent)' }}>
          {mode === 'rec' && <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 14 }}><Waveform active color="#fff" /></div>}
          {mode === 'review' ? (
            <div style={{ background: 'rgba(20,22,24,0.7)', backdropFilter: 'blur(14px)', borderRadius: T.r5, padding: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, justifyContent: 'center' }}>
                <Sym name="check_circle" size={20} fill={1} color={T.positive} />
                <span style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>답변을 저장했어요 · {mmss(elapsed)}</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.3fr', gap: 8 }}>
                <button onClick={onRetake} style={glassBtn(false)}><Sym name="replay" size={18} color="#fff" />다시</button>
                <button onClick={onNext} style={glassBtn(true)}>{isLast ? '면접 종료' : '다음 질문'}<Sym name="arrow_forward" size={18} color="#fff" /></button>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)' }}>{mode === 'rec' ? '답변 중 — 끝나면 정지를 눌러요' : '준비되면 버튼을 눌러 답변을 시작해요'}</span>
              <RecordBtn recording={mode === 'rec'} dark onClick={mode === 'rec' ? onStop : onStart} />
            </div>
          )}
        </div>
      </CameraView>
    </div>
  );
}
function glassBtn(primary) {
  return {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '13px', borderRadius: T.r3,
    border: 'none', cursor: 'pointer', fontFamily: T.font, fontSize: 14, fontWeight: 700, color: '#fff',
    background: primary ? T.brandSolid : 'rgba(255,255,255,0.16)', WebkitTapHighlightColor: 'transparent',
  };
}

// ════════════════════════════════════════════════════════════
// 변형 B — 구조형 (질문 카드 + 카메라 + 컨트롤 분리)
// ════════════════════════════════════════════════════════════
function InterviewB({ q, idx, total, mode, elapsed, onStart, onStop, onRetake, onNext, isLast }) {
  return (
    <Body bottomPad={20} style={{ display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
        <QDots idx={idx} total={total} />
        <span style={{ marginLeft: 'auto', fontSize: 12, fontWeight: 700, color: T.fgMuted }}>{idx + 1} / {total}</span>
      </div>

      {/* 질문 카드 */}
      <Card pad={14} style={{ marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <CatChip cat={q.cat} small />
          <span style={{ marginLeft: 'auto', fontSize: 11, color: T.fgSubtle, display: 'flex', alignItems: 'center', gap: 3 }}><Sym name="schedule" size={14} color={T.fgSubtle} />권장 {mmss(q.limit)}</span>
        </div>
        <div style={{ fontSize: 17, fontWeight: 700, color: T.fg, lineHeight: 1.45, letterSpacing: '-0.01em' }}>{q.text}</div>
      </Card>

      {/* 카메라 */}
      <CameraView recording={mode === 'rec'} time={mmss(elapsed)} style={{ flex: 1, minHeight: 280 }}>
        {mode === 'review' && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, background: 'rgba(13,14,15,0.55)', backdropFilter: 'blur(3px)' }}>
            <span style={{ width: 56, height: 56, borderRadius: T.full, background: 'rgba(255,255,255,0.12)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}><Sym name="play_arrow" size={32} fill={1} color="#fff" /></span>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>내 답변 다시보기 · {mmss(elapsed)}</span>
          </div>
        )}
        {mode === 'ready' && (
          <div style={{ position: 'absolute', left: 0, right: 0, bottom: 14, textAlign: 'center', fontSize: 12, color: 'rgba(255,255,255,0.7)' }}>카메라·마이크 준비 완료</div>
        )}
      </CameraView>

      {/* 타이머 + 파형 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 4px' }}>
        <span style={{ fontSize: 20, fontWeight: 700, color: mode === 'rec' ? T.critical : T.fg, fontVariantNumeric: 'tabular-nums', minWidth: 52 }}>{mmss(elapsed)}</span>
        <div style={{ flex: 1 }}><Waveform active={mode === 'rec'} color={T.purple} /></div>
      </div>

      {/* 컨트롤 */}
      {mode === 'review' ? (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: 8 }}>
          <Button variant="outline" size="large" leadingIcon="replay" onClick={onRetake}>다시 답하기</Button>
          <Button variant="brand" size="large" trailingIcon="arrow_forward" onClick={onNext}>{isLast ? '면접 종료' : '다음 질문'}</Button>
        </div>
      ) : mode === 'rec' ? (
        <Button variant="critical" size="large" fullWidth leadingIcon="stop_circle" onClick={onStop}>답변 종료</Button>
      ) : (
        <Button variant="brand" size="large" fullWidth leadingIcon="fiber_manual_record" onClick={onStart}>답변 시작</Button>
      )}
    </Body>
  );
}

// ════════════════════════════════════════════════════════════
// 변형 C — 코치형 (카메라 + STAR 가이드 + 키포인트)
// ════════════════════════════════════════════════════════════
const STAR_GUIDE = [
  { k: 'S', label: '상황', hint: '언제·어디서' },
  { k: 'T', label: '과제', hint: '무엇이 문제' },
  { k: 'A', label: '행동', hint: '내가 한 일' },
  { k: 'R', label: '결과', hint: '수치·배움' },
];
function InterviewC({ q, idx, total, mode, elapsed, onStart, onStop, onRetake, onNext, isLast }) {
  const keypoints = (Q_WHY[q.id] || '').split(' — ');
  const words = q.transcript.replace(/[“”"]/g, '').split(' ');
  const revealed = mode === 'review' ? words.length : Math.min(words.length, Math.floor(elapsed * 2.6));
  return (
    <Body bottomPad={20} style={{ display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
        <QDots idx={idx} total={total} />
        <span style={{ marginLeft: 'auto', fontSize: 12, fontWeight: 700, color: T.fgMuted }}>{idx + 1} / {total}</span>
      </div>

      {/* 질문 + 카메라 나란히 */}
      <Card pad={12} style={{ marginBottom: 10 }}>
        <div style={{ display: 'flex', gap: 12 }}>
          <CameraView recording={mode === 'rec'} time={mmss(elapsed)} rounded={T.r3} style={{ width: 116, height: 150, flex: 'none' }} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}><CatChip cat={q.cat} small /></div>
            <div style={{ fontSize: 15, fontWeight: 700, color: T.fg, lineHeight: 1.4, letterSpacing: '-0.01em' }}>{q.text}</div>
            <div style={{ marginTop: 8, fontSize: 16, fontWeight: 700, color: mode === 'rec' ? T.critical : T.fgSubtle, fontVariantNumeric: 'tabular-nums' }}>{mmss(elapsed)} <span style={{ fontSize: 11, fontWeight: 500, color: T.fgSubtle }}>/ 권장 {mmss(q.limit)}</span></div>
          </div>
        </div>
      </Card>

      {/* STAR 가이드 */}
      <div style={{ fontSize: 12, fontWeight: 700, color: T.fgSubtle, margin: '2px 2px 8px', display: 'flex', alignItems: 'center', gap: 5 }}><Sym name="view_timeline" size={16} fill={1} color={T.blue} />STAR 구조로 답해 보세요</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 6, marginBottom: 12 }}>
        {STAR_GUIDE.map(s => (
          <div key={s.k} style={{ padding: '10px 6px', borderRadius: T.r2_5, background: T.bnBlue, textAlign: 'center' }}>
            <div style={{ fontSize: 18, fontWeight: 800, color: T.blue, lineHeight: 1 }}>{s.k}</div>
            <div style={{ fontSize: 11, fontWeight: 700, color: T.fg, marginTop: 3 }}>{s.label}</div>
            <div style={{ fontSize: 9.5, color: T.fgSubtle, marginTop: 1 }}>{s.hint}</div>
          </div>
        ))}
      </div>

      {/* ready: 키포인트 / rec·review: 실시간 자막 */}
      {mode === 'ready' ? (
        <Card pad={12} bg={T.bnGreen} border={false} style={{ marginBottom: 'auto' }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: T.brand, marginBottom: 6, display: 'flex', alignItems: 'center', gap: 5 }}><Sym name="tips_and_updates" size={15} fill={1} color={T.brand} />이 질문 키포인트</div>
          {keypoints.map((kp, i) => (
            <div key={i} style={{ display: 'flex', gap: 6, alignItems: 'flex-start', marginTop: i ? 5 : 0 }}>
              <Sym name="arrow_right" size={16} color={T.brand} style={{ marginTop: 1 }} />
              <span style={{ fontSize: 12.5, color: T.fg, lineHeight: 1.4 }}>{kp}</span>
            </div>
          ))}
        </Card>
      ) : (
        <Card pad={12} style={{ marginBottom: 'auto', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
            {mode === 'rec'
              ? <><span style={{ width: 8, height: 8, borderRadius: T.full, background: '#ff453a', animation: 'iv-blink 1s steps(2) infinite' }} /><span style={{ fontSize: 12, fontWeight: 700, color: T.fg }}>실시간 음성 인식</span></>
              : <><Sym name="subtitles" size={16} fill={1} color={T.purple} /><span style={{ fontSize: 12, fontWeight: 700, color: T.fg }}>내 답변 자막</span></>}
            <span style={{ marginLeft: 'auto', fontSize: 11, color: T.fgSubtle }}>{revealed} / {words.length} 단어</span>
          </div>
          <div style={{ fontSize: 14, lineHeight: 1.65, color: T.fg, minHeight: 90, maxHeight: 130, overflow: 'hidden' }}>
            {revealed === 0 && mode === 'rec'
              ? <span style={{ color: T.placeholder }}>말을 시작하면 자막이 실시간으로 나타나요…</span>
              : <>{words.slice(0, revealed).join(' ')}{mode === 'rec' && <span style={{ display: 'inline-block', width: 2, height: '1.05em', marginLeft: 2, background: T.brand, verticalAlign: 'text-bottom', animation: 'iv-blink 1s steps(2) infinite' }} />}</>}
          </div>
        </Card>
      )}

      {/* 컨트롤 */}
      <div style={{ paddingTop: 12 }}>
        {mode === 'review' ? (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: 8 }}>
            <Button variant="outline" size="large" leadingIcon="replay" onClick={onRetake}>다시 답하기</Button>
            <Button variant="brand" size="large" trailingIcon="arrow_forward" onClick={onNext}>{isLast ? '면접 종료' : '다음 질문'}</Button>
          </div>
        ) : mode === 'rec' ? (
          <Button variant="critical" size="large" fullWidth leadingIcon="stop_circle" onClick={onStop}>답변 종료</Button>
        ) : (
          <Button variant="brand" size="large" fullWidth leadingIcon="fiber_manual_record" onClick={onStart}>답변 시작</Button>
        )}
      </div>
    </Body>
  );
}

// ── 완료 화면 ─────────────────────────────────────────────────
function InterviewFinish({ ctx, retry, count, totalTime }) {
  return (
    <Screen bg={T.layer}>
      <Body bottomPad={140}>
        <div style={{ textAlign: 'center', paddingTop: 40, animation: 'saeum-pop .5s var(--mossy-timing-function-enter)' }}>
          <span style={{ width: 80, height: 80, borderRadius: T.full, background: T.brandWeak, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
            <Sym name="check_circle" size={48} fill={1} color={T.brand} />
          </span>
          <div style={{ fontSize: 25, fontWeight: 700, color: T.fg, marginTop: 14, letterSpacing: '-0.02em' }}>{retry ? '다시 답변했어요!' : '면접을 완주했어요!'}</div>
          <div style={{ fontSize: 14, color: T.fgMuted, marginTop: 4 }}>{retry ? '이전 답변과 어떻게 달라졌는지 확인해요' : 'AI가 답변·음성·시선·전달력을 분석할게요'}</div>
        </div>
        <Card pad={14} style={{ marginTop: 22 }}>
          <div style={{ display: 'flex' }}>
            {[['질문', `${count}개`], ['소요 시간', totalTime], ['완료율', '100%']].map(([l, v], i) => (
              <div key={i} style={{ flex: 1, textAlign: 'center', borderRight: i < 2 ? `1px solid ${T.line}` : 'none' }}>
                <div style={{ fontSize: 20, fontWeight: 700, color: i === 0 ? T.brand : T.fg }}>{v}</div>
                <div style={{ fontSize: 11, color: T.fgSubtle, marginTop: 2 }}>{l}</div>
              </div>
            ))}
          </div>
        </Card>
      </Body>
      <FlowFooter>
        {retry
          ? <Button variant="brand" size="large" fullWidth trailingIcon="compare_arrows" onClick={() => ctx.replace('ivRetry')}>비교 결과 보기</Button>
          : <Button variant="brand" size="large" fullWidth leadingIcon="auto_awesome" onClick={() => ctx.replace('ivFeedback')}>AI 피드백 받기</Button>}
      </FlowFooter>
    </Screen>
  );
}

// ── 컨테이너 (상태 머신) ──────────────────────────────────────
function IVInterview({ ctx }) {
  const retry = ctx.params && ctx.params.retry;
  const questions = retry ? IV_WEAK_IDS.map(id => IV_QUESTIONS.find(q => q.id === id)) : IV_QUESTIONS;
  const total = questions.length;

  const [idx, setIdx] = useIT(0);
  const [mode, setMode] = useIT('ready'); // ready | rec | review
  const [elapsed, setElapsed] = useIT(0);
  const [done, setDone] = useIT(false);
  const [acc, setAcc] = useIT(0); // 누적 소요(초)
  const tref = useITR(null);

  useITE(() => {
    if (mode === 'rec') {
      tref.current = setInterval(() => setElapsed(e => e + 1), 1000);
      return () => clearInterval(tref.current);
    }
  }, [mode]);

  const start = () => { setElapsed(0); setMode('rec'); };
  const stop = () => { clearInterval(tref.current); setMode('review'); setAcc(a => a + elapsed); };
  const retake = () => { setElapsed(0); setMode('rec'); };
  const next = () => {
    if (idx >= total - 1) { setDone(true); return; }
    setIdx(i => i + 1); setMode('ready'); setElapsed(0);
  };

  if (done) return <InterviewFinish ctx={ctx} retry={retry} count={total} totalTime={mmss(acc || (retry ? 98 : 742))} />;

  const q = questions[idx];
  const isLast = idx === total - 1;
  const props = { q, idx, total, mode, elapsed, onStart: start, onStop: stop, onRetake: retake, onNext: next, isLast };

  return (
    <Screen bg={T.basement}>
      <FlowHeader stepKey="interview" title={retry ? '약점 다시 면접' : '모의 면접'} onClose={() => ctx.resetTo('ivHub')} />
      <InterviewC {...props} />
    </Screen>
  );
}

Object.assign(window, { IVInterview, InterviewA, InterviewB, InterviewC, InterviewFinish, Waveform, RecordBtn, QDots, mmss });
