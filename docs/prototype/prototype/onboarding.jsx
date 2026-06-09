// onboarding.jsx — 첫 실행 플로우 (5단계)
const { useState: useStateOnb } = React;

function Onboarding({ ctx, initialStep = 0 }) {
  const [step, setStep] = useStateOnb(initialStep);
  const [field, setField] = useStateOnb('it');
  const [mins, setMins] = useStateOnb(10);
  const [notify, setNotify] = useStateOnb(true);

  const next = () => setStep(s => Math.min(s + 1, 4));
  const skip = () => setStep(3);
  const finish = () => { ctx.showToast('환영해요! 첫 게임을 시작해볼까요', { icon: 'eco' }); ctx.resetTo('home'); };

  // shared full-screen layout
  const wrap = (content, footer) => (
    <Screen bg={T.layer}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto', paddingTop: 50 }} className="saeum-scroll">
        {content}
      </div>
      <div style={{ flex: 'none', padding: '12px 20px 34px' }}>{footer}</div>
    </Screen>
  );

  // ── 1. Splash ──
  if (step === 0) {
    return wrap(
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '0 32px' }}>
        <div style={{ width: 96, height: 96, borderRadius: 28, background: T.brandSolid, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24, boxShadow: T.s2 }}>
          <Sym name="eco" size={54} fill={1} color="#fff" />
        </div>
        <div style={{ fontSize: 28, fontWeight: 700, lineHeight: 1.3, letterSpacing: '-0.02em', color: T.fg }}>
          게임으로 연습하는<br/>AI 면접 준비
        </div>
        <div style={{ marginTop: 14, fontSize: 16, color: T.fgMuted, lineHeight: 1.5, maxWidth: 280 }}>
          9개의 역량 게임으로 실전처럼 연습하고, 나만의 AI 리포트를 받아요.
        </div>
        <div style={{ marginTop: 22 }}><Logo size={18} /></div>
      </div>,
      <>
        <Button variant="brand" size="large" fullWidth trailingIcon="arrow_forward" onClick={next}>시작하기</Button>
        <div style={{ textAlign: 'center', marginTop: 14 }}>
          <button onClick={() => ctx.resetTo('home')} style={linkBtn}>이미 계정이 있어요 · 로그인</button>
        </div>
      </>
    );
  }

  // ── 2 & 3. Value props ──
  if (step === 1 || step === 2) {
    const isFirst = step === 1;
    return wrap(
      <>
        <div style={{ padding: '0 20px', display: 'flex', justifyContent: 'flex-end' }}>
          <button onClick={skip} style={linkBtn}>건너뛰기</button>
        </div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '0 28px' }}>
          {isFirst ? (
            <div style={{ width: '100%', maxWidth: 300, padding: 22, borderRadius: T.r6, background: T.bnGreen, display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 28 }}>
              {GAMES.map(g => (
                <div key={g.id} style={{ aspectRatio: '1', borderRadius: T.r3, background: T.layer, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: T.s1 }}>
                  <Sym name={g.icon} size={26} fill={1} color={g.ink} />
                </div>
              ))}
            </div>
          ) : (
            <div style={{ width: '100%', maxWidth: 300, height: 200, borderRadius: T.r6, background: T.bnBlue, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 28, position: 'relative' }}>
              <ReadinessGauge score={74} size={140} label={false} />
            </div>
          )}
          <div style={{ fontSize: 25, fontWeight: 700, lineHeight: 1.32, letterSpacing: '-0.02em', color: T.fg }}>
            {isFirst ? <>실제 AI 면접에 나오는<br/>9가지 역량 게임</> : <>내 역량을 한눈에<br/>AI 리포트로 받아요</>}
          </div>
          <div style={{ marginTop: 12, fontSize: 15, color: T.fgMuted, lineHeight: 1.5, maxWidth: 290 }}>
            {isFirst
              ? '가위바위보부터 마법약 만들기까지, 실전과 똑같은 게임을 반복해서 연습해요.'
              : '신뢰·전략·관계·가치·조직적합 5대 역량 점수와 맞춤 개선 팁을 알려드려요.'}
          </div>
        </div>
        <Dots total={2} active={step - 1} />
      </>,
      <Button variant="brand" size="large" fullWidth trailingIcon="arrow_forward" onClick={next}>다음</Button>
    );
  }

  // ── 4. 분야 선택 ──
  if (step === 3) {
    const fields = [
      { id: 'it', label: 'IT · 개발', icon: 'code' },
      { id: 'biz', label: '경영 · 기획', icon: 'insert_chart' },
      { id: 'mkt', label: '마케팅 · 영업', icon: 'campaign' },
      { id: 'design', label: '디자인 · 크리에이티브', icon: 'palette' },
      { id: 'fin', label: '금융 · 회계', icon: 'account_balance' },
      { id: 'etc', label: '기타', icon: 'more_horiz' },
    ];
    return wrap(
      <>
        <Header title="" onBack={() => setStep(2)} right={<span style={{ fontSize: 13, color: T.fgSubtle, paddingRight: 8 }}>1 / 2</span>} border={false} />
        <div style={{ padding: '4px 24px 0' }}>
          <div style={{ fontSize: 24, fontWeight: 700, letterSpacing: '-0.02em', color: T.fg }}>어떤 분야를 준비하세요?</div>
          <div style={{ marginTop: 4, fontSize: 14, color: T.fgMuted }}>맞춤 연습 코스를 추천해드려요.</div>
          <div style={{ marginTop: 18, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {fields.map(f => {
              const sel = field === f.id;
              return (
                <button key={f.id} onClick={() => setField(f.id)} style={{
                  display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px', cursor: 'pointer',
                  borderRadius: T.r3, fontFamily: T.font, textAlign: 'left',
                  background: sel ? T.brandWeak : T.layer,
                  border: `1.5px solid ${sel ? T.brandStroke : T.line}`,
                  WebkitTapHighlightColor: 'transparent',
                }}>
                  <Sym name={f.icon} size={24} fill={sel ? 1 : 0} color={sel ? T.brand : T.fgMuted} />
                  <span style={{ flex: 1, fontSize: 16, fontWeight: sel ? 700 : 500, color: sel ? T.brand : T.fg }}>{f.label}</span>
                  <Sym name={sel ? 'radio_button_checked' : 'radio_button_unchecked'} size={22} color={sel ? T.brand : T.lineWeak} fill={sel ? 1 : 0} />
                </button>
              );
            })}
          </div>
        </div>
      </>,
      <Button variant="brand" size="large" fullWidth trailingIcon="arrow_forward" onClick={next}>다음</Button>
    );
  }

  // ── 5. 연습 시간 + 알림 ──
  const times = [
    { v: 5, t: '5분', s: '가볍게' },
    { v: 10, t: '10분', s: '꾸준하게' },
    { v: 20, t: '20분', s: '진지하게' },
    { v: 30, t: '30분+', s: '몰입해서' },
  ];
  return wrap(
    <>
      <Header title="" onBack={() => setStep(3)} right={<span style={{ fontSize: 13, color: T.fgSubtle, paddingRight: 8 }}>2 / 2</span>} border={false} />
      <div style={{ padding: '4px 24px 0' }}>
        <div style={{ fontSize: 24, fontWeight: 700, letterSpacing: '-0.02em', color: T.fg }}>하루 몇 분 연습할까요?</div>
        <div style={{ marginTop: 4, fontSize: 14, color: T.fgMuted }}>꾸준함이 가장 중요해요. 부담 없이 골라요.</div>
        <div style={{ marginTop: 18, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {times.map(o => {
            const sel = mins === o.v;
            return (
              <button key={o.v} onClick={() => setMins(o.v)} style={{
                padding: '20px 12px', textAlign: 'center', cursor: 'pointer', borderRadius: T.r4, fontFamily: T.font,
                background: sel ? T.brandWeak : T.layer, border: `1.5px solid ${sel ? T.brandStroke : T.line}`,
                position: 'relative', WebkitTapHighlightColor: 'transparent',
              }}>
                <div style={{ fontSize: 26, fontWeight: 700, color: sel ? T.brand : T.fg }}>{o.t}</div>
                <div style={{ marginTop: 2, fontSize: 13, color: T.fgSubtle }}>{o.s}</div>
                {sel && <div style={{ position: 'absolute', top: 10, right: 10 }}><Sym name="check_circle" size={20} fill={1} color={T.brand} /></div>}
              </button>
            );
          })}
        </div>
        <div style={{ marginTop: 18 }}>
          <ListItem
            leadingIcon="notifications"
            title="매일 같은 시간 리마인드"
            description="연습 시간을 알림으로 알려드려요"
            trailing={<Switch checked={notify} onChange={setNotify} />}
            style={{ padding: '14px 16px', border: `1px solid ${T.line}`, borderRadius: T.r3 }}
          />
        </div>
      </div>
    </>,
    <Button variant="brand" size="large" fullWidth trailingIcon="eco" onClick={finish}>새움 시작하기</Button>
  );
}

const linkBtn = {
  border: 'none', background: 'transparent', cursor: 'pointer', fontFamily: T.font,
  fontSize: 14, fontWeight: 500, color: T.fgSubtle, WebkitTapHighlightColor: 'transparent', padding: 4,
};

function Dots({ total, active }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', gap: 6, padding: '8px 0 4px' }}>
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} style={{ width: i === active ? 20 : 7, height: 7, borderRadius: T.full, background: i === active ? T.brandSolid : T.neutralWeak, transition: 'width .3s' }} />
      ))}
    </div>
  );
}

Object.assign(window, { Onboarding });
