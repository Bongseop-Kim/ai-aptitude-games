// mock-flow.jsx — 모의고사(9게임 종합 테스트)의 전체 화면 플로우 스토리보드.
// 진입 → 시작/안내 → 게임1(전체) → 진행/전환(압축) → 중단/복귀 → 완주 → 로딩 → 리포트 → 공유 → 기록.
// 신규 화면 4종(MockBriefing / MockInterstitial / MockPause / MockResume)을 정의하고,
// 나머지는 실제 앱 컴포넌트(GameIntro·GameResult·MockFinish·ReportLoading·ReportScreen·ShareSheet·RecordsTab 등)를 그대로 재사용.

const { useState: useMf } = React;

// ── 정적 렌더용 mock ctx (nav는 no-op, board=true로 타이머/애니메이션 동결) ──
function mfCtx(params = {}) {
  const completed = (() => { const s = {}; GAMES.forEach(g => { if (g.done) s[g.id] = g.score; }); return s; })();
  return {
    params, route: { name: 'mockflow', params }, completedGames: completed, board: true,
    nav: () => {}, back: () => {}, replace: () => {}, resetTo: () => {},
    isPro: false, setPro: () => {}, showToast: () => {}, completeGame: () => {}, streak: 4,
  };
}

// ── 디바이스 래퍼 ──────────────────────────────────────────────
function MfDevice({ children }) {
  return (
    <IOSDevice width={390} height={844}>
      <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}>{children}</div>
    </IOSDevice>
  );
}

