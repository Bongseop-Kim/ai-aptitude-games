// iv-analysis.jsx — Step 3. AI 분석 결과 (로딩 → 결과, 변형 A 리포트형 / B 카드형)
const { useState: useAN, useEffect: useANE } = React;

const Q_WHY = {
  1: '면접 도입 — 첫인상과 전달력 확인',
  2: '컬처핏 — 회사 가치와 지원 동기 정합성',
  3: '핵심 경험 — LCP 개선 사례를 STAR로 검증',
  4: '협업 — 디자이너와의 갈등 조율 능력',
  5: '직무 깊이 — 디자인 시스템 설계 요건 대조',
  6: '직무 — 성능 트레이드오프 판단력',
  7: '인성 — 실패 회복력과 학습 태도',
  8: '가치 — 장기 동기와 성장 방향',
};
const MATCH_LABEL = (s) => s >= 80 ? '아주 강한 매칭' : s >= 70 ? '강한 매칭' : s >= 55 ? '보통 매칭' : '보완 필요';

// 분석 로딩
function AnalyzeLoading({ onDone }) {
  const steps = ['이력서 핵심 역량 추출', '채용공고 요건 파싱', '역량 ↔ 요건 매칭', '약점·갭 식별', '맞춤 질문 8개 생성'];
  const [done, setDone] = useAN(0);
  useANE(() => {
    const iv = setInterval(() => setDone(d => d + 1), 560);
    const t = setTimeout(onDone, 3000);
    return () => { clearInterval(iv); clearTimeout(t); };
  }, []);
  const pct = Math.min(100, Math.round((done / steps.length) * 100));
  return (
    <Body>
      <div style={{ textAlign: 'center', paddingTop: 30 }}>
        <div style={{ width: 110, height: 110, margin: '0 auto', position: 'relative' }}>
          <svg width="110" height="110" style={{ transform: 'rotate(-90deg)' }}>
            <circle cx="55" cy="55" r="48" fill="none" stroke={T.neutralWeak} strokeWidth="8" />
            <circle cx="55" cy="55" r="48" fill="none" stroke={T.brandSolid} strokeWidth="8" strokeLinecap="round" strokeDasharray={`${2 * Math.PI * 48 * (pct / 100)} ${2 * Math.PI * 48}`} style={{ transition: 'stroke-dasharray .5s' }} />
          </svg>
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Sym name="auto_awesome" size={34} fill={1} color={T.brand} /></div>
        </div>
        <div style={{ fontSize: 18, fontWeight: 700, color: T.fg, marginTop: 16 }}>맞춤 면접을 설계하고 있어요</div>
        <div style={{ fontSize: 13, color: T.fgSubtle, marginTop: 2 }}>이력서와 공고를 대조하는 중</div>
      </div>
      <div style={{ marginTop: 28, display: 'flex', flexDirection: 'column', gap: 12 }}>
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

// ── 변형 A: 리포트형 ──────────────────────────────────────────
function AnalysisVariantA({ ctx }) {
  return (
    <Body bottomPad={96}>
      {/* 적합도 */}
      <Card pad={16} bg={T.bnGreen} border={false} style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <ScoreRing score={IV_MATCH.score} size={92} stroke={9} />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 12, color: T.fgMuted }}>이력서 × {IV_JOB.company} 적합도</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: T.brand, marginTop: 2 }}>{MATCH_LABEL(IV_MATCH.score)}</div>
          <div style={{ fontSize: 12, color: T.fgMuted, marginTop: 4, lineHeight: 1.4 }}>요건 5개 중 3개 충족 · 2개 보완하면 합격선에 가까워요</div>
        </div>
      </Card>

      {/* 매칭 상세 */}
      <SectionHead title="요건별 매칭" icon="rule" />
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

      {/* 맞춤 질문 */}
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

