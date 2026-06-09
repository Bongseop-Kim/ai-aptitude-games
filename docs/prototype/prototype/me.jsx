// me.jsx — 내 정보 탭 (프로필 + 구독 + 설정)
const { useState: useMe } = React;

function MeTab({ ctx }) {
  const [push, setPush] = useMe(true);
  const [sound, setSound] = useMe(true);
  const done = Object.keys(ctx.completedGames).length;
  return (
    <Screen bg={T.basement}>
      <div style={{ flex: 'none', paddingTop: 50, background: T.layer, borderBottom: `1px solid ${T.line}` }}>
        <div style={{ padding: '4px 16px 10px' }}>
          <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em', color: T.fg }}>내 정보</div>
        </div>
      </div>
      <Body bottomPad={104}>
        {/* profile */}
        <Card pad={16} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <Avatar name="김준비" size={56} ring />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 17, fontWeight: 700, color: T.fg }}>김준비</span>
              {ctx.isPro && <Badge variant="brand">PRO</Badge>}
            </div>
            <div style={{ fontSize: 12, color: T.fgSubtle, marginTop: 2 }}>IT · 개발 준비 · @saeum</div>
            <div style={{ marginTop: 6 }}><ReadinessChip score={74} size="small" /></div>
          </div>
          <IconButton icon="edit" aria-label="편집" variant="weak" onClick={() => ctx.showToast('프로필 편집')} />
        </Card>

        {/* quick stats */}
        <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
          {[['연속', `${ctx.streak}일`, 'local_fire_department'], ['완료 게임', `${done}/9`, 'stadia_controller'], ['모의고사', '6회', 'emoji_events']].map(([l, v, ic], i) => (
            <Card key={i} pad={12} style={{ flex: 1, textAlign: 'center' }}>
              <Sym name={ic} size={20} fill={1} color={T.brand} />
              <div style={{ fontSize: 17, fontWeight: 700, color: T.fg, marginTop: 2 }}>{v}</div>
              <div style={{ fontSize: 10, color: T.fgSubtle }}>{l}</div>
            </Card>
          ))}
        </div>

        {/* subscription */}
        <SectionHead title="구독" />
        {ctx.isPro ? (
          <Card pad={0}>
            <ListItem leadingIcon="workspace_premium" title="새움 Pro · 월간" description="무료 체험 6일 남음" value="관리" onClick={() => ctx.nav('billing', { step: 'manage' })} style={listRow} />
          </Card>
        ) : (
          <Card pad={14} bg={T.inverted} border={false} radius={T.r4} onClick={() => ctx.nav('billing', { step: 'landing' })}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <Sym name="eco" size={26} fill={1} color="var(--mossy-color-palette-mossy-500)" />
              <div style={{ flex: 1 }}><div style={{ fontSize: 14, fontWeight: 700, color: T.fgInv }}>새움 Pro 시작하기</div><div style={{ fontSize: 12, color: 'var(--mossy-color-palette-gray-600)' }}>전체 리포트 · 7일 무료</div></div>
              <Sym name="arrow_forward" size={20} color="#fff" />
            </div>
          </Card>
        )}

        {/* settings */}
        <SectionHead title="설정" />
        <Card pad={0}>
          <div style={{ padding: '0 14px' }}>
            <ListItem leadingIcon="notifications" title="푸시 알림" trailing={<Switch checked={push} onChange={setPush} />} style={{ borderBottom: `1px solid ${T.line}` }} />
            <ListItem leadingIcon="volume_up" title="효과음" trailing={<Switch checked={sound} onChange={setSound} />} style={{ borderBottom: `1px solid ${T.line}` }} />
            <ListItem leadingIcon="schedule" title="리마인드 시간" value="오후 9:00" onClick={() => ctx.showToast('리마인드 시간 설정')} style={{ borderBottom: `1px solid ${T.line}` }} />
            <ListItem leadingIcon="leaderboard" title="주간 랭킹" value="친구" onClick={() => ctx.nav('retention', { view: 'ranking' })} style={{ borderBottom: `1px solid ${T.line}` }} />
            <ListItem leadingIcon="group_add" title="친구 초대" onClick={() => ctx.nav('retention', { view: 'invite' })} />
          </div>
        </Card>

        <SectionHead title="기타" />
        <Card pad={0}>
          <div style={{ padding: '0 14px' }}>
            <ListItem leadingIcon="help" title="도움말 · 자주 묻는 질문" onClick={() => ctx.showToast('도움말')} style={{ borderBottom: `1px solid ${T.line}` }} />
            <ListItem leadingIcon="description" title="이용약관 · 개인정보처리방침" onClick={() => ctx.showToast('약관')} style={{ borderBottom: `1px solid ${T.line}` }} />
            <ListItem leadingIcon="logout" title="로그아웃" trailing="none" onClick={() => ctx.resetTo('onboarding')} />
          </div>
        </Card>

        <div style={{ textAlign: 'center', marginTop: 16, fontSize: 11, color: T.fgSubtle }}>새움 · 버전 1.0.0</div>
      </Body>
    </Screen>
  );
}

const listRow = { padding: '14px' };

Object.assign(window, { MeTab });
