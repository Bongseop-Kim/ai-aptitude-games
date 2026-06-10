// iv-shared.jsx — 실전 영상 면접 트랙: 공유 데이터 + 컴포넌트
// 새움(Saeum) ds-setup 헬퍼(T, Sym, Card, Progress, Button …) 위에서 동작.

const { useState: useIV, useEffect: useIVE, useRef: useIVR } = React;

// ── 6단계 플로우 정의 ─────────────────────────────────────────
const IV_STEPS = [
  { key: 'resume',    n: 1, label: '이력서',     icon: 'description' },
  { key: 'job',       n: 2, label: '채용공고',   icon: 'work' },
  { key: 'analysis',  n: 3, label: 'AI 분석',    icon: 'auto_awesome' },
  { key: 'interview', n: 4, label: '모의 면접',  icon: 'videocam' },
  { key: 'feedback',  n: 5, label: '피드백',     icon: 'insights' },
  { key: 'retry',     n: 6, label: '재도전',     icon: 'replay' },
];

// ── 5대 분석 축 (시선·전달력은 Pro 심층) ──────────────────────
const AXES = [
  { key: 'content',  name: '내용',      sub: '충실도·관련성',   icon: 'lightbulb',            ink: T.mossy600,                            bg: T.bnGreen,  pro: false },
  { key: 'star',     name: '내용 구조', sub: 'STAR 흐름',       icon: 'view_timeline',        ink: T.blue,                                bg: T.bnBlue,   pro: false },
  { key: 'voice',    name: '음성',      sub: '속도·떨림·발음',   icon: 'graphic_eq',           ink: T.purple,                              bg: T.bnPurple, pro: false },
  { key: 'gaze',     name: '시선',      sub: '카메라 아이컨택',  icon: 'visibility',           ink: 'var(--mossy-color-manner-temp-l7-text)', bg: T.bnOrange, pro: true },
  { key: 'delivery', name: '전달력',    sub: '표정·자세·제스처', icon: 'sentiment_satisfied',  ink: T.red,                                 bg: T.bnPink,   pro: true },
];
const axisByKey = (k) => AXES.find(a => a.key === k);

// ── 지원자 / 채용공고 목업 ────────────────────────────────────
const IV_RESUME = {
  name: '김준비',
  role: '프론트엔드 엔지니어',
  years: '경력 3년',
  file: '김준비_이력서_2026.pdf',
  skills: ['React', 'TypeScript', 'Next.js', '디자인 시스템', 'Jest', 'GraphQL'],
  highlights: [
    '커머스 웹 프론트엔드 리드 (MAU 80만)',
    '사내 디자인 시스템 0→1 구축',
    'LCP 4.1s → 1.8s 성능 개선',
  ],
};
const IV_JOB = {
  company: '리플로우',
  role: '프론트엔드 엔지니어 (Senior)',
  type: '정규직 · 서울 성수',
  source: 'reflow.team/careers/fe-senior',
  must: ['React · TypeScript 3년+', '디자인 시스템 설계/운영', '웹 성능 최적화', '협업·코드리뷰 문화'],
  nice: ['Next.js App Router', '디자인-엔지니어링 협업', '오픈소스 기여'],
};

// 적합도(매칭) — 분석 결과에서 사용
const IV_MATCH = {
  score: 78,
  matched: [
    { k: 'React · TypeScript', note: '3년 실무 — 요건 충족', hit: true },
    { k: '디자인 시스템', note: '0→1 구축 경험 — 강한 매칭', hit: true },
    { k: '웹 성능 최적화', note: 'LCP 56% 개선 사례', hit: true },
    { k: 'Next.js App Router', note: '경험 명시 없음 — 보완 권장', hit: false },
    { k: '리더십·코드리뷰', note: '리드 경험 있으나 근거 약함', hit: false },
  ],
};

