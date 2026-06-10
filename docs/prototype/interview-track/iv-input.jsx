// iv-input.jsx — 면접 허브 + Step1 이력서 + Step2 채용공고 + Step6 재도전 + 탭 스텁
const { useState: useIN } = React;

// ── 면접 탭 허브 ──────────────────────────────────────────────
function InterviewHub({ ctx }) {
  const sessions = [
    { date: '1월 12일', company: '리플로우', role: '프론트엔드', score: 74, delta: 8, q: 8, latest: true },
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
          <button onClick={() => ctx.nav('ivStub', { tab: 'me' })} aria-label="도움말" style={iconBtn}><Sym name="help" size={22} color={T.fgMuted} /></button>
        </div>
      </div>

      <Body bottomPad={104}>
        {/* hero */}
        <Card pad={0} style={{ overflow: 'hidden', marginBottom: 16 }}>
          <div style={{ padding: 18, background: T.bnGreen }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ width: 36, height: 36, borderRadius: T.r2, background: T.layer, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                <Sym name="videocam" size={22} fill={1} color={T.brand} />
              </span>
              <Pill tone="brand">AI 맞춤 면접</Pill>
            </div>
            <div style={{ fontSize: 20, fontWeight: 700, color: T.fg, marginTop: 12, letterSpacing: '-0.01em', lineHeight: 1.35 }}>
              내 이력서와 지원할 공고로<br/>실전처럼 연습해요
            </div>
            <div style={{ fontSize: 13, color: T.fgMuted, marginTop: 6 }}>맞춤 질문 → 영상 면접 → 5가지 항목 분석 → 재도전</div>
          </div>
          <div style={{ padding: 14 }}>
            <Button variant="brand" size="large" fullWidth leadingIcon="bolt" onClick={() => ctx.nav('ivResume')}>새 면접 시작하기</Button>
          </div>
        </Card>

        {/* 6-step rail */}
        <SectionHead title="이렇게 진행돼요" />
        <Card pad={14} style={{ marginBottom: 18 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            {IV_STEPS.map((s, i) => (
              <div key={s.key} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, flex: 1, position: 'relative' }}>
                {i < IV_STEPS.length - 1 && <div style={{ position: 'absolute', top: 19, left: '60%', right: '-40%', height: 2, background: T.line }} />}
                <span style={{ width: 38, height: 38, borderRadius: T.full, background: T.brandWeak, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', zIndex: 1 }}>
                  <Sym name={s.icon} size={20} fill={1} color={T.brand} />
                </span>
                <span style={{ fontSize: 9.5, color: T.fgMuted, fontWeight: 600, textAlign: 'center', lineHeight: 1.2 }}>{s.label}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* 지난 면접 */}
        <SectionHead title="지난 면접" action="전체" onAction={() => ctx.nav('ivStub', { tab: 'records' })} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {sessions.map((s, i) => (
            <Card key={i} pad={12} onClick={() => ctx.nav('ivFeedback')} style={{ display: 'flex', alignItems: 'center', gap: 12, position: 'relative' }}>
              {s.latest && <span style={{ position: 'absolute', top: -7, left: 12 }}><Badge variant="critical">NEW</Badge></span>}
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

// ── Step 1. 이력서 등록 ───────────────────────────────────────
function IVResume({ ctx }) {
  const [mode, setMode] = useIN('file');
  const [fileName, setFileName] = useIN(null);
  const [paste, setPaste] = useIN('');
  const [parsing, setParsing] = useIN(false);
  const [parsed, setParsed] = useIN(false);

  const doFile = (v) => {
    if (!v) { setFileName(null); setParsed(false); return; }
    setFileName(IV_RESUME.file); setParsing(true); setParsed(false);
    setTimeout(() => { setParsing(false); setParsed(true); }, 1100);
  };
  const ready = parsed || (mode === 'paste' && paste.trim().length > 20);

  return (
    <Screen bg={T.basement}>
      <FlowHeader stepKey="resume" title="이력서 등록" onClose={() => ctx.resetTo('ivHub')} />
      <Body bottomPad={96}>
        <div style={{ margin: '2px 2px 14px' }}>
          <div style={{ fontSize: 15, color: T.fgMuted, lineHeight: 1.5 }}>이력서를 올리면 AI가 경력·역량을 읽어 <b style={{ color: T.fg }}>맞춤 질문</b>을 만들어요.</div>
        </div>

        <Card pad={14}>
          <UploadOrPaste
            mode={mode} setMode={setMode}
            fileName={fileName} onFile={doFile}
            pasteValue={paste} onPaste={setPaste}
            placeholder="이력서 내용을 붙여넣어 주세요. 경력, 프로젝트, 보유 기술 등을 적으면 더 정확해요."
          />
        </Card>

        {/* 분석 중 */}
        {parsing && (
          <Card pad={14} style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ width: 24, height: 24, borderRadius: T.full, border: `2.5px solid ${T.neutralWeak}`, borderTopColor: T.brand, animation: 'saeum-spin .8s linear infinite', flex: 'none' }} />
            <span style={{ fontSize: 14, color: T.fgMuted }}>이력서를 읽고 있어요…</span>
          </Card>
        )}

        {/* 파싱 결과 */}
        {parsed && mode === 'file' && (
          <div style={{ marginTop: 12, animation: 'saeum-fade-up .35s var(--mossy-timing-function-enter)' }}>
            <Banner tone="positive" icon="auto_awesome">이력서에서 핵심 정보를 읽었어요.</Banner>
            <Card pad={14} style={{ marginTop: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <Avatar name={IV_RESUME.name} size={44} />
                <div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: T.fg }}>{IV_RESUME.name}</div>
                  <div style={{ fontSize: 13, color: T.fgMuted }}>{IV_RESUME.role} · {IV_RESUME.years}</div>
                </div>
              </div>
              <div style={{ fontSize: 12, fontWeight: 700, color: T.fgSubtle, margin: '14px 0 8px' }}>보유 기술</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {IV_RESUME.skills.map(s => <KwChip key={s} ink={T.brand} bg={T.brandWeak} icon="check">{s}</KwChip>)}
              </div>
              <div style={{ fontSize: 12, fontWeight: 700, color: T.fgSubtle, margin: '14px 0 8px' }}>핵심 경험</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {IV_RESUME.highlights.map((h, i) => (
                  <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                    <Sym name="trending_up" size={16} color={T.positive} fill={1} style={{ marginTop: 2 }} />
                    <span style={{ fontSize: 13, color: T.fg, lineHeight: 1.4 }}>{h}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}
      </Body>
      <FlowFooter>
        <Button variant="brand" size="large" fullWidth trailingIcon="arrow_forward" disabled={!ready} onClick={() => ctx.nav('ivJob')}>채용공고 등록하기</Button>
      </FlowFooter>
    </Screen>
  );
}

// ── Step 2. 채용공고 등록 ─────────────────────────────────────
function IVJob({ ctx }) {
  const [mode, setMode] = useIN('paste');
  const [fileName, setFileName] = useIN(null);
  const [paste, setPaste] = useIN('');
  const [parsing, setParsing] = useIN(false);
  const [parsed, setParsed] = useIN(false);

  const trigger = () => { setParsing(true); setParsed(false); setTimeout(() => { setParsing(false); setParsed(true); }, 1100); };
  const doFile = (v) => { if (!v) { setFileName(null); setParsed(false); return; } setFileName('리플로우_FE_채용공고.pdf'); trigger(); };
  const onPaste = (v) => { setPaste(v); };

  // paste mode: parse when blur-ish — use a 입력 완료 button
  const ready = parsed;

  return (
    <Screen bg={T.basement}>
      <FlowHeader stepKey="job" title="채용공고 등록" onBack={() => ctx.back()} onClose={() => ctx.resetTo('ivHub')} />
      <Body bottomPad={96}>
        <div style={{ margin: '2px 2px 14px' }}>
          <div style={{ fontSize: 15, color: T.fgMuted, lineHeight: 1.5 }}>지원할 공고를 올리면 <b style={{ color: T.fg }}>요건과 내 이력서를 대조</b>해 질문을 맞춰요.</div>
        </div>

        <Card pad={14}>
          <UploadOrPaste
            kind="job" mode={mode} setMode={setMode}
            fileName={fileName} onFile={doFile}
            pasteValue={paste} onPaste={onPaste}
            placeholder="채용공고 URL 또는 본문을 붙여넣어 주세요. (예: reflow.team/careers/fe-senior)"
          />
          {mode === 'paste' && !parsed && (
            <Button variant="outline" size="medium" fullWidth leadingIcon="auto_awesome" style={{ marginTop: 12 }} disabled={paste.trim().length < 10 || parsing} onClick={trigger}>공고 분석하기</Button>
          )}
        </Card>

        {parsing && (
          <Card pad={14} style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ width: 24, height: 24, borderRadius: T.full, border: `2.5px solid ${T.neutralWeak}`, borderTopColor: T.brand, animation: 'saeum-spin .8s linear infinite', flex: 'none' }} />
            <span style={{ fontSize: 14, color: T.fgMuted }}>공고 요건을 정리하고 있어요…</span>
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
              <div style={{ fontSize: 12, fontWeight: 700, color: T.fgSubtle, margin: '14px 0 8px' }}>우대 사항</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {IV_JOB.nice.map(s => <KwChip key={s} icon="add">{s}</KwChip>)}
              </div>
            </Card>
          </div>
        )}
      </Body>
      <FlowFooter>
        <Button variant="brand" size="large" fullWidth trailingIcon="auto_awesome" disabled={!ready} onClick={() => ctx.nav('ivAnalysis')}>AI 분석 시작하기</Button>
      </FlowFooter>
    </Screen>
  );
}

// ── Step 6. 재도전 / 복습 ─────────────────────────────────────
function IVRetry({ ctx }) {
  const weak = IV_WEAK_IDS.map(id => IV_QUESTIONS.find(q => q.id === id));
  const focus = weak[0];
  // 개선된(이번) 점수 — 데모용
  const improved = { content: focus.scores.content + 12, star: focus.scores.star + 16, voice: focus.scores.voice + 4, gaze: focus.scores.gaze + 6, delivery: focus.scores.delivery + 8 };

  return (
    <Screen bg={T.basement}>
      <FlowHeader stepKey="retry" title="약점 질문 다시 풀기" onBack={() => ctx.back()} onClose={() => ctx.resetTo('ivHub')} />
      <Body bottomPad={96}>
        <Banner tone="warning" icon="target" style={{ marginBottom: 14 }}>지난 면접에서 <b>내용·STAR 구조</b>가 약했던 질문 {weak.length}개만 모았어요.</Banner>

        <SectionHead title="다시 답할 질문" />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
          {weak.map((q, i) => (
            <Card key={q.id} pad={12}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <CatChip cat={q.cat} small />
                <span style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
                  <span style={{ fontSize: 11, color: T.fgSubtle }}>내용 <b style={{ color: 'var(--mossy-color-manner-temp-l7-text)' }}>{q.scores.content}</b></span>
                  <span style={{ fontSize: 11, color: T.fgSubtle }}>STAR <b style={{ color: 'var(--mossy-color-manner-temp-l7-text)' }}>{q.scores.star}</b></span>
                </span>
              </div>
              <div style={{ fontSize: 14, fontWeight: 600, color: T.fg, lineHeight: 1.45, marginBottom: 10 }}>{q.text}</div>
              <Button variant="outline" size="medium" fullWidth leadingIcon="videocam" onClick={() => ctx.nav('ivInterview', { retry: true, qid: q.id })}>다시 답하기</Button>
            </Card>
          ))}
        </div>

        {/* 나란히 비교 */}
        <SectionHead title="이전 답변과 비교" icon="compare_arrows" />
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, margin: '0 2px 8px' }}>
          <CatChip cat={focus.cat} small />
          <span style={{ fontSize: 12, color: T.fgMuted, lineHeight: 1.3 }}>{focus.text}</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          {[
            { tag: '이전 답변', sc: focus.scores, tone: 'old', tr: focus.transcript, dur: focus.dur },
            { tag: '이번 답변', sc: improved, tone: 'new', tr: focus.transcript + ' 결과적으로 합의 후 재작업이 30% 줄었고, 이후엔 사전 정렬 회의를 정례화했습니다.', dur: '1:38' },
          ].map((col) => (
            <Card key={col.tag} pad={12} bg={col.tone === 'new' ? T.bnGreen : T.layer} border={col.tone !== 'new'}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 8 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: col.tone === 'new' ? T.brand : T.fgMuted }}>{col.tag}</span>
                {col.tone === 'new' && <Sym name="auto_awesome" size={14} fill={1} color={T.brand} />}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 10 }}>
                {['content', 'star'].map(k => {
                  const a = axisByKey(k), delta = improved[k] - focus.scores[k];
                  return (
                    <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ fontSize: 11, color: T.fgSubtle, width: 56 }}>{a.name}</span>
                      <div style={{ flex: 1 }}><Progress value={col.sc[k]} color={a.ink} height={6} /></div>
                      <span style={{ fontSize: 12, fontWeight: 700, color: T.fg, width: 22, textAlign: 'right' }}>{col.sc[k]}</span>
                      {col.tone === 'new' && <span style={{ fontSize: 10, fontWeight: 700, color: T.positive, width: 26 }}>▲{delta}</span>}
                    </div>
                  );
                })}
              </div>
              <div style={{ fontSize: 11, color: T.fgMuted, lineHeight: 1.5, maxHeight: 92, overflow: 'hidden' }}>“{col.tr}”</div>
            </Card>
          ))}
        </div>
        <Card pad={12} bg={T.bnGreen} border={false} style={{ marginTop: 10, display: 'flex', gap: 10, alignItems: 'flex-start' }}>
          <Sym name="trending_up" size={20} color={T.positive} fill={1} />
          <div style={{ fontSize: 13, color: T.fg, lineHeight: 1.45 }}>결과(Result)를 수치로 마무리하니 <b>STAR +16점</b>. 같은 패턴을 다른 답변에도 적용해 보세요.</div>
        </Card>
      </Body>
      <FlowFooter>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: 8 }}>
          <Button variant="outline" size="large" onClick={() => ctx.nav('ivFeedback')}>피드백</Button>
          <Button variant="brand" size="large" trailingIcon="replay" onClick={() => ctx.nav('ivInterview', { retry: true })}>약점만 다시 면접</Button>
        </div>
      </FlowFooter>
    </Screen>
  );
}

