// iv-ncs.jsx — 실전 면접 트랙 · NCS/AI Hub 반영 화면 (인터랙티브)
// 기존 iv-* 헬퍼/데이터(ds-setup, iv-shared, iv-input, iv-analysis, iv-feedback) 위에서 동작.
// 변경 화면만 NCS 버전으로 새로 정의하고, 라우터(iv-app-ncs)가 이 컴포넌트들로 연결한다.

const { useState: useNcs } = React;

// ── NCS 직무 매핑 데이터 (프론트엔드 엔지니어 예시 · API: ncs_code / ncs_name) ──
const NCS_PRIMARY = {
  name: '응용SW엔지니어링',
  group: '정보통신 › 정보기술 › 정보기술개발',
  code: '20010206',
  level: '세분류',
  conf: 92,
  units: ['요구사항 확인', '화면 구현', '기능 구현', '통합 구현', '테스트'],
};
const NCS_CANDIDATES = [
  { name: '응용SW엔지니어링', code: '20010206', conf: 92, units: ['요구사항 확인', '화면 구현', '기능 구현', '통합 구현', '테스트'] },
  { name: 'UI/UX엔지니어링', code: '20010212', conf: 86, units: ['UI 요구사항 분석', 'UI 설계', 'UI 구현', '사용성 평가'] },
  { name: '시스템SW엔지니어링', code: '20010204', conf: 64, units: ['시스템 SW 기초 설계', '시스템 SW 구현'] },
  { name: '데이터베이스엔지니어링', code: '20010205', conf: 58, units: ['DB 설계', 'DB 구현', 'DB 운영'] },
];

// peer (동일 직군) 비교
const NCS_PEER = { content: 70, star: 63, voice: 76, gaze: 67, delivery: 71 };

// 데이터 출처 문구 (의무 고지 — 정확 표기)
const SRC_AIHUB = "본 서비스는 과학기술정보통신부의 재원으로 한국지능정보사회진흥원(NIA)의 지원을 받아 구축된 'AI Hub 채용면접 인터뷰 데이터'를 활용합니다.";
const SRC_NCS = '출처: 한국산업인력공단, 국가직무능력표준(NCS) — 공공데이터포털';

