// billing.jsx — 결제/구독 (랜딩·비교·결제·성공·관리·해지)
const { useState: useBl } = React;

function BillingScreen({ ctx }) {
  const step = ctx.params.step || 'landing';
  const map = { landing: BillingLanding, compare: BillingCompare, checkout: BillingCheckout, success: BillingSuccess, manage: BillingManage, cancel: BillingCancel };
  const C = map[step] || BillingLanding;
  return <C ctx={ctx} />;
}

const BENEFITS = [
  ['workspace_premium', '리포트 7섹션 전체 열람', '복원력 · 패턴 · AI 코치 포함'],
  ['all_inclusive', '모의고사 무제한 응시', '무료는 월 1회'],
  ['inventory_2', '전 회차 기록 보관', '무료는 최근 3회만'],
  ['groups', '또래 비교 · 심층 분석', 'N=12,400 데이터'],
];

function BillingLanding({ ctx }) {
  return (
    <Screen bg={T.layer}>
      <Header onBack={ctx.back} title="" right={<button onClick={() => ctx.showToast('복원할 구매 내역이 없어요')} style={{ border: 'none', background: 'transparent', color: T.fgSubtle, fontFamily: T.font, fontSize: 13, cursor: 'pointer', paddingRight: 8 }}>복원하기</button>} border={false} />
      <Body bottomPad={120}>
        <div style={{ textAlign: 'center', paddingTop: 4 }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 12px', borderRadius: T.full, background: T.inverted, color: T.fgInv, fontSize: 12, fontWeight: 700 }}><Sym name="eco" size={15} fill={1} color="var(--mossy-color-palette-mossy-500)" />새움 PRO</span>
          <div style={{ fontSize: 24, fontWeight: 700, color: T.fg, marginTop: 10, letterSpacing: '-0.02em', lineHeight: 1.3 }}>전체 리포트를<br />지금 열어보세요</div>
          <div style={{ fontSize: 13, color: T.fgMuted, marginTop: 6 }}>스트레스 복원력 · 응답 패턴 · AI 코치</div>
        </div>

        <div style={{ position: 'relative', marginTop: 16 }}>
          <Card pad={14} style={{ filter: 'blur(3px)' }}>
            <div style={{ fontSize: 11, color: T.fgSubtle }}>스트레스 복원력</div>
            <svg width="100%" height="56" viewBox="0 0 300 56" style={{ marginTop: 4 }}><path d="M10,40 L60,34 L110,24 L160,42 L210,46 L260,14 L290,10" fill="none" stroke={T.brandSolid} strokeWidth="2.5" /></svg>
          </Card>
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
            <Sym name="lock" size={26} color={T.fg} fill={1} /><span style={{ fontSize: 12, fontWeight: 700, color: T.fg }}>프리미엄 전용</span>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 18 }}>
          {BENEFITS.map(([ic, t, s], i) => (
            <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <span style={{ width: 34, height: 34, borderRadius: T.full, background: T.brandWeak, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}><Sym name={ic} size={20} fill={1} color={T.brand} /></span>
              <div><div style={{ fontSize: 14, fontWeight: 700, color: T.fg }}>{t}</div><div style={{ fontSize: 12, color: T.fgSubtle }}>{s}</div></div>
            </div>
          ))}
        </div>

        <Card pad={14} bg={T.bnGreen} border={false} style={{ marginTop: 16, position: 'relative' }}>
          <span style={{ position: 'absolute', top: -9, right: 14 }}><Badge variant="brand" style={{ height: 20, padding: '0 10px' }}>7일 무료</Badge></span>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
            <span style={{ fontSize: 24, fontWeight: 700, color: T.fg }}>₩9,900</span>
            <span style={{ fontSize: 13, color: T.fgSubtle }}>/ 월</span>
            <span style={{ marginLeft: 'auto', fontSize: 11, color: T.fgSubtle }}>언제든 해지</span>
          </div>
          <div style={{ fontSize: 11, color: T.fgSubtle, marginTop: 2 }}>7일 후 자동 결제 · 부가세 포함</div>
        </Card>
      </Body>
      <div style={{ flex: 'none', padding: '10px 16px 30px', borderTop: `1px solid ${T.line}`, background: T.layer }}>
        <Button variant="brand" size="large" fullWidth trailingIcon="arrow_forward" onClick={() => ctx.nav('billing', { step: 'checkout' })}>7일 무료로 시작</Button>
        <div style={{ textAlign: 'center', marginTop: 8 }}><button onClick={() => ctx.nav('billing', { step: 'compare' })} style={linkB}>플랜 비교 보기</button></div>
      </div>
    </Screen>
  );
}

