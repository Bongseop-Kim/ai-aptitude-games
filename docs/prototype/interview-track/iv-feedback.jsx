// iv-feedback.jsx — Step 5. 피드백 (변형 A 종합형 / B 타임라인형) + Pro 잠금
const { useState: useFB } = React;

const IV_PEER = { content: 70, star: 63, voice: 76, gaze: 67, delivery: 71 };
const qOverall = (q) => Math.round(AXES.reduce((s, a) => s + q.scores[a.key], 0) / AXES.length);

const IV_TOP_FIX = [
  { axis: 'star', icon: 'view_timeline', title: '결과(Result)로 마무리하기', body: '답변 4개에서 결과가 빠졌어요. "그래서 무엇이 좋아졌는지"를 수치로 닫아주세요.' },
  { axis: 'gaze', icon: 'visibility', title: '카메라를 기준점으로', body: '시선이 자주 아래로 향했어요. 렌즈를 사람 눈이라 생각하고 70% 이상 유지해 보세요.', pro: true },
  { axis: 'content', icon: 'translate', title: '전문 용어 한 번씩 풀기', body: '용어가 연달아 나올 때 쉬운 말로 한 번 풀어주면 전달력이 올라가요.' },
];

// 심층 분석 (Pro) — 시선 히트맵 + 전달력
function DeepAnalysis() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
      <Card pad={12}>
        <div style={{ fontSize: 12, fontWeight: 700, color: T.fg, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 5 }}><Sym name="visibility" size={15} fill={1} color="var(--mossy-color-manner-temp-l7-text)" />시선 분포</div>
        <div style={{ position: 'relative', height: 96, borderRadius: T.r2, background: '#16181a', overflow: 'hidden' }}>
          <svg width="48%" height="80%" viewBox="0 0 100 120" style={{ position: 'absolute', left: '26%', bottom: 0, opacity: 0.4 }}><circle cx="50" cy="34" r="22" fill="#3a4046" /><path d="M8 120 C10 84 30 70 50 70 C70 70 90 84 92 120 Z" fill="#3a4046" /></svg>
          <span style={{ position: 'absolute', left: '44%', top: '20%', width: 30, height: 30, borderRadius: T.full, background: 'radial-gradient(circle, rgba(255,69,58,0.7), transparent 70%)' }} />
          <span style={{ position: 'absolute', left: '30%', top: '55%', width: 22, height: 22, borderRadius: T.full, background: 'radial-gradient(circle, rgba(255,159,10,0.6), transparent 70%)' }} />
        </div>
        <div style={{ fontSize: 11, color: T.fgMuted, marginTop: 6, lineHeight: 1.4 }}>카메라 응시 <b style={{ color: T.fg }}>68%</b> · 화면 아래 22%</div>
      </Card>
      <Card pad={12}>
        <div style={{ fontSize: 12, fontWeight: 700, color: T.fg, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 5 }}><Sym name="sentiment_satisfied" size={15} fill={1} color={T.red} />전달력</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[['표정 안정', 78], ['자세 일관성', 71], ['제스처', 64], ['말 속도', 82]].map(([l, v]) => (
            <div key={l} style={{ display: 'grid', gridTemplateColumns: '56px 1fr 24px', gap: 6, alignItems: 'center' }}>
              <span style={{ fontSize: 10.5, color: T.fgSubtle }}>{l}</span>
              <Progress value={v} color={T.red} height={6} />
              <span style={{ fontSize: 11, fontWeight: 700, color: T.fg, textAlign: 'right' }}>{v}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

// 질문별 코멘트 블록 (공용)
function QFeedbackDetail({ q, isPro, ctx }) {
  return (
    <div>
      {/* 답변 다시보기 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: 10, borderRadius: T.r2_5, background: '#16181a', marginBottom: 10 }}>
        <span style={{ width: 34, height: 34, borderRadius: T.full, background: 'rgba(255,255,255,0.14)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}><Sym name="play_arrow" size={20} fill={1} color="#fff" /></span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)' }}>내 답변 · {q.dur}</div>
          <div style={{ height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.15)', marginTop: 5 }}><div style={{ width: '32%', height: '100%', borderRadius: 2, background: '#fff' }} /></div>
        </div>
      </div>
      <div style={{ fontSize: 12, color: T.fgMuted, lineHeight: 1.5, fontStyle: 'italic', marginBottom: 12 }}>“{q.transcript}”</div>

      {/* 항목별 점수 */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 12 }}>
        {AXES.map(a => <AxisBar key={a.key} axisKey={a.key} score={q.scores[a.key]} locked={a.pro && !isPro} showSub={false} />)}
      </div>

      {/* 코멘트 */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start', padding: 10, borderRadius: T.r2_5, background: T.bnGreen }}>
          <Sym name="thumb_up" size={16} fill={1} color={T.positive} style={{ marginTop: 1 }} />
          <span style={{ fontSize: 12.5, color: T.fg, lineHeight: 1.45 }}>{q.good}</span>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start', padding: 10, borderRadius: T.r2_5, background: T.bnOrange }}>
          <Sym name="tips_and_updates" size={16} fill={1} color="var(--mossy-color-manner-temp-l7-text)" style={{ marginTop: 1 }} />
          <span style={{ fontSize: 12.5, color: T.fg, lineHeight: 1.45 }}>{q.fix}</span>
        </div>
      </div>
      {ctx && <button onClick={() => ctx.nav('ivInterview', { retry: true, qid: q.id })} style={{ marginTop: 10, width: '100%', border: `1px solid ${T.line}`, background: T.layer, borderRadius: T.r2_5, padding: '9px', fontFamily: T.font, fontSize: 13, fontWeight: 700, color: T.brand, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}><Sym name="replay" size={16} color={T.brand} />이 질문 다시 답하기</button>}
    </div>
  );
}

// ── 변형 A: 종합형 ────────────────────────────────────────────
function FeedbackVariantA({ ctx, isPro }) {
  const [open, setOpen] = useFB(null);
  return (
    <Body bottomPad={96}>
      {/* 종합 */}
      <Card pad={16} bg={T.bnGreen} border={false} style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <ReadinessGauge score={IV_OVERALL} size={104} label={false} />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 12, color: T.fgMuted }}>{IV_JOB.company} 모의 면접 종합</div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}><span style={{ fontSize: 32, fontWeight: 700, color: T.fg }}>{IV_OVERALL}</span><span style={{ fontSize: 13, color: T.fgSubtle }}>/ 100</span></div>
          <Badge variant="positive" style={{ marginTop: 4 }}>또래 대비 상위 31%</Badge>
        </div>
      </Card>

      {/* 레이더 */}
      <SectionHead title="5가지 항목 분석" />
      <Card pad={12}>
        <div style={{ display: 'flex', justifyContent: 'center' }}><AxisRadar scores={IV_AXIS_AVG} peer={IV_PEER} size={236} lockedKeys={isPro ? [] : ['gaze', 'delivery']} /></div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginTop: 2 }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: T.fgMuted }}><span style={{ width: 16, height: 3, background: T.brandSolid }} />나</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: T.fgSubtle }}><span style={{ width: 16, height: 0, borderTop: '2px dashed var(--mossy-color-palette-gray-500)' }} />또래 평균</span>
        </div>
      </Card>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 9, marginTop: 12 }}>
        {AXES.map(a => <AxisBar key={a.key} axisKey={a.key} score={IV_AXIS_AVG[a.key]} locked={a.pro && !isPro} />)}
      </div>

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
    </Body>
  );
}

