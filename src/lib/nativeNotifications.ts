import { Capacitor } from '@capacitor/core';
import { LocalNotifications, type LocalNotificationSchema } from '@capacitor/local-notifications';
import { buildDivinumOfficiumUrl } from './divinumOfficium';
import { TRANSLATIONS } from './i18n';
import { addDays, getLiturgicalDay } from './liturgicalCalendar';
import { resolveDailySchedule } from './scheduleEngine';
import type { AppSettings, CanonicalHourId, LanguageCode, PrayerLogEntry } from './types';

const CHANNEL_HOURS = 'divine-office-hours-v2';
const CHANNEL_DEVOTIONS = 'divine-office-devotions-v2';

let initialized = false;
let permissionRequested = false;

export function isNativeAndroid(): boolean {
  return Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'android';
}

export async function initNativeNotifications(): Promise<void> {
  if (!Capacitor.isNativePlatform() || initialized) return;
  initialized = true;

  try {
    if (Capacitor.getPlatform() === 'android') {
      await LocalNotifications.createChannel({
        id: CHANNEL_HOURS,
        name: 'Canonical Hours',
        description: 'Alarm reminders for the Eight Canonical Hours of the 1960 Roman Breviary',
        sound: 'cathedral_bell.mp3',
        importance: 5,
        visibility: 1,
        vibration: true,
        lights: true,
        lightColor: '#D4AF5A',
      });

      await LocalNotifications.createChannel({
        id: CHANNEL_DEVOTIONS,
        name: 'Angelus & Daily Rosary',
        description: 'Traditional daily Angelus / Regina Cæli and Rosary reminders',
        sound: 'cathedral_bell.mp3',
        importance: 5,
        visibility: 1,
        vibration: true,
        lights: true,
        lightColor: '#D4AF5A',
      });
    }

    await LocalNotifications.addListener('localNotificationActionPerformed', (action) => {
      const url = action.notification?.extra?.divinumUrl;
      if (typeof url === 'string' && url.startsWith('https://')) {
        window.open(url, '_blank', 'noopener,noreferrer');
      }
    });
  } catch {
    // Ignore native initialization errors in restricted environments
  }
}

export async function requestExactAlarmSetting(): Promise<boolean> {
  if (!isNativeAndroid()) return false;
  try {
    const res = await LocalNotifications.changeExactNotificationSetting();
    return res.exact_alarm === 'granted';
  } catch {
    return false;
  }
}

function buildDateAtMinutes(baseDate: Date, totalMinutes: number): Date {
  const d = new Date(baseDate.getFullYear(), baseDate.getMonth(), baseDate.getDate(), 0, 0, 0, 0);
  d.setMinutes(totalMinutes);
  return d;
}

function parseHHMMToMinutes(hhmm: string): number | null {
  const parts = hhmm.split(':');
  if (parts.length !== 2) return null;
  const h = Number(parts[0]);
  const m = Number(parts[1]);
  if (!Number.isFinite(h) || !Number.isFinite(m)) return null;
  return h * 60 + m;
}