function BillingCompare({ ctx }) {
  const [yr, setYr] = useBl(false);
  const rows = [['개별 게임 플레이', '무제한', '무제한'], ['모의고사 응시', '월 1회', '무제한'], ['리포트 기본 4섹션', 'y', 'y'], ['스트레스 복원력', 'lock', 'y'], ['응답 패턴 프로필', 'lock', 'y'], ['AI 코치 2주 플랜', 'lock', 'y'], ['기록 보관', '최근 3회', '전체'], ['또래 심층 비교', 'lock', 'y'], ['광고', '있음', '없음']];
  const cell = (v, pro) => v === 'y' ? <Sym name="check" size={18} color={T.positive} /> : v === 'lock' ? <Sym name="lock" size={15} color={T.fgSubtle} /> : <span style={{ fontSize: 12, color: pro ? T.fg : T.fgMuted, fontWeight: pro ? 700 : 400 }}>{v}</span>;
  return (
    <Screen bg={T.layer}>
      <Header onBack={ctx.back} title="플랜 비교" />
      <Body bottomPad={120}>
        <div style={{ display: 'flex', background: T.neutralWeak, borderRadius: T.r3, padding: 3 }}>
          {[['월간', false], ['연간', true]].map(([l, v]) => (
            <button key={l} onClick={() => setYr(v)} style={{ flex: 1, padding: '8px', borderRadius: T.r2, border: 'none', cursor: 'pointer', fontFamily: T.font, fontSize: 13, fontWeight: 700, background: yr === v ? T.layer : 'transparent', color: yr === v ? T.fg : T.fgSubtle, boxShadow: yr === v ? T.s1 : 'none', position: 'relative' }}>
              {l}{v && <span style={{ marginLeft: 4, fontSize: 10, color: T.brand }}>-20%</span>}
            </button>
          ))}
        </div>
        <Card pad={0} style={{ marginTop: 12, overflow: 'hidden' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr 1fr', background: T.basement, borderBottom: `1px solid ${T.line}` }}>
            <div style={{ padding: 10, fontSize: 11, color: T.fgSubtle }}>기능</div>
            <div style={{ padding: 10, textAlign: 'center', borderLeft: `1px solid ${T.line}` }}><div style={{ fontSize: 12, fontWeight: 700, color: T.fg }}>Free</div><div style={{ fontSize: 10, color: T.fgSubtle }}>₩0</div></div>
            <div style={{ padding: 10, textAlign: 'center', borderLeft: `1px solid ${T.line}`, background: T.brandWeak }}><div style={{ fontSize: 12, fontWeight: 700, color: T.brand }}>Pro</div><div style={{ fontSize: 10, color: T.fgSubtle }}>{yr ? '₩7,900' : '₩9,900'}/월</div></div>
          </div>
          {rows.map((r, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr 1fr', borderBottom: i < rows.length - 1 ? `1px solid ${T.line}` : 'none' }}>
              <div style={{ padding: '9px 10px', fontSize: 12, color: T.fg }}>{r[0]}</div>
              <div style={{ padding: '9px', textAlign: 'center', borderLeft: `1px solid ${T.line}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{cell(r[1], false)}</div>
              <div style={{ padding: '9px', textAlign: 'center', borderLeft: `1px solid ${T.line}`, background: 'var(--mossy-color-bg-brand-weak)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{cell(r[2], true)}</div>
            </div>
          ))}
        </Card>
        <div style={{ fontSize: 11, color: T.fgSubtle, marginTop: 10, lineHeight: 1.6 }}>· 7일 무료체험 후 자동 결제 / 언제든 해지<br />· 미사용 시 결제 후 7일 내 환불 가능</div>
      </Body>
      <div style={{ flex: 'none', padding: '10px 16px 30px', borderTop: `1px solid ${T.line}`, background: T.layer }}>
        <Button variant="brand" size="large" fullWidth onClick={() => ctx.nav('billing', { step: 'checkout' })}>Pro 시작하기 · 7일 무료</Button>
      </div>
    </Screen>
  );
}

function BillingCheckout({ ctx }) {
  const [pay, setPay] = useBl(0);
  const [agree, setAgree] = useBl(true);
  const methods = [['카카오페이', 'chat', '추천'], ['토스', 'bolt'], ['네이버페이', 'eco'], ['신용/체크카드', 'credit_card'], ['휴대폰 결제', 'smartphone']];
  return (
    <Screen bg={T.basement}>
      <Header onBack={ctx.back} title="결제" />
      <Body bottomPad={130}>
        <Card pad={12}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}><span style={{ fontSize: 13, fontWeight: 700, color: T.fg }}>새움 Pro · 월간</span><span style={{ fontSize: 14, fontWeight: 700, color: T.fg }}>₩9,900</span></div>
          <div style={{ fontSize: 11, color: T.fgSubtle, marginTop: 2 }}>7일 무료 체험 · 이후 매월 자동 결제</div>
          <div style={{ marginTop: 8, padding: 8, background: T.bnGreen, borderRadius: T.r2, display: 'flex', justifyContent: 'space-between' }}><span style={{ fontSize: 12, fontWeight: 700, color: T.positive }}>오늘 결제 금액</span><span style={{ fontSize: 13, fontWeight: 700, color: T.positive }}>₩0</span></div>
        </Card>
        <SectionHead title="결제 수단" />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {methods.map((m, i) => (
            <button key={i} onClick={() => setPay(i)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: 12, borderRadius: T.r3, cursor: 'pointer', fontFamily: T.font, background: T.layer, border: `1.5px solid ${pay === i ? T.brandStroke : T.line}`, WebkitTapHighlightColor: 'transparent' }}>
              <Sym name={pay === i ? 'radio_button_checked' : 'radio_button_unchecked'} size={20} color={pay === i ? T.brand : T.lineWeak} fill={pay === i ? 1 : 0} />
              <Sym name={m[1]} size={20} color={T.fgMuted} />
              <span style={{ fontSize: 14, fontWeight: pay === i ? 700 : 400, color: T.fg }}>{m[0]}</span>
              {m[2] && <span style={{ marginLeft: 'auto' }}><Badge variant="positive">{m[2]}</Badge></span>}
            </button>
          ))}
        </div>
        <button onClick={() => ctx.showToast('프로모 코드 입력')} style={{ width: '100%', marginTop: 10, display: 'flex', alignItems: 'center', gap: 8, padding: 12, borderRadius: T.r3, border: `1.5px dashed ${T.lineWeak}`, background: 'transparent', cursor: 'pointer', fontFamily: T.font }}>
          <Sym name="confirmation_number" size={18} color={T.fgMuted} /><span style={{ fontSize: 13, color: T.fg }}>프로모 코드 입력</span><Sym name="chevron_right" size={18} color={T.fgSubtle} style={{ marginLeft: 'auto' }} />
        </button>
        <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
          {['만 14세 이상입니다 (필수)', '유료 서비스 이용약관 동의 (필수)', '자동 결제 동의 (필수)'].map((t, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Sym name="check_circle" size={18} fill={1} color={T.brand} /><span style={{ fontSize: 12, color: T.fgMuted, flex: 1 }}>{t}</span></div>
          ))}
        </div>
      </Body>
      <div style={{ flex: 'none', padding: '10px 16px 30px', borderTop: `1px solid ${T.line}`, background: T.layer }}>
        <Button variant="brand" size="large" fullWidth onClick={() => ctx.replace('billing', { step: 'success' })}>{methods[pay][0]}로 무료 체험 시작</Button>
        <div style={{ textAlign: 'center', marginTop: 6, fontSize: 11, color: T.fgSubtle }}>첫 결제일 · 2026년 1월 19일 (7일 후)</div>
      </div>
    </Screen>
  );
}

function BillingSuccess({ ctx }) {
  useBl(); React.useEffect(() => { ctx.setPro(true); }, []);
  const unlocked = [['스트레스 복원력 리포트', '지금 보기'], ['응답 패턴 프로필', '지금 보기'], ['AI 코치 2주 플랜', '시작하기']];
  return (
    <Screen bg={T.layer}>
      <Header title="" right={<IconButton icon="close" aria-label="닫기" variant="ghost" onClick={() => ctx.resetTo('home')} />} border={false} />
      <Body bottomPad={120}>
        <div style={{ textAlign: 'center', paddingTop: 16 }}>
          <span style={{ width: 84, height: 84, borderRadius: T.full, background: T.brandSolid, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', boxShadow: T.s2, animation: 'saeum-pop .5s var(--mossy-timing-function-enter)' }}><Sym name="check" size={48} color="#fff" weight={600} /></span>
          <div style={{ fontSize: 22, fontWeight: 700, color: T.fg, marginTop: 16 }}>Pro 시작!</div>
          <div style={{ fontSize: 13, color: T.fgMuted, marginTop: 4 }}>7일 무료 체험이 시작됐어요</div>
        </div>
        <Card pad={14} style={{ marginTop: 18 }}>
          {[['플랜', '새움 Pro 월간'], ['오늘 결제', '₩0 (무료 체험)'], ['첫 결제일', '2026. 1. 19'], ['결제 수단', '카카오페이']].map(([l, v], i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: i < 3 ? `1px solid ${T.line}` : 'none' }}><span style={{ fontSize: 12, color: T.fgSubtle }}>{l}</span><span style={{ fontSize: 13, fontWeight: 700, color: i === 1 ? T.positive : T.fg }}>{v}</span></div>
          ))}
        </Card>
        <SectionHead title="방금 열린 기능" />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {unlocked.map(([t, a], i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: 12, borderRadius: T.r3, background: T.bnGreen }}>
              <Sym name="lock_open" size={20} fill={1} color={T.positive} /><span style={{ fontSize: 13, fontWeight: 700, color: T.fg, flex: 1 }}>{t}</span><span style={{ fontSize: 12, fontWeight: 700, color: T.brand }}>{a} ›</span>
            </div>
          ))}
        </div>
      </Body>
      <div style={{ flex: 'none', padding: '10px 16px 30px', borderTop: `1px solid ${T.line}`, background: T.layer }}>
        <Button variant="brand" size="large" fullWidth trailingIcon="arrow_forward" onClick={() => ctx.nav('report')}>전체 리포트 열기</Button>
      </div>
    </Screen>
  );
}

function BillingManage({ ctx }) {
  return (
    <Screen bg={T.basement}>
      <Header onBack={ctx.back} title="구독 관리" />
      <Body bottomPad={40}>
        <Card pad={14} bg={T.bnGreen} border={false} style={{ position: 'relative' }}>
          <span style={{ position: 'absolute', top: -9, right: 14 }}><Badge variant="positive">ACTIVE</Badge></span>
          <div style={{ fontSize: 11, color: T.fgSubtle }}>현재 플랜</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: T.fg }}>새움 Pro · 월간</div>
          <div style={{ display: 'flex', gap: 24, marginTop: 8 }}>
            <div><div style={{ fontSize: 10, color: T.fgSubtle }}>무료 체험 종료</div><div style={{ fontSize: 13, fontWeight: 700, color: T.fg }}>1월 19일</div></div>
            <div><div style={{ fontSize: 10, color: T.fgSubtle }}>다음 결제일</div><div style={{ fontSize: 13, fontWeight: 700, color: T.fg }}>1월 19일</div></div>
          </div>
        </Card>
        <Banner tone="positive" icon="redeem" style={{ marginTop: 10 }}>무료 체험 6일 남음 · 지금 해지해도 종료일까지 이용할 수 있어요</Banner>
        <SectionHead title="결제 수단" />
        <ListItem leadingIcon="chat" title="카카오페이" value="변경" style={{ border: `1px solid ${T.line}`, borderRadius: T.r3, padding: '10px 14px' }} onClick={() => ctx.showToast('결제 수단 변경')} />
        <SectionHead title="플랜 변경 / 해지" />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <ListItem leadingIcon="trending_up" title="연간으로 변경" description="20% 저렴해요" value="-20%" style={{ border: `1px solid ${T.line}`, borderRadius: T.r3, padding: '10px 14px' }} onClick={() => ctx.showToast('연간 전환 안내')} />
          <ListItem leadingIcon="cancel" title="구독 해지" trailing="chevron" style={{ border: `1px solid ${T.line}`, borderRadius: T.r3, padding: '10px 14px' }} onClick={() => ctx.nav('billing', { step: 'cancel' })} />
        </div>
      </Body>
    </Screen>
  );
}

function BillingCancel({ ctx }) {
  const [reason, setReason] = useBl(null);
  const reasons = ['가격 부담', '잘 안 써요', '취업 완료', '기능 부족', '다른 앱 사용', '기타'];
  return (
    <Screen bg={T.layer}>
      <Header onBack={ctx.back} title="구독 해지" />
      <Body bottomPad={130}>
        <div style={{ textAlign: 'center', paddingTop: 8 }}>
          <Sym name="sentiment_dissatisfied" size={44} color={T.fgMuted} />
          <div style={{ fontSize: 20, fontWeight: 700, color: T.fg, marginTop: 6 }}>정말 떠나시나요?</div>
          <div style={{ fontSize: 12, color: T.fgSubtle, marginTop: 2 }}>해지 전에 이것만 확인해 주세요</div>
        </div>
        <Card pad={12} bg={T.bnOrange} border={false} style={{ marginTop: 14 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--mossy-color-manner-temp-l7-text)' }}>해지하면 사라지는 혜택</div>
          <div style={{ marginTop: 6, display: 'flex', flexDirection: 'column', gap: 6 }}>
            {[['lock', '리포트 프리미엄 3섹션'], ['groups', '또래 심층 비교'], ['psychology_alt', 'AI 코치 2주 플랜'], ['inventory_2', '전체 회차 기록']].map(([ic, t], i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Sym name={ic} size={18} color={T.fgMuted} /><span style={{ fontSize: 13, color: T.fgMuted }}>{t}</span></div>
            ))}
          </div>
        </Card>
        <SectionHead title="이건 어떠세요?" />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <Card pad={12} bg={T.bnGreen} border={false} onClick={() => ctx.showToast('구독을 1개월 일시 정지했어요', { icon: 'pause_circle' })} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Sym name="pause_circle" size={24} fill={1} color={T.positive} /><div style={{ flex: 1 }}><div style={{ fontSize: 13, fontWeight: 700, color: T.fg }}>구독 일시 정지 (1개월)</div><div style={{ fontSize: 11, color: T.fgSubtle }}>기능은 그대로, 결제만 건너뛰기</div></div><span style={{ fontSize: 12, fontWeight: 700, color: T.positive }}>선택 ›</span>
          </Card>
          <Card pad={12} bg={T.bnYellow} border={false} onClick={() => ctx.showToast('다음 달 50% 할인을 받았어요', { icon: 'redeem' })} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Sym name="redeem" size={24} fill={1} color={T.yellowDeep} /><div style={{ flex: 1 }}><div style={{ fontSize: 13, fontWeight: 700, color: T.fg }}>다음 달 50% 할인</div><div style={{ fontSize: 11, color: T.fgSubtle }}>한 번만 ₩4,950에 이용</div></div><span style={{ fontSize: 12, fontWeight: 700, color: T.yellowDeep }}>받기 ›</span>
          </Card>
        </div>
        <SectionHead title="해지 사유 (선택)" />
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {reasons.map(r => <Tag key={r} selected={reason === r} onClick={() => setReason(r)}>{r}</Tag>)}
        </div>
      </Body>
      <div style={{ flex: 'none', padding: '10px 16px 30px', borderTop: `1px solid ${T.line}`, background: T.layer }}>
        <Button variant="brand" size="large" fullWidth onClick={ctx.back}>계속 Pro 이용하기</Button>
        <div style={{ textAlign: 'center', marginTop: 8 }}><button onClick={() => { ctx.setPro(false); ctx.showToast('구독을 해지했어요 (1/19 종료)'); ctx.nav('me'); }} style={{ ...linkB, textDecoration: 'underline' }}>그래도 해지할게요</button></div>
      </div>
    </Screen>
  );
}

const linkB = { border: 'none', background: 'transparent', color: T.fgSubtle, fontFamily: T.font, fontSize: 13, fontWeight: 500, cursor: 'pointer' };

Object.assign(window, { BillingScreen });
