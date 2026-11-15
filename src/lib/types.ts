export type CanonicalHourId =
  | 'matins'
  | 'lauds'
  | 'prime'
  | 'terce'
  | 'sext'
  | 'none'
  | 'vespers'
  | 'compline';

export type LanguageCode = 'en' | 'la' | 'fa';

export type SoundProfile =
  | 'monastic_bell'
  | 'sanctus_chime'
  | 'gregorian_tone'
  | 'cloister_bell'
  | 'cathedral_peal'
  | 'angelus_cathedral';

export type SolarAnchor =
  | 'manual'
  | 'civil_dawn'
  | 'sunrise'
  | 'roman_terce'
  | 'solar_noon'
  | 'roman_none'
  | 'sunset'
  | 'civil_dusk';

export type LiturgicalColor = 'white' | 'red' | 'violet' | 'green' | 'rose' | 'black';

export type LiturgicalClass = 'I' | 'II' | 'III' | 'IV';

export type LiturgicalSeason =
  | 'advent'
  | 'christmas'
  | 'epiphany'
  | 'septuagesima'
  | 'lent'
  | 'passiontide'
  | 'triduum'
  | 'easter'
  | 'pentecost';

export interface HourConfig {
  id: CanonicalHourId;
  enabled: boolean;
  weekdayTime: string; // HH:MM (24h)
  weekendTime: string; // HH:MM (24h)
  solarAnchor: SolarAnchor;
  solarOffsetMinutes: number; // e.g., -15 for 15m before sunset
  sound: SoundProfile;
  volume: number; // 0..100
}

export interface CityCoord {
  id: string;
  name: string;
  country: string;
  lat: number;
  lon: number;
  tzOffsetMinutes: number; // Standard or local offset in minutes
}

export interface DevotionReminderConfig {
  angelusEnabled: boolean;
  angelusTimes: [string, string, string]; // 06:00, 12:00, 18:00
  angelusSlotsEnabled: [boolean, boolean, boolean];
  rosaryEnabled: boolean;
  rosaryTime: string;
}

export interface MatinsNightSettings {
  quietNightsEnabled: boolean;
  // Day of week index 0=Sun..6=Sat for nights when Matins alarm is muted
  quietDays: number[];
  anticipationEnabled: boolean;
  anticipationTime: string; // e.g. "20:00"
  anticipateLaudsToo: boolean;
}

export interface PermissionChecklist {
  notificationsGranted: boolean;
  exactAlarmVerified: boolean;
  batteryExemptionVerified: boolean;
  autostartVerified: boolean;
}

export interface AppSettings {
  language: LanguageCode;
  useWeekendSchedule: boolean;
  useSolarTiming: boolean;
  selectedCityId: string;
  customCityName: string;
  customLat: number;
  customLon: number;
  customTzOffsetMinutes: number;
  divinumVersion: string;
  defaultSnoozeMinutes: number;
  vibrateEnabled: boolean;
  hours: Record<CanonicalHourId, HourConfig>;
  matinsSettings: MatinsNightSettings;
  devotions: DevotionReminderConfig;
  permissions: PermissionChecklist;
}

export interface SolarTimes {
  civilDawnMinutes: number;
  sunriseMinutes: number;
  romanTerceMinutes: number;
  solarNoonMinutes: number;
  romanNoneMinutes: number;
  sunsetMinutes: number;
  civilDuskMinutes: number;
}

export interface LiturgicalDayInfo {
  dateKey: string; // YYYY-MM-DD
  latinTitle: string;
  englishTitle: string;
  persianTitle: string;
  season: LiturgicalSeason;
  liturgicalClass: LiturgicalClass;
  color: LiturgicalColor;
  isSunday: boolean;
  isTriduum: boolean;
  isPaschaltide: boolean;
  rubricNote?: string;
  rosaryMystery: 'joyful' | 'sorrowful' | 'glorious';
}

export interface ResolvedHourSchedule {
  id: CanonicalHourId;
  enabled: boolean;
  effectiveTime: string; // HH:MM
  effectiveMinutes: number; // 0..1439
  source: 'manual_weekday' | 'manual_weekend' | 'solar' | 'anticipated' | 'quiet_muted';
  isQuietMuted: boolean;
  isAnticipatedForTomorrow: boolean;
  targetOfficeDate: Date; // Today, or Tomorrow if anticipated!
  divinumOfficiumUrl: string;
  skippedToday: boolean;
  snoozedUntilMinutes: number | null;
  prayedToday: boolean;
}

export interface PrayerLogEntry {
  id: string;
  dateKey: string; // YYYY-MM-DD
  hourId: CanonicalHourId;
  prayedAtIso: string;
  liturgicalTitle: string;
}

export interface ActiveAlarmState {
  hourId: CanonicalHourId | 'test' | 'angelus' | 'rosary';
  label: string;
  latinLabel: string;
  triggeredAtMs: number;
  autoStopAtMs: number;
  divinumUrl: string;
  liturgicalDay: LiturgicalDayInfo;
  sound: SoundProfile;
  volume: number;
  isTest: boolean;
  isAnticipated?: boolean;
}