// ── 마케팅 / 고지 조각 ────────────────────────────────────────────────────
function NcsKeywordTag({ size = 'md' }) {
  const sm = size === 'sm';
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: sm ? '4px 10px' : '6px 12px', borderRadius: T.full, background: T.brandWeak, color: T.brand, fontSize: sm ? 11 : 12, fontWeight: 700 }}>
      <Sym name="verified" size={sm ? 14 : 16} fill={1} color={T.brand} />국가직무능력표준(NCS) 기반
    </span>
  );
}
function DataBadge({ tone = 'neutral', icon = 'insights' }) {
  const s = tone === 'dark'
    ? { bg: 'rgba(255,255,255,0.16)', fg: '#fff' }
    : { bg: T.bnBlue, fg: T.blueDeep };
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '6px 11px', borderRadius: T.full, background: s.bg }}>
      <Sym name={icon} size={15} fill={1} color={s.fg} />
      <span style={{ fontSize: 12, fontWeight: 700, color: s.fg }}>실제 면접 데이터 8만 건 기반 분석</span>
    </span>
  );
}
function NcsJobChip({ small }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: small ? '3px 9px' : '5px 11px', borderRadius: T.full, background: T.bnGreen, color: T.mossy700, fontSize: small ? 11 : 12.5, fontWeight: 700 }}>
      <Sym name="workspace_premium" size={small ? 13 : 15} fill={1} color={T.mossy600} />프론트엔드 엔지니어 · NCS 기반
    </span>
  );
}
function SourceFootnote({ ctx }) {
  return (
    <div style={{ marginTop: 14, paddingTop: 12, borderTop: `1px solid ${T.line}` }}>
      <div style={{ fontSize: 10.5, color: T.fgSubtle, lineHeight: 1.5 }}>
        분석 근거: 한국산업인력공단 NCS(공공데이터포털) · AI Hub 채용면접 인터뷰 데이터(NIA)
      </div>
      <button onClick={() => ctx.nav('ivSource')} style={{ marginTop: 6, display: 'inline-flex', alignItems: 'center', gap: 3, border: 'none', background: 'transparent', padding: 0, cursor: 'pointer', fontFamily: T.font, fontSize: 11, fontWeight: 700, color: T.brand }}>
        데이터 출처 자세히 보기<Sym name="chevron_right" size={14} color={T.brand} />
      </button>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════
// 1. 면접 탭 루트 — 새 면접 시작 허브 (NCS·8만건 트러스트) / 홈 탭 루트(디자인)
// ════════════════════════════════════════════════════════════════════════
function InterviewHubB({ ctx }) {
  const sessions = [
    { date: '1월 12일', company: '리플로우', role: '프론트엔드', score: 74, delta: 8, q: 8 },
    { date: '1월 6일', company: '오월컴퍼니', role: '프론트엔드', score: 66, delta: null, q: 6 },
  ];
  return (
    <Screen bg={T.basement}>
      <div style={{ flex: 'none', paddingTop: 50, background: T.layer, borderBottom: `1px solid ${T.line}` }}>
        <div style={{ display: 'flex', alignItems: 'center', padding: '4px 16px 12px' }}>
          <div>
            <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em', color: T.fg }}>실전 면접</div>
            <div style={{ fontSize: 13, color: T.fgSubtle, marginTop: 1 }}>이력서·채용공고로 맞춤 영상 면접</div>
          </div>
          <div style={{ flex: 1 }} />
          <button onClick={() => ctx.nav('ivSource')} aria-label="데이터 출처" style={iconBtn}><Sym name="info" size={22} color={T.fgMuted} /></button>
        </div>
      </div>

      <Body bottomPad={104}>
        {/* NCS 직무 카드 — 히어로 (C 직무 중심형) */}
        <Card pad={16} bg={T.bnGreen} border={false} style={{ marginBottom: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}><NcsKeywordTag size="sm" /></div>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
            <span style={{ width: 46, height: 46, borderRadius: T.r3, background: T.layer, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}>
              <Sym name="workspace_premium" size={26} fill={1} color={T.mossy600} />
            </span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 11, color: T.fgMuted }}>국가직무능력표준(NCS) 기반 분류</div>
              <div style={{ fontSize: 20, fontWeight: 700, color: T.fg, marginTop: 2 }}>프론트엔드 엔지니어</div>
              <div style={{ fontSize: 12, color: T.fgMuted, marginTop: 1 }}>지원 공고에 맞춰 자동 분류했어요</div>
            </div>
            <IconButton icon="edit" aria-label="직무 변경" variant="weak" onClick={() => ctx.showToast('NCS 직무 변경', { icon: 'edit' })} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 12 }}>
            <Sym name="check_circle" size={15} fill={1} color={T.positive} /><span style={{ fontSize: 12, color: T.fg, fontWeight: 600 }}>매핑 신뢰도 92%</span>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 12 }}>
            {NCS_PRIMARY.units.map(u => (
              <span key={u} style={{ display: 'inline-flex', alignItems: 'center', padding: '5px 10px', borderRadius: T.full, background: T.layer, color: T.mossy700, fontSize: 11.5, fontWeight: 600 }}>{u}</span>
            ))}
          </div>
        </Card>

        {/* 이 직무로 면접 시작 */}
        <Card pad={14} style={{ marginBottom: 18, display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ width: 44, height: 44, borderRadius: T.r3, background: T.brandWeak, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}>
            <Sym name="videocam" size={24} fill={1} color={T.brand} />
          </span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: T.fg }}>이 직무로 면접 시작</div>
            <div style={{ fontSize: 12, color: T.fgMuted, marginTop: 1 }}>능력단위 기반 맞춤 질문 8개 · 8만 건 분석</div>
          </div>
        </Card>
        <Button variant="brand" size="large" fullWidth leadingIcon="bolt" style={{ marginBottom: 18 }} onClick={() => ctx.nav('ivResume')}>이력서로 시작하기</Button>

        {/* 지난 면접 */}
        <SectionHead title="지난 면접" action="전체" onAction={() => ctx.nav('ivStub', { tab: 'records' })} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {sessions.map((s, i) => (
            <Card key={i} pad={12} onClick={() => ctx.nav('ivFeedback')} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <ScoreRing score={s.score} size={46} stroke={5} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: 14, fontWeight: 700, color: T.fg }}>{s.company}</span>
                  <span style={{ fontSize: 12, color: T.fgSubtle }}>{s.role}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 2, fontSize: 11, color: T.fgSubtle }}>
                  <span>{s.date}</span><span>질문 {s.q}개</span>
                  {s.delta != null && <span style={{ color: T.positive, fontWeight: 700 }}>▲ {s.delta}</span>}
                </div>
              </div>
              <Sym name="chevron_right" size={20} color={T.fgSubtle} />
            </Card>
          ))}
        </div>
      </Body>
    </Screen>
  );
}

