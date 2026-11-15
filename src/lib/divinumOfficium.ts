import type { CanonicalHourId } from './types';

const HOUR_PARAM_MAP: Record<CanonicalHourId, string> = {
  matins: 'Matutinum',
  lauds: 'Laudes',
  prime: 'Prima',
  terce: 'Tertia',
  sext: 'Sexta',
  none: 'Nona',
  vespers: 'Vespera',
  compline: 'Completorium',
};

export function formatDivinumDate(date: Date): string {
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  const yyyy = String(date.getFullYear());
  return `${mm}-${dd}-${yyyy}`;
}

/**
 * Generates a direct Divinum Officium URL for the exact canonical hour, date, and 1960 Rubrics version.
 * Supports anticipated Matins/Lauds where `targetDate` is tomorrow's liturgical date.
 */
export function buildDivinumOfficiumUrl(
  hourId: CanonicalHourId,
  targetDate: Date,
  version: string = 'Rubrics 1960 - 1960'
): string {
  const hourCommand = HOUR_PARAM_MAP[hourId];
  const dateStr = formatDivinumDate(targetDate);
  const params = new URLSearchParams({
    command: `pray${hourCommand}`,
    date1: dateStr,
    version,
  });
  return `https://divinumofficium.com/cgi-bin/horas/officium.pl?${params.toString()}`;
}

export function buildDivinumOfficiumHomeUrl(version: string = 'Rubrics 1960 - 1960'): string {
  const params = new URLSearchParams({ version });
  return `https://divinumofficium.com/cgi-bin/horas/officium.pl?${params.toString()}`;
}