// ── 변형 B: 타임라인형 ────────────────────────────────────────
function FeedbackVariantB({ ctx, isPro }) {
  const [open, setOpen] = useFB(IV_QUESTIONS[0].id);
  return (
    <Body bottomPad={96}>
      {/* 요약 스트립 */}
      <Card pad={14} style={{ marginBottom: 4 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <ScoreRing score={IV_OVERALL} size={58} stroke={6} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 12, color: T.fgMuted }}>{IV_JOB.company} 종합 점수</div>
            <Badge variant="positive" style={{ marginTop: 3 }}>또래 상위 31%</Badge>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 5, marginTop: 12 }}>
          {AXES.map(a => {
            const locked = a.pro && !isPro;
            return (
              <div key={a.key} style={{ flex: 1, textAlign: 'center', padding: '7px 2px', borderRadius: T.r2, background: a.bg }}>
                <Sym name={a.icon} size={16} fill={1} color={a.ink} />
                <div style={{ fontSize: 14, fontWeight: 700, color: locked ? T.fgSubtle : T.fg, marginTop: 1 }}>{locked ? '🔒' : IV_AXIS_AVG[a.key]}</div>
                <div style={{ fontSize: 9, color: T.fgSubtle }}>{a.name}</div>
              </div>
            );
          })}
        </div>
      </Card>

      {!isPro && (
        <Card pad={12} onClick={() => ctx.setPro(true)} style={{ margin: '12px 0', display: 'flex', alignItems: 'center', gap: 10, background: T.bnPurple, border: 'none', cursor: 'pointer' }}>
          <Sym name="lock" size={20} fill={1} color={T.purple} />
          <div style={{ flex: 1, fontSize: 12.5, color: T.fg, lineHeight: 1.4 }}><b>시선·전달력 심층 분석</b>은 Pro에서 열려요</div>
          <Sym name="chevron_right" size={20} color={T.purple} />
        </Card>
      )}

      {/* 타임라인 */}
      <SectionHead title="질문별 타임라인" icon="timeline" />
      <div style={{ position: 'relative' }}>
        <div style={{ position: 'absolute', left: 19, top: 8, bottom: 8, width: 2, background: T.line }} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {IV_QUESTIONS.map(q => {
            const isOpen = open === q.id, sc = qOverall(q);
            const tone = sc >= 78 ? T.positive : sc >= 68 ? T.brand : 'var(--mossy-color-manner-temp-l7-text)';
            return (
              <div key={q.id} style={{ display: 'flex', gap: 12 }}>
                <span style={{ width: 40, flex: 'none', display: 'flex', justifyContent: 'center', paddingTop: 12 }}>
                  <span style={{ width: 30, height: 30, borderRadius: T.full, background: T.layer, border: `2px solid ${tone}`, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: tone, zIndex: 1 }}>{q.id}</span>
                </span>
                <Card pad={0} style={{ flex: 1, overflow: 'hidden' }}>
                  <button onClick={() => setOpen(isOpen ? null : q.id)} style={{ width: '100%', display: 'flex', gap: 10, padding: 12, background: 'transparent', border: 'none', cursor: 'pointer', fontFamily: T.font, textAlign: 'left', alignItems: 'center', WebkitTapHighlightColor: 'transparent' }}>
                    <CameraView rounded={T.r2} style={{ width: 52, height: 52, flex: 'none' }}>
                      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Sym name="play_arrow" size={20} fill={1} color="rgba(255,255,255,0.9)" /></div>
                    </CameraView>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><CatChip cat={q.cat} small /><span style={{ marginLeft: 'auto', fontSize: 15, fontWeight: 700, color: tone }}>{sc}</span></div>
                      <div style={{ fontSize: 12.5, fontWeight: 600, color: T.fg, lineHeight: 1.35, marginTop: 4 }}>{q.text}</div>
                    </div>
                  </button>
                  {isOpen && <div style={{ padding: '0 12px 14px' }}><QFeedbackDetail q={q} isPro={isPro} ctx={ctx} /></div>}
                </Card>
              </div>
            );
          })}
        </div>
      </div>
    </Body>
  );
}

// ── 컨테이너 ──────────────────────────────────────────────────
function IVFeedback({ ctx }) {
  const isPro = !!ctx.isPro;
  return (
    <Screen bg={T.basement}>
      <FlowHeader stepKey="feedback" title="AI 피드백" onBack={() => ctx.back()} onClose={() => ctx.resetTo('ivHub')} />
      <FeedbackVariantA ctx={ctx} isPro={isPro} />
      <FlowFooter>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: 8 }}>
          <Button variant="outline" size="large" leadingIcon="ios_share" onClick={() => ctx.showToast('피드백 카드를 저장했어요', { icon: 'download' })}>공유</Button>
          <Button variant="brand" size="large" trailingIcon="replay" onClick={() => ctx.nav('ivRetry')}>약점 재도전</Button>
        </div>
      </FlowFooter>
    </Screen>
  );
}

Object.assign(window, { IVFeedback, FeedbackVariantA, FeedbackVariantB, DeepAnalysis, QFeedbackDetail, qOverall, IV_PEER, IV_TOP_FIX });