// ── 1-b. 홈 탭 루트 (디자인 전용 — 실전 면접 + NCS + AI Hub 노출) ────────────
// 버튼 동작/플로우는 다루지 않음. 인터랙티브 체험은 '면접' 탭에 집중.
function SaeumHomeRoot() {
  const tiles = GAMES.slice(0, 3);
  const chip = {
    display: 'inline-flex', alignItems: 'center', gap: 4, padding: '6px 10px', marginRight: 4,
    borderRadius: T.full, border: 'none', background: T.neutralWeak, cursor: 'default',
    fontFamily: T.font,
  };
  return (
    <Screen bg={T.basement}>
      {/* top bar */}
      <div style={{ flex: 'none', paddingTop: 50, background: T.layer, borderBottom: `1px solid ${T.line}` }}>
        <div style={{ display: 'flex', alignItems: 'center', padding: '4px 14px 12px' }}>
          <Logo size={19} />
          <div style={{ flex: 1 }} />
          <span style={chip}><Sym name="local_fire_department" size={18} fill={1} color="var(--mossy-color-manner-temp-l6-text)" /><span style={{ fontWeight: 700, fontSize: 14, color: T.fg }}>4</span></span>
          <span style={{ width: 40, height: 40, borderRadius: T.full, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
            <Sym name="notifications" size={24} color={T.fg} /><span style={{ position: 'absolute', top: 7, right: 7 }}><Badge dot /></span>
          </span>
        </div>
      </div>

      <Body bottomPad={104}>
        {/* greeting */}
        <div style={{ margin: '2px 2px 14px' }}>
          <div style={{ fontSize: 24, fontWeight: 700, letterSpacing: '-0.02em', color: T.fg }}>김준비님,</div>
          <div style={{ fontSize: 15, color: T.fgMuted, marginTop: 2 }}>오늘도 한 걸음 나아가요</div>
        </div>

        {/* 준비도 status (overview) */}
        <Card pad={16} style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
            <ReadinessGauge score={74} size={104} label={false} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 13, color: T.fgSubtle, fontWeight: 500 }}>면접 준비도</span>
                <Badge variant="positive">동일 직군 상위 28%</Badge>
              </div>
              <div style={{ marginTop: 8 }}><NcsJobChip small /></div>
              <div style={{ fontSize: 12, color: T.fgMuted, marginTop: 8, lineHeight: 1.45 }}>최근 모의 면접 <b style={{ color: T.fg }}>74점</b> · 리플로우 프론트엔드</div>
            </div>
          </div>
          <div style={{ marginTop: 14, paddingTop: 12, borderTop: `1px solid ${T.line}`, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Sym name="insights" size={18} fill={1} color={T.info} />
            <span style={{ fontSize: 12.5, color: T.fg, fontWeight: 600 }}>실제 면접 데이터 <b style={{ color: T.info }}>8만 건</b> 기반 분석</span>
          </div>
        </Card>

        {/* 실전 면접 — 당근 스타일 (따뜻·친근, 새움 그린) */}
        <SectionHead title="실전 면접" />
        <Card pad={0} border={false} radius={18} style={{ overflow: 'hidden', marginBottom: 18, boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 6px 18px rgba(74,124,89,0.12)' }}>
          <div style={{ padding: 18, background: T.bnGreen }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 10px', borderRadius: 999, background: T.layer, color: T.brand, fontSize: 11, fontWeight: 700 }}>
              <Sym name="verified" size={14} fill={1} color={T.brand} />국가직무능력표준(NCS) 기반
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 14 }}>
              <span style={{ width: 58, height: 58, borderRadius: 18, background: 'var(--mossy-color-palette-mossy-200)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}>
                <Sym name="interpreter_mode" size={32} fill={1} color={T.brand} />
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 19, fontWeight: 800, color: T.fg, lineHeight: 1.3, letterSpacing: '-0.02em' }}>내 직무에 딱 맞는<br/>면접을 연습해요</div>
              </div>
            </div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 14, padding: '7px 12px', borderRadius: 999, background: T.layer, color: T.brand, fontSize: 12.5, fontWeight: 700 }}>
              <Sym name="groups" size={16} fill={1} color={T.brand} />실제 면접 데이터 8만 건 분석
            </div>
          </div>
          <div style={{ padding: 14, background: T.layer }}>
            <Button variant="brand" size="large" fullWidth>실전 면접 시작하기</Button>
            <div style={{ textAlign: 'center', fontSize: 12, color: T.fgSubtle, marginTop: 8 }}>이력서·채용공고 → 맞춤 영상 면접</div>
          </div>
        </Card>

        {/* 역량 게임 연습 (기존 트랙) */}
        <SectionHead title="역량 게임 연습" action="전체" />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 18 }}>
          {tiles.map(g => <GameTile key={g.id} g={g} />)}
        </div>

        {/* 프로토타입 안내 — 유지 */}
        <Card pad={13} bg={T.bnCool} border={false} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
          <Sym name="swipe_up" size={20} fill={1} color={T.fgMuted} style={{ marginTop: 1 }} />
          <div style={{ fontSize: 12.5, color: T.fg, lineHeight: 1.5 }}>이 프로토타입은 새로 추가되는 <b style={{ color: T.brand }}>실전 면접</b> 탭에 집중해요. 아래 <b>면접</b> 탭에서 전체 플로우를 체험할 수 있어요.</div>
        </Card>
      </Body>
    </Screen>
  );
}

