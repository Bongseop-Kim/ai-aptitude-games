// ds-setup.jsx — 새움 (Saeum) foundation on top of the Mossy Design System
// Brand: 새움 — "새 + 움(싹)". 성장·준비·차분한 자신감. Forest-green, calm, trustworthy.
// Reuses Mossy bundle components (window.MossyDesignSystem_2cf354) + Mossy tokens (var(--mossy-*)).

const DS = window.MossyDesignSystem_2cf354 || {};
const {
  Button, IconButton, TextField, Switch, Badge, Tag,
  Banner, Toast, ListItem, Tabs, BottomNav, Avatar, MannerTemperature,
} = DS;

// ── token shorthands (CSS var references) ──────────────────────
const T = {
  // foreground
  fg: 'var(--mossy-color-fg-neutral)',
  fgMuted: 'var(--mossy-color-fg-neutral-muted)',
  fgSubtle: 'var(--mossy-color-fg-neutral-subtle)',
  fgInv: 'var(--mossy-color-fg-neutral-inverted)',
  brand: 'var(--mossy-color-fg-brand)',
  positive: 'var(--mossy-color-fg-positive)',
  critical: 'var(--mossy-color-fg-critical)',
  info: 'var(--mossy-color-fg-informative)',
  warn: 'var(--mossy-color-fg-warning-contrast)',
  placeholder: 'var(--mossy-color-fg-placeholder)',
  // background
  layer: 'var(--mossy-color-bg-layer-default)',
  basement: 'var(--mossy-color-bg-layer-basement)',
  floating: 'var(--mossy-color-bg-layer-floating)',
  brandSolid: 'var(--mossy-color-bg-brand-solid)',
  brandWeak: 'var(--mossy-color-bg-brand-weak)',
  neutralWeak: 'var(--mossy-color-bg-neutral-weak)',
  inverted: 'var(--mossy-color-bg-neutral-inverted)',
  positiveWeak: 'var(--mossy-color-bg-positive-weak)',
  disabled: 'var(--mossy-color-bg-disabled)',
  // stroke
  line: 'var(--mossy-color-stroke-neutral-subtle)',
  lineWeak: 'var(--mossy-color-stroke-neutral-weak)',
  lineContrast: 'var(--mossy-color-stroke-neutral-contrast)',
  brandStroke: 'var(--mossy-color-stroke-brand-solid)',
  // banner tints
  bnGreen: 'var(--mossy-color-banner-green)',
  bnBlue: 'var(--mossy-color-banner-blue)',
  bnYellow: 'var(--mossy-color-banner-yellow)',
  bnOrange: 'var(--mossy-color-banner-orange)',
  bnPurple: 'var(--mossy-color-banner-purple)',
  bnPink: 'var(--mossy-color-banner-pink)',
  bnRed: 'var(--mossy-color-banner-red)',
  bnTeal: 'var(--mossy-color-banner-teal)',
  bnCool: 'var(--mossy-color-banner-cool-gray)',
  bnWarm: 'var(--mossy-color-banner-warm-gray)',
  // palette accents (solid)
  red: 'var(--mossy-color-palette-red-700)',
  redDeep: 'var(--mossy-color-palette-red-800)',
  purple: 'var(--mossy-color-palette-purple-700)',
  purpleDeep: 'var(--mossy-color-palette-purple-800)',
  blue: 'var(--mossy-color-palette-blue-700)',
  blueDeep: 'var(--mossy-color-palette-blue-800)',
  green: 'var(--mossy-color-palette-green-700)',
  yellowDeep: 'var(--mossy-color-palette-yellow-800)',
  mossy600: 'var(--mossy-color-palette-mossy-600)',
  mossy700: 'var(--mossy-color-palette-mossy-700)',
  mossy100: 'var(--mossy-color-palette-mossy-100)',
  // radius
  r2: 'var(--mossy-radius-r2)', r2_5: 'var(--mossy-radius-r2_5)', r3: 'var(--mossy-radius-r3)',
  r4: 'var(--mossy-radius-r4)', r5: 'var(--mossy-radius-r5)', r6: 'var(--mossy-radius-r6)',
  full: 'var(--mossy-radius-full)',
  // shadow
  s1: 'var(--mossy-shadow-s1)', s2: 'var(--mossy-shadow-s2)', s3: 'var(--mossy-shadow-s3)',
  font: 'var(--mossy-font-family-base)',
};