export async function syncNativeNotifications(
  settings: AppSettings,
  skippedToday: CanonicalHourId[],
  snoozedMap: Partial<Record<CanonicalHourId, number>>,
  prayerLog: PrayerLogEntry[],
  language: LanguageCode
): Promise<void> {
  if (!Capacitor.isNativePlatform()) return;

  try {
    await initNativeNotifications();

    const perms = await LocalNotifications.checkPermissions();
    if (perms.display !== 'granted') {
      if (permissionRequested) return;
      permissionRequested = true;
      const requested = await LocalNotifications.requestPermissions();
      if (requested.display !== 'granted') return;
    }

    let useExact = false;
    if (Capacitor.getPlatform() === 'android') {
      const exactStatus = await LocalNotifications.checkExactNotificationSetting();
      useExact = exactStatus.exact_alarm === 'granted';
    }

    await LocalNotifications.cancelAll();

    const now = new Date();
    const nowMs = now.getTime();
    const t = TRANSLATIONS[language];
    const notifications: LocalNotificationSchema[] = [];
    let nextId = 1001;

    for (let dayOffset = 0; dayOffset < 2; dayOffset++) {
      const targetDate = dayOffset === 0 ? now : addDays(now, 1);
      const daySkipped = dayOffset === 0 ? skippedToday : [];
      const daySnoozed = dayOffset === 0 ? snoozedMap : {};
      const resolved = resolveDailySchedule(targetDate, settings, daySkipped, daySnoozed, prayerLog);
      const litDay = getLiturgicalDay(targetDate);
      const nextLitDay = getLiturgicalDay(addDays(targetDate, 1));

      for (const h of resolved.hours) {
        if (!h.enabled || h.skippedToday || h.prayedToday) continue;
        const targetMins = h.snoozedUntilMinutes !== null ? h.snoozedUntilMinutes : h.effectiveMinutes;
        const fireAt = buildDateAtMinutes(targetDate, targetMins);
        if (fireAt.getTime() <= nowMs + 5000) continue;

        const officeLit = h.isAnticipatedForTomorrow ? nextLitDay : litDay;
        notifications.push({
          id: nextId++,
          title: `${t.hours[h.id].name} · ${t.hours[h.id].latinName}`,
          body: `${officeLit.latinTitle} — ${t.openingVersicle}`,
          channelId: CHANNEL_HOURS,
          sound: 'cathedral_bell.mp3',
          autoCancel: true,
          isExactNotification: useExact,
          schedule: {
            at: fireAt,
            allowWhileIdle: true,
          },
          extra: {
            hourId: h.id,
            divinumUrl: h.divinumOfficiumUrl,
          },
        });
      }

      if (settings.devotions.angelusEnabled) {
        settings.devotions.angelusTimes.forEach((timeVal, slotIdx) => {
          if (!settings.devotions.angelusSlotsEnabled[slotIdx]) return;
          const mins = parseHHMMToMinutes(timeVal);
          if (mins === null) return;
          const fireAt = buildDateAtMinutes(targetDate, mins);
          if (fireAt.getTime() <= nowMs + 5000) return;

          notifications.push({
            id: nextId++,
            title: litDay.isPaschaltide ? t.labels.reginaCaeliTitle : t.labels.angelusTitle,
            body: litDay.isPaschaltide
              ? 'Regina Cæli, lætare, alleluia'
              : 'Angelus Domini nuntiavit Mariæ',
            channelId: CHANNEL_DEVOTIONS,
            sound: 'cathedral_bell.mp3',
            autoCancel: true,
            isExactNotification: useExact,
            schedule: {
              at: fireAt,
              allowWhileIdle: true,
            },
            extra: {
              hourId: 'angelus',
              divinumUrl: buildDivinumOfficiumUrl('sext', targetDate, settings.divinumVersion),
            },
          });
        });
      }

      if (settings.devotions.rosaryEnabled) {
        const mins = parseHHMMToMinutes(settings.devotions.rosaryTime);
        if (mins !== null) {
          const fireAt = buildDateAtMinutes(targetDate, mins);
          if (fireAt.getTime() > nowMs + 5000) {
            notifications.push({
              id: nextId++,
              title: t.labels.rosaryTitle,
              body: `${t.labels.mysteryOfDay}: ${t.mysteries[litDay.rosaryMystery]}`,
              channelId: CHANNEL_DEVOTIONS,
              sound: 'cathedral_bell.mp3',
              autoCancel: true,
              isExactNotification: useExact,
              schedule: {
                at: fireAt,
                allowWhileIdle: true,
              },
              extra: {
                hourId: 'rosary',
                divinumUrl: buildDivinumOfficiumUrl('vespers', targetDate, settings.divinumVersion),
              },
            });
          }
        }
      }
    }

    if (notifications.length > 0) {
      await LocalNotifications.schedule({ notifications });
    }
  } catch {
    // Keep web preview and restricted devices error-free
  }
}