// ════════════════════════════════════════════════════════════════════════
// 2. 채용공고(JD) 등록 → NCS 직무 표시 + 수정 시트
// ════════════════════════════════════════════════════════════════════════
function NcsClassCard({ ncs, onEdit }) {
  return (
    <Card pad={14} bg={T.bnGreen} border={false}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
        <span style={{ width: 42, height: 42, borderRadius: T.r3, background: T.layer, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}>
          <Sym name="workspace_premium" size={24} fill={1} color={T.mossy600} />
        </span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 11, color: T.fgMuted }}>{NCS_PRIMARY.group}</div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 2, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 18, fontWeight: 700, color: T.fg }}>{ncs.name}</span>
            <span style={{ fontSize: 11, color: T.fgSubtle }}>{NCS_PRIMARY.level} · {ncs.code}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8 }}>
            <Sym name="check_circle" size={15} fill={1} color={T.positive} />
            <span style={{ fontSize: 12, color: T.fg, fontWeight: 600 }}>매핑 신뢰도 {ncs.conf}%</span>
          </div>
        </div>
      </div>
      <div style={{ fontSize: 11.5, color: T.fgMuted, margin: '12px 0 8px', fontWeight: 600 }}>핵심 능력단위</div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        {(ncs.units || NCS_PRIMARY.units).map(u => (
          <span key={u} style={{ display: 'inline-flex', alignItems: 'center', padding: '5px 10px', borderRadius: T.full, background: T.layer, color: T.mossy700, fontSize: 11.5, fontWeight: 600 }}>{u}</span>
        ))}
      </div>
      <button onClick={onEdit} style={{ marginTop: 14, width: '100%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '11px', borderRadius: T.r2_5, border: `1.5px solid ${T.brandStroke}`, background: T.layer, color: T.brand, fontFamily: T.font, fontSize: 14, fontWeight: 700, cursor: 'pointer', WebkitTapHighlightColor: 'transparent' }}>
        <Sym name="edit" size={18} color={T.brand} />직무가 다른가요? 직접 고르기
      </button>
    </Card>
  );
}

function NcsEditSheet({ current, onClose, onSelect, ctx }) {
  const [sel, setSel] = useNcs(NCS_CANDIDATES.findIndex(c => c.code === current.code));
  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 70 }}>
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'var(--mossy-color-bg-overlay)' }} />
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, background: T.floating, borderRadius: '20px 20px 0 0', padding: '12px 16px 30px', boxShadow: T.s3, maxHeight: '80%', display: 'flex', flexDirection: 'column', animation: 'saeum-sheet-up .3s var(--mossy-timing-function-enter)' }}>
        <div style={{ width: 40, height: 4, borderRadius: 2, background: T.neutralWeak, margin: '0 auto 12px', flex: 'none' }} />
        <div style={{ flex: 'none' }}>
          <div style={{ fontSize: 18, fontWeight: 700, color: T.fg }}>NCS 직무 선택</div>
          <div style={{ fontSize: 13, color: T.fgMuted, marginTop: 2 }}>매핑이 정확하지 않다면 직접 골라주세요.</div>
        </div>
        <div className="saeum-scroll" style={{ flex: 1, overflowY: 'auto', margin: '14px 0', display: 'flex', flexDirection: 'column', gap: 8 }}>
          {NCS_CANDIDATES.map((c, i) => {
            const on = i === sel;
            return (
              <button key={c.code} onClick={() => setSel(i)} style={{ textAlign: 'left', fontFamily: T.font, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12, padding: '13px 14px', borderRadius: T.r3, background: on ? T.brandWeak : T.layer, border: `1.5px solid ${on ? T.brandStroke : T.line}`, WebkitTapHighlightColor: 'transparent' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 15, fontWeight: 700, color: on ? T.brand : T.fg }}>{c.name}</span>
                    {i === 0 && <Badge variant="brand">추천</Badge>}
                  </div>
                  <div style={{ fontSize: 11, color: T.fgSubtle, marginTop: 2 }}>세분류 · {c.code} · 유사도 {c.conf}%</div>
                </div>
                <Sym name={on ? 'radio_button_checked' : 'radio_button_unchecked'} size={22} fill={on ? 1 : 0} color={on ? T.brand : T.lineWeak} />
              </button>
            );
          })}
          <button onClick={() => ctx.showToast('NCS 직무 검색', { icon: 'search' })} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '12px', borderRadius: T.r3, border: `1px dashed ${T.lineContrast}`, background: T.basement, color: T.fgMuted, fontFamily: T.font, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
            <Sym name="search" size={18} color={T.fgMuted} />다른 NCS 직무 검색
          </button>
        </div>
        <Button variant="brand" size="large" fullWidth style={{ flex: 'none' }} onClick={() => onSelect(NCS_CANDIDATES[sel])}>이 직무로 분석하기</Button>
      </div>
    </div>
  );
}

