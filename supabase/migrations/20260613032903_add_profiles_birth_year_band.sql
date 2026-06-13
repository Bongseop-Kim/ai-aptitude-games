-- Cohort definition input for peer percentiles (P2). Optional, consent-gated.
-- The out-of-repo analysis server buckets users on these exact tokens;
-- null birth_year_band = undisclosed / excluded from cohort.
alter table "public"."profiles"
  add column "birth_year_band" text
    check (birth_year_band in (
      '~1969', '1970_1974', '1975_1979', '1980_1984', '1985_1989',
      '1990_1994', '1995_1999', '2000_2004', '2005_2009', '2010~'
    ));

-- Records when the user consented to using their birth-year band for peer
-- comparison. Null = not consented. Timestamp (not boolean) keeps an audit trail.
alter table "public"."profiles"
  add column "birth_year_band_consent_at" timestamptz;

alter table "public"."profiles"
  add constraint "profiles_birth_year_band_pairing_chk"
  check (
    (
      birth_year_band is null
      and birth_year_band_consent_at is null
    )
    or (
      birth_year_band is not null
      and birth_year_band_consent_at is not null
    )
  );
