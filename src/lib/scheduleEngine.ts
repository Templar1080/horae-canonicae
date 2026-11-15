import { buildDivinumOfficiumUrl } from './divinumOfficium';
import { addDays, toDateKey } from './liturgicalCalendar';
import {
  calculateSolarTimes,
  formatMinutesToHHMM,
  getSolarAnchorMinutes,
  OFFLINE_CITIES,
  parseHHMMToMinutes,
} from './solar';
import type {
  AppSettings,
  CanonicalHourId,
  PrayerLogEntry,
  ResolvedHourSchedule,
  SolarTimes,
} from './types';

export const CANONICAL_HOUR_ORDER: CanonicalHourId[] = [
  'matins',
  'lauds',
  'prime',
  'terce',
  'sext',
  'none',
  'vespers',
  'compline',
];

export function resolveLocation(settings: AppSettings): {
  name: string;
  lat: number;
  lon: number;
  tzOffsetMinutes: number;
} {
  if (settings.selectedCityId === 'custom') {
    return {
      name: settings.customCityName || 'Custom Location',
      lat: settings.customLat,
      lon: settings.customLon,
      tzOffsetMinutes: settings.customTzOffsetMinutes,
    };
  }
  const found = OFFLINE_CITIES.find((c) => c.id === settings.selectedCityId) ?? OFFLINE_CITIES[0];
  return {
    name: `${found.name}, ${found.country}`,
    lat: found.lat,
    lon: found.lon,
    tzOffsetMinutes: found.tzOffsetMinutes,
  };
}

export function getSolarTimesForSettings(date: Date, settings: AppSettings): SolarTimes {
  const loc = resolveLocation(settings);
  return calculateSolarTimes(date, loc.lat, loc.lon, loc.tzOffsetMinutes);
}

/**
 * Resolves all 8 Canonical Hours for `nowDate`, honoring:
 * - Weekday vs Weekend schedules
 * - Offline Sunrise/Sunset solar anchors + offsets
 * - Quiet Night Matins (mutes Matins on selected nights of the week)
 * - 1960 Matins & Lauds evening anticipation (prayed evening before for tomorrow's Office)
 * - Skip Today & Snooze states
 * - Today's Prayer Log completion
 */
export function resolveDailySchedule(
  nowDate: Date,
  settings: AppSettings,
  skippedTodayIds: CanonicalHourId[],
  snoozedUntilMap: Partial<Record<CanonicalHourId, number>>,
  prayerLog: PrayerLogEntry[]
): {
  hours: ResolvedHourSchedule[];
  solar: SolarTimes;
  nextHour: ResolvedHourSchedule | null;
  minutesUntilNext: number | null;
} {
  const dow = nowDate.getDay(); // 0=Sun..6=Sat
  const isWeekend = dow === 0 || dow === 6;
  const todayKey = toDateKey(nowDate);
  const tomorrowDate = addDays(nowDate, 1);
  const solar = getSolarTimesForSettings(nowDate, settings);

  const hours: ResolvedHourSchedule[] = CANONICAL_HOUR_ORDER.map((id) => {
    const cfg = settings.hours[id];
    const isAnticipatedMatins =
      id === 'matins' && settings.matinsSettings.anticipationEnabled;
    const isAnticipatedLauds =
      id === 'lauds' &&
      settings.matinsSettings.anticipationEnabled &&
      settings.matinsSettings.anticipateLaudsToo;
    const isAnticipated = isAnticipatedMatins || isAnticipatedLauds;

    // Quiet Night Matins: checks day-of-week index (for tonight if anticipated, or morning of today)
    const isQuietMuted =
      id === 'matins' &&
      settings.matinsSettings.quietNightsEnabled &&
      settings.matinsSettings.quietDays.includes(dow);

    let effectiveMinutes: number;
    let source: ResolvedHourSchedule['source'];

    if (isQuietMuted) {
      effectiveMinutes = parseHHMMToMinutes(
        settings.useWeekendSchedule && isWeekend ? cfg.weekendTime : cfg.weekdayTime
      );
      source = 'quiet_muted';
    } else if (isAnticipated) {
      const baseAnticipation = parseHHMMToMinutes(settings.matinsSettings.anticipationTime);
      // If Lauds is also anticipated right after Matins, offset +35 minutes
      effectiveMinutes = isAnticipatedLauds ? (baseAnticipation + 35) % 1440 : baseAnticipation;
      source = 'anticipated';
    } else if (settings.useSolarTiming && cfg.solarAnchor !== 'manual') {
      const anchorMins = getSolarAnchorMinutes(solar, cfg.solarAnchor);
      effectiveMinutes = ((anchorMins + cfg.solarOffsetMinutes) % 1440 + 1440) % 1440;
      source = 'solar';
    } else if (settings.useWeekendSchedule && isWeekend) {
      effectiveMinutes = parseHHMMToMinutes(cfg.weekendTime);
      source = 'manual_weekend';
    } else {
      effectiveMinutes = parseHHMMToMinutes(cfg.weekdayTime);
      source = 'manual_weekday';
    }

    const effectiveTime = formatMinutesToHHMM(effectiveMinutes);
    const targetOfficeDate = isAnticipated ? tomorrowDate : nowDate;
    const targetKey = toDateKey(targetOfficeDate);
    const divinumOfficiumUrl = buildDivinumOfficiumUrl(
      id,
      targetOfficeDate,
      settings.divinumVersion
    );

    const skippedToday = skippedTodayIds.includes(id);
    const snoozedUntil = snoozedUntilMap[id] ?? null;
    const prayedToday = prayerLog.some(
      (entry) => entry.hourId === id && (entry.dateKey === todayKey || (isAnticipated && entry.dateKey === targetKey))
    );

    return {
      id,
      enabled: cfg.enabled && !isQuietMuted,
      effectiveTime,
      effectiveMinutes,
      source,
      isQuietMuted,
      isAnticipatedForTomorrow: isAnticipated,
      targetOfficeDate,
      divinumOfficiumUrl,
      skippedToday,
      snoozedUntilMinutes: snoozedUntil,
      prayedToday,
    };
  });

  // Sort chronologically by effectiveMinutes (taking snooze into account for upcoming alert)
  const nowMinutes = nowDate.getHours() * 60 + nowDate.getMinutes();

  const activeUpcoming = hours
    .filter((h) => h.enabled && !h.skippedToday && !h.prayedToday)
    .map((h) => {
      const targetMin = h.snoozedUntilMinutes !== null ? h.snoozedUntilMinutes : h.effectiveMinutes;
      const delta = targetMin >= nowMinutes ? targetMin - nowMinutes : 1440 - nowMinutes + targetMin;
      return { hour: h, delta };
    })
    .sort((a, b) => a.delta - b.delta);

  const next = activeUpcoming[0] ?? null;

  return {
    hours,
    solar,
    nextHour: next ? next.hour : null,
    minutesUntilNext: next ? next.delta : null,
  };
}
