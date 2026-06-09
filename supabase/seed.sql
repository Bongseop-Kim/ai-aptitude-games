-- 새움(Saeum) seed data — games master catalog (9 games).
-- Loaded on `supabase db reset`. Idempotent so reruns are safe.

insert into public.games (id, name, skill, description, icon, default_minutes, sort_order) values
  ('rps',     '가위바위보',   '억제 제어',        '규칙과 반대로 반응하며 습관적 선택을 억제해요.',   'game',     2, 1),
  ('rotate',  '도형 회전',    '시공간 작업기억',  '도형을 머릿속에서 돌리고 뒤집어 목표 모양을 만들어요.', 'game',     3, 2),
  ('promise', '약속 정하기',  '논리 추론',        '여러 단서를 통합해 가능한 장소를 좁혀요.',         'profile',  4, 3),
  ('potion',  '마법약 만들기', '귀납 추론',        '결과를 보고 숨은 규칙을 빠르게 찾아요.',           'star',     4, 4),
  ('path',    '길 만들기',    '계획력',           '제한된 자원으로 충돌 없는 길을 설계해요.',         'share',    3, 5),
  ('numbers', '숫자 누르기',  'Digit Span',       '숫자를 잠깐 기억한 뒤 거꾸로 입력해요.',           'game',     2, 6),
  ('memory',  '도형 순서',    'N-back',           '계속 바뀌는 정보를 갱신하고 유지해요.',            'calendar', 3, 7),
  ('cat',     '고양이 찾기',  '메타인지',         '확신과 실제 정답이 얼마나 맞는지 확인해요.',       'profile',  5, 8),
  ('compare', '개수 비교',    'Subitizing',       '크기 착시에 속지 않고 개수를 직관적으로 비교해요.', 'rank',     2, 9)
on conflict (id) do update set
  name            = excluded.name,
  skill           = excluded.skill,
  description     = excluded.description,
  icon            = excluded.icon,
  default_minutes = excluded.default_minutes,
  sort_order      = excluded.sort_order;