// ── Material Symbol icon ───────────────────────────────────────
function Sym({ name, size = 24, fill = 0, weight = 500, color, style }) {
  return (
    <span className="material-symbols-rounded" style={{
      fontSize: size, lineHeight: 1, color: color || 'inherit',
      fontVariationSettings: `'FILL' ${fill}, 'wght' ${weight}, 'GRAD' 0, 'opsz' ${size}`,
      flex: 'none', userSelect: 'none', ...style,
    }}>{name}</span>
  );
}

// ── Brand wordmark — 새움 + leaf ───────────────────────────────
function Logo({ size = 20, mono = false, showText = true }) {
  const markColor = mono ? 'currentColor' : '#fff';
  const markBg = mono ? 'transparent' : T.brandSolid;
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: size * 0.4 }}>
      <span style={{
        width: size * 1.5, height: size * 1.5, borderRadius: size * 0.5,
        background: markBg, display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        border: mono ? `1.5px solid currentColor` : 'none',
      }}>
        <Sym name="eco" size={size} fill={1} color={mono ? 'var(--mossy-color-fg-brand)' : markColor} />
      </span>
      {showText && (
        <span style={{
          fontFamily: T.font, fontWeight: 700, fontSize: size, letterSpacing: '-0.02em',
          color: mono ? 'currentColor' : T.fg,
        }}>새움</span>
      )}
    </span>
  );
}

// ── App screen shell (inside the iOS frame content area) ───────
// Fills the device content area; manages status-bar clearance + bottom nav space.
function Screen({ children, bg = T.layer, pad = true, style }) {
  return (
    <div style={{
      position: 'absolute', inset: 0, background: bg,
      display: 'flex', flexDirection: 'column', overflow: 'hidden',
      fontFamily: T.font, color: T.fg, ...style,
    }}>{children}</div>
  );
}

// Header that clears the iOS status bar / dynamic island.
function Header({ title, sub, onBack, right, center, bg = T.layer, border = true }) {
  return (
    <div style={{
      flex: 'none', paddingTop: 50, background: bg,
      borderBottom: border ? `1px solid ${T.line}` : 'none',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 8px 12px', minHeight: 44 }}>
        {onBack ? (
          <button onClick={onBack} aria-label="뒤로" style={iconBtn}>
            <Sym name="arrow_back_ios_new" size={22} color={T.fg} />
          </button>
        ) : <div style={{ width: title ? 8 : 0 }} />}
        <div style={{ flex: 1, minWidth: 0, textAlign: center ? 'center' : 'left', paddingLeft: center ? 0 : 6 }}>
          {sub && <div style={{ fontSize: 12, color: T.fgSubtle, fontWeight: 500 }}>{sub}</div>}
          {title && <div style={{ fontSize: 18, fontWeight: 700, letterSpacing: '-0.01em', color: T.fg }}>{title}</div>}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>{right}</div>
      </div>
    </div>
  );
}

const iconBtn = {
  width: 40, height: 40, borderRadius: T.full, border: 'none', background: 'transparent',
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
  WebkitTapHighlightColor: 'transparent', padding: 0,
};

// Scrollable body region (between header and bottom nav).
function Body({ children, pad = 16, bottomPad = 24, style }) {
  return (
    <div className="saeum-scroll" style={{
      flex: 1, overflowY: 'auto', overflowX: 'hidden',
      padding: `12px ${pad}px ${bottomPad}px`, ...style,
    }}>{children}</div>
  );
}

// Section heading row
function SectionHead({ title, action, onAction, icon }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, margin: '4px 2px 10px' }}>
      {icon && <Sym name={icon} size={20} color={T.fg} fill={1} />}
      <div style={{ fontSize: 17, fontWeight: 700, letterSpacing: '-0.01em', color: T.fg }}>{title}</div>
      {action && (
        <button onClick={onAction} style={{
          marginLeft: 'auto', border: 'none', background: 'transparent', cursor: 'pointer',
          fontFamily: T.font, fontSize: 13, fontWeight: 500, color: T.fgSubtle,
          display: 'inline-flex', alignItems: 'center', gap: 2,
        }}>{action}<Sym name="chevron_right" size={16} /></button>
      )}
    </div>
  );
}