// ── 면접 질문 8개 (+ 피드백 데이터) ───────────────────────────
// cat: 카테고리, scores: 5축 점수, transcript: 답변 발췌, good/fix: 코멘트
const IV_QUESTIONS = [
  {
    id: 1, cat: '오프닝', text: '1분 안에 자기소개를 부탁드려요.', limit: 60,
    scores: { content: 78, star: 60, voice: 86, gaze: 74, delivery: 82 },
    dur: '0:52',
    transcript: '안녕하세요. 3년 차 프론트엔드 엔지니어 김준비입니다. 커머스 웹을 맡아 MAU 80만 서비스를 운영했고, 사내 디자인 시스템을 처음부터 구축한 경험이 있습니다…',
    good: '말 속도가 안정적이고, 핵심 경력을 앞에 배치해 첫인상이 또렷했어요.',
    fix: '강점을 지원 직무 요건과 한 문장으로 연결하면 설득력이 올라가요.',
  },
  {
    id: 2, cat: '지원 동기', text: '리플로우에 지원하신 이유가 궁금해요.', limit: 90,
    scores: { content: 72, star: 55, voice: 80, gaze: 66, delivery: 70 },
    dur: '1:08',
    transcript: '디자인 시스템을 제품의 핵심으로 삼는 점에 끌렸습니다. 제가 0→1로 만든 경험과 방향이 맞다고…',
    good: '회사의 가치와 본인 경험을 연결한 점이 좋았어요.',
    fix: '"끌렸다" 같은 표현보다 구체적 사례 한 가지를 들면 진정성이 커져요.',
  },
  {
    id: 3, cat: '경험', text: '가장 도전적이었던 프로젝트와 본인의 역할을 말씀해 주세요.', limit: 120,
    scores: { content: 84, star: 80, voice: 78, gaze: 72, delivery: 76 },
    dur: '1:46',
    transcript: '레거시 결제 페이지의 LCP가 4.1초였는데, 번들 분석과 이미지 전략을 바꿔 1.8초까지 줄였습니다. 제가 측정·가설·실험을 주도했고…',
    good: '상황-행동-결과가 분명하고 수치로 임팩트를 증명했어요. STAR가 잘 잡혔어요.',
    fix: '"과제(Task)"에서 왜 어려웠는지 제약을 한 줄 더하면 완벽해요.',
  },
  {
    id: 4, cat: '관계', text: '팀 내 의견 충돌을 해결한 경험이 있나요?', limit: 120,
    scores: { content: 70, star: 58, voice: 74, gaze: 62, delivery: 64 },
    dur: '1:22',
    transcript: '디자이너와 컴포넌트 추상화 범위로 부딪혔습니다. 서로의 우선순위를 정리한 표를 만들어…',
    good: '갈등을 회피하지 않고 구조적으로 접근한 점이 인상적이에요.',
    fix: '결과(Result)가 약해요 — 합의 이후 무엇이 좋아졌는지 마무리가 필요해요.',
  },
  {
    id: 5, cat: '직무', text: '디자인 시스템을 구축할 때 가장 중요하게 본 것은?', limit: 120,
    scores: { content: 82, star: 66, voice: 80, gaze: 70, delivery: 74 },
    dur: '1:34',
    transcript: '토큰 계층과 채택률이었습니다. 아무리 잘 만들어도 쓰지 않으면 의미가 없어서, 마이그레이션 도구와 문서를…',
    good: '직무 깊이가 느껴지는 답변이에요. 우선순위 판단이 명확했어요.',
    fix: '전문 용어가 연달아 나와요. 한 번은 쉬운 말로 풀어주면 전달력이 좋아져요.',
  },
  {
    id: 6, cat: '직무', text: '성능 최적화에서 트레이드오프를 어떻게 판단했나요?', limit: 120,
    scores: { content: 76, star: 64, voice: 72, gaze: 58, delivery: 66 },
    dur: '1:18',
    transcript: '초기 로딩과 상호작용 지연 사이에서 사용자 여정을 기준으로…',
    good: '판단 기준을 "사용자 여정"으로 둔 점이 설득력 있었어요.',
    fix: '시선이 자주 아래로 향했어요. 카메라를 기준점으로 삼아 보세요.',
  },
  {
    id: 7, cat: '인성', text: '실패했던 경험과 그로부터 배운 점을 말씀해 주세요.', limit: 120,
    scores: { content: 68, star: 54, voice: 76, gaze: 64, delivery: 68 },
    dur: '1:05',
    transcript: '급하게 배포한 기능에서 장애가 났습니다. 롤백 후 회고를 진행했고…',
    good: '실패를 솔직하게 인정한 태도가 좋았어요.',
    fix: '"배운 점"이 추상적이에요. 이후 바꾼 습관을 구체적으로 들어주세요.',
  },
  {
    id: 8, cat: '가치', text: '5년 후 어떤 엔지니어가 되고 싶나요?', limit: 90,
    scores: { content: 74, star: 56, voice: 82, gaze: 72, delivery: 78 },
    dur: '0:58',
    transcript: '제품의 문제를 정의하는 엔지니어가 되고 싶습니다. 기술은 수단이고…',
    good: '가치관이 분명하고 표현이 깔끔했어요.',
    fix: '회사에서의 구체적 기여로 연결하면 면접관이 그림을 그리기 쉬워요.',
  },
];

