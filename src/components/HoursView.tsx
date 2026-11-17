import { useState } from 'react';
import {
  BellRing,
  BookOpen,
  Check,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  RotateCcw,
  SkipForward,
  Sun,
  Volume2,
} from 'lucide-react';
import { playLiturgicalChime } from '../lib/audio';
import { buildDivinumOfficiumHomeUrl } from '../lib/divinumOfficium';
import type { TranslationBundle } from '../lib/i18n';
import { formatMinutesToHHMM } from '../lib/solar';
import type {
  AppSettings,
  CanonicalHourId,
  HourConfig,
  LiturgicalDayInfo,
  ResolvedHourSchedule,
  SolarAnchor,
  SolarTimes,
  SoundProfile,
} from '../lib/types';
import { CrossEmblem, LiturgicalColorSwatch } from './CrossEmblem';

interface HoursViewProps {
  nowDate: Date;
  settings: AppSettings;
  liturgicalDay: LiturgicalDayInfo;
  tomorrowDay: LiturgicalDayInfo;
  hours: ResolvedHourSchedule[];
  solar: SolarTimes;
  locationName: string;
  nextHour: ResolvedHourSchedule | null;
  minutesUntilNext: number | null;
  t: TranslationBundle;
  onUpdateHour: (id: CanonicalHourId, patch: Partial<HourConfig>) => void;
  onTogglePrayed: (id: CanonicalHourId) => void;
  onSkipToday: (id: CanonicalHourId) => void;
  onUndoSkip: (id: CanonicalHourId) => void;
  onClearSnooze: (id: CanonicalHourId) => void;
  onTriggerHourAlarm: (id: CanonicalHourId) => void;
  onTriggerDevotionAlarm: (kind: 'angelus' | 'rosary') => void;
  onToggleDevotion: (kind: 'angelus' | 'rosary') => void;
  onUpdateAngelusSlot: (index: 0 | 1 | 2, patch: { enabled?: boolean; time?: string }) => void;
  onOpenRosaryReader: () => void;
}

const SOLAR_ANCHOR_OPTIONS: { value: SolarAnchor; label: string }[] = [
  { value: 'manual', label: 'Fixed Manual Time' },
  { value: 'civil_dawn', label: 'Civil Dawn (First Light)' },
  { value: 'sunrise', label: 'Sunrise' },
  { value: 'roman_terce', label: '3rd Roman Hour (Mid-Morning)' },
  { value: 'solar_noon', label: 'Solar Noon (Midday)' },
  { value: 'roman_none', label: '9th Roman Hour (Mid-Afternoon)' },
  { value: 'sunset', label: 'Sunset' },
  { value: 'civil_dusk', label: 'Civil Dusk (Nightfall)' },
];

const SOUND_PROFILES: SoundProfile[] = [
  'angelus_cathedral',
  'monastic_bell',
  'sanctus_chime',
  'gregorian_tone',
  'cloister_bell',
  'cathedral_peal',
];