function IVJobNCS({ ctx }) {
  const [mode, setMode] = useNcs('paste');
  const [fileName, setFileName] = useNcs(null);
  const [paste, setPaste] = useNcs('');
  const [parsing, setParsing] = useNcs(false);
  const [parsed, setParsed] = useNcs(false);
  const [ncs, setNcs] = useNcs(NCS_PRIMARY);
  const [sheet, setSheet] = useNcs(false);

  const trigger = () => { setParsing(true); setParsed(false); setTimeout(() => { setParsing(false); setParsed(true); }, 1100); };
  const doFile = (v) => { if (!v) { setFileName(null); setParsed(false); return; } setFileName('리플로우_FE_채용공고.pdf'); trigger(); };

  return (
    <Screen bg={T.basement}>
      <FlowHeader stepKey="job" title="채용공고 등록" onBack={() => ctx.back()} onClose={() => ctx.resetTo('ivHub')} />
      <Body bottomPad={96}>
        <div style={{ margin: '2px 2px 14px' }}>
          <div style={{ fontSize: 15, color: T.fgMuted, lineHeight: 1.5 }}>지원할 공고를 올리면 <b style={{ color: T.fg }}>NCS 직무로 분류</b>하고 요건과 내 이력서를 대조해요.</div>
        </div>

        <Card pad={14}>
          <UploadOrPaste kind="job" mode={mode} setMode={setMode} fileName={fileName} onFile={doFile}
            pasteValue={paste} onPaste={setPaste} placeholder="채용공고 URL 또는 본문을 붙여넣어 주세요. (예: reflow.team/careers/fe-senior)" />
          {mode === 'paste' && !parsed && (
            <Button variant="outline" size="medium" fullWidth leadingIcon="auto_awesome" style={{ marginTop: 12 }} disabled={paste.trim().length < 10 || parsing} onClick={trigger}>공고 분석하기</Button>
          )}
        </Card>

        {parsing && (
          <Card pad={14} style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ width: 24, height: 24, borderRadius: T.full, border: `2.5px solid ${T.neutralWeak}`, borderTopColor: T.brand, animation: 'saeum-spin .8s linear infinite', flex: 'none' }} />
            <span style={{ fontSize: 14, color: T.fgMuted }}>공고 요건과 NCS 직무를 정리하고 있어요…</span>
          </Card>
        )}

        {parsed && (
          <div style={{ marginTop: 12, animation: 'saeum-fade-up .35s var(--mossy-timing-function-enter)' }}>
            <Banner tone="positive" icon="auto_awesome">채용공고에서 핵심 요건을 읽었어요.</Banner>

            <Card pad={14} style={{ marginTop: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ width: 44, height: 44, borderRadius: T.r3, background: T.bnBlue, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}>
                  <Sym name="apartment" size={24} fill={1} color={T.blue} />
                </span>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: T.fg }}>{IV_JOB.company}</div>
                  <div style={{ fontSize: 13, color: T.fgMuted }}>{IV_JOB.role}</div>
                  <div style={{ fontSize: 11, color: T.fgSubtle }}>{IV_JOB.type}</div>
                </div>
              </div>
              <div style={{ fontSize: 12, fontWeight: 700, color: T.fgSubtle, margin: '14px 0 8px' }}>필수 요건</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                {IV_JOB.must.map((m, i) => (
                  <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                    <Sym name="check_circle" size={16} color={T.brand} fill={1} style={{ marginTop: 2 }} />
                    <span style={{ fontSize: 13, color: T.fg, lineHeight: 1.4 }}>{m}</span>
                  </div>
                ))}
              </div>
            </Card>

            {/* NCS 직무 분류 — 핵심 */}
            <SectionHead title="NCS 직무 분류" icon="verified" />
            <NcsClassCard ncs={ncs} onEdit={() => setSheet(true)} />

            <Banner tone="informative" icon="info" style={{ marginTop: 12 }}>
              선택한 NCS 직무의 <b>능력단위</b>를 기준으로 맞춤 질문과 평가가 맞춰져요.
            </Banner>
          </div>
        )}
      </Body>
      <FlowFooter>
        <Button variant="brand" size="large" fullWidth trailingIcon="auto_awesome" disabled={!parsed} onClick={() => ctx.nav('ivAnalysis')}>AI 분석 시작하기</Button>
      </FlowFooter>

      {sheet && <NcsEditSheet current={ncs} ctx={ctx} onClose={() => setSheet(false)} onSelect={(c) => { setNcs(c); setSheet(false); ctx.showToast('NCS 직무를 변경했어요', { icon: 'check_circle' }); }} />}
    </Screen>
  );
}