// 카테고리 색
const CAT_COLOR = {
  '오프닝': { ink: T.mossy600, bg: T.bnGreen },
  '지원 동기': { ink: T.purple, bg: T.bnPurple },
  '경험': { ink: T.blue, bg: T.bnBlue },
  '관계': { ink: T.red, bg: T.bnPink },
  '직무': { ink: T.blueDeep, bg: T.bnCool },
  '인성': { ink: 'var(--mossy-color-manner-temp-l7-text)', bg: T.bnOrange },
  '가치': { ink: T.purpleDeep, bg: T.bnPurple },
};

// 5축 평균 (피드백 종합)
function avgAxes(questions = IV_QUESTIONS) {
  const sum = {}; AXES.forEach(a => sum[a.key] = 0);
  questions.forEach(q => AXES.forEach(a => sum[a.key] += q.scores[a.key]));
  const out = {}; AXES.forEach(a => out[a.key] = Math.round(sum[a.key] / questions.length));
  return out;
}
const IV_AXIS_AVG = avgAxes();
const IV_OVERALL = Math.round(AXES.reduce((s, a) => s + IV_AXIS_AVG[a.key], 0) / AXES.length);

// 약점 질문 (재도전 대상) — STAR 또는 content 낮은 순
const IV_WEAK_IDS = [...IV_QUESTIONS].sort((a, b) => (a.scores.star + a.scores.content) - (b.scores.star + b.scores.content)).slice(0, 3).map(q => q.id);

// ════════════════════════════════════════════════════════════
// 공유 컴포넌트
// ════════════════════════════════════════════════════════════

// 플로우 헤더 (Step N/6 + 닫기)
function FlowHeader({ stepKey, title, onBack, onClose, sub }) {
  const step = IV_STEPS.find(s => s.key === stepKey);
  return (
    <div style={{ flex: 'none', paddingTop: 50, background: T.layer, borderBottom: `1px solid ${T.line}` }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 8px 10px', minHeight: 44 }}>
        {onBack ? (
          <button onClick={onBack} aria-label="뒤로" style={iconBtn}><Sym name="arrow_back_ios_new" size={22} color={T.fg} /></button>
        ) : <div style={{ width: 12 }} />}
        <div style={{ flex: 1, minWidth: 0, paddingLeft: 4 }}>
          <div style={{ fontSize: 11, color: T.brand, fontWeight: 700 }}>{step ? `STEP ${step.n} / 6` : sub}</div>
          <div style={{ fontSize: 17, fontWeight: 700, letterSpacing: '-0.01em', color: T.fg }}>{title}</div>
        </div>
        {onClose && <button onClick={onClose} aria-label="닫기" style={iconBtn}><Sym name="close" size={22} color={T.fgMuted} /></button>}
      </div>
      {step && (
        <div style={{ display: 'flex', gap: 4, padding: '0 16px 10px' }}>
          {IV_STEPS.map((s) => (
            <div key={s.key} style={{ flex: 1, height: 3, borderRadius: 2, background: s.n <= step.n ? T.brandSolid : T.neutralWeak }} />
          ))}
        </div>
      )}
    </div>
  );
}

// 카테고리 칩
function CatChip({ cat, small }) {
  const c = CAT_COLOR[cat] || { ink: T.fgMuted, bg: T.neutralWeak };
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', borderRadius: T.full,
      padding: small ? '2px 8px' : '3px 10px', background: c.bg, color: c.ink,
      fontSize: small ? 11 : 12, fontWeight: 700, flex: 'none',
    }}>{cat}</span>
  );
}

