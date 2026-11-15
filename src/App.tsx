import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AlarmOverlay } from './components/AlarmOverlay';
import { CalendarView } from './components/CalendarView';
import { HoursView } from './components/HoursView';
import { PermissionsGuideView } from './components/PermissionsGuideView';
import { OfflineIndicator } from './components/PWAInstallPanel';
import { PrayerLogView } from './components/PrayerLogView';
import { RosaryReaderModal } from './components/RosaryReaderModal';
import { SettingsView } from './components/SettingsView';
import { TopBar, type AppTab } from './components/TopBar';
import { startRepeatingAlarm, stopRepeatingAlarm } from './lib/audio';
import { buildDivinumOfficiumUrl } from './lib/divinumOfficium';
import { TRANSLATIONS } from './lib/i18n';
import { addDays, getLiturgicalDay, toDateKey } from './lib/liturgicalCalendar';
import { resolveDailySchedule, resolveLocation } from './lib/scheduleEngine';
import { syncNativeNotifications } from './lib/nativeNotifications';
import { formatMinutesToHHMM } from './lib/solar';
import {
  createDefaultSettings,
  loadPrayerLog,
  loadSettings,
  loadSkippedToday,
  parseBackup,
  savePrayerLog,
  saveSettings,
  saveSkippedToday,
  serializeBackup,
} from './lib/storage';
import type {
  ActiveAlarmState,
  AppSettings,
  CanonicalHourId,
  HourConfig,
  PermissionChecklist,
  PrayerLogEntry,
} from './lib/types';

const TEN_MINUTES_MS = 10 * 60 * 1000;