// 9게임 진행 도트
function ProgressDots({ done, total = 9, current = true, color = T.brandSolid }) {
  return (
    <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
      {Array.from({ length: total }).map((_, i) => {
        const isDone = i < done, isCur = current && i === done;
        return (
          <span key={i} style={{
            flex: 1, height: 6, borderRadius: T.full,
            background: isDone ? color : isCur ? 'transparent' : T.neutralWeak,
            border: isCur ? `2px solid ${color}` : 'none',
            boxSizing: 'border-box', transition: 'all .3s',
          }} />
        );
      })}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// 신규 ① 모의고사 시작 / 안내 (브리핑)
// ════════════════════════════════════════════════════════════════
function MockBriefing({ ctx = mfCtx() }) {
  return (
    <Screen bg={T.layer}>
      <Header center sub="모의고사" title="" onBack={() => {}}
        right={<IconButton icon="close" aria-label="닫기" variant="ghost" />} />
      <Body bottomPad={150}>
        <div style={{ textAlign: 'center', paddingTop: 8 }}>
          <span style={{ width: 80, height: 80, borderRadius: T.full, background: T.brandWeak, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
            <Sym name="emoji_events" size={46} fill={1} color={T.brand} />
          </span>
          <div style={{ fontSize: 25, fontWeight: 700, color: T.fg, marginTop: 12, letterSpacing: '-0.02em' }}>모의고사 한 판</div>
          <div style={{ fontSize: 14, color: T.fgMuted, marginTop: 4, lineHeight: 1.45, padding: '0 12px' }}>9개 역량 게임을 한 번에 풀고, AI 종합 리포트를 받아요</div>
        </div>

        <div style={{ display: 'flex', gap: 10, marginTop: 18 }}>
          <StatBox label="게임" value="9" />
          <StatBox label="문항" value="240" />
          <StatBox label="예상 시간" value="22분" />
        </div>

        <SectionHead title="이렇게 진행돼요" />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[
            ['list_alt', '9개 역량 게임을 정해진 순서로 풀어요'],
            ['save', '중간에 멈춰도 진행이 24시간 동안 저장돼요'],
            ['auto_awesome', '완주하면 5대 역량 리포트가 만들어져요'],
          ].map(([ic, txt], i) => (
            <Card key={i} pad={12} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ width: 34, height: 34, borderRadius: T.full, background: T.brandWeak, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}>
                <Sym name={ic} size={20} fill={1} color={T.brand} />
              </span>
              <span style={{ fontSize: 14, color: T.fg, lineHeight: 1.4 }}>{txt}</span>
            </Card>
          ))}
        </div>

        <SectionHead title="출제 순서" />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
          {GAMES.map((g, i) => (
            <div key={g.id} style={{ position: 'relative', padding: '12px 8px 10px', borderRadius: T.r3, border: `1px solid ${T.line}`, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
              <span style={{ position: 'absolute', top: 6, left: 8, fontSize: 10, fontWeight: 700, color: T.fgSubtle }}>{i + 1}</span>
              <span style={{ width: 36, height: 36, borderRadius: T.r2_5, background: g.bg, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                <Sym name={g.icon} size={22} fill={1} color={g.ink} />
              </span>
              <span style={{ fontSize: 11, fontWeight: 700, color: T.fg, textAlign: 'center', lineHeight: 1.2 }}>{g.name}</span>
            </div>
          ))}
        </div>

        <Banner tone="neutral" icon="lightbulb" style={{ marginTop: 14 }}>
          조용한 곳에서 끊김 없이 푸는 걸 권해요. 점수보다 응답의 일관성이 더 중요하게 평가돼요.
        </Banner>
      </Body>
      <div style={{ flex: 'none', padding: '10px 16px 30px', borderTop: `1px solid ${T.line}`, background: T.layer }}>
        <Button variant="brand" size="large" fullWidth trailingIcon="play_arrow">모의고사 시작</Button>
        <div style={{ textAlign: 'center', marginTop: 8, fontSize: 12, color: T.fgSubtle }}>마지막 회차 1월 12일 · 78점</div>
      </div>
    </Screen>
  );
}

// ════════════════════════════════════════════════════════════════
// 신규 ② 게임 간 전환 (인터스티셜)
// ════════════════════════════════════════════════════════════════
function MockInterstitial({ doneCount = 2 }) {
  const justDone = GAMES[doneCount - 1];
  const next = GAMES[doneCount];
  return (
    <Screen bg={T.brandWeak}>
      <div style={{ flex: 'none', paddingTop: 56, padding: '56px 20px 0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: T.brand }}>{doneCount} / 9 완료</span>
          <span style={{ fontSize: 12, color: T.fgMuted }}>약 {GAMES.slice(doneCount).reduce((a, g) => a + g.min, 0)}분 남음</span>
        </div>
        <ProgressDots done={doneCount} />
      </div>

      <Center style={{ gap: 0, padding: '0 24px' }}>
        <div style={{ textAlign: 'center', animation: 'saeum-pop .5s var(--mossy-timing-function-enter)' }}>
          <span style={{ width: 72, height: 72, borderRadius: T.full, background: T.layer, boxShadow: T.s1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
            <Sym name="check_circle" size={42} fill={1} color={T.positive} />
          </span>
          <div style={{ fontSize: 20, fontWeight: 700, color: T.fg, marginTop: 12, letterSpacing: '-0.01em' }}>{justDone.name} 완료</div>
          <div style={{ marginTop: 8, display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 11px', borderRadius: T.full, background: T.positiveWeak, color: T.positive, fontSize: 12, fontWeight: 700 }}>
            <Sym name="check" size={14} color={T.positive} />{justDone.cog} · {justDone.score}점
          </div>
        </div>

        <div style={{ width: 1, height: 28, background: T.lineWeak, margin: '20px 0' }} />

        <div style={{ width: '100%', fontSize: 12, fontWeight: 700, color: T.fgSubtle, textAlign: 'center', marginBottom: 10 }}>다음 게임</div>
        <Card pad={16} shadow style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 14 }}>
          <span style={{ width: 56, height: 56, borderRadius: T.r3, background: next.bg, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}>
            <Sym name={next.icon} size={32} fill={1} color={next.ink} />
          </span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 11, color: T.fgSubtle }}>{doneCount + 1}번째 게임</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: T.fg, letterSpacing: '-0.01em' }}>{next.name}</div>
            <div style={{ fontSize: 12, color: T.fgMuted, marginTop: 1 }}>{next.cog} · 약 {next.min}분</div>
          </div>
        </Card>
      </Center>

      <div style={{ flex: 'none', padding: '10px 16px 30px' }}>
        <Button variant="brand" size="large" fullWidth trailingIcon="arrow_forward">다음 게임</Button>
        <div style={{ textAlign: 'center', marginTop: 8 }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 13, color: T.fgSubtle }}>
            <Sym name="pause_circle" size={16} color={T.fgSubtle} />잠시 멈추기
          </span>
        </div>
      </div>
    </Screen>
  );
}

// ════════════════════════════════════════════════════════════════
// 신규 ③ 일시정지 / 중도 이탈 확인 (게임 진행 위 시트)
// ════════════════════════════════════════════════════════════════
function MockPause() {
  const g = gameById('memory');
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      {/* 진행 중 게임 배경 */}
      <div style={{ position: 'absolute', inset: 0, filter: 'saturate(0.9)' }}>
        <Memory_play g={g} />
      </div>
      {/* 스크림 */}
      <div style={{ position: 'absolute', inset: 0, background: 'var(--mossy-color-bg-overlay)' }} />
      {/* 시트 */}
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, background: T.floating, borderRadius: '20px 20px 0 0', padding: '12px 16px 30px', boxShadow: T.s3, animation: 'saeum-sheet-up .3s var(--mossy-timing-function-enter)' }}>
        <div style={{ width: 40, height: 4, borderRadius: 2, background: T.neutralWeak, margin: '0 auto 16px' }} />
        <div style={{ textAlign: 'center' }}>
          <span style={{ width: 56, height: 56, borderRadius: T.full, background: T.bnYellow, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
            <Sym name="pause" size={30} fill={1} color={T.yellowDeep} />
          </span>
          <div style={{ fontSize: 19, fontWeight: 700, color: T.fg, marginTop: 10 }}>모의고사를 잠시 멈출까요?</div>
          <div style={{ fontSize: 13, color: T.fgMuted, marginTop: 4, lineHeight: 1.45 }}>지금까지 푼 3개 게임은 저장돼요.<br />24시간 안에 이어서 풀 수 있어요.</div>
        </div>

        <Card pad={12} bg={T.basement} border={false} style={{ marginTop: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: T.fg }}>3 / 9 진행</span>
            <span style={{ fontSize: 12, color: T.fgSubtle }}>8분 24초 경과</span>
          </div>
          <ProgressDots done={3} />
        </Card>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 16 }}>
          <Button variant="brand" size="large" fullWidth leadingIcon="play_arrow">이어서 풀기</Button>
          <Button variant="outline" size="large" fullWidth leadingIcon="bookmark">저장하고 나가기</Button>
          <div style={{ textAlign: 'center', marginTop: 2 }}>
            <span style={{ fontSize: 13, fontWeight: 500, color: T.critical }}>모의고사 그만두기</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// 신규 ④ 이어하기 (저장된 진행 복귀)
// ════════════════════════════════════════════════════════════════
function MockResume() {
  const doneN = 3;
  const done = GAMES.slice(0, doneN);
  const remain = GAMES.slice(doneN);
  return (
    <Screen bg={T.basement}>
      <Header sub="모의고사" title="" onBack={() => {}} />
      <Body bottomPad={170}>
        <Card pad={16} bg={T.bnGreen} border={false} style={{ animation: 'saeum-fade-up .4s var(--mossy-timing-function-enter)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ width: 40, height: 40, borderRadius: T.full, background: T.layer, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}>
              <Sym name="hourglass_bottom" size={24} fill={1} color={T.brand} />
            </span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: T.fg }}>진행 중인 모의고사가 있어요</div>
              <div style={{ fontSize: 12, color: T.fgMuted, marginTop: 1 }}>{doneN} / 9 게임 · 8분 24초 진행</div>
            </div>
          </div>
          <div style={{ marginTop: 12 }}><Progress value={(doneN / 9) * 100} color={T.brandSolid} height={6} /></div>
        </Card>

        <Banner tone="warning" icon="timer" style={{ marginTop: 12 }}>저장된 진행은 23시간 뒤에 사라져요.</Banner>

        <SectionHead title="완료한 게임" />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {done.map((g, i) => (
            <div key={g.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', borderRadius: T.r3, border: `1px solid ${T.line}`, background: T.layer }}>
              <span style={{ width: 36, height: 36, borderRadius: T.r2_5, background: g.bg, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}>
                <Sym name={g.icon} size={20} fill={1} color={g.ink} />
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: T.fg }}>{g.name}</div>
                <div style={{ fontSize: 11, color: T.fgSubtle }}>{g.cog}</div>
              </div>
              <span style={{ fontSize: 15, fontWeight: 700, color: T.positive, marginRight: 4 }}>{g.score}</span>
              <Sym name="check_circle" size={20} fill={1} color={T.positive} />
            </div>
          ))}
        </div>

        <SectionHead title="남은 게임" />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {remain.map((g, i) => {
            const isNext = i === 0;
            return (
              <div key={g.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', borderRadius: T.r3, border: `1.5px solid ${isNext ? T.brandStroke : T.line}`, background: isNext ? T.brandWeak : T.layer }}>
                <span style={{ width: 36, height: 36, borderRadius: T.r2_5, background: isNext ? T.layer : T.basement, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}>
                  <Sym name={g.icon} size={20} fill={1} color={isNext ? g.ink : T.fgSubtle} />
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: isNext ? T.fg : T.fgMuted }}>{g.name}</div>
                  <div style={{ fontSize: 11, color: T.fgSubtle }}>{g.cog} · 약 {g.min}분</div>
                </div>
                {isNext ? <Pill tone="brand">다음</Pill> : <Sym name="lock_clock" size={18} color={T.fgSubtle} />}
              </div>
            );
          })}
        </div>
      </Body>
      <div style={{ flex: 'none', padding: '10px 16px 30px', borderTop: `1px solid ${T.line}`, background: T.layer }}>
        <Button variant="brand" size="large" fullWidth trailingIcon="arrow_forward">이어서 풀기 · {doneN + 1}번째 게임</Button>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 8 }}>
          <Button variant="outline" size="medium" leadingIcon="restart_alt">처음부터</Button>
          <Button variant="ghost" size="medium">그만두기</Button>
        </div>
      </div>
    </Screen>
  );
}

// ════════════════════════════════════════════════════════════════
// 캔버스 — 전체 모의고사 플로우
// ════════════════════════════════════════════════════════════════
const rps = gameById('rps');

// 아트보드 헬퍼 — DCArtboard 엘리먼트를 "직접" 반환해야 DCSection의 type 검사를 통과해요.
// (커스텀 컴포넌트로 감싸면 c.type !== DCArtboard 가 되어 프레임이 렌더되지 않음)
function ab(id, label, node) {
  return (
    <DCArtboard id={id} label={label} width={390} height={844}>
      <MfDevice>{node}</MfDevice>
    </DCArtboard>
  );
}

function MockFlowCanvas() {
  return (
    <DesignCanvas>
      {/* ① 진입 & 시작 */}
      <DCSection id="entry" title="① 진입 & 시작" subtitle="게임/기록 탭 진입 → 모의고사 안내(신규) → 시작">
        {ab('e-games', '게임 탭 · 모의고사 진입', <GamesTab ctx={mfCtx()} />)}
        {ab('e-records', '기록 탭 · 새 모의고사', <RecordsTab ctx={mfCtx()} />)}
        {ab('e-brief', '★ 모의고사 시작/안내 (신규)', <MockBriefing />)}
        <DCPostIt top={-20} left={1320} rotate={-3} width={236}>
          현재 앱은 안내 없이 바로 1게임으로 진입해요. 9게임·240문항·22분을 미리 알려주는 브리핑 화면을 신규로 추가했어요.
        </DCPostIt>
      </DCSection>

      {/* ② 게임 1 — 전체 예시 */}
      <DCSection id="game1" title="② 게임 1 · 가위바위보 (전체 예시)" subtitle="인트로 → 플레이(문제→정답) → 결과 · 나머지 8게임은 동일 구조">
        {ab('g1-intro', '1-A. 인트로 (모의고사 1/9)', <GameIntro ctx={mfCtx({ id: 'rps', mock: true, idx: 0 })} />)}
        {ab('g1-q', '1-B. 플레이 · 문제', <Rps_play g={rps} />)}
        {ab('g1-a', '1-C. 플레이 · 정답', <Rps_play g={rps} reveal />)}
        {ab('g1-result', '1-D. 결과 (1/9)', <GameResult ctx={mfCtx({ id: 'rps', score: 81, mock: true, idx: 0 })} />)}
        <DCPostIt top={-20} left={1720} rotate={3} width={220}>
          게임별 상세 플레이는 「새움 게임 플로우」 문서에 9종 모두 있어요. 여기선 모의고사 골격만 봅니다.
        </DCPostIt>
      </DCSection>

      {/* ③ 진행 & 전환 (압축) */}
      <DCSection id="progress" title="③ 진행 & 전환 (압축)" subtitle="게임 간 전환(신규)으로 진행도를 보여주며 9게임을 이어 풀어요">
        {ab('p-inter2', '★ 게임 간 전환 2/9 (신규)', <MockInterstitial doneCount={2} />)}
        {ab('p-mid', '중간 결과 5/9', <GameResult ctx={mfCtx({ id: 'path', score: 69, mock: true, idx: 4 })} />)}
        {ab('p-inter6', '★ 게임 간 전환 6/9 (신규)', <MockInterstitial doneCount={6} />)}
        {ab('p-last', '마지막 결과 9/9', <GameResult ctx={mfCtx({ id: 'compare', score: 88, mock: true, idx: 8 })} />)}
        <DCPostIt top={-20} left={2120} rotate={-3} width={232}>
          매 게임 사이에 전환 화면을 넣어 진행도(2/9…)·다음 게임을 예고하고, 잠시 멈출 기회를 줘요.
        </DCPostIt>
      </DCSection>

      {/* ④ 중단 & 복귀 (신규) */}
      <DCSection id="pause" title="④ 중단 & 복귀 (신규)" subtitle="22분 중 이탈에 대비 — 일시정지·저장·이어하기">
        {ab('pa-pause', '★ 일시정지 / 나가기 확인', <MockPause />)}
        {ab('pa-resume', '★ 이어하기 (저장된 진행)', <MockResume />)}
        <DCPostIt top={-20} left={840} rotate={3} width={232}>
          중도 이탈 시 진행을 24시간 저장하고, 다시 들어오면 완료/남은 게임과 함께 이어하기로 복귀해요.
        </DCPostIt>
      </DCSection>

      {/* ⑤ 완주 & 분석 */}
      <DCSection id="finish" title="⑤ 완주 & 분석" subtitle="9게임 완주 축하 → AI 리포트 생성 로딩">
        {ab('f-finish', '완주 축하 (240문항)', <MockFinish ctx={mfCtx()} />)}
        {ab('f-loading', 'AI 분석 로딩', <ReportLoading ctx={mfCtx()} />)}
      </DCSection>

      {/* ⑥ 리포트 */}
      <DCSection id="report" title="⑥ AI 종합 리포트" subtitle="표지 → 5대 역량 → 강·약점 → 또래 비교 → 잠긴 섹션(Pro) → 공유">
        {ab('r-cover', '표지 · 종합 준비도', <ReportScreen ctx={mfCtx()} initialSec={0} />)}
        {ab('r-radar', '5대 역량 레이더', <ReportScreen ctx={mfCtx()} initialSec={1} />)}
        {ab('r-high', '강점 · 약점 Top 3', <ReportScreen ctx={mfCtx()} initialSec={2} />)}
        {ab('r-peer', '또래 비교 · 성장 추이', <ReportScreen ctx={mfCtx()} initialSec={5} />)}
        {ab('r-locked', '잠긴 섹션 (Pro 페이월)', <ReportScreen ctx={mfCtx()} initialSec={3} />)}
        {ab('r-share', '공유 카드 시트', (
          <div style={{ position: 'absolute', inset: 0 }}>
            <ReportScreen ctx={mfCtx()} initialSec={0} />
            <ShareSheet ctx={mfCtx()} onClose={() => {}} />
          </div>
        ))}
        <DCPostIt top={-20} left={2520} rotate={3} width={228}>
          Free 4섹션 + Pro 3섹션(복원력·응답 패턴·코치). 잠긴 섹션은 블러+페이월로 업셀해요.
        </DCPostIt>
      </DCSection>

      {/* ⑦ 기록 아카이브 */}
      <DCSection id="archive" title="⑦ 기록 아카이브" subtitle="회차별 리포트 보관 → 다음 모의고사로 순환">
        {ab('a-records', '기록 탭 · 6회차', <RecordsTab ctx={mfCtx()} />)}
        <DCPostIt top={-20} left={440} rotate={-3} width={224}>
          완주한 리포트는 기록 탭에 회차별로 쌓이고, 여기서 다시 새 모의고사를 시작해 플로우가 순환해요.
        </DCPostIt>
      </DCSection>
    </DesignCanvas>
  );
}

Object.assign(window, { MockFlowCanvas, MockBriefing, MockInterstitial, MockPause, MockResume });