// 축 점수 바 (Pro 잠금 지원)
function AxisBar({ axisKey, score, locked, showSub = true }) {
  const a = axisByKey(axisKey);
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr 34px', gap: 10, alignItems: 'center' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
        <span style={{ width: 28, height: 28, borderRadius: T.r2, background: a.bg, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}>
          <Sym name={a.icon} size={17} fill={1} color={a.ink} />
        </span>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: T.fg, display: 'flex', alignItems: 'center', gap: 3 }}>
            {a.name}{a.pro && <Sym name="lock" size={12} color={T.fgSubtle} />}
          </div>
          {showSub && <div style={{ fontSize: 10, color: T.fgSubtle, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.sub}</div>}
        </div>
      </div>
      {locked
        ? <div style={{ height: 8, borderRadius: T.full, background: `repeating-linear-gradient(45deg, ${T.neutralWeak}, ${T.neutralWeak} 4px, transparent 4px, transparent 8px)` }} />
        : <Progress value={score} color={a.ink} height={8} />}
      <div style={{ textAlign: 'right', fontSize: 14, fontWeight: 700, color: locked ? T.fgSubtle : T.fg }}>{locked ? '–' : score}</div>
    </div>
  );
}

// 5축 레이더
function AxisRadar({ scores = IV_AXIS_AVG, peer, size = 230, lockedKeys = [] }) {
  const cx = size / 2, cy = size / 2 + 2, r = size * 0.3;
  const n = AXES.length;
  const pt = (i, ratio) => { const a = -Math.PI / 2 + (i * 2 * Math.PI) / n; return [cx + Math.cos(a) * r * ratio, cy + Math.sin(a) * r * ratio]; };
  const poly = (fn) => AXES.map((a, i) => pt(i, fn(a, i)).join(',')).join(' ');
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {[0.25, 0.5, 0.75, 1].map(rr => <polygon key={rr} points={poly(() => rr)} fill="none" stroke="var(--mossy-color-stroke-neutral-subtle)" strokeWidth="1" />)}
      {AXES.map((_, i) => { const [x, y] = pt(i, 1); return <line key={i} x1={cx} y1={cy} x2={x} y2={y} stroke="var(--mossy-color-stroke-neutral-subtle)" strokeWidth="1" />; })}
      {peer && <polygon points={poly((a) => peer[a.key] / 100)} fill="var(--mossy-color-palette-gray-400)" fillOpacity="0.25" stroke="var(--mossy-color-palette-gray-500)" strokeWidth="1.5" strokeDasharray="3 3" />}
      <polygon points={poly(a => scores[a.key] / 100)} fill="var(--mossy-color-bg-brand-solid)" fillOpacity="0.2" stroke="var(--mossy-color-bg-brand-solid)" strokeWidth="2.5" />
      {AXES.map((a, i) => { const [x, y] = pt(i, scores[a.key] / 100); return <circle key={i} cx={x} cy={y} r="4" fill="var(--mossy-color-bg-layer-default)" stroke="var(--mossy-color-bg-brand-solid)" strokeWidth="2" />; })}
      {AXES.map((a, i) => {
        const [x, y] = pt(i, 1.28);
        const locked = lockedKeys.includes(a.key);
        return (
          <g key={i}>
            <text x={x} y={y - 1} textAnchor="middle" fontFamily="var(--mossy-font-family-base)" fontWeight="700" fontSize="12" fill="var(--mossy-color-fg-neutral)">{a.name}</text>
            <text x={x} y={y + 13} textAnchor="middle" fontFamily="var(--mossy-font-family-base)" fontSize="11" fill="var(--mossy-color-fg-neutral-subtle)">{locked ? '🔒' : scores[a.key]}</text>
          </g>
        );
      })}
    </svg>
  );
}

