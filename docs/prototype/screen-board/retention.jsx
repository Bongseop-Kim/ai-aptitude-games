// retention.jsx — 스트릭·랭킹·초대·대회·알림
const { useState: useRt } = React;

function RetentionScreen({ ctx }) {
  const view = ctx.params.view || 'streak';
  const map = { streak: RtStreak, ranking: RtRanking, invite: RtInvite, event: RtEvent, push: RtPush };
  const C = map[view] || RtStreak;
  return <C ctx={ctx} />;
}

function RtStreak({ ctx }) {
  const played = new Set([2, 3, 5, 6, 7, 8, 9]);
  const missed = new Set([4]);
  const today = 9;
  const cells = Array.from({ length: 35 }, (_, i) => i - 2);
  return (
    <Screen bg={T.layer}>
      <Header onBack={ctx.back} title="스트릭" />
      <Body bottomPad={40}>
        <div style={{ textAlign: 'center', paddingTop: 6 }}>
          <Sym name="local_fire_department" size={44} fill={1} color="var(--mossy-color-manner-temp-l6-text)" />
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: 6 }}><span style={{ fontSize: 48, fontWeight: 700, color: T.fg, lineHeight: 1 }}>4</span><span style={{ fontSize: 14, color: T.fgSubtle }}>일 연속</span></div>
          <div style={{ fontSize: 12, color: T.fgSubtle, marginTop: 4 }}>개인 최고 · 7일 (12월 18일)</div>
        </div>
        <Banner tone="positive" icon="check_circle" style={{ marginTop: 14 }}>오늘 완료 · 가위바위보 1판 · 00:45 소요 (+1일)</Banner>
        <SectionHead title="2026년 1월" />
        <Card pad={12}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 4 }}>
            {['월', '화', '수', '목', '금', '토', '일'].map(d => <div key={d} style={{ textAlign: 'center', fontSize: 10, color: T.fgSubtle }}>{d}</div>)}
            {cells.map((d, i) => {
              const valid = d > 0 && d <= 31, isToday = d === today, p = played.has(d), m = missed.has(d);
              return (
                <div key={i} style={{ aspectRatio: '1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {valid && (
                    <div style={{ width: '86%', height: '86%', borderRadius: T.r2, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, position: 'relative', background: p ? T.brandSolid : m ? T.neutralWeak : T.layer, color: p ? '#fff' : m ? T.fgSubtle : T.fg, border: `1.5px solid ${isToday ? T.fg : T.line}` }}>
                      {d}{p && <span style={{ position: 'absolute', bottom: 1 }}><Sym name="local_fire_department" size={9} fill={1} color="#fff" /></span>}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </Card>
        <Card pad={12} style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 10 }}>
          <Sym name="ac_unit" size={22} color={T.info} fill={1} /><div style={{ flex: 1 }}><div style={{ fontSize: 13, fontWeight: 700, color: T.fg }}>스트릭 방패 · 2개 보유</div><div style={{ fontSize: 11, color: T.fgSubtle }}>하루 놓쳐도 스트릭 유지 (주 1회)</div></div><Sym name="chevron_right" size={18} color={T.fgSubtle} />
        </Card>
      </Body>
    </Screen>
  );
}

function RtRanking({ ctx }) {
  const [tab, setTab] = useRt('친구');
  const podium = [{ r: 2, n: '나', s: 1796, h: 70, me: true }, { r: 1, n: '민수', s: 1842, h: 88 }, { r: 3, n: '서연', s: 1680, h: 54 }];
  const rest = [{ r: 4, n: '준호', s: 1541 }, { r: 5, n: '유진', s: 1402 }, { r: 6, n: '태민', s: 1298 }];
  return (
    <Screen bg={T.basement}>
      <Header onBack={ctx.back} title="주간 랭킹" right={<IconButton icon="info" aria-label="정보" variant="ghost" />} />
      <div style={{ flex: 'none', padding: '0 16px', background: T.layer }}>
        <Tabs tabs={['친구', '전체', '학교']} value={tab} onChange={setTab} />
      </div>
      <Body bottomPad={40}>
        <Card pad={12} bg={T.bnGreen} border={false}>
          <div style={{ display: 'flex', alignItems: 'baseline' }}><span style={{ fontSize: 12, fontWeight: 700, color: T.fg }}>1월 6일 - 1월 12일</span><span style={{ marginLeft: 'auto', fontSize: 11, color: T.fgSubtle }}>종료까지 3일 5시간</span></div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 4 }}><span style={{ fontSize: 12, color: T.fgMuted }}>내 순위</span><span style={{ fontSize: 22, fontWeight: 700, color: T.brand }}>2위</span><span style={{ fontSize: 11, color: T.fgSubtle }}>/ 6명 · 1위까지 46점</span></div>
        </Card>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.1fr 1fr', gap: 8, alignItems: 'flex-end', marginTop: 16 }}>
          {podium.map((p, i) => (
            <div key={i} style={{ textAlign: 'center' }}>
              <Avatar name={p.n} size={p.r === 1 ? 44 : 36} ring={p.me} style={{ margin: '0 auto' }} />
              <div style={{ fontSize: 12, fontWeight: 700, color: T.fg, marginTop: 4 }}>{p.n}</div>
              <div style={{ fontSize: 11, color: T.fgSubtle }}>{p.s}</div>
              <div style={{ marginTop: 4, height: p.h, background: p.r === 1 ? T.brandSolid : p.me ? 'var(--mossy-color-palette-gray-400)' : 'var(--mossy-color-palette-gray-300)', borderRadius: `${'8px'} 8px 0 0`, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', paddingTop: 4 }}>
                <span style={{ fontSize: 16, fontWeight: 700, color: p.r === 1 ? '#fff' : T.fg }}>{p.r}</span>
              </div>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 12 }}>
          {rest.map((f, i) => (
            <Card key={i} pad={10} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ width: 18, textAlign: 'center', fontSize: 14, fontWeight: 700, color: T.fgSubtle }}>{f.r}</span>
              <Avatar name={f.n} size={32} /><span style={{ fontSize: 14, fontWeight: 700, color: T.fg }}>{f.n}</span>
              <span style={{ marginLeft: 'auto', fontSize: 14, fontWeight: 700, color: T.fg }}>{f.s}</span>
            </Card>
          ))}
        </div>
        <Card pad={12} bg={T.bnYellow} border={false} style={{ marginTop: 10, textAlign: 'center' }}>
          <div style={{ fontSize: 12, color: T.fgMuted }}>친구를 초대하고 랭킹을 키워보세요</div>
          <Button variant="brand" size="small" leadingIcon="person_add" style={{ marginTop: 8 }} onClick={() => ctx.nav('retention', { view: 'invite' })}>친구 초대</Button>
        </Card>
      </Body>
    </Screen>
  );
}

function RtInvite({ ctx }) {
  return (
    <Screen bg={T.layer}>
      <Header onBack={ctx.back} title="친구 초대" />
      <Body bottomPad={40}>
        <div style={{ textAlign: 'center', paddingTop: 8 }}>
          <div style={{ display: 'inline-flex', gap: 8 }}>
            <Avatar name="나" size={44} /><Avatar name="민수" size={44} /><Avatar name="서연" size={44} />
          </div>
          <div style={{ fontSize: 20, fontWeight: 700, color: T.fg, marginTop: 10, lineHeight: 1.3 }}>같이 하면<br />더 오래 가요</div>
        </div>
        <Card pad={14} bg={T.bnGreen} border={false} style={{ marginTop: 16, position: 'relative' }}>
          <span style={{ position: 'absolute', top: -9, left: 14 }}><Badge variant="positive">둘 다 받아요</Badge></span>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 4 }}>
            {[['나에게', 'Pro 1일', '친구 가입 완료 시'], ['친구에게', 'Pro 1일', '첫 게임 완료 시']].map(([who, what, when], i) => (
              <div key={i} style={{ textAlign: 'center', borderLeft: i === 1 ? `1px solid ${T.line}` : 'none' }}>
                <Sym name="redeem" size={26} fill={1} color={T.brand} />
                <div style={{ fontSize: 12, fontWeight: 700, color: T.fg }}>{who}</div>
                <div style={{ fontSize: 15, fontWeight: 700, color: T.brand }}>{what}</div>
                <div style={{ fontSize: 10, color: T.fgSubtle }}>{when}</div>
              </div>
            ))}
          </div>
        </Card>
        <Card pad={12} style={{ marginTop: 12 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: T.fg }}>내 초대 현황</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 6, marginTop: 8, textAlign: 'center' }}>
            {[['보낸 초대', '3', T.fg], ['가입', '1', T.positive], ['획득 Pro', '1일', T.brand]].map(([l, v, c], i) => (
              <div key={i} style={{ borderLeft: i ? `1px solid ${T.line}` : 'none' }}><div style={{ fontSize: 10, color: T.fgSubtle }}>{l}</div><div style={{ fontSize: 16, fontWeight: 700, color: c }}>{v}</div></div>
            ))}
          </div>
        </Card>
        <SectionHead title="내 초대 코드" />
        <div style={{ padding: 12, borderRadius: T.r3, border: `1.5px dashed ${T.lineWeak}`, display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 18, fontWeight: 700, letterSpacing: 2, color: T.fg }}>SAEUM-7K4M</span>
          <button onClick={() => ctx.showToast('초대 코드를 복사했어요', { icon: 'content_copy' })} style={{ marginLeft: 'auto', border: 'none', background: 'transparent', cursor: 'pointer' }}><Sym name="content_copy" size={20} color={T.fgMuted} /></button>
        </div>
        <Button variant="brand" size="large" fullWidth leadingIcon="chat" style={{ marginTop: 14 }} onClick={() => ctx.showToast('카카오톡 공유를 열었어요')}>카카오톡으로 초대하기</Button>
      </Body>
    </Screen>
  );
}

