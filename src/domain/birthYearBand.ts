export type BirthYearBand =
  | '~1969'
  | '1970_1974'
  | '1975_1979'
  | '1980_1984'
  | '1985_1989'
  | '1990_1994'
  | '1995_1999'
  | '2000_2004'
  | '2005_2009'
  | '2010~';

export type BirthYearBandOption = {
  value: BirthYearBand;
  label: string;
};

export const BIRTH_YEAR_BAND_OPTIONS: readonly BirthYearBandOption[] = [
  { value: '~1969', label: '1969년 이전' },
  { value: '1970_1974', label: '1970–1974년' },
  { value: '1975_1979', label: '1975–1979년' },
  { value: '1980_1984', label: '1980–1984년' },
  { value: '1985_1989', label: '1985–1989년' },
  { value: '1990_1994', label: '1990–1994년' },
  { value: '1995_1999', label: '1995–1999년' },
  { value: '2000_2004', label: '2000–2004년' },
  { value: '2005_2009', label: '2005–2009년' },
  { value: '2010~', label: '2010년 이후' },
] as const;

const BIRTH_YEAR_BAND_LABELS = Object.fromEntries(
  BIRTH_YEAR_BAND_OPTIONS.map((option) => [option.value, option.label]),
) as Record<BirthYearBand, string>;

export function birthYearBandLabel(band: BirthYearBand | null | undefined): string | null {
  if (band == null) return null;
  return BIRTH_YEAR_BAND_LABELS[band] ?? null;
}