// 작은 원형 점수 게이지
function ScoreRing({ score = 74, size = 54, stroke = 6, color, label }) {
  const c = color || readinessColor(score).text;
  const r = (size - stroke) / 2, circ = 2 * Math.PI * r, pct = Math.max(0, Math.min(100, score)) / 100;
  return (
    <div style={{ position: 'relative', width: size, height: size, flex: 'none' }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={T.neutralWeak} strokeWidth={stroke} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={c} strokeWidth={stroke} strokeLinecap="round"
          strokeDasharray={`${circ * pct} ${circ}`} style={{ transition: 'stroke-dasharray .6s var(--mossy-timing-function-enter)' }} />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontSize: size * 0.3, fontWeight: 700, color: c, lineHeight: 1 }}>{score}</span>
        {label && <span style={{ fontSize: size * 0.16, color: T.fgSubtle }}>{label}</span>}
      </div>
    </div>
  );
}

// 카메라 플레이스홀더 (사람 실루엣 + 녹화중 UI)
function CameraView({ recording = false, time, mirrored = true, dim = false, children, rounded = T.r4, style }) {
  return (
    <div style={{
      position: 'relative', borderRadius: rounded, overflow: 'hidden',
      background: 'radial-gradient(120% 90% at 50% 10%, #2b2f33 0%, #16181a 70%, #0d0e0f 100%)',
      ...style,
    }}>
      {/* 사람 실루엣 */}
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', filter: dim ? 'blur(2px)' : 'none' }}>
        <svg width="62%" height="78%" viewBox="0 0 100 130" preserveAspectRatio="xMidYMax meet" style={{ transform: mirrored ? 'scaleX(-1)' : 'none', opacity: 0.5 }}>
          <circle cx="50" cy="34" r="22" fill="#3a4046" />
          <path d="M8 130 C10 88 30 70 50 70 C70 70 90 88 92 130 Z" fill="#3a4046" />
        </svg>
      </div>
      {/* 비네팅 */}
      <div style={{ position: 'absolute', inset: 0, boxShadow: 'inset 0 0 60px rgba(0,0,0,0.5)' }} />
      {/* REC */}
      {recording && (
        <div style={{ position: 'absolute', top: 12, left: 12, display: 'flex', alignItems: 'center', gap: 6, padding: '4px 10px', borderRadius: T.full, background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(6px)' }}>
          <span style={{ width: 8, height: 8, borderRadius: T.full, background: '#ff453a', animation: 'iv-blink 1s steps(2) infinite' }} />
          <span style={{ fontSize: 12, fontWeight: 700, color: '#fff', letterSpacing: '0.02em' }}>REC {time}</span>
        </div>
      )}
      {children}
    </div>
  );
}

// Pro 잠금 래퍼 (blur + 오버레이)
function ProLock({ locked, onUpgrade, label = '시선·전달력 심층 분석', compact = false, children }) {
  if (!locked) return children;
  return (
    <div style={{ position: 'relative' }}>
      <div style={{ filter: 'blur(5px)', pointerEvents: 'none', userSelect: 'none' }}>{children}</div>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: compact ? 6 : 9, padding: 16, textAlign: 'center' }}>
        <span style={{ width: compact ? 40 : 52, height: compact ? 40 : 52, borderRadius: T.full, background: T.layer, boxShadow: T.s2, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
          <Sym name="lock" size={compact ? 22 : 28} color={T.brand} fill={1} />
        </span>
        <div style={{ fontSize: compact ? 13 : 15, fontWeight: 700, color: T.fg }}>{label}</div>
        {!compact && <div style={{ fontSize: 12, color: T.fgMuted, maxWidth: 220 }}>Pro에서 시선 히트맵과 전달력 상세를 확인할 수 있어요.</div>}
        <Button variant="brand" size={compact ? 'small' : 'medium'} leadingIcon="bolt" onClick={onUpgrade} style={{ marginTop: 2 }}>Pro로 잠금 해제</Button>
      </div>
    </div>
  );
}

// 파일 업로드 / 붙여넣기 토글 입력 블록
function UploadOrPaste({ kind, mode, setMode, fileName, onFile, pasteValue, onPaste, placeholder, accept = 'PDF · 이미지' }) {
  return (
    <div>
      <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
        {[['file', '파일 업로드', 'upload_file'], ['paste', '직접 붙여넣기', 'content_paste']].map(([v, l, ic]) => {
          const sel = mode === v;
          return (
            <button key={v} onClick={() => setMode(v)} style={{
              flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              padding: '10px 8px', borderRadius: T.r2_5, cursor: 'pointer', fontFamily: T.font,
              background: sel ? T.brandWeak : T.layer, border: `1.5px solid ${sel ? T.brandStroke : T.line}`,
              color: sel ? T.brand : T.fgMuted, fontSize: 13, fontWeight: 700, WebkitTapHighlightColor: 'transparent',
            }}>
              <Sym name={ic} size={18} fill={sel ? 1 : 0} color={sel ? T.brand : T.fgMuted} />{l}
            </button>
          );
        })}
      </div>
      {mode === 'file' ? (
        fileName ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 14, borderRadius: T.r3, background: T.bnGreen }}>
            <span style={{ width: 40, height: 40, borderRadius: T.r2, background: T.layer, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}>
              <Sym name="picture_as_pdf" size={24} fill={1} color={T.brand} />
            </span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: T.fg, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{fileName}</div>
              <div style={{ fontSize: 12, color: T.brand, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 3 }}><Sym name="check_circle" size={14} fill={1} color={T.positive} />업로드 완료</div>
            </div>
            <button onClick={() => onFile(null)} style={iconBtn} aria-label="삭제"><Sym name="close" size={20} color={T.fgSubtle} /></button>
          </div>
        ) : (
          <button onClick={() => onFile(true)} style={{
            width: '100%', padding: '28px 16px', borderRadius: T.r3, cursor: 'pointer', fontFamily: T.font,
            background: T.basement, border: `1.5px dashed ${T.lineContrast}`,
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, WebkitTapHighlightColor: 'transparent',
          }}>
            <span style={{ width: 48, height: 48, borderRadius: T.full, background: T.layer, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
              <Sym name="cloud_upload" size={26} color={T.brand} />
            </span>
            <div style={{ fontSize: 14, fontWeight: 700, color: T.fg }}>파일을 끌어다 놓거나 눌러서 첨부</div>
            <div style={{ fontSize: 12, color: T.fgSubtle }}>{accept} · 최대 10MB</div>
          </button>
        )
      ) : (
        <div style={{ position: 'relative' }}>
          <textarea value={pasteValue} onChange={(e) => onPaste(e.target.value)} placeholder={placeholder} rows={6} style={{
            width: '100%', resize: 'none', borderRadius: T.r3, padding: 14, fontFamily: T.font, fontSize: 14, lineHeight: 1.5,
            color: T.fg, background: T.layer, border: `1.5px solid ${T.line}`, outline: 'none', boxSizing: 'border-box',
          }} />
        </div>
      )}
    </div>
  );
}

// 강조 칩 (Pill)
function Pill({ children, tone = 'brand' }) {
  const tones = {
    brand: { bg: T.brandWeak, fg: T.brand },
    fire: { bg: 'var(--mossy-color-manner-temp-l6-bg)', fg: 'var(--mossy-color-manner-temp-l6-text)' },
    neutral: { bg: T.neutralWeak, fg: T.fgMuted },
  };
  const c = tones[tone] || tones.brand;
  return <span style={{ display: 'inline-flex', alignItems: 'center', padding: '3px 9px', borderRadius: T.full, background: c.bg, color: c.fg, fontSize: 12, fontWeight: 700 }}>{children}</span>;
}

// 키워드 칩
function KwChip({ children, ink = T.fgMuted, bg = T.neutralWeak, icon }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '5px 10px', borderRadius: T.full, background: bg, color: ink, fontSize: 12, fontWeight: 600 }}>
      {icon && <Sym name={icon} size={14} fill={1} color={ink} />}{children}
    </span>
  );
}

Object.assign(window, {
  IV_STEPS, AXES, axisByKey, IV_RESUME, IV_JOB, IV_MATCH, IV_QUESTIONS, CAT_COLOR,
  IV_AXIS_AVG, IV_OVERALL, IV_WEAK_IDS, avgAxes,
  FlowHeader, CatChip, AxisBar, AxisRadar, ScoreRing, CameraView, ProLock, UploadOrPaste, KwChip, Pill,
});