// ════════════════════════════════════════════════════════════════════════
// 3. AI 분석 — 8만 건 배지 + NCS 능력단위 매칭
// ════════════════════════════════════════════════════════════════════════
function AnalyzeLoadingNcs({ onDone }) {
  const steps = ['이력서 핵심 역량 추출', '채용공고 → NCS 직무 매핑', 'NCS 능력단위 ↔ 역량 대조', '약점·갭 식별', '맞춤 질문 8개 생성'];
  const [done, setDone] = useNcs(0);
  React.useEffect(() => {
    const iv = setInterval(() => setDone(d => d + 1), 560);
    const t = setTimeout(onDone, 3000);
    return () => { clearInterval(iv); clearTimeout(t); };
  }, []);
  const pct = Math.min(100, Math.round((done / steps.length) * 100));
  return (
    <Body>
      <div style={{ textAlign: 'center', paddingTop: 26 }}>
        <div style={{ width: 110, height: 110, margin: '0 auto', position: 'relative' }}>
          <svg width="110" height="110" style={{ transform: 'rotate(-90deg)' }}>
            <circle cx="55" cy="55" r="48" fill="none" stroke={T.neutralWeak} strokeWidth="8" />
            <circle cx="55" cy="55" r="48" fill="none" stroke={T.brandSolid} strokeWidth="8" strokeLinecap="round" strokeDasharray={`${2 * Math.PI * 48 * (pct / 100)} ${2 * Math.PI * 48}`} style={{ transition: 'stroke-dasharray .5s' }} />
          </svg>
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Sym name="auto_awesome" size={34} fill={1} color={T.brand} /></div>
        </div>
        <div style={{ fontSize: 18, fontWeight: 700, color: T.fg, marginTop: 16 }}>맞춤 면접을 설계하고 있어요</div>
        <div style={{ fontSize: 13, color: T.fgSubtle, marginTop: 2 }}>NCS 능력단위로 이력서와 공고를 대조하는 중</div>
        <div style={{ marginTop: 14, display: 'flex', justifyContent: 'center' }}><DataBadge /></div>
      </div>
      <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 12 }}>
        {steps.map((s, i) => {
          const isDone = i < done, active = i === done;
          return (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ width: 22, height: 22, borderRadius: T.full, flex: 'none', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: isDone ? T.brandSolid : T.layer, border: `2px solid ${isDone ? T.brandSolid : active ? T.fg : T.lineWeak}` }}>
                {isDone ? <Sym name="check" size={14} color="#fff" /> : active ? <span style={{ width: 6, height: 6, borderRadius: T.full, background: T.fg }} /> : null}
              </span>
              <span style={{ fontSize: 14, fontWeight: active ? 700 : 400, color: isDone || active ? T.fg : T.fgSubtle }}>{s}</span>
              {active && <span style={{ marginLeft: 'auto', fontSize: 12, color: T.fgSubtle }}>처리 중…</span>}
            </div>
          );
        })}
      </div>
    </Body>
  );
}

function AnalysisResultNcs({ ctx }) {
  return (
    <Body bottomPad={96}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
        <NcsJobChip small /><DataBadge />
      </div>

      <Card pad={16} bg={T.bnGreen} border={false} style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <ScoreRing score={IV_MATCH.score} size={88} stroke={9} />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 12, color: T.fgMuted }}>이력서 × {IV_JOB.company} 적합도</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: T.brand, marginTop: 2 }}>{MATCH_LABEL(IV_MATCH.score)}</div>
          <div style={{ fontSize: 12, color: T.fgMuted, marginTop: 4, lineHeight: 1.4 }}>NCS 능력단위 5개 중 3개 충족 · 2개 보완하면 합격선에 가까워요</div>
        </div>
      </Card>

      <SectionHead title="능력단위별 매칭" icon="rule" />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
        {IV_MATCH.matched.map((m, i) => (
          <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', padding: '10px 12px', borderRadius: T.r3, border: `1px solid ${T.line}`, background: T.layer }}>
            <Sym name={m.hit ? 'check_circle' : 'error'} size={20} fill={1} color={m.hit ? T.positive : 'var(--mossy-color-manner-temp-l7-text)'} style={{ marginTop: 1 }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: T.fg }}>{m.k}</div>
              <div style={{ fontSize: 12, color: T.fgMuted, marginTop: 1 }}>{m.note}</div>
            </div>
          </div>
        ))}
      </div>

      <SectionHead title="생성된 맞춤 질문" action={`${IV_QUESTIONS.length}개`} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {IV_QUESTIONS.map((q) => (
          <Card key={q.id} pad={12}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ width: 24, height: 24, borderRadius: T.full, background: T.brandWeak, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flex: 'none', fontSize: 12, fontWeight: 700, color: T.brand }}>{q.id}</span>
              <CatChip cat={q.cat} small />
            </div>
            <div style={{ fontSize: 14, fontWeight: 600, color: T.fg, lineHeight: 1.45, margin: '8px 0 6px' }}>{q.text}</div>
            <div style={{ display: 'flex', gap: 6, alignItems: 'flex-start', fontSize: 11, color: T.fgSubtle }}>
              <Sym name="lightbulb" size={14} color={T.fgSubtle} fill={1} style={{ marginTop: 1 }} />
              <span style={{ lineHeight: 1.4 }}>{Q_WHY[q.id]}</span>
            </div>
          </Card>
        ))}
      </div>
    </Body>
  );
}

function IVAnalysisNCS({ ctx }) {
  const [phase, setPhase] = useNcs('loading');
  return (
    <Screen bg={T.basement}>
      <FlowHeader stepKey="analysis" title={phase === 'loading' ? 'AI 분석 중' : 'AI 분석 결과'} onBack={phase === 'result' ? () => ctx.back() : null} onClose={() => ctx.resetTo('ivHub')} />
      {phase === 'loading' ? <AnalyzeLoadingNcs onDone={() => setPhase('result')} /> : <AnalysisResultNcs ctx={ctx} />}
      {phase === 'result' && (
        <FlowFooter>
          <Button variant="brand" size="large" fullWidth leadingIcon="videocam" onClick={() => ctx.nav('ivInterview')}>모의 면접 시작하기</Button>
        </FlowFooter>
      )}
    </Screen>
  );
}