// ── 변형 B: 카드 스택형 ───────────────────────────────────────
function AnalysisVariantB({ ctx }) {
  const hit = IV_MATCH.matched.filter(m => m.hit);
  const miss = IV_MATCH.matched.filter(m => !m.hit);
  // 카테고리 그룹
  const groups = {};
  IV_QUESTIONS.forEach(q => { (groups[q.cat] = groups[q.cat] || []).push(q); });
  const [open, setOpen] = useAN(Object.keys(groups)[0]);

  return (
    <Body bottomPad={96}>
      {/* 적합도 바 */}
      <Card pad={14}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 8 }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: T.fg }}>이력서 × {IV_JOB.company} 적합도</span>
          <span style={{ display: 'flex', alignItems: 'baseline', gap: 3 }}><span style={{ fontSize: 26, fontWeight: 700, color: T.brand }}>{IV_MATCH.score}</span><span style={{ fontSize: 12, color: T.fgSubtle }}>/100</span></span>
        </div>
        <Progress value={IV_MATCH.score} color={T.brandSolid} height={10} />
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontSize: 12 }}>
          <span style={{ color: T.positive, fontWeight: 700 }}>충족 {hit.length}</span>
          <span style={{ color: 'var(--mossy-color-manner-temp-l7-text)', fontWeight: 700 }}>보완 {miss.length}</span>
        </div>
      </Card>

      {/* 키워드 매칭 */}
      <SectionHead title="키워드 매칭" icon="join_inner" />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        <Card pad={12} bg={T.bnGreen} border={false}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 8 }}><Sym name="check_circle" size={16} fill={1} color={T.positive} /><span style={{ fontSize: 12, fontWeight: 700, color: T.fg }}>충족</span></div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
            {hit.map(m => <KwChip key={m.k} ink={T.mossy700} bg="var(--mossy-color-bg-layer-default)">{m.k}</KwChip>)}
          </div>
        </Card>
        <Card pad={12} bg={T.bnOrange} border={false}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 8 }}><Sym name="adjust" size={16} fill={1} color="var(--mossy-color-manner-temp-l7-text)" /><span style={{ fontSize: 12, fontWeight: 700, color: T.fg }}>보완</span></div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
            {miss.map(m => <KwChip key={m.k} ink="var(--mossy-color-manner-temp-l7-text)" bg="var(--mossy-color-bg-layer-default)">{m.k}</KwChip>)}
          </div>
        </Card>
      </div>

      {/* 카테고리별 질문 (아코디언) */}
      <SectionHead title="맞춤 질문" action={`총 ${IV_QUESTIONS.length}개`} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {Object.entries(groups).map(([cat, qs]) => {
          const c = CAT_COLOR[cat], isOpen = open === cat;
          return (
            <Card key={cat} pad={0} style={{ overflow: 'hidden' }}>
              <button onClick={() => setOpen(isOpen ? null : cat)} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: 12, background: 'transparent', border: 'none', cursor: 'pointer', fontFamily: T.font, WebkitTapHighlightColor: 'transparent' }}>
                <span style={{ width: 32, height: 32, borderRadius: T.r2, background: c.bg, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: c.ink }}>{qs.length}</span>
                </span>
                <span style={{ flex: 1, textAlign: 'left', fontSize: 14, fontWeight: 700, color: T.fg }}>{cat}</span>
                <Sym name={isOpen ? 'expand_less' : 'expand_more'} size={22} color={T.fgSubtle} />
              </button>
              {isOpen && (
                <div style={{ padding: '0 12px 12px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {qs.map(q => (
                    <div key={q.id} style={{ padding: '10px 12px', borderRadius: T.r2_5, background: T.basement }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: T.fg, lineHeight: 1.4 }}>{q.text}</div>
                      <div style={{ fontSize: 11, color: T.fgSubtle, marginTop: 4, display: 'flex', gap: 5, alignItems: 'flex-start' }}><Sym name="lightbulb" size={13} fill={1} color={T.fgSubtle} style={{ marginTop: 1 }} />{Q_WHY[q.id]}</div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </Body>
  );
}

// ── 컨테이너 (로딩 → 변형) ────────────────────────────────────
function IVAnalysis({ ctx }) {
  const [phase, setPhase] = useAN('loading');
  return (
    <Screen bg={T.basement}>
      <FlowHeader stepKey="analysis" title={phase === 'loading' ? 'AI 분석 중' : 'AI 분석 결과'} onBack={phase === 'result' ? () => ctx.back() : null} onClose={() => ctx.resetTo('ivHub')} />
      {phase === 'loading'
        ? <AnalyzeLoading onDone={() => setPhase('result')} />
        : <AnalysisVariantA ctx={ctx} />}
      {phase === 'result' && (
        <FlowFooter>
          <Button variant="brand" size="large" fullWidth leadingIcon="videocam" onClick={() => ctx.nav('ivInterview')}>모의 면접 시작하기</Button>
        </FlowFooter>
      )}
    </Screen>
  );
}

Object.assign(window, { IVAnalysis, AnalysisVariantA, AnalysisVariantB, AnalyzeLoading, Q_WHY });