export function HoursView({
  nowDate,
  settings,
  liturgicalDay,
  tomorrowDay,
  hours,
  solar,
  locationName,
  nextHour,
  minutesUntilNext,
  t,
  onUpdateHour,
  onTogglePrayed,
  onSkipToday,
  onUndoSkip,
  onClearSnooze,
  onTriggerHourAlarm,
  onTriggerDevotionAlarm,
  onToggleDevotion,
  onUpdateAngelusSlot,
  onOpenRosaryReader,
}: HoursViewProps) {
  const [expandedHourId, setExpandedHourId] = useState<CanonicalHourId | null>(null);

  const dayTitle =
    settings.language === 'la'
      ? liturgicalDay.latinTitle
      : settings.language === 'fa'
      ? liturgicalDay.persianTitle
      : liturgicalDay.englishTitle;

  const prayedCount = hours.filter((h) => h.prayedToday).length;
  const nowClock = `${String(nowDate.getHours()).padStart(2, '0')}:${String(
    nowDate.getMinutes()
  ).padStart(2, '0')}`;

  const formatDuration = (mins: number | null) => {
    if (mins === null) return '—';
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    if (h === 0) return `${m}m`;
    return `${h}h ${m}m`;
  };

  return (
    <div className="space-y-8">
      {/* Liturgical Day Banner & Opening Versicle */}
      <section className="border-b border-[#DDD3C0] pb-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-2 max-w-2xl">
            <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs font-medium text-[#62564E]">
              <span>{t.labels.liturgicalDay}</span>
              <span aria-hidden="true">·</span>
              <span>
                {t.labels.classLabel} {liturgicalDay.liturgicalClass}
              </span>
              <span aria-hidden="true">·</span>
              <LiturgicalColorSwatch
                color={liturgicalDay.color}
                label={t.colors[liturgicalDay.color]}
              />
              <span aria-hidden="true">·</span>
              <span className="tabular-nums">{liturgicalDay.dateKey}</span>
            </div>

            <h1 className="font-display text-2xl font-bold text-[#1F1815] sm:text-3xl text-balance">
              {dayTitle}
            </h1>

            {settings.language !== 'la' && (
              <p className="text-sm italic text-[#9B2330]">{liturgicalDay.latinTitle}</p>
            )}

            {liturgicalDay.rubricNote && (
              <p className="pt-1 text-sm text-[#62564E]">{liturgicalDay.rubricNote}</p>
            )}
          </div>

          <div className="flex flex-col items-start gap-2 lg:items-end">
            <p className="font-display text-sm italic text-[#4B0D16]">
              ℣. {t.openingVersicle}
            </p>
            <p className="text-xs text-[#62564E]">℟. {t.openingResponse}</p>
            <a
              href={buildDivinumOfficiumHomeUrl(settings.divinumVersion)}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 inline-flex items-center gap-1.5 text-xs font-semibold text-[#6B1420] underline underline-offset-4 hover:text-[#4B0D16]"
            >
              <span>{t.actions.openDivinumHome}</span>
              <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
            </a>
          </div>
        </div>
      </section>

      {/* Primary Focal Anchor: Next Canonical Hour & Solar Strip */}
      <section aria-label={t.labels.nextHour}>
        <div className="rounded-2xl border border-[#B88B2E]/40 bg-[#6B1420] p-6 text-[#FBF8F1] shadow-sm sm:p-7">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-4">
              <CrossEmblem size={52} className="hidden sm:flex" />
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-x-2 text-xs text-[#E7D8C3]">
                  <span>{t.labels.nextHour}</span>
                  <span aria-hidden="true">·</span>
                  <span className="tabular-nums">{nowClock}</span>
                  <span aria-hidden="true">·</span>
                  <span className="tabular-nums">
                    {prayedCount}/8 {t.actions.prayed}
                  </span>
                </div>

                {nextHour ? (
                  <>
                    <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                      <h2 className="font-display text-2xl font-bold text-[#FBF8F1] sm:text-3xl">
                        {t.hours[nextHour.id].name}
                      </h2>
                      <span className="font-display text-2xl font-semibold text-[#D4AF5A] tabular-nums">
                        {nextHour.snoozedUntilMinutes !== null
                          ? formatMinutesToHHMM(nextHour.snoozedUntilMinutes)
                          : nextHour.effectiveTime}
                      </span>
                      <span className="text-sm text-[#E7D8C3] tabular-nums">
                        ({t.labels.inMinutes} {formatDuration(minutesUntilNext)})
                      </span>
                    </div>
                    <p className="text-sm text-[#E7D8C3]">
                      {t.hours[nextHour.id].latinName} — {t.hours[nextHour.id].meaning}
                    </p>
                    {nextHour.isAnticipatedForTomorrow && (
                      <p className="text-xs font-medium text-[#D4AF5A]">
                        {t.labels.anticipatedTomorrow}: {tomorrowDay.latinTitle}
                      </p>
                    )}
                  </>
                ) : (
                  <div>
                    <h2 className="font-display text-2xl font-bold text-[#FBF8F1]">
                      All enabled hours completed today
                    </h2>
                    <p className="text-sm text-[#E7D8C3]">
                      Laus Deo semper. Your enabled canonical hours for today are fulfilled or skipped.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {nextHour && (
              <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                <a
                  href={nextHour.divinumOfficiumUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-[#D4AF5A] px-5 py-2.5 text-sm font-bold text-[#2A080D] transition-colors hover:bg-[#E2C275] whitespace-nowrap"
                >
                  <span>{t.actions.prayNow}</span>
                  <ExternalLink className="h-4 w-4" aria-hidden="true" />
                </a>

                <button
                  type="button"
                  onClick={() => onTogglePrayed(nextHour.id)}
                  className="inline-flex min-h-[44px] items-center gap-1.5 rounded-xl border border-[#FBF8F1]/30 bg-[#5A101A] px-4 py-2.5 text-sm font-medium text-[#FBF8F1] hover:bg-[#4B0D16] whitespace-nowrap"
                >
                  <Check className="h-4 w-4 text-[#D4AF5A]" aria-hidden="true" />
                  <span>{t.actions.markPrayed}</span>
                </button>
              </div>
            )}
          </div>

          {/* Operational Solar & Schedule Strip */}
          <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-[#B88B2E]/25 pt-4 text-xs text-[#E7D8C3]">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
              <span className="inline-flex items-center gap-1.5 font-medium text-[#F7E8C8]">
                <Sun className="h-3.5 w-3.5 text-[#D4AF5A]" aria-hidden="true" />
                <span>{locationName}</span>
              </span>
              <span className="tabular-nums">
                {t.labels.sunrise}: {formatMinutesToHHMM(solar.sunriseMinutes)}
              </span>
              <span className="tabular-nums">
                {t.labels.solarNoon}: {formatMinutesToHHMM(solar.solarNoonMinutes)}
              </span>
              <span className="tabular-nums">
                {t.labels.sunset}: {formatMinutesToHHMM(solar.sunsetMinutes)}
              </span>
            </div>
            <div className="text-xs text-[#E7D8C3]/90">
              {settings.useSolarTiming ? t.labels.solarEnabled : t.labels.weekdayMode}
            </div>
          </div>
        </div>
      </section>

      {/* Eight Canonical Hours */}
      <section aria-labelledby="canonical-hours-heading" className="space-y-4">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2
            id="canonical-hours-heading"
            className="font-display text-xl font-bold text-[#1F1815]"
          >
            Eight Canonical Hours
          </h2>
          <p className="text-xs text-[#62564E]">
            {settings.useWeekendSchedule
              ? `${t.labels.weekdayMode} / ${t.labels.weekendMode}`
              : t.labels.weekdayMode}
            {settings.matinsSettings.anticipationEnabled
              ? ` · ${t.labels.anticipatedTomorrow}`
              : ''}
          </p>
        </div>

        <div className="divide-y divide-[#DDD3C0] rounded-2xl border border-[#DDD3C0] bg-[#FAF6EC]">
          {hours.map((hour) => {
            const cfg = settings.hours[hour.id];
            const copy = t.hours[hour.id];
            const isExpanded = expandedHourId === hour.id;
            const isNext = nextHour?.id === hour.id;

            const sourceText = hour.isQuietMuted
              ? t.labels.quietNightMuted
              : hour.isAnticipatedForTomorrow
              ? `${t.labels.anticipatedTomorrow}`
              : hour.source === 'solar'
              ? `Solar (${cfg.solarAnchor.replace('_', ' ')}${
                  cfg.solarOffsetMinutes !== 0
                    ? ` ${cfg.solarOffsetMinutes > 0 ? '+' : ''}${cfg.solarOffsetMinutes}m`
                    : ''
                })`
              : hour.source === 'manual_weekend'
              ? t.labels.weekendMode
              : t.labels.weekdayMode;

            return (
              <div
                key={hour.id}
                data-testid={`hour-row-${hour.id}`}
                className={`transition-colors ${
                  isNext ? 'bg-[#F3EDE0]/80' : 'bg-transparent'
                }`}
              >
                <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-4">
                  {/* Left: Switch + Hour Title & Note */}
                  <div className="flex items-start gap-4 min-w-0">
                    <button
                      type="button"
                      role="switch"
                      aria-checked={cfg.enabled}
                      aria-label={`Toggle ${copy.name}`}
                      onClick={() => onUpdateHour(hour.id, { enabled: !cfg.enabled })}
                      className={`mt-1 relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full border transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6B1420] ${
                        cfg.enabled
                          ? 'border-[#6B1420] bg-[#6B1420]'
                          : 'border-[#C9BDA8] bg-[#E8E0D0]'
                      }`}
                    >
                      <span
                        className={`inline-block h-5 w-5 transform rounded-full bg-[#FBF8F1] shadow-sm transition-transform ${
                          cfg.enabled ? 'translate-x-6 rtl:-translate-x-6' : 'translate-x-1 rtl:-translate-x-1'
                        }`}
                      />
                    </button>

                    <div className="min-w-0 space-y-1">
                      <div className="flex flex-wrap items-baseline gap-x-2.5 gap-y-0.5">
                        <h3 className="font-display text-lg font-bold text-[#1F1815]">
                          {copy.name}
                        </h3>
                        <span className="text-sm italic text-[#9B2330]">{copy.latinName}</span>
                        {isNext && (
                          <span className="text-xs font-semibold text-[#6B1420]">
                            · Up next
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-[#62564E] leading-relaxed">{copy.meaning}</p>
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-[#62564E]">
                        <span>{sourceText}</span>
                        <span aria-hidden="true">·</span>
                        <span>{t.sounds[cfg.sound]}</span>
                        {hour.skippedToday && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span className="font-semibold text-[#9B2330]">
                              {t.labels.skippedBadge}
                            </span>
                          </>
                        )}
                        {hour.snoozedUntilMinutes !== null && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span className="font-semibold text-[#6B1420] tabular-nums">
                              {t.labels.snoozedUntil}{' '}
                              {formatMinutesToHHMM(hour.snoozedUntilMinutes)}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right: Time Display + Actions */}
                  <div className="flex flex-wrap items-center justify-between gap-3 sm:justify-end shrink-0">
                    <div className="text-start sm:text-end">
                      <div
                        className={`font-display text-2xl font-bold tabular-nums ${
                          hour.enabled && !hour.skippedToday
                            ? 'text-[#1F1815]'
                            : 'text-[#62564E]/60 line-through'
                        }`}
                      >
                        {hour.effectiveTime}
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => onTogglePrayed(hour.id)}
                        aria-pressed={hour.prayedToday}
                        className={`inline-flex min-h-[40px] items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap ${
                          hour.prayedToday
                            ? 'border-[#275937] bg-[#275937] text-white'
                            : 'border-[#DDD3C0] bg-[#FBF8F1] text-[#1F1815] hover:bg-[#F3EDE0]'
                        }`}
                      >
                        <Check className="h-3.5 w-3.5" aria-hidden="true" />
                        <span>{hour.prayedToday ? t.actions.prayed : t.actions.markPrayed}</span>
                      </button>

                      <a
                        href={hour.divinumOfficiumUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`Open ${copy.name} in Divinum Officium`}
                        className="inline-flex min-h-[40px] items-center gap-1 rounded-lg border border-[#DDD3C0] bg-[#FBF8F1] px-3 py-1.5 text-xs font-semibold text-[#6B1420] hover:bg-[#F3EDE0] whitespace-nowrap"
                      >
                        <span>Pray</span>
                        <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                      </a>

                      {hour.snoozedUntilMinutes !== null ? (
                        <button
                          type="button"
                          onClick={() => onClearSnooze(hour.id)}
                          className="inline-flex min-h-[40px] items-center gap-1 rounded-lg border border-[#DDD3C0] bg-[#FBF8F1] px-2.5 py-1.5 text-xs font-medium text-[#62564E] hover:text-[#1F1815]"
                        >
                          <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                          <span>Clear snooze</span>
                        </button>
                      ) : hour.skippedToday ? (
                        <button
                          type="button"
                          onClick={() => onUndoSkip(hour.id)}
                          className="inline-flex min-h-[40px] items-center gap-1 rounded-lg border border-[#9B2330]/40 bg-[#FBF8F1] px-2.5 py-1.5 text-xs font-semibold text-[#9B2330] hover:bg-[#F3EDE0]"
                        >
                          <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                          <span>{t.actions.undoSkip}</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => onSkipToday(hour.id)}
                          aria-label={`Skip ${copy.name} today`}
                          title={t.actions.skipToday}
                          className="inline-flex min-h-[40px] items-center gap-1 rounded-lg border border-[#DDD3C0] bg-[#FBF8F1] px-2.5 py-1.5 text-xs font-medium text-[#62564E] hover:bg-[#F3EDE0] hover:text-[#1F1815]"
                        >
                          <SkipForward className="h-3.5 w-3.5" aria-hidden="true" />
                          <span className="hidden lg:inline">{t.actions.skipToday}</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => setExpandedHourId(isExpanded ? null : hour.id)}
                        aria-expanded={isExpanded}
                        aria-label={`Configure ${copy.name}`}
                        className="inline-flex min-h-[40px] items-center gap-1 rounded-lg border border-[#DDD3C0] bg-[#FBF8F1] px-2.5 py-1.5 text-xs font-medium text-[#1F1815] hover:bg-[#F3EDE0]"
                      >
                        <span>{t.actions.edit}</span>
                        {isExpanded ? (
                          <ChevronUp className="h-3.5 w-3.5" aria-hidden="true" />
                        ) : (
                          <ChevronDown className="h-3.5 w-3.5" aria-hidden="true" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Expandable Per-Hour Editor */}
                {isExpanded && (
                  <div className="border-t border-[#DDD3C0] bg-[#F3EDE0]/60 px-4 py-5 sm:px-6">
                    {cfg.solarAnchor !== 'manual' && (
                      <p className="mb-4 text-xs text-[#62564E]">
                        {t.labels.manualTimeNotice}
                      </p>
                    )}
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                      <div>
                        <label
                          htmlFor={`weekday-time-${hour.id}`}
                          className="block text-xs font-semibold text-[#1F1815] mb-1.5"
                        >
                          {t.labels.weekdayMode}
                        </label>
                        <input
                          id={`weekday-time-${hour.id}`}
                          type="time"
                          value={cfg.weekdayTime}
                          onChange={(e) =>
                            onUpdateHour(hour.id, {
                              weekdayTime: e.target.value,
                              solarAnchor: 'manual',
                            })
                          }
                          className="w-full min-h-[40px] rounded-lg border border-[#C9BDA8] bg-[#FBF8F1] px-3 py-1.5 text-sm text-[#1F1815] tabular-nums"
                        />
                      </div>

                      <div>
                        <label
                          htmlFor={`weekend-time-${hour.id}`}
                          className="block text-xs font-semibold text-[#1F1815] mb-1.5"
                        >
                          {t.labels.weekendMode}
                        </label>
                        <input
                          id={`weekend-time-${hour.id}`}
                          type="time"
                          value={cfg.weekendTime}
                          onChange={(e) =>
                            onUpdateHour(hour.id, {
                              weekendTime: e.target.value,
                              solarAnchor: 'manual',
                            })
                          }
                          className="w-full min-h-[40px] rounded-lg border border-[#C9BDA8] bg-[#FBF8F1] px-3 py-1.5 text-sm text-[#1F1815] tabular-nums"
                        />
                      </div>

                      <div>
                        <label
                          htmlFor={`solar-anchor-${hour.id}`}
                          className="block text-xs font-semibold text-[#1F1815] mb-1.5"
                        >
                          Solar Timing Anchor
                        </label>
                        <select
                          id={`solar-anchor-${hour.id}`}
                          value={cfg.solarAnchor}
                          onChange={(e) =>
                            onUpdateHour(hour.id, {
                              solarAnchor: e.target.value as SolarAnchor,
                            })
                          }
                          className="w-full min-h-[40px] rounded-lg border border-[#C9BDA8] bg-[#FBF8F1] px-3 py-1.5 text-sm text-[#1F1815]"
                        >
                          {SOLAR_ANCHOR_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label
                          htmlFor={`solar-offset-${hour.id}`}
                          className="block text-xs font-semibold text-[#1F1815] mb-1.5"
                        >
                          Solar Offset (minutes)
                        </label>
                        <input
                          id={`solar-offset-${hour.id}`}
                          type="number"
                          min={-180}
                          max={180}
                          value={cfg.solarOffsetMinutes}
                          disabled={cfg.solarAnchor === 'manual'}
                          onChange={(e) =>
                            onUpdateHour(hour.id, {
                              solarOffsetMinutes: Number(e.target.value) || 0,
                            })
                          }
                          className="w-full min-h-[40px] rounded-lg border border-[#C9BDA8] bg-[#FBF8F1] px-3 py-1.5 text-sm text-[#1F1815] tabular-nums disabled:opacity-50"
                        />
                      </div>

                      <div>
                        <label
                          htmlFor={`sound-select-${hour.id}`}
                          className="block text-xs font-semibold text-[#1F1815] mb-1.5"
                        >
                          Bell / Chime Sound
                        </label>
                        <select
                          id={`sound-select-${hour.id}`}
                          value={cfg.sound}
                          onChange={(e) =>
                            onUpdateHour(hour.id, {
                              sound: e.target.value as SoundProfile,
                            })
                          }
                          className="w-full min-h-[40px] rounded-lg border border-[#C9BDA8] bg-[#FBF8F1] px-3 py-1.5 text-sm text-[#1F1815]"
                        >
                          {SOUND_PROFILES.map((sp) => (
                            <option key={sp} value={sp}>
                              {t.sounds[sp]}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label
                          htmlFor={`volume-range-${hour.id}`}
                          className="block text-xs font-semibold text-[#1F1815] mb-1.5 tabular-nums"
                        >
                          Volume ({cfg.volume}%)
                        </label>
                        <input
                          id={`volume-range-${hour.id}`}
                          type="range"
                          min={10}
                          max={100}
                          step={5}
                          value={cfg.volume}
                          onChange={(e) =>
                            onUpdateHour(hour.id, { volume: Number(e.target.value) })
                          }
                          className="w-full accent-[#6B1420] mt-2"
                        />
                      </div>

                      <div className="sm:col-span-2 flex flex-wrap items-end gap-2.5">
                        <button
                          type="button"
                          onClick={() => playLiturgicalChime(cfg.sound, cfg.volume)}
                          className="inline-flex min-h-[40px] items-center gap-1.5 rounded-lg border border-[#C9BDA8] bg-[#FBF8F1] px-3.5 py-2 text-xs font-semibold text-[#1F1815] hover:bg-[#EAE1CE]"
                        >
                          <Volume2 className="h-3.5 w-3.5 text-[#6B1420]" aria-hidden="true" />
                          <span>{t.actions.previewSound}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => onTriggerHourAlarm(hour.id)}
                          className="inline-flex min-h-[40px] items-center gap-1.5 rounded-lg bg-[#6B1420] px-3.5 py-2 text-xs font-semibold text-[#FBF8F1] hover:bg-[#4B0D16]"
                        >
                          <BellRing className="h-3.5 w-3.5 text-[#D4AF5A]" aria-hidden="true" />
                          <span>Test {copy.name} Alarm</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setExpandedHourId(null)}
                          className="inline-flex min-h-[40px] items-center rounded-lg px-3 py-2 text-xs font-medium text-[#62564E] hover:text-[#1F1815]"
                        >
                          {t.actions.done}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Traditional Daily Devotions: Angelus / Regina Caeli & Rosary */}
      <section aria-label="Traditional Devotions" className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-[#DDD3C0] bg-[#FAF6EC] p-5 flex flex-col justify-between gap-4">
          <div className="space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-display text-base font-bold text-[#1F1815]">
                  {liturgicalDay.isPaschaltide
                    ? t.labels.reginaCaeliTitle
                    : t.labels.angelusTitle}
                </h3>
                <p className="mt-1 text-sm text-[#62564E]">
                  {liturgicalDay.isPaschaltide
                    ? 'Paschaltide rubric: Regina Cæli is recited standing; cathedral bourdon bell.'
                    : 'Great cathedral bourdon bell; toggle or edit each daily hour individually.'}
                </p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={settings.devotions.angelusEnabled}
                aria-label="Toggle Angelus reminders"
                onClick={() => onToggleDevotion('angelus')}
                className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full border transition-colors ${
                  settings.devotions.angelusEnabled
                    ? 'border-[#6B1420] bg-[#6B1420]'
                    : 'border-[#C9BDA8] bg-[#E8E0D0]'
                }`}
              >
                <span
                  className={`inline-block h-5 w-5 transform rounded-full bg-[#FBF8F1] transition-transform ${
                    settings.devotions.angelusEnabled
                      ? 'translate-x-6 rtl:-translate-x-6'
                      : 'translate-x-1 rtl:-translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Individual Morning / Noon / Evening Angelus Slots */}
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3 pt-1">
              {(['Morning', 'Noon', 'Evening'] as const).map((slotLabel, idx) => {
                const slotIdx = idx as 0 | 1 | 2;
                const slotEnabled = settings.devotions.angelusSlotsEnabled[slotIdx];
                const slotTime = settings.devotions.angelusTimes[slotIdx];
                return (
                  <div
                    key={slotLabel}
                    className={`rounded-xl border p-2.5 transition-colors ${
                      slotEnabled && settings.devotions.angelusEnabled
                        ? 'border-[#DDD3C0] bg-[#FBF8F1]'
                        : 'border-[#E6DEC9] bg-[#F3EDE0]/50 opacity-70'
                    }`}
                  >
                    <label className="flex items-center justify-between gap-2 text-xs font-semibold text-[#1F1815] cursor-pointer mb-1.5">
                      <span>{slotLabel}</span>
                      <input
                        type="checkbox"
                        aria-label={`Enable ${slotLabel} Angelus`}
                        checked={slotEnabled}
                        onChange={(e) =>
                          onUpdateAngelusSlot(slotIdx, { enabled: e.target.checked })
                        }
                        className="h-4 w-4 accent-[#6B1420]"
                      />
                    </label>
                    <input
                      type="time"
                      aria-label={`${slotLabel} Angelus time`}
                      value={slotTime}
                      disabled={!slotEnabled}
                      onChange={(e) =>
                        onUpdateAngelusSlot(slotIdx, { time: e.target.value })
                      }
                      className="w-full min-h-[34px] rounded-md border border-[#C9BDA8] bg-white px-2 py-1 text-xs text-[#1F1815] tabular-nums disabled:opacity-50"
                    />
                  </div>
                );
              })}
            </div>
          </div>

          <div>
            <button
              type="button"
              onClick={() => onTriggerDevotionAlarm('angelus')}
              className="inline-flex min-h-[40px] items-center gap-1.5 rounded-lg border border-[#DDD3C0] bg-[#FBF8F1] px-3.5 py-2 text-xs font-semibold text-[#1F1815] hover:bg-[#F3EDE0]"
            >
              <BellRing className="h-3.5 w-3.5 text-[#6B1420]" aria-hidden="true" />
              <span>
                Test {liturgicalDay.isPaschaltide ? 'Regina Cæli' : 'Angelus'} Cathedral Bell
              </span>
            </button>
          </div>
        </div>

        <div className="rounded-2xl border border-[#DDD3C0] bg-[#FAF6EC] p-5 flex flex-col justify-between gap-4">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1.5">
              <h3 className="font-display text-base font-bold text-[#1F1815]">
                {t.labels.rosaryTitle}
              </h3>
              <p className="text-sm text-[#62564E]">
                {t.labels.mysteryOfDay}:{' '}
                <button
                  type="button"
                  onClick={onOpenRosaryReader}
                  className="font-semibold text-[#6B1420] underline underline-offset-4 hover:text-[#4B0D16]"
                >
                  {t.mysteries[liturgicalDay.rosaryMystery]}
                </button>
              </p>
              <p className="text-xs text-[#62564E]">
                Read each decade one by one with Scripture reading and traditional fruit.
              </p>
              <p className="text-xs font-medium text-[#6B1420] tabular-nums">
                Daily at {settings.devotions.rosaryTime}
              </p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={settings.devotions.rosaryEnabled}
              aria-label="Toggle Daily Rosary reminder"
              onClick={() => onToggleDevotion('rosary')}
              className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full border transition-colors ${
                settings.devotions.rosaryEnabled
                  ? 'border-[#6B1420] bg-[#6B1420]'
                  : 'border-[#C9BDA8] bg-[#E8E0D0]'
              }`}
            >
              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-[#FBF8F1] transition-transform ${
                  settings.devotions.rosaryEnabled
                    ? 'translate-x-6 rtl:-translate-x-6'
                    : 'translate-x-1 rtl:-translate-x-1'
                }`}
              />
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={onOpenRosaryReader}
              className="inline-flex min-h-[40px] items-center gap-1.5 rounded-lg bg-[#6B1420] px-3.5 py-2 text-xs font-semibold text-[#FBF8F1] hover:bg-[#4B0D16]"
            >
              <BookOpen className="h-3.5 w-3.5 text-[#D4AF5A]" aria-hidden="true" />
              <span>Pray {t.mysteries[liturgicalDay.rosaryMystery]}</span>
            </button>

            <button
              type="button"
              onClick={() => onTriggerDevotionAlarm('rosary')}
              className="inline-flex min-h-[40px] items-center gap-1.5 rounded-lg border border-[#DDD3C0] bg-[#FBF8F1] px-3.5 py-2 text-xs font-semibold text-[#1F1815] hover:bg-[#F3EDE0]"
            >
              <BellRing className="h-3.5 w-3.5 text-[#6B1420]" aria-hidden="true" />
              <span>Test Rosary Chime</span>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