// Card surface — borderless on tinted bg, hairline border on white.
function Card({ children, onClick, pad = 14, bg = T.layer, border = true, radius = T.r4, shadow = false, style }) {
  return (
    <div onClick={onClick} style={{
      background: bg, borderRadius: radius,
      border: border ? `1px solid ${T.line}` : 'none',
      boxShadow: shadow ? T.s1 : 'none',
      padding: pad, cursor: onClick ? 'pointer' : 'default',
      WebkitTapHighlightColor: 'transparent', ...style,
    }}>{children}</div>
  );
}

// Thin progress bar
function Progress({ value = 0, color = T.brandSolid, track = T.neutralWeak, height = 6 }) {
  return (
    <div style={{ width: '100%', height, background: track, borderRadius: T.full, overflow: 'hidden' }}>
      <div style={{ width: `${Math.max(0, Math.min(100, value))}%`, height: '100%', background: color, borderRadius: T.full, transition: 'width .4s var(--mossy-timing-function-easing)' }} />
    </div>
  );
}

// ── ReadinessGauge — 면접 준비도 (reinterpreted Manner Temperature) ──
// score 0-100 → manner-temp level color ramp. baseline 36.5 framing kept as "준비 온도".
function readinessLevel(score) {
  // map 0-100 to L1..L10 like manner temp warmth
  if (score < 30) return 1;
  if (score < 40) return 2;
  if (score < 50) return 3;
  if (score < 58) return 4;
  if (score < 66) return 5;
  if (score < 74) return 6;
  if (score < 82) return 7;
  if (score < 88) return 8;
  if (score < 94) return 9;
  return 10;
}
function readinessColor(score) {
  return {
    text: `var(--mossy-color-manner-temp-l${readinessLevel(score)}-text)`,
    bg: `var(--mossy-color-manner-temp-l${readinessLevel(score)}-bg)`,
  };
}
function readinessLabel(score) {
  if (score < 45) return '준비 시작';
  if (score < 62) return '기초 다지는 중';
  if (score < 76) return '꾸준히 오르는 중';
  if (score < 88) return '실전 감각 좋아요';
  return '거의 만점 컨디션';
}

// Large circular gauge for home / report
function ReadinessGauge({ score = 74, size = 132, stroke = 12, label = true }) {
  const c = readinessColor(score);
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(100, score)) / 100;
  return (
    <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
      <div style={{ position: 'relative', width: size, height: size }}>
        <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={c.bg} strokeWidth={stroke} />
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={c.text} strokeWidth={stroke}
            strokeLinecap="round" strokeDasharray={`${circ * pct} ${circ}`}
            style={{ transition: 'stroke-dasharray .6s var(--mossy-timing-function-enter)' }} />
        </svg>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
            <span style={{ fontSize: size * 0.34, fontWeight: 700, lineHeight: 1, color: c.text, letterSpacing: '-0.02em' }}>{score}</span>
            <span style={{ fontSize: size * 0.12, fontWeight: 700, color: c.text, marginTop: size * 0.05 }}>°</span>
          </div>
          <div style={{ fontSize: size * 0.1, fontWeight: 500, color: T.fgSubtle, marginTop: 2 }}>준비도</div>
        </div>
      </div>
      {label && <div style={{ fontSize: 13, fontWeight: 700, color: c.text }}>{readinessLabel(score)}</div>}
    </div>
  );
}

// Compact inline readiness chip
function ReadinessChip({ score = 74, size = 'medium' }) {
  const c = readinessColor(score);
  const sm = size === 'small';
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      padding: sm ? '2px 8px' : '4px 10px', borderRadius: T.full,
      background: c.bg, color: c.text, fontWeight: 700, fontSize: sm ? 12 : 13,
    }}>
      <Sym name="local_fire_department" size={sm ? 14 : 16} fill={1} color={c.text} />
      {score}°
    </span>
  );
}