// ════════════════════════════════════════════════════════════════════════
// 4. AI 피드백 — peer 문구 + 능력단위 평가 + 하단 출처 고지
// ════════════════════════════════════════════════════════════════════════
function FeedbackNcsBody({ ctx, isPro }) {
  const [open, setOpen] = useNcs(null);
  return (
    <Body bottomPad={96}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}><NcsJobChip small /></div>

      <Card pad={16} bg={T.bnGreen} border={false} style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <ReadinessGauge score={IV_OVERALL} size={100} label={false} />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 12, color: T.fgMuted }}>{IV_JOB.company} 모의 면접 종합</div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}><span style={{ fontSize: 32, fontWeight: 700, color: T.fg }}>{IV_OVERALL}</span><span style={{ fontSize: 13, color: T.fgSubtle }}>/ 100</span></div>
          <Badge variant="positive" style={{ marginTop: 4 }}>동일 직군 지원자 중 상위 31%</Badge>
        </div>
      </Card>

      <SectionHead title="5가지 항목 분석" />
      <Card pad={12}>
        <div style={{ display: 'flex', justifyContent: 'center' }}><AxisRadar scores={IV_AXIS_AVG} peer={NCS_PEER} size={236} lockedKeys={isPro ? [] : ['gaze', 'delivery']} /></div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginTop: 2 }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: T.fgMuted }}><span style={{ width: 16, height: 3, background: T.brandSolid }} />나</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: T.fgSubtle }}><span style={{ width: 16, height: 0, borderTop: '2px dashed var(--mossy-color-palette-gray-500)' }} />동일 직군 지원자 평균</span>
        </div>
        <div style={{ textAlign: 'center', marginTop: 6, fontSize: 10.5, color: T.fgSubtle }}>실제 면접 데이터 8만 건 · 동일 직군(프론트엔드) 기준</div>
      </Card>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 9, marginTop: 12 }}>
        {AXES.map(a => <AxisBar key={a.key} axisKey={a.key} score={IV_AXIS_AVG[a.key]} locked={a.pro && !isPro} />)}
      </div>

      {/* 직무 역량(능력단위) 기반 평가 */}
      <SectionHead title="직무 역량(능력단위) 기반 평가" icon="workspace_premium" />
      <Card pad={13}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <span style={{ width: 30, height: 30, borderRadius: T.r2, background: T.bnGreen, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}><Sym name="lightbulb" size={17} fill={1} color={T.mossy600} /></span>
          <span style={{ fontSize: 14, fontWeight: 700, color: T.fg }}>내용</span>
          <span style={{ marginLeft: 'auto', fontSize: 16, fontWeight: 700, color: T.fg }}>{IV_AXIS_AVG.content}</span>
        </div>
        <div style={{ fontSize: 12, color: T.fgMuted, lineHeight: 1.5 }}>
          <b style={{ color: T.fg }}>국가직무능력표준(NCS)</b> 능력단위(요구사항 확인·화면 구현·통합 구현) 기준으로 답변의 충실도를 평가했어요.
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 10 }}>
          {['요구사항 확인 82', '화면 구현 79', '통합 구현 71'].map(u => (
            <span key={u} style={{ display: 'inline-flex', alignItems: 'center', padding: '4px 10px', borderRadius: T.full, background: T.bnGreen, color: T.mossy700, fontSize: 11, fontWeight: 700 }}>{u}</span>
          ))}
        </div>
      </Card>

      {/* Pro 심층 */}
      <SectionHead title="시선 · 전달력 심층" action={isPro ? null : 'Pro'} />
      <ProLock locked={!isPro} onUpgrade={() => ctx.setPro(true)}>
        <DeepAnalysis />
      </ProLock>

      {/* Top 개선 */}
      <SectionHead title="가장 먼저 고칠 점" icon="priority_high" />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {IV_TOP_FIX.map((f, i) => {
          const a = axisByKey(f.axis);
          return (
            <Card key={i} pad={12} style={{ display: 'flex', gap: 12 }}>
              <span style={{ width: 36, height: 36, borderRadius: T.r2, background: a.bg, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}><Sym name={f.icon} size={20} fill={1} color={a.ink} /></span>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><span style={{ fontSize: 14, fontWeight: 700, color: T.fg }}>{i + 1}. {f.title}</span>{f.pro && <Badge variant="brand">Pro</Badge>}</div>
                <div style={{ fontSize: 12, color: T.fgMuted, marginTop: 3, lineHeight: 1.45 }}>{f.body}</div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* 질문별 아코디언 */}
      <SectionHead title="질문별 다시보기" action={`${IV_QUESTIONS.length}개`} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {IV_QUESTIONS.map(q => {
          const isOpen = open === q.id, sc = qOverall(q);
          return (
            <Card key={q.id} pad={0} style={{ overflow: 'hidden' }}>
              <button onClick={() => setOpen(isOpen ? null : q.id)} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: 12, background: 'transparent', border: 'none', cursor: 'pointer', fontFamily: T.font, textAlign: 'left', WebkitTapHighlightColor: 'transparent' }}>
                <ScoreRing score={sc} size={38} stroke={4} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <CatChip cat={q.cat} small />
                  <div style={{ fontSize: 13, fontWeight: 600, color: T.fg, lineHeight: 1.35, marginTop: 4 }}>{q.text}</div>
                </div>
                <Sym name={isOpen ? 'expand_less' : 'expand_more'} size={22} color={T.fgSubtle} />
              </button>
              {isOpen && <div style={{ padding: '0 12px 14px' }}><QFeedbackDetail q={q} isPro={isPro} ctx={ctx} /></div>}
            </Card>
          );
        })}
      </div>

      {/* 하단 데이터 출처 고지 */}
      <Card pad={14} style={{ marginTop: 12 }}>
        <SourceFootnote ctx={ctx} />
      </Card>
    </Body>
  );
}

