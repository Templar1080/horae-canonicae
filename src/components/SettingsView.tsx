import { useRef, useState } from 'react';
import { Download, RotateCcw, Upload } from 'lucide-react';
import type { TranslationBundle } from '../lib/i18n';
import { formatMinutesToHHMM, OFFLINE_CITIES } from '../lib/solar';
import type {
  AppSettings,
  LanguageCode,
  LiturgicalDayInfo,
  ResolvedHourSchedule,
  SolarTimes,
} from '../lib/types';
import { CrossEmblem } from './CrossEmblem';
import { PWAInstallCard } from './PWAInstallPanel';

interface SettingsViewProps {
  settings: AppSettings;
  solar: SolarTimes;
  nextHour: ResolvedHourSchedule | null;
  liturgicalDay: LiturgicalDayInfo;
  t: TranslationBundle;
  onUpdateSettings: (patch: Partial<AppSettings>) => void;
  onExportBackup: () => void;
  onImportBackup: (jsonText: string) => boolean;
  onResetDefaults: () => void;
}

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function SettingsView({
  settings,
  solar,
  nextHour,
  liturgicalDay,
  t,
  onUpdateSettings,
  onExportBackup,
  onImportBackup,
  onResetDefaults,
}: SettingsViewProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [widgetTheme, setWidgetTheme] = useState<'burgundy' | 'parchment'>('burgundy');

  const toggleQuietDay = (dayIdx: number) => {
    const exists = settings.matinsSettings.quietDays.includes(dayIdx);
    const updated = exists
      ? settings.matinsSettings.quietDays.filter((d) => d !== dayIdx)
      : [...settings.matinsSettings.quietDays, dayIdx].sort();
    onUpdateSettings({
      matinsSettings: {
        ...settings.matinsSettings,
        quietDays: updated,
      },
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    const ok = onImportBackup(text);
    setImportStatus(
      ok
        ? 'Backup restored successfully.'
        : 'Invalid backup file. Please choose a valid Divine Office Reminder JSON backup.'
    );
    e.target.value = '';
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-[#DDD3C0] pb-5">
        <h1 className="font-display text-2xl font-bold text-[#1F1815] sm:text-3xl">
          {t.nav.settings}
        </h1>
        <p className="mt-1 text-sm text-[#62564E]">
          Configure interface language, solar sunrise/sunset city, Matins night rubrics, widget style, and backup files.
        </p>
      </div>

      <PWAInstallCard />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Language & Rubrics Version */}
        <section className="rounded-2xl border border-[#DDD3C0] bg-[#FAF6EC] p-5 space-y-4">
          <h2 className="font-display text-lg font-bold text-[#1F1815]">
            Language &amp; Breviary Tradition
          </h2>

          <div>
            <span className="block text-xs font-semibold text-[#62564E] mb-2">
              Interface Language (English · Latina · فارسی)
            </span>
            <div className="grid grid-cols-3 gap-2">
              {(
                [
                  { code: 'en', label: 'English' },
                  { code: 'la', label: 'Latina' },
                  { code: 'fa', label: 'فارسی (RTL)' },
                ] as { code: LanguageCode; label: string }[]
              ).map((lang) => (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => onUpdateSettings({ language: lang.code })}
                  aria-pressed={settings.language === lang.code}
                  className={`min-h-[42px] rounded-xl border px-3 py-2 text-xs font-semibold transition-colors ${
                    settings.language === lang.code
                      ? 'border-[#6B1420] bg-[#6B1420] text-[#FBF8F1]'
                      : 'border-[#DDD3C0] bg-[#FBF8F1] text-[#1F1815] hover:bg-[#F3EDE0]'
                  }`}
                >
                  {lang.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="divinum-version-select"
                className="block text-xs font-semibold text-[#1F1815] mb-1.5"
              >
                Divinum Officium Version
              </label>
              <select
                id="divinum-version-select"
                value={settings.divinumVersion}
                onChange={(e) => onUpdateSettings({ divinumVersion: e.target.value })}
                className="w-full min-h-[40px] rounded-lg border border-[#C9BDA8] bg-[#FBF8F1] px-3 py-1.5 text-sm text-[#1F1815]"
              >
                <option value="Rubrics 1960 - 1960">Rubrics 1960 (1962 Missal)</option>
                <option value="Divino Afflatu - 1954">Divino Afflatu (1954)</option>
                <option value="Tridentine - 1910">Tridentine (1910)</option>
                <option value="Monastic - 1963">Monastic (1963)</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="default-snooze-select"
                className="block text-xs font-semibold text-[#1F1815] mb-1.5"
              >
                Default Snooze Minutes
              </label>
              <select
                id="default-snooze-select"
                value={settings.defaultSnoozeMinutes}
                onChange={(e) =>
                  onUpdateSettings({ defaultSnoozeMinutes: Number(e.target.value) })
                }
                className="w-full min-h-[40px] rounded-lg border border-[#C9BDA8] bg-[#FBF8F1] px-3 py-1.5 text-sm text-[#1F1815] tabular-nums"
              >
                <option value={5}>5 minutes</option>
                <option value={10}>10 minutes</option>
                <option value={15}>15 minutes</option>
                <option value={30}>30 minutes</option>
              </select>
            </div>
          </div>

          <div className="flex flex-wrap gap-4 pt-1">
            <label className="inline-flex items-center gap-2 text-sm text-[#1F1815] cursor-pointer">
              <input
                type="checkbox"
                checked={settings.useWeekendSchedule}
                onChange={(e) =>
                  onUpdateSettings({ useWeekendSchedule: e.target.checked })
                }
                className="h-4 w-4 accent-[#6B1420]"
              />
              <span>Use separate Saturday/Sunday weekend times</span>
            </label>

            <label className="inline-flex items-center gap-2 text-sm text-[#1F1815] cursor-pointer">
              <input
                type="checkbox"
                checked={settings.vibrateEnabled}
                onChange={(e) => onUpdateSettings({ vibrateEnabled: e.target.checked })}
                className="h-4 w-4 accent-[#6B1420]"
              />
              <span>Vibrate with alarm</span>
            </label>
          </div>
        </section>

        {/* Offline Sunrise & Sunset Astronomical Timing */}
        <section className="rounded-2xl border border-[#DDD3C0] bg-[#FAF6EC] p-5 space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="font-display text-lg font-bold text-[#1F1815]">
                Offline Sunrise &amp; Sunset Timing
              </h2>
              <p className="text-xs text-[#62564E] mt-0.5">
                Computes Prime at sunrise, Terce/None by Roman daylight hours, and Vespers near sunset with zero internet.
              </p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={settings.useSolarTiming}
              aria-label="Toggle solar timing"
              onClick={() => onUpdateSettings({ useSolarTiming: !settings.useSolarTiming })}
              className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full border transition-colors ${
                settings.useSolarTiming
                  ? 'border-[#6B1420] bg-[#6B1420]'
                  : 'border-[#C9BDA8] bg-[#E8E0D0]'
              }`}
            >
              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-[#FBF8F1] transition-transform ${
                  settings.useSolarTiming
                    ? 'translate-x-6 rtl:-translate-x-6'
                    : 'translate-x-1 rtl:-translate-x-1'
                }`}
              />
            </button>
          </div>

          <div>
            <label
              htmlFor="solar-city-select"
              className="block text-xs font-semibold text-[#1F1815] mb-1.5"
            >
              City / Coordinates (Offline Gazetteer)
            </label>
            <select
              id="solar-city-select"
              value={settings.selectedCityId}
              onChange={(e) => onUpdateSettings({ selectedCityId: e.target.value })}
              className="w-full min-h-[40px] rounded-lg border border-[#C9BDA8] bg-[#FBF8F1] px-3 py-1.5 text-sm text-[#1F1815]"
            >
              {OFFLINE_CITIES.map((city) => (
                <option key={city.id} value={city.id}>
                  {city.name}, {city.country}
                </option>
              ))}
              <option value="custom">Custom Latitude / Longitude</option>
            </select>
          </div>

          {settings.selectedCityId === 'custom' && (
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-[11px] font-semibold text-[#62564E] mb-1">
                  Lat
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={settings.customLat}
                  onChange={(e) =>
                    onUpdateSettings({ customLat: Number(e.target.value) || 0 })
                  }
                  className="w-full min-h-[38px] rounded-lg border border-[#C9BDA8] bg-[#FBF8F1] px-2.5 text-xs tabular-nums"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-[#62564E] mb-1">
                  Lon
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={settings.customLon}
                  onChange={(e) =>
                    onUpdateSettings({ customLon: Number(e.target.value) || 0 })
                  }
                  className="w-full min-h-[38px] rounded-lg border border-[#C9BDA8] bg-[#FBF8F1] px-2.5 text-xs tabular-nums"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-[#62564E] mb-1">
                  UTC Offset (min)
                </label>
                <input
                  type="number"
                  step="30"
                  value={settings.customTzOffsetMinutes}
                  onChange={(e) =>
                    onUpdateSettings({
                      customTzOffsetMinutes: Number(e.target.value) || 0,
                    })
                  }
                  className="w-full min-h-[38px] rounded-lg border border-[#C9BDA8] bg-[#FBF8F1] px-2.5 text-xs tabular-nums"
                />
              </div>
            </div>
          )}

          <div className="grid grid-cols-3 gap-2 rounded-xl border border-[#DDD3C0] bg-[#FBF8F1] p-3 text-xs tabular-nums">
            <div>
              <span className="block text-[#62564E]">{t.labels.sunrise}</span>
              <span className="font-bold text-[#1F1815]">
                {formatMinutesToHHMM(solar.sunriseMinutes)}
              </span>
            </div>
            <div>
              <span className="block text-[#62564E]">{t.labels.solarNoon}</span>
              <span className="font-bold text-[#1F1815]">
                {formatMinutesToHHMM(solar.solarNoonMinutes)}
              </span>
            </div>
            <div>
              <span className="block text-[#62564E]">{t.labels.sunset}</span>
              <span className="font-bold text-[#1F1815]">
                {formatMinutesToHHMM(solar.sunsetMinutes)}
              </span>
            </div>
          </div>
        </section>

        {/* Matins Quiet Nights & 1960 Anticipation */}
        <section className="rounded-2xl border border-[#DDD3C0] bg-[#FAF6EC] p-5 space-y-4">
          <h2 className="font-display text-lg font-bold text-[#1F1815]">
            Matins Night &amp; 1960 Anticipation Rubrics
          </h2>

          <div className="space-y-2 border-b border-[#DDD3C0] pb-4">
            <label className="flex items-center gap-2.5 text-sm font-semibold text-[#1F1815] cursor-pointer">
              <input
                type="checkbox"
                checked={settings.matinsSettings.quietNightsEnabled}
                onChange={(e) =>
                  onUpdateSettings({
                    matinsSettings: {
                      ...settings.matinsSettings,
                      quietNightsEnabled: e.target.checked,
                    },
                  })
                }
                className="h-4 w-4 accent-[#6B1420]"
              />
              <span>Quiet Night Matins (mute Matins on selected nights)</span>
            </label>

            <div className="flex flex-wrap gap-1.5 pt-1">
              {DAY_NAMES.map((dayName, idx) => {
                const selected = settings.matinsSettings.quietDays.includes(idx);
                return (
                  <button
                    key={dayName}
                    type="button"
                    disabled={!settings.matinsSettings.quietNightsEnabled}
                    onClick={() => toggleQuietDay(idx)}
                    aria-pressed={selected}
                    className={`min-h-[36px] rounded-lg border px-2.5 py-1 text-xs font-semibold transition-colors disabled:opacity-45 ${
                      selected
                        ? 'border-[#6B1420] bg-[#6B1420] text-[#FBF8F1]'
                        : 'border-[#DDD3C0] bg-[#FBF8F1] text-[#1F1815]'
                    }`}
                  >
                    {dayName}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-3">
            <label className="flex items-center gap-2.5 text-sm font-semibold text-[#1F1815] cursor-pointer">
              <input
                type="checkbox"
                checked={settings.matinsSettings.anticipationEnabled}
                onChange={(e) =>
                  onUpdateSettings({
                    matinsSettings: {
                      ...settings.matinsSettings,
                      anticipationEnabled: e.target.checked,
                    },
                  })
                }
                className="h-4 w-4 accent-[#6B1420]"
              />
              <span>Anticipate Matins the evening before (1960 Rubrics)</span>
            </label>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="anticipation-time"
                  className="block text-xs font-semibold text-[#62564E] mb-1"
                >
                  Evening Anticipation Time
                </label>
                <input
                  id="anticipation-time"
                  type="time"
                  value={settings.matinsSettings.anticipationTime}
                  disabled={!settings.matinsSettings.anticipationEnabled}
                  onChange={(e) =>
                    onUpdateSettings({
                      matinsSettings: {
                        ...settings.matinsSettings,
                        anticipationTime: e.target.value,
                      },
                    })
                  }
                  className="w-full min-h-[40px] rounded-lg border border-[#C9BDA8] bg-[#FBF8F1] px-3 py-1.5 text-sm tabular-nums disabled:opacity-50"
                />
              </div>
              <div className="flex items-end pb-1">
                <label className="inline-flex items-center gap-2 text-xs font-medium text-[#1F1815] cursor-pointer">
                  <input
                    type="checkbox"
                    disabled={!settings.matinsSettings.anticipationEnabled}
                    checked={settings.matinsSettings.anticipateLaudsToo}
                    onChange={(e) =>
                      onUpdateSettings({
                        matinsSettings: {
                          ...settings.matinsSettings,
                          anticipateLaudsToo: e.target.checked,
                        },
                      })
                    }
                    className="h-4 w-4 accent-[#6B1420]"
                  />
                  <span>Also anticipate Lauds (+35m)</span>
                </label>
              </div>
            </div>
          </div>
        </section>

        {/* Home-Screen Widget Preview & Backup */}
        <section className="rounded-2xl border border-[#DDD3C0] bg-[#FAF6EC] p-5 space-y-4">
          <div className="flex items-center justify-between gap-2">
            <h2 className="font-display text-lg font-bold text-[#1F1815]">
              {t.labels.widgetPreviewTitle}
            </h2>
            <div className="flex gap-1 rounded-lg bg-[#EFE8D8] p-1">
              <button
                type="button"
                onClick={() => setWidgetTheme('burgundy')}
                className={`rounded-md px-2.5 py-1 text-xs font-semibold ${
                  widgetTheme === 'burgundy'
                    ? 'bg-[#6B1420] text-[#FBF8F1]'
                    : 'text-[#62564E]'
                }`}
              >
                Burgundy
              </button>
              <button
                type="button"
                onClick={() => setWidgetTheme('parchment')}
                className={`rounded-md px-2.5 py-1 text-xs font-semibold ${
                  widgetTheme === 'parchment'
                    ? 'bg-[#FBF8F1] text-[#1F1815] shadow-xs'
                    : 'text-[#62564E]'
                }`}
              >
                Parchment
              </button>
            </div>
          </div>

          <div
            className={`rounded-2xl border p-4 shadow-sm transition-colors ${
              widgetTheme === 'burgundy'
                ? 'border-[#B88B2E]/50 bg-[#5A101A] text-[#FBF8F1]'
                : 'border-[#C9BDA8] bg-[#FBF8F1] text-[#1F1815]'
            }`}
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <CrossEmblem size={40} />
                <div className="min-w-0">
                  <p
                    className={`text-[11px] font-medium ${
                      widgetTheme === 'burgundy' ? 'text-[#D4AF5A]' : 'text-[#9B2330]'
                    }`}
                  >
                    {t.labels.nextHour}
                  </p>
                  <p className="font-display text-lg font-bold truncate">
                    {nextHour ? t.hours[nextHour.id].name : 'Compline'}
                  </p>
                  <p
                    className={`text-xs truncate ${
                      widgetTheme === 'burgundy' ? 'text-[#E7D8C3]' : 'text-[#62564E]'
                    }`}
                  >
                    {liturgicalDay.latinTitle}
                  </p>
                </div>
              </div>
              <div className="font-display text-2xl font-bold tabular-nums shrink-0">
                {nextHour ? nextHour.effectiveTime : '21:00'}
              </div>
            </div>
          </div>

          {/* Backup Export / Import / Reset */}
          <div className="border-t border-[#DDD3C0] pt-4 space-y-3">
            <h3 className="font-display text-sm font-bold text-[#1F1815]">
              Settings &amp; Prayer Log Backup
            </h3>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={onExportBackup}
                className="inline-flex min-h-[40px] items-center gap-1.5 rounded-lg border border-[#DDD3C0] bg-[#FBF8F1] px-3.5 py-2 text-xs font-semibold text-[#1F1815] hover:bg-[#F3EDE0]"
              >
                <Download className="h-3.5 w-3.5 text-[#6B1420]" aria-hidden="true" />
                <span>{t.actions.exportBackup}</span>
              </button>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex min-h-[40px] items-center gap-1.5 rounded-lg border border-[#DDD3C0] bg-[#FBF8F1] px-3.5 py-2 text-xs font-semibold text-[#1F1815] hover:bg-[#F3EDE0]"
              >
                <Upload className="h-3.5 w-3.5 text-[#6B1420]" aria-hidden="true" />
                <span>{t.actions.importBackup}</span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="application/json,.json"
                onChange={handleFileChange}
                className="sr-only"
                aria-label="Upload JSON backup file"
              />

              <button
                type="button"
                onClick={onResetDefaults}
                className="inline-flex min-h-[40px] items-center gap-1.5 rounded-lg border border-[#9B2330]/30 bg-[#FBF8F1] px-3.5 py-2 text-xs font-semibold text-[#9B2330] hover:bg-[#F3EDE0]"
              >
                <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                <span>{t.actions.resetDefaults}</span>
              </button>
            </div>
            {importStatus && (
              <p className="text-xs font-medium text-[#4B0D16]">{importStatus}</p>
            )}
          </div>
        </section>

        {/* Angelus & Rosary Times + GitHub Actions Android Build Guide */}
        <section className="lg:col-span-2 rounded-2xl border border-[#DDD3C0] bg-[#FAF6EC] p-5 space-y-5">
          <div>
            <h2 className="font-display text-lg font-bold text-[#1F1815]">
              Angelus / Regina Cæli &amp; Rosary Times
            </h2>
            <p className="text-xs text-[#62564E] mt-0.5">
              Customize daily Angelus times (automatically becomes Regina Cæli in Paschaltide) and your evening Rosary reminder.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {([0, 1, 2] as const).map((idx) => {
              const slotEnabled = settings.devotions.angelusSlotsEnabled[idx];
              return (
                <div key={idx} className="space-y-1">
                  <label className="flex items-center justify-between gap-2 text-xs font-semibold text-[#1F1815] cursor-pointer">
                    <span>
                      Angelus {idx === 0 ? 'Morning' : idx === 1 ? 'Noon' : 'Evening'}
                    </span>
                    <input
                      type="checkbox"
                      aria-label={`Settings toggle ${idx === 0 ? 'Morning' : idx === 1 ? 'Noon' : 'Evening'} Angelus`}
                      checked={slotEnabled}
                      onChange={(e) => {
                        const nextEnabled: [boolean, boolean, boolean] = [
                          ...settings.devotions.angelusSlotsEnabled,
                        ];
                        nextEnabled[idx] = e.target.checked;
                        onUpdateSettings({
                          devotions: {
                            ...settings.devotions,
                            angelusSlotsEnabled: nextEnabled,
                          },
                        });
                      }}
                      className="h-4 w-4 accent-[#6B1420]"
                    />
                  </label>
                  <input
                    id={`angelus-time-${idx}`}
                    type="time"
                    disabled={!slotEnabled}
                    value={settings.devotions.angelusTimes[idx]}
                    onChange={(e) => {
                      const next: [string, string, string] = [...settings.devotions.angelusTimes];
                      next[idx] = e.target.value;
                      onUpdateSettings({
                        devotions: { ...settings.devotions, angelusTimes: next },
                      });
                    }}
                    className="w-full min-h-[40px] rounded-lg border border-[#C9BDA8] bg-[#FBF8F1] px-3 py-1.5 text-sm tabular-nums disabled:opacity-50"
                  />
                </div>
              );
            })}

            <div>
              <label
                htmlFor="rosary-time-input"
                className="block text-xs font-semibold text-[#1F1815] mb-1"
              >
                Daily Rosary
              </label>
              <input
                id="rosary-time-input"
                type="time"
                value={settings.devotions.rosaryTime}
                onChange={(e) =>
                  onUpdateSettings({
                    devotions: { ...settings.devotions, rosaryTime: e.target.value },
                  })
                }
                className="w-full min-h-[40px] rounded-lg border border-[#C9BDA8] bg-[#FBF8F1] px-3 py-1.5 text-sm tabular-nums"
              />
            </div>
          </div>

          <details className="border-t border-[#DDD3C0] pt-4 text-xs text-[#62564E]">
            <summary className="cursor-pointer font-semibold text-[#4B0D16] hover:underline">
              Android &amp; GitHub Actions Build Architecture Notes
            </summary>
            <div className="mt-3 space-y-2 leading-relaxed">
              <p>
                This companion mirrors the Android 1960 Breviary architecture: exact daily scheduling via{' '}
                <code className="rounded bg-[#EFE8D8] px-1 py-0.5 text-[#1F1815]">
                  AlarmManager.setAlarmClock()
                </code>
                , reschedule receivers on{' '}
                <code className="rounded bg-[#EFE8D8] px-1 py-0.5 text-[#1F1815]">
                  BOOT_COMPLETED
                </code>{' '}
                and{' '}
                <code className="rounded bg-[#EFE8D8] px-1 py-0.5 text-[#1F1815]">
                  TIMEZONE_CHANGED
                </code>
                , and automated APK signing via GitHub Actions (<code className="rounded bg-[#EFE8D8] px-1 py-0.5 text-[#1F1815]">./gradlew assembleRelease</code>) with zero local SDK installation required.
              </p>
            </div>
          </details>
        </section>
      </div>
    </div>
  );
}
