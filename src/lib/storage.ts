import type { AppSettings, CanonicalHourId, PrayerLogEntry } from './types';

const SETTINGS_KEY = 'divine_office_reminder_settings_v1';
const LOG_KEY = 'divine_office_reminder_log_v1';
const SKIP_KEY = 'divine_office_reminder_skips_v1';

export function createDefaultSettings(): AppSettings {
  return {
    language: 'en',
    useWeekendSchedule: true,
    useSolarTiming: true,
    selectedCityId: 'rome',
    customCityName: 'Custom Parish',
    customLat: 41.9022,
    customLon: 12.4539,
    customTzOffsetMinutes: 60,
    divinumVersion: 'Rubrics 1960 - 1960',
    defaultSnoozeMinutes: 10,
    vibrateEnabled: true,
    hours: {
      matins: {
        id: 'matins',
        enabled: true,
        weekdayTime: '05:00',
        weekendTime: '06:00',
        solarAnchor: 'manual',
        solarOffsetMinutes: 0,
        sound: 'angelus_cathedral',
        volume: 95,
      },
      lauds: {
        id: 'lauds',
        enabled: true,
        weekdayTime: '06:00',
        weekendTime: '07:00',
        solarAnchor: 'civil_dawn',
        solarOffsetMinutes: 0,
        sound: 'angelus_cathedral',
        volume: 90,
      },
      prime: {
        id: 'prime',
        enabled: true,
        weekdayTime: '06:45',
        weekendTime: '07:45',
        solarAnchor: 'sunrise',
        solarOffsetMinutes: 0,
        sound: 'angelus_cathedral',
        volume: 90,
      },
      terce: {
        id: 'terce',
        enabled: true,
        weekdayTime: '09:00',
        weekendTime: '09:30',
        solarAnchor: 'roman_terce',
        solarOffsetMinutes: 0,
        sound: 'angelus_cathedral',
        volume: 85,
      },
      sext: {
        id: 'sext',
        enabled: true,
        weekdayTime: '12:00',
        weekendTime: '12:15',
        solarAnchor: 'solar_noon',
        solarOffsetMinutes: 0,
        sound: 'angelus_cathedral',
        volume: 90,
      },
      none: {
        id: 'none',
        enabled: true,
        weekdayTime: '15:00',
        weekendTime: '15:00',
        solarAnchor: 'roman_none',
        solarOffsetMinutes: 0,
        sound: 'angelus_cathedral',
        volume: 85,
      },
      vespers: {
        id: 'vespers',
        enabled: true,
        weekdayTime: '17:30',
        weekendTime: '17:30',
        solarAnchor: 'sunset',
        solarOffsetMinutes: -15,
        sound: 'angelus_cathedral',
        volume: 95,
      },
      compline: {
        id: 'compline',
        enabled: true,
        weekdayTime: '21:00',
        weekendTime: '21:30',
        solarAnchor: 'civil_dusk',
        solarOffsetMinutes: 45,
        sound: 'angelus_cathedral',
        volume: 85,
      },
    },
    matinsSettings: {
      quietNightsEnabled: false,
      quietDays: [1, 2, 3, 4, 5],
      anticipationEnabled: false,
      anticipationTime: '20:00',
      anticipateLaudsToo: false,
    },
    devotions: {
      angelusEnabled: true,
      angelusTimes: ['06:00', '12:00', '18:00'],
      angelusSlotsEnabled: [true, true, true],
      rosaryEnabled: true,
      rosaryTime: '19:30',
    },
    permissions: {
      notificationsGranted: false,
      exactAlarmVerified: false,
      batteryExemptionVerified: false,
      autostartVerified: false,
    },
  };
}

export function loadSettings(): AppSettings {
  const defaults = createDefaultSettings();
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return defaults;
    const parsed = JSON.parse(raw) as Partial<AppSettings>;
    return {
      ...defaults,
      ...parsed,
      hours: {
        ...defaults.hours,
        ...(parsed.hours ?? {}),
      },
      matinsSettings: {
        ...defaults.matinsSettings,
        ...(parsed.matinsSettings ?? {}),
      },
      devotions: {
        ...defaults.devotions,
        ...(parsed.devotions ?? {}),
        angelusSlotsEnabled:
          parsed.devotions?.angelusSlotsEnabled ?? defaults.devotions.angelusSlotsEnabled,
      },
      permissions: {
        ...defaults.permissions,
        ...(parsed.permissions ?? {}),
      },
    };
  } catch {
    return defaults;
  }
}

export function saveSettings(settings: AppSettings): void {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch {
    // Ignore quota errors
  }
}

export function loadPrayerLog(): PrayerLogEntry[] {
  try {
    const raw = localStorage.getItem(LOG_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function savePrayerLog(entries: PrayerLogEntry[]): void {
  try {
    localStorage.setItem(LOG_KEY, JSON.stringify(entries));
  } catch {
    // Ignore quota errors
  }
}

export interface DailySkipStore {
  dateKey: string;
  skippedHours: CanonicalHourId[];
}

export function loadSkippedToday(todayKey: string): CanonicalHourId[] {
  try {
    const raw = localStorage.getItem(SKIP_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as DailySkipStore;
    if (parsed.dateKey !== todayKey) return [];
    return Array.isArray(parsed.skippedHours) ? parsed.skippedHours : [];
  } catch {
    return [];
  }
}

export function saveSkippedToday(todayKey: string, skippedHours: CanonicalHourId[]): void {
  try {
    localStorage.setItem(SKIP_KEY, JSON.stringify({ dateKey: todayKey, skippedHours }));
  } catch {
    // Ignore quota errors
  }
}

export interface BackupPayload {
  schemaVersion: number;
  exportedAtIso: string;
  settings: AppSettings;
  prayerLog: PrayerLogEntry[];
}

export function serializeBackup(settings: AppSettings, prayerLog: PrayerLogEntry[]): string {
  const payload: BackupPayload = {
    schemaVersion: 1,
    exportedAtIso: new Date().toISOString(),
    settings,
    prayerLog,
  };
  return JSON.stringify(payload, null, 2);
}

export function parseBackup(jsonText: string): BackupPayload | null {
  try {
    const parsed = JSON.parse(jsonText) as Partial<BackupPayload>;
    if (!parsed || typeof parsed !== 'object' || !parsed.settings || !parsed.settings.hours) {
      return null;
    }
    const defaults = createDefaultSettings();
    const mergedSettings: AppSettings = {
      ...defaults,
      ...parsed.settings,
      hours: { ...defaults.hours, ...parsed.settings.hours },
      matinsSettings: { ...defaults.matinsSettings, ...(parsed.settings.matinsSettings ?? {}) },
      devotions: { ...defaults.devotions, ...(parsed.settings.devotions ?? {}) },
      permissions: { ...defaults.permissions, ...(parsed.settings.permissions ?? {}) },
    };
    const prayerLog = Array.isArray(parsed.prayerLog) ? parsed.prayerLog : [];
    return {
      schemaVersion: parsed.schemaVersion ?? 1,
      exportedAtIso: parsed.exportedAtIso ?? new Date().toISOString(),
      settings: mergedSettings,
      prayerLog,
    };
  } catch {
    return null;
  }
}