function IVFeedbackNCS({ ctx }) {
  const isPro = !!ctx.isPro;
  return (
    <Screen bg={T.basement}>
      <FlowHeader stepKey="feedback" title="AI 피드백" onBack={() => ctx.back()} onClose={() => ctx.resetTo('ivHub')} />
      <FeedbackNcsBody ctx={ctx} isPro={isPro} />
      <FlowFooter>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: 8 }}>
          <Button variant="outline" size="large" leadingIcon="ios_share" onClick={() => ctx.showToast('피드백 카드를 저장했어요', { icon: 'download' })}>공유</Button>
          <Button variant="brand" size="large" trailingIcon="replay" onClick={() => ctx.nav('ivRetry')}>약점 재도전</Button>
        </div>
      </FlowFooter>
    </Screen>
  );
}

// ════════════════════════════════════════════════════════════════════════
// 5. 데이터 출처 고지 화면
// ════════════════════════════════════════════════════════════════════════
function SourceDisclosureScreen({ ctx }) {
  return (
    <Screen bg={T.basement}>
      <FlowHeader sub="설정" title="오픈소스 · 데이터 출처" onBack={() => ctx.back()} />
      <Body bottomPad={28}>
        <div style={{ fontSize: 13, color: T.fgMuted, lineHeight: 1.5, margin: '2px 2px 14px' }}>
          새움은 직무 표준과 공개 데이터를 바탕으로 면접 질문과 분석을 제공해요. 출처를 아래와 같이 표기합니다.
        </div>

        <SectionHead title="데이터 출처" />

        <Card pad={16} style={{ marginBottom: 10 }}>
          <div style={{ height: 30, display: 'flex', alignItems: 'center', marginBottom: 12 }}>
            <img src={(window.__resources && window.__resources.ncsLogo) || "assets/ncs-logo.png"} alt="NCS 국가직무능력표준" style={{ height: 30, width: 'auto', objectFit: 'contain' }} />
          </div>
          <div style={{ fontSize: 14, fontWeight: 700, color: T.fg }}>국가직무능력표준 (NCS)</div>
          <div style={{ fontSize: 12.5, color: T.fgMuted, marginTop: 6, lineHeight: 1.6 }}>{SRC_NCS}</div>
          <div style={{ marginTop: 10 }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 9px', borderRadius: T.full, background: T.neutralWeak, color: T.fgMuted, fontSize: 11, fontWeight: 600 }}><Sym name="public" size={13} color={T.fgMuted} />공공데이터 · 출처표시</span>
          </div>
        </Card>

        <Card pad={16}>
          <div style={{ height: 34, display: 'flex', alignItems: 'center', marginBottom: 12 }}>
            <img src={(window.__resources && window.__resources.aihubLogo) || "assets/aihub-logo.png"} alt="AI Hub" style={{ height: 34, width: 'auto', objectFit: 'contain' }} />
          </div>
          <div style={{ fontSize: 14, fontWeight: 700, color: T.fg }}>AI Hub 채용면접 인터뷰 데이터</div>
          <div style={{ fontSize: 12.5, color: T.fgMuted, marginTop: 6, lineHeight: 1.6 }}>{SRC_AIHUB}</div>
        </Card>

        <Banner tone="neutral" icon="info" style={{ marginTop: 12 }}>
          본 서비스는 위 데이터를 <b>활용</b>하며, 정부·기관의 인증이나 제휴를 의미하지 않아요.
        </Banner>

        <SectionHead title="오픈소스 라이선스" />
        <Card pad={0}>
          <div style={{ padding: '0 14px' }}>
            {[['React', 'MIT'], ['Material Symbols', 'Apache-2.0'], ['Pretendard', 'OFL-1.1']].map(([n, l], i, a) => (
              <div key={n} style={{ display: 'flex', alignItems: 'center', padding: '13px 0', borderBottom: i < a.length - 1 ? `1px solid ${T.line}` : 'none' }}>
                <span style={{ flex: 1, fontSize: 14, color: T.fg }}>{n}</span>
                <span style={{ fontSize: 12, color: T.fgSubtle }}>{l}</span>
              </div>
            ))}
          </div>
        </Card>
      </Body>
    </Screen>
  );
}

Object.assign(window, {
  SaeumHomeRoot, InterviewHubB, IVJobNCS, IVAnalysisNCS, IVFeedbackNCS, SourceDisclosureScreen,
  NcsClassCard, NcsEditSheet, NcsKeywordTag, DataBadge, NcsJobChip, SourceFootnote,
  NCS_PRIMARY, NCS_CANDIDATES, NCS_PEER,
});