// ── 플로우 하단 고정 푸터 ─────────────────────────────────────
function FlowFooter({ children }) {
  return (
    <div style={{ flex: 'none', padding: '10px 16px 30px', borderTop: `1px solid ${T.line}`, background: T.layer }}>{children}</div>
  );
}

// ── 다른 탭 스텁 (기존 새움 앱 안내) ──────────────────────────
function IVStub({ ctx }) {
  const tab = (ctx.params && ctx.params.tab) || 'home';
  const labels = { home: '홈', games: '게임', records: '기록', me: '내 정보' };
  const icons = { home: 'home', games: 'stadia_controller', records: 'insights', me: 'person' };
  return (
    <Screen bg={T.basement}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '0 36px' }}>
        <span style={{ width: 72, height: 72, borderRadius: T.full, background: T.layer, boxShadow: T.s1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
          <Sym name={icons[tab]} size={36} color={T.fgMuted} />
        </span>
        <div style={{ fontSize: 18, fontWeight: 700, color: T.fg, marginTop: 16 }}>{labels[tab]} 탭</div>
        <div style={{ fontSize: 14, color: T.fgMuted, marginTop: 6, lineHeight: 1.5, maxWidth: 250 }}>
          이 화면은 기존 새움 앱(게임 트랙)에 있어요. 이 프로토타입은 새로 추가되는 <b style={{ color: T.brand }}>실전 면접</b> 탭에 집중해요.
        </div>
        <Button variant="brand" size="medium" leadingIcon="videocam" style={{ marginTop: 18 }} onClick={() => ctx.resetTo('ivHub')}>실전 면접으로 가기</Button>
      </div>
    </Screen>
  );
}

Object.assign(window, { InterviewHub, IVResume, IVJob, IVRetry, FlowFooter, IVStub });