function RtEvent({ ctx }) {
  const prizes = [['1위', 'Pro 3개월 + 기프티콘 ₩30,000'], ['2~10위', 'Pro 1개월'], ['11~100위', 'Pro 1주일'], ['상위 50%', '참가 뱃지 + 100 XP']];
  return (
    <Screen bg={T.basement}>
      <Header onBack={ctx.back} title="주간 대회" right={<IconButton icon="ios_share" aria-label="공유" variant="ghost" />} />
      <Body bottomPad={120}>
        <Card pad={16} bg={T.bnGreen} border={false} style={{ position: 'relative' }}>
          <span style={{ position: 'absolute', top: 14, right: 14 }}><Badge variant="critical">LIVE</Badge></span>
          <Sym name="emoji_events" size={28} fill={1} color={T.brand} />
          <div style={{ fontSize: 18, fontWeight: 700, color: T.fg, marginTop: 4 }}>1월 2주차 대회</div>
          <div style={{ fontSize: 12, color: T.fgMuted }}>9게임 누적 점수 기준</div>
          <div style={{ display: 'flex', gap: 20, marginTop: 10 }}>
            <div><div style={{ fontSize: 10, color: T.fgSubtle }}>종료까지</div><div style={{ fontSize: 16, fontWeight: 700, color: T.fg }}>3일 05시간</div></div>
            <div style={{ borderLeft: `1px solid ${T.line}`, paddingLeft: 16 }}><div style={{ fontSize: 10, color: T.fgSubtle }}>참가자</div><div style={{ fontSize: 16, fontWeight: 700, color: T.fg }}>3,482명</div></div>
          </div>
        </Card>
        <Card pad={12} style={{ marginTop: 10 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}><span style={{ fontSize: 12, fontWeight: 700, color: T.fg }}>내 순위</span><span style={{ fontSize: 20, fontWeight: 700, color: T.fg }}>628</span><span style={{ fontSize: 11, color: T.fgSubtle }}>위 · 상위 18%</span><span style={{ marginLeft: 'auto', fontSize: 11, fontWeight: 700, color: T.positive }}>▲ +42</span></div>
          <div style={{ marginTop: 8 }}><Progress value={82} color={T.brandSolid} height={8} /></div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 3, fontSize: 10, color: T.fgSubtle }}><span>내 점수 1,796</span><span>상위 10% · 2,100</span></div>
        </Card>
        <SectionHead title="상품" />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {prizes.map(([r, p], i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: 10, borderRadius: T.r3, border: `1px solid ${T.line}` }}>
              <Badge variant={i === 0 ? 'brand' : 'neutral'} style={{ minWidth: 56, height: 22 }}>{r}</Badge>
              <span style={{ fontSize: 13, color: T.fg }}>{p}</span>
            </div>
          ))}
        </div>
      </Body>
      <div style={{ flex: 'none', padding: '10px 16px 30px', borderTop: `1px solid ${T.line}`, background: T.layer }}>
        <Button variant="brand" size="large" fullWidth trailingIcon="arrow_forward" onClick={() => ctx.nav('gameIntro', { id: 'rps', mock: true, idx: 0 })}>지금 한 판 더</Button>
      </div>
    </Screen>
  );
}