export default function App() {
  const [activeTab, setActiveTab] = useState<AppTab>('hours');
  const [settings, setSettings] = useState<AppSettings>(() => loadSettings());
  const [prayerLog, setPrayerLog] = useState<PrayerLogEntry[]>(() => loadPrayerLog());
  const [nowDate, setNowDate] = useState<Date>(() => new Date());
  const [skippedToday, setSkippedToday] = useState<CanonicalHourId[]>(() =>
    loadSkippedToday(toDateKey(new Date()))
  );
  const [snoozedMap, setSnoozedMap] = useState<Partial<Record<CanonicalHourId, number>>>({});
  const [activeAlarm, setActiveAlarm] = useState<ActiveAlarmState | null>(null);
  const [rosaryReaderOpen, setRosaryReaderOpen] = useState(false);
  const lastFiredSlotRef = useRef<string>('');

  const t = TRANSLATIONS[settings.language];

  // Sync document RTL/LTR and language attribute
  useEffect(() => {
    document.documentElement.dir = t.dir;
    document.documentElement.lang = settings.language;
  }, [t.dir, settings.language]);

  // Persist settings, prayer log, and daily skips
  useEffect(() => {
    saveSettings(settings);
  }, [settings]);

  useEffect(() => {
    savePrayerLog(prayerLog);
  }, [prayerLog]);

  const todayKey = toDateKey(nowDate);
  useEffect(() => {
    saveSkippedToday(todayKey, skippedToday);
  }, [todayKey, skippedToday]);

  // Sync native Android LocalNotifications when running inside Capacitor APK
  useEffect(() => {
    void syncNativeNotifications(
      settings,
      skippedToday,
      snoozedMap,
      prayerLog,
      settings.language
    );
  }, [settings, skippedToday, snoozedMap, prayerLog, todayKey]);

  const liturgicalDay = useMemo(() => getLiturgicalDay(nowDate), [nowDate]);
  const tomorrowDay = useMemo(() => getLiturgicalDay(addDays(nowDate, 1)), [nowDate]);
  const location = useMemo(() => resolveLocation(settings), [settings]);

  const schedule = useMemo(
    () => resolveDailySchedule(nowDate, settings, skippedToday, snoozedMap, prayerLog),
    [nowDate, settings, skippedToday, snoozedMap, prayerLog]
  );

  const fireAlarm = useCallback(
    (alarmState: ActiveAlarmState) => {
      setActiveAlarm(alarmState);
      startRepeatingAlarm(alarmState.sound, alarmState.volume, settings.vibrateEnabled);

      if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
        try {
          const notif = new Notification(`${alarmState.label} · ${alarmState.latinLabel}`, {
            body: `${alarmState.liturgicalDay.latinTitle} — ${t.openingVersicle}`,
            tag: `divine-office-${alarmState.hourId}`,
          });
          notif.onclick = () => {
            window.open(alarmState.divinumUrl, '_blank', 'noopener,noreferrer');
          };
        } catch {
          // Ignore browser notification failure
        }
      }
    },
    [settings.vibrateEnabled, t.openingVersicle]
  );

  // Live minute ticker & automatic alarm scheduler
  useEffect(() => {
    const interval = window.setInterval(() => {
      const current = new Date();
      setNowDate(current);

      const curKey = toDateKey(current);
      if (curKey !== todayKey) {
        setSkippedToday([]);
        setSnoozedMap({});
      }

      const currentMinutes = current.getHours() * 60 + current.getMinutes();
      const slotPrefix = `${curKey}-${currentMinutes}`;

      // Check canonical hours
      for (const h of schedule.hours) {
        if (!h.enabled || h.skippedToday || h.prayedToday) continue;
        const targetMin = h.snoozedUntilMinutes !== null ? h.snoozedUntilMinutes : h.effectiveMinutes;
        if (targetMin === currentMinutes) {
          const fireId = `${slotPrefix}-${h.id}`;
          if (lastFiredSlotRef.current !== fireId) {
            lastFiredSlotRef.current = fireId;
            const cfg = settings.hours[h.id];
            const nowMs = Date.now();
            fireAlarm({
              hourId: h.id,
              label: t.hours[h.id].name,
              latinLabel: t.hours[h.id].latinName,
              triggeredAtMs: nowMs,
              autoStopAtMs: nowMs + TEN_MINUTES_MS,
              divinumUrl: h.divinumOfficiumUrl,
              liturgicalDay: h.isAnticipatedForTomorrow ? tomorrowDay : liturgicalDay,
              sound: cfg.sound,
              volume: cfg.volume,
              isTest: false,
              isAnticipated: h.isAnticipatedForTomorrow,
            });
            return;
          }
        }
      }

      // Check Angelus & Rosary
      const hhmm = formatMinutesToHHMM(currentMinutes);
      const angelusShouldRing =
        settings.devotions.angelusEnabled &&
        settings.devotions.angelusTimes.some(
          (timeVal, idx) => settings.devotions.angelusSlotsEnabled[idx] && timeVal === hhmm
        );
      if (angelusShouldRing) {
        const fireId = `${slotPrefix}-angelus`;
        if (lastFiredSlotRef.current !== fireId) {
          lastFiredSlotRef.current = fireId;
          const nowMs = Date.now();
          fireAlarm({
            hourId: 'angelus',
            label: liturgicalDay.isPaschaltide ? t.labels.reginaCaeliTitle : t.labels.angelusTitle,
            latinLabel: liturgicalDay.isPaschaltide ? 'Regina Cæli, lætare' : 'Angelus Domini nuntiavit Mariæ',
            triggeredAtMs: nowMs,
            autoStopAtMs: nowMs + TEN_MINUTES_MS,
            divinumUrl: buildDivinumOfficiumUrl('sext', current, settings.divinumVersion),
            liturgicalDay,
            sound: 'angelus_cathedral',
            volume: 95,
            isTest: false,
          });
        }
      } else if (settings.devotions.rosaryEnabled && settings.devotions.rosaryTime === hhmm) {
        const fireId = `${slotPrefix}-rosary`;
        if (lastFiredSlotRef.current !== fireId) {
          lastFiredSlotRef.current = fireId;
          const nowMs = Date.now();
          fireAlarm({
            hourId: 'rosary',
            label: t.labels.rosaryTitle,
            latinLabel: t.mysteries[liturgicalDay.rosaryMystery],
            triggeredAtMs: nowMs,
            autoStopAtMs: nowMs + TEN_MINUTES_MS,
            divinumUrl: buildDivinumOfficiumUrl('vespers', current, settings.divinumVersion),
            liturgicalDay,
            sound: 'angelus_cathedral',
            volume: 90,
            isTest: false,
          });
        }
      }
    }, 5000);

    return () => window.clearInterval(interval);
  }, [
    todayKey,
    schedule.hours,
    settings,
    liturgicalDay,
    tomorrowDay,
    t,
    fireAlarm,
  ]);

  const stopActiveAlarm = useCallback(() => {
    stopRepeatingAlarm();
    setActiveAlarm(null);
  }, []);

  const handleTriggerTestAlarm = useCallback(() => {
    const target = schedule.nextHour ?? schedule.hours[0];
    const cfg = settings.hours[target.id];
    const nowMs = Date.now();
    fireAlarm({
      hourId: target.id,
      label: t.hours[target.id].name,
      latinLabel: t.hours[target.id].latinName,
      triggeredAtMs: nowMs,
      autoStopAtMs: nowMs + TEN_MINUTES_MS,
      divinumUrl: target.divinumOfficiumUrl,
      liturgicalDay: target.isAnticipatedForTomorrow ? tomorrowDay : liturgicalDay,
      sound: cfg.sound,
      volume: cfg.volume,
      isTest: true,
      isAnticipated: target.isAnticipatedForTomorrow,
    });
  }, [schedule, settings.hours, t.hours, tomorrowDay, liturgicalDay, fireAlarm]);

  const handleTriggerHourAlarm = useCallback(
    (id: CanonicalHourId) => {
      const target = schedule.hours.find((h) => h.id === id) ?? schedule.hours[0];
      const cfg = settings.hours[id];
      const nowMs = Date.now();
      fireAlarm({
        hourId: id,
        label: t.hours[id].name,
        latinLabel: t.hours[id].latinName,
        triggeredAtMs: nowMs,
        autoStopAtMs: nowMs + TEN_MINUTES_MS,
        divinumUrl: target.divinumOfficiumUrl,
        liturgicalDay: target.isAnticipatedForTomorrow ? tomorrowDay : liturgicalDay,
        sound: cfg.sound,
        volume: cfg.volume,
        isTest: true,
        isAnticipated: target.isAnticipatedForTomorrow,
      });
    },
    [schedule.hours, settings.hours, t.hours, tomorrowDay, liturgicalDay, fireAlarm]
  );

  const handleTriggerDevotionAlarm = useCallback(
    (kind: 'angelus' | 'rosary') => {
      const nowMs = Date.now();
      if (kind === 'angelus') {
        fireAlarm({
          hourId: 'angelus',
          label: liturgicalDay.isPaschaltide ? t.labels.reginaCaeliTitle : t.labels.angelusTitle,
          latinLabel: liturgicalDay.isPaschaltide
            ? 'Regina Cæli, lætare'
            : 'Angelus Domini nuntiavit Mariæ',
          triggeredAtMs: nowMs,
          autoStopAtMs: nowMs + TEN_MINUTES_MS,
          divinumUrl: buildDivinumOfficiumUrl('sext', nowDate, settings.divinumVersion),
          liturgicalDay,
          sound: 'angelus_cathedral',
          volume: 95,
          isTest: true,
        });
      } else {
        fireAlarm({
          hourId: 'rosary',
          label: t.labels.rosaryTitle,
          latinLabel: t.mysteries[liturgicalDay.rosaryMystery],
          triggeredAtMs: nowMs,
          autoStopAtMs: nowMs + TEN_MINUTES_MS,
          divinumUrl: buildDivinumOfficiumUrl('vespers', nowDate, settings.divinumVersion),
          liturgicalDay,
          sound: 'angelus_cathedral',
          volume: 90,
          isTest: true,
        });
      }
    },
    [liturgicalDay, nowDate, settings.divinumVersion, t, fireAlarm]
  );

  const handleUpdateHour = useCallback((id: CanonicalHourId, patch: Partial<HourConfig>) => {
    setSettings((prev) => ({
      ...prev,
      hours: {
        ...prev.hours,
        [id]: {
          ...prev.hours[id],
          ...patch,
        },
      },
    }));
  }, []);

  const handleTogglePrayed = useCallback(
    (id: CanonicalHourId) => {
      const resolved = schedule.hours.find((h) => h.id === id);
      const targetKey = resolved ? toDateKey(resolved.targetOfficeDate) : todayKey;
      const litTitle = resolved?.isAnticipatedForTomorrow
        ? tomorrowDay.latinTitle
        : liturgicalDay.latinTitle;

      setPrayerLog((prev) => {
        const exists = prev.some((e) => e.dateKey === targetKey && e.hourId === id);
        if (exists) {
          return prev.filter((e) => !(e.dateKey === targetKey && e.hourId === id));
        }
        return [
          ...prev,
          {
            id: `${targetKey}-${id}-${Date.now()}`,
            dateKey: targetKey,
            hourId: id,
            prayedAtIso: new Date().toISOString(),
            liturgicalTitle: litTitle,
          },
        ];
      });
    },
    [schedule.hours, todayKey, tomorrowDay.latinTitle, liturgicalDay.latinTitle]
  );

  const handleSkipToday = useCallback((id: CanonicalHourId) => {
    setSkippedToday((prev) => (prev.includes(id) ? prev : [...prev, id]));
    setSnoozedMap((prev) => {
      const copy = { ...prev };
      delete copy[id];
      return copy;
    });
  }, []);

  const handleUndoSkip = useCallback((id: CanonicalHourId) => {
    setSkippedToday((prev) => prev.filter((item) => item !== id));
  }, []);

  const handleClearSnooze = useCallback((id: CanonicalHourId) => {
    setSnoozedMap((prev) => {
      const copy = { ...prev };
      delete copy[id];
      return copy;
    });
  }, []);

  const handleSnoozeFromAlarm = useCallback(
    (minutes: number) => {
      if (
        activeAlarm &&
        activeAlarm.hourId !== 'test' &&
        activeAlarm.hourId !== 'angelus' &&
        activeAlarm.hourId !== 'rosary'
      ) {
        const nowMins = nowDate.getHours() * 60 + nowDate.getMinutes();
        const snoozeUntil = (nowMins + minutes) % 1440;
        const targetId = activeAlarm.hourId;
        setSnoozedMap((prev) => ({
          ...prev,
          [targetId]: snoozeUntil,
        }));
      }
      stopActiveAlarm();
    },
    [activeAlarm, nowDate, stopActiveAlarm]
  );

  const handleSkipFromAlarm = useCallback(() => {
    if (
      activeAlarm &&
      activeAlarm.hourId !== 'test' &&
      activeAlarm.hourId !== 'angelus' &&
      activeAlarm.hourId !== 'rosary'
    ) {
      handleSkipToday(activeAlarm.hourId);
    }
    stopActiveAlarm();
  }, [activeAlarm, handleSkipToday, stopActiveAlarm]);

  const handleMarkPrayedAndStop = useCallback(() => {
    if (
      activeAlarm &&
      activeAlarm.hourId !== 'test' &&
      activeAlarm.hourId !== 'angelus' &&
      activeAlarm.hourId !== 'rosary'
    ) {
      const id = activeAlarm.hourId;
      const resolved = schedule.hours.find((h) => h.id === id);
      const targetKey = resolved ? toDateKey(resolved.targetOfficeDate) : todayKey;
      setPrayerLog((prev) => {
        if (prev.some((e) => e.dateKey === targetKey && e.hourId === id)) return prev;
        return [
          ...prev,
          {
            id: `${targetKey}-${id}-${Date.now()}`,
            dateKey: targetKey,
            hourId: id,
            prayedAtIso: new Date().toISOString(),
            liturgicalTitle: activeAlarm.liturgicalDay.latinTitle,
          },
        ];
      });
    }
    stopActiveAlarm();
  }, [activeAlarm, schedule.hours, todayKey, stopActiveAlarm]);

  const handleUpdateSettings = useCallback((patch: Partial<AppSettings>) => {
    setSettings((prev) => ({ ...prev, ...patch }));
  }, []);

  const handleUpdatePermissions = useCallback((patch: Partial<PermissionChecklist>) => {
    setSettings((prev) => ({
      ...prev,
      permissions: { ...prev.permissions, ...patch },
    }));
  }, []);

  const handleExportBackup = useCallback(() => {
    const content = serializeBackup(settings, prayerLog);
    const blob = new Blob([content], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `divine-office-backup-${todayKey}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [settings, prayerLog, todayKey]);

  const handleImportBackup = useCallback((jsonText: string) => {
    const parsed = parseBackup(jsonText);
    if (!parsed) return false;
    setSettings(parsed.settings);
    setPrayerLog(parsed.prayerLog);
    return true;
  }, []);

  const handleResetDefaults = useCallback(() => {
    setSettings(createDefaultSettings());
    setSkippedToday([]);
    setSnoozedMap({});
  }, []);

  return (
    <div
      data-active-tab={activeTab}
      className="min-h-screen bg-[#FBF8F1] text-[#1F1815] pb-24 md:pb-12"
    >
      <TopBar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onTriggerTestAlarm={handleTriggerTestAlarm}
        t={t}
      />

      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
        {activeTab === 'hours' && (
          <HoursView
            nowDate={nowDate}
            settings={settings}
            liturgicalDay={liturgicalDay}
            tomorrowDay={tomorrowDay}
            hours={schedule.hours}
            solar={schedule.solar}
            locationName={location.name}
            nextHour={schedule.nextHour}
            minutesUntilNext={schedule.minutesUntilNext}
            t={t}
            onUpdateHour={handleUpdateHour}
            onTogglePrayed={handleTogglePrayed}
            onSkipToday={handleSkipToday}
            onUndoSkip={handleUndoSkip}
            onClearSnooze={handleClearSnooze}
            onTriggerHourAlarm={handleTriggerHourAlarm}
            onTriggerDevotionAlarm={handleTriggerDevotionAlarm}
            onToggleDevotion={(kind) =>
              setSettings((prev) => ({
                ...prev,
                devotions: {
                  ...prev.devotions,
                  angelusEnabled:
                    kind === 'angelus'
                      ? !prev.devotions.angelusEnabled
                      : prev.devotions.angelusEnabled,
                  rosaryEnabled:
                    kind === 'rosary'
                      ? !prev.devotions.rosaryEnabled
                      : prev.devotions.rosaryEnabled,
                },
              }))
            }
            onUpdateAngelusSlot={(index, patch) =>
              setSettings((prev) => {
                const nextTimes: [string, string, string] = [...prev.devotions.angelusTimes];
                const nextEnabled: [boolean, boolean, boolean] = [
                  ...prev.devotions.angelusSlotsEnabled,
                ];
                if (patch.time !== undefined) nextTimes[index] = patch.time;
                if (patch.enabled !== undefined) nextEnabled[index] = patch.enabled;
                return {
                  ...prev,
                  devotions: {
                    ...prev.devotions,
                    angelusTimes: nextTimes,
                    angelusSlotsEnabled: nextEnabled,
                  },
                };
              })
            }
            onOpenRosaryReader={() => setRosaryReaderOpen(true)}
          />
        )}

        {activeTab === 'calendar' && (
          <CalendarView nowDate={nowDate} settings={settings} t={t} />
        )}

        {activeTab === 'log' && (
          <PrayerLogView
            nowDate={nowDate}
            prayerLog={prayerLog}
            t={t}
            onTogglePrayed={handleTogglePrayed}
            onDeleteEntry={(entryId) =>
              setPrayerLog((prev) => prev.filter((e) => e.id !== entryId))
            }
            onClearAll={() => setPrayerLog([])}
          />
        )}

        {activeTab === 'permissions' && (
          <PermissionsGuideView
            permissions={settings.permissions}
            t={t}
            onUpdatePermissions={handleUpdatePermissions}
            onTriggerTestAlarm={handleTriggerTestAlarm}
          />
        )}

        {activeTab === 'settings' && (
          <SettingsView
            settings={settings}
            solar={schedule.solar}
            nextHour={schedule.nextHour}
            liturgicalDay={liturgicalDay}
            t={t}
            onUpdateSettings={handleUpdateSettings}
            onExportBackup={handleExportBackup}
            onImportBackup={handleImportBackup}
            onResetDefaults={handleResetDefaults}
          />
        )}
      </main>

      {activeAlarm && (
        <AlarmOverlay
          alarm={activeAlarm}
          defaultSnoozeMinutes={settings.defaultSnoozeMinutes}
          language={settings.language}
          t={t}
          onStop={stopActiveAlarm}
          onSnooze={handleSnoozeFromAlarm}
          onSkipToday={handleSkipFromAlarm}
          onMarkPrayedAndStop={handleMarkPrayedAndStop}
        />
      )}
      {rosaryReaderOpen && (
        <RosaryReaderModal
          mysteryOfTheDay={liturgicalDay.rosaryMystery}
          onClose={() => setRosaryReaderOpen(false)}
        />
      )}
      <OfflineIndicator />
    </div>
  );
}