// ── Game catalogue ─────────────────────────────────────────────
// icon = Material Symbol, ink/bg from real Mossy tokens.
const GAMES = [
  { id: 'rps',     name: '가위바위보',   cog: '억제 제어',     icon: 'front_hand',     ink: T.red,       bg: T.bnRed,    score: 81, done: true,  min: 2 },
  { id: 'rotate',  name: '도형 회전',    cog: '시공간 작업기억', icon: 'rotate_right',   ink: T.purple,    bg: T.bnPurple, score: 72, done: true,  min: 3 },
  { id: 'promise', name: '약속 정하기',  cog: '논리 추론',      icon: 'groups',         ink: T.blue,      bg: T.bnBlue,   score: 78, done: true,  min: 4 },
  { id: 'potion',  name: '마법약 만들기', cog: '귀납 추론',      icon: 'science',        ink: T.yellowDeep, bg: T.bnYellow, score: 85, done: true,  min: 4 },
  { id: 'path',    name: '길 만들기',    cog: '계획력',         icon: 'route',          ink: T.green,     bg: T.bnGreen,  score: 69, done: false, min: 3 },
  { id: 'numbers', name: '숫자 누르기',  cog: 'Digit Span',     icon: 'dialpad',        ink: T.blueDeep,  bg: T.bnCool,   score: 63, done: false, min: 2 },
  { id: 'memory',  name: '도형 순서',    cog: 'N-back',         icon: 'extension',      ink: T.purpleDeep, bg: T.bnPurple, score: 66, done: false, min: 3 },
  { id: 'cat',     name: '고양이 찾기',  cog: '메타인지',       icon: 'pets',           ink: T.yellowDeep, bg: T.bnOrange, score: 82, done: false, min: 5 },
  { id: 'compare', name: '개수 비교',    cog: 'Subitizing',     icon: 'balance',        ink: T.redDeep,   bg: T.bnPink,   score: 88, done: false, min: 2 },
];
const gameById = (id) => GAMES.find(g => g.id === id);

// Game tile (grid)
function GameTile({ g, onClick, locked = false }) {
  return (
    <button onClick={onClick} style={{
      textAlign: 'left', border: `1px solid ${T.line}`, background: T.layer,
      borderRadius: T.r4, padding: 12, cursor: 'pointer', fontFamily: T.font,
      display: 'flex', flexDirection: 'column', gap: 8, WebkitTapHighlightColor: 'transparent',
      position: 'relative',
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <span style={{ width: 40, height: 40, borderRadius: T.r3, background: g.bg, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
          <Sym name={g.icon} size={24} fill={1} color={g.ink} />
        </span>
        {g.done && <Sym name="check_circle" size={18} fill={1} color={T.positive} />}
      </div>
      <div>
        <div style={{ fontSize: 13, fontWeight: 700, color: T.fg, letterSpacing: '-0.01em', lineHeight: 1.25 }}>{g.name}</div>
        <div style={{ fontSize: 11, color: T.fgSubtle, marginTop: 1 }}>{g.cog}</div>
      </div>
      <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', gap: 6 }}>
        <div style={{ flex: 1 }}><Progress value={g.score} color={g.ink} height={5} /></div>
        <span style={{ fontSize: 12, fontWeight: 700, color: T.fg }}>{g.score}</span>
      </div>
    </button>
  );
}

// Pressable tile/button helper that adds a pressed feel without scale
function press(e, on) { e.currentTarget.style.filter = on ? 'brightness(0.96)' : 'none'; }

Object.assign(window, {
  DS, T, Sym, Logo, Screen, Header, Body, SectionHead, Card, Progress,
  ReadinessGauge, ReadinessChip, readinessColor, readinessLabel, readinessLevel,
  GAMES, gameById, GameTile, iconBtn, press,
  Button, IconButton, TextField, Switch, Badge, Tag, Banner, Toast, ListItem, Tabs, BottomNav, Avatar, MannerTemperature,
});