function RtPush({ ctx }) {
  const items = [
    ['groups', '민수님이 주간 랭킹에서 추월했어요', '반격', '방금', true],
    ['local_fire_department', '스트릭 꺼질 위기! 오늘 1판만 해보세요', '4일째 · 오늘 안 풂', '1시간 전', true],
    ['bolt', '새 챌린지 · 마법약 75점이 열렸어요', '+20 XP', '오전 9:00', false],
    ['insights', '주간 리포트가 도착했어요', '평균 +4점 · 상위 22%', '월 09:00', false],
    ['emoji_events', '1월 2주 대회 진행 중 · 상위 18%', '3일 남음', '1/8', false],
  ];
  return (
    <Screen bg={T.basement}>
      <Header onBack={ctx.back} title="알림" right={<IconButton icon="settings" aria-label="설정" variant="ghost" />} />
      <Body bottomPad={40}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {items.map(([ic, t, sub, time, unread], i) => (
            <Card key={i} pad={12} bg={unread ? T.bnGreen : T.layer} border style={{ display: 'flex', gap: 10, alignItems: 'flex-start', position: 'relative' }}>
              {unread && <span style={{ position: 'absolute', left: 4, top: 16 }}><Badge dot /></span>}
              <span style={{ marginLeft: unread ? 8 : 0, width: 36, height: 36, borderRadius: T.full, background: T.layer, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flex: 'none', border: `1px solid ${T.line}` }}><Sym name={ic} size={20} fill={1} color={T.brand} /></span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, color: T.fg, lineHeight: 1.4 }}>{t}</div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 2 }}><span style={{ fontSize: 11, color: T.fgSubtle }}>{sub}</span><span style={{ marginLeft: 'auto', fontSize: 11, color: T.fgSubtle }}>{time}</span></div>
              </div>
            </Card>
          ))}
        </div>
        <SectionHead title="잠금화면 미리보기" />
        <div style={{ padding: 12, borderRadius: T.r4, background: '#1c1c1e' }}>
          <div style={{ padding: 12, borderRadius: T.r3, background: 'rgba(255,255,255,0.12)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ width: 20, height: 20, borderRadius: 5, background: T.brandSolid, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}><Sym name="eco" size={13} fill={1} color="#fff" /></span>
              <span style={{ fontSize: 12, fontWeight: 700, color: '#fff' }}>역검</span><span style={{ marginLeft: 'auto', fontSize: 11, color: '#aaa' }}>지금</span>
            </div>
            <div style={{ color: '#fff', fontSize: 13, fontWeight: 700, marginTop: 6 }}>스트릭이 꺼질 위기예요</div>
            <div style={{ color: '#ccc', fontSize: 12, marginTop: 2 }}>오늘 가위바위보 1판이면 4일째 이어져요</div>
          </div>
        </div>
      </Body>
    </Screen>
  );
}

Object.assign(window, { RetentionScreen });
