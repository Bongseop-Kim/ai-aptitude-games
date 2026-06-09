// home.jsx — 홈 탭
function HomeScreen({ ctx }) {
  const top3 = GAMES.find(g => g.id === 'potion'); // 오늘의 픽
  const grid = GAMES;

  return (
    <Screen bg={T.basement}>
      {/* top bar */}
      <div style={{ flex: 'none', paddingTop: 50, background: T.layer, borderBottom: `1px solid ${T.line}` }}>
        <div style={{ display: 'flex', alignItems: 'center', padding: '4px 14px 12px' }}>
          <Logo size={19} />
          <div style={{ flex: 1 }} />
          <button onClick={() => ctx.nav('retention', { view: 'streak' })} style={{ ...chipBtn }}>
            <Sym name="local_fire_department" size={18} fill={1} color="var(--mossy-color-manner-temp-l6-text)" />
            <span style={{ fontWeight: 700, fontSize: 14, color: T.fg }}>{ctx.streak}</span>
          </button>
          <button onClick={() => ctx.nav('billing', { step: 'landing' })} style={{ ...chipBtn }}>
            <Sym name="diamond" size={17} fill={1} color={T.info} />
            <span style={{ fontWeight: 700, fontSize: 14, color: T.fg }}>340</span>
          </button>
          <button onClick={() => ctx.nav('retention', { view: 'push' })} aria-label="알림" style={{ ...iconBtn, position: 'relative' }}>
            <Sym name="notifications" size={24} color={T.fg} />
            <span style={{ position: 'absolute', top: 7, right: 7 }}><Badge dot /></span>
          </button>
        </div>
      </div>

      <Body bottomPad={104}>
        {/* greeting */}
        <div style={{ margin: '2px 2px 14px' }}>
          <div style={{ fontSize: 24, fontWeight: 700, letterSpacing: '-0.02em', color: T.fg }}>김준비님,</div>
          <div style={{ fontSize: 15, color: T.fgMuted, marginTop: 2 }}>오늘도 한 판 해볼까요?</div>
        </div>

        {/* readiness card */}
        <Card pad={16} style={{ marginBottom: 14 }}>
          <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
            <ReadinessGauge score={74} size={116} label={false} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 13, color: T.fgSubtle, fontWeight: 500 }}>면접 준비도</span>
                <Badge variant="positive">상위 28%</Badge>
              </div>
              <div style={{ fontSize: 14, fontWeight: 700, color: T.brand, marginTop: 4 }}>{readinessLabel(74)}</div>
              <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 6 }}>
                <MiniStat icon="trending_up" iconColor={T.positive} label="강한 역량" value="신뢰 · 82" />
                <MiniStat icon="adjust" iconColor="var(--mossy-color-manner-temp-l7-text)" label="보완 역량" value="관계 · 68" />
              </div>
            </div>
          </div>
          <button onClick={() => ctx.nav('records')} style={fullLinkRow}>
            <span>지난 리포트 보기</span><Sym name="chevron_right" size={18} color={T.fgSubtle} />
          </button>
        </Card>

        {/* today challenge */}
        <SectionHead title="오늘의 챌린지" icon="bolt" action="전체" onAction={() => ctx.nav('retention', { view: 'event' })} />
        <Card pad={14} bg={T.bnGreen} border={false} style={{ marginBottom: 18 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ width: 48, height: 48, borderRadius: T.r3, background: T.layer, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}>
              <Sym name={top3.icon} size={28} fill={1} color={top3.ink} />
            </span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: T.fg }}>{top3.name} · 75점 이상</div>
              <div style={{ fontSize: 12, color: T.fgMuted, marginTop: 1 }}>{top3.cog} · 예상 {top3.min}분</div>
              <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
                <Pill tone="brand">+20 XP</Pill>
                <Pill tone="fire">스트릭 +1일</Pill>
              </div>
            </div>
          </div>
          <Button variant="brand" size="medium" fullWidth trailingIcon="play_arrow" style={{ marginTop: 12 }}
            onClick={() => ctx.nav('gameIntro', { id: top3.id })}>지금 도전하기</Button>
        </Card>

        {/* all games */}
        <SectionHead title="모든 게임" action="진행도순" onAction={() => ctx.nav('games')} />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
          {grid.map(g => <GameTile key={g.id} g={g} onClick={() => ctx.nav('gameIntro', { id: g.id })} />)}
        </div>

        {/* mock exam CTA */}
        <Card pad={16} bg={T.inverted} border={false} radius={T.r5} style={{ marginTop: 18 }} onClick={() => ctx.nav('gameIntro', { id: 'rps', mock: true, idx: 0 })}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <span style={{ width: 50, height: 50, borderRadius: T.r4, background: T.brandSolid, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}>
              <Sym name="emoji_events" size={28} fill={1} color="#fff" />
            </span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--mossy-color-palette-mossy-500)', letterSpacing: '0.02em' }}>모의고사</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: T.fgInv, marginTop: 1 }}>9게임 연속 · 22분</div>
              <div style={{ fontSize: 12, color: 'var(--mossy-color-palette-gray-600)', marginTop: 2 }}>완주하면 5대 역량 리포트가 열려요</div>
            </div>
            <Sym name="arrow_forward" size={22} color="#fff" />
          </div>
        </Card>

        {/* friends teaser */}
        <Card pad={12} style={{ marginTop: 12 }} onClick={() => ctx.nav('retention', { view: 'ranking' })}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Avatar name="민수" size={36} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, color: T.fg }}><b>민수</b>님이 주간 랭킹에서 추월했어요</div>
              <div style={{ fontSize: 11, color: T.fgSubtle, marginTop: 1 }}>내 순위 2위 · 1위까지 46점</div>
            </div>
            <Pill tone="fire">반격</Pill>
          </div>
        </Card>
      </Body>
    </Screen>
  );
}

function MiniStat({ icon, iconColor, label, value }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <Sym name={icon} size={18} fill={1} color={iconColor} />
      <span style={{ fontSize: 12, color: T.fgSubtle }}>{label}</span>
      <span style={{ marginLeft: 'auto', fontSize: 13, fontWeight: 700, color: T.fg }}>{value}</span>
    </div>
  );
}

function Pill({ children, tone = 'brand' }) {
  const tones = {
    brand: { bg: T.brandWeak, fg: T.brand },
    fire: { bg: 'var(--mossy-color-manner-temp-l5-bg)', fg: 'var(--mossy-color-manner-temp-l6-text)' },
    info: { bg: 'var(--mossy-color-bg-informative-weak)', fg: T.info },
    neutral: { bg: T.neutralWeak, fg: T.fgMuted },
  }[tone];
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', padding: '3px 9px', borderRadius: T.full, background: tones.bg, color: tones.fg, fontSize: 11, fontWeight: 700 }}>{children}</span>
  );
}

const chipBtn = {
  display: 'inline-flex', alignItems: 'center', gap: 4, padding: '6px 10px', marginRight: 4,
  borderRadius: T.full, border: 'none', background: T.neutralWeak, cursor: 'pointer',
  fontFamily: T.font, WebkitTapHighlightColor: 'transparent',
};

const fullLinkRow = {
  marginTop: 12, paddingTop: 12, borderTop: `1px solid ${T.line}`, width: '100%',
  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  border: 'none', borderTopStyle: 'solid', background: 'transparent', cursor: 'pointer',
  fontFamily: T.font, fontSize: 13, fontWeight: 500, color: T.fgMuted, WebkitTapHighlightColor: 'transparent',
};

Object.assign(window, { HomeScreen, MiniStat, Pill });
