import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateSolarTimes, formatMinutesToHHMM } from './solar';
import { getEasterSunday, getFirstSundayOfAdvent, getLiturgicalDay } from './liturgicalCalendar';
import { buildDivinumOfficiumUrl } from './divinumOfficium';
import { resolveDailySchedule } from './scheduleEngine';
import { createDefaultSettings, parseBackup, serializeBackup } from './storage';
import { ROSARY_MYSTERIES } from './rosaryMysteries';

test('solar calculation orders dawn, sunrise, terce, noon, none, sunset, dusk', () => {
  // Rome in June (summer)
  const juneDate = new Date(2026, 5, 21, 12, 0, 0);
  const solar = calculateSolarTimes(juneDate, 41.9022, 12.4539, 120); // UTC+2 DST
  assert.ok(solar.civilDawnMinutes < solar.sunriseMinutes);
  assert.ok(solar.sunriseMinutes < solar.romanTerceMinutes);
  assert.ok(solar.romanTerceMinutes < solar.solarNoonMinutes);
  assert.ok(solar.solarNoonMinutes < solar.romanNoneMinutes);
  assert.ok(solar.romanNoneMinutes < solar.sunsetMinutes);
  assert.ok(solar.sunsetMinutes < solar.civilDuskMinutes);
  // Sunrise in Rome June should be ~05:30-05:45 CEST
  assert.ok(solar.sunriseMinutes >= 315 && solar.sunriseMinutes <= 360);
});

test('1960 liturgical calendar computus, Triduum, Paschaltide, and Nov 15 2026', () => {
  const easter2026 = getEasterSunday(2026);
  assert.equal(easter2026.getFullYear(), 2026);
  assert.equal(easter2026.getMonth() + 1, 4);
  assert.equal(easter2026.getDate(), 5);

  const advent2026 = getFirstSundayOfAdvent(2026);
  assert.equal(advent2026.getMonth() + 1, 11);
  assert.equal(advent2026.getDate(), 29);

  // Sacred Triduum 2026: Apr 2, Apr 3, Apr 4
  const maundyThursday = getLiturgicalDay(new Date(2026, 3, 2, 12, 0, 0));
  assert.equal(maundyThursday.isTriduum, true);
  assert.equal(maundyThursday.latinTitle, 'Feria V in Cena Domini');
  assert.equal(maundyThursday.isPaschaltide, false);

  const goodFriday = getLiturgicalDay(new Date(2026, 3, 3, 12, 0, 0));
  assert.equal(goodFriday.isTriduum, true);
  assert.equal(goodFriday.color, 'black');

  // Easter Sunday -> Paschaltide true
  const easterDay = getLiturgicalDay(new Date(2026, 3, 5, 12, 0, 0));
  assert.equal(easterDay.isPaschaltide, true);
  assert.equal(easterDay.liturgicalClass, 'I');

  // Nov 15, 2026 (25th week after Pentecost -> Resumed Sunday after Epiphany)
  const nov15 = getLiturgicalDay(new Date(2026, 10, 15, 12, 0, 0));
  assert.equal(nov15.isSunday, true);
  assert.equal(nov15.color, 'green');
  assert.equal(nov15.englishTitle, '5th Sunday after Epiphany (Resumed)');
  assert.match(nov15.latinTitle, /Resumpta|Pentecosten/);
});

test('Divinum Officium direct link encodes hour, date, and 1960 rubrics', () => {
  const date = new Date(2026, 10, 15, 12, 0, 0);
  const url = buildDivinumOfficiumUrl('vespers', date, 'Rubrics 1960 - 1960');
  assert.ok(url.includes('command=prayVespera'));
  assert.ok(url.includes('date1=11-15-2026'));
  assert.ok(url.includes('Rubrics+1960'));
});

test('schedule engine handles weekend times, solar offsets, quiet nights, and matins anticipation', () => {
  const settings = createDefaultSettings();
  // Sunday Nov 15, 2026 at 10:30 AM
  const sundayMorning = new Date(2026, 10, 15, 10, 30, 0);

  // 1) Manual weekend schedule check
  settings.useSolarTiming = false;
  settings.useWeekendSchedule = true;
  const resWeekend = resolveDailySchedule(sundayMorning, settings, [], {}, []);
  const matinsWeekend = resWeekend.hours.find((h) => h.id === 'matins')!;
  assert.equal(matinsWeekend.effectiveTime, '06:00');
  assert.equal(matinsWeekend.source, 'manual_weekend');
  assert.equal(resWeekend.nextHour?.id, 'sext');

  // 2) Quiet night Matins on Sunday (dow=0)
  settings.matinsSettings.quietNightsEnabled = true;
  settings.matinsSettings.quietDays = [0];
  const resQuiet = resolveDailySchedule(sundayMorning, settings, [], {}, []);
  const matinsQuiet = resQuiet.hours.find((h) => h.id === 'matins')!;
  assert.equal(matinsQuiet.isQuietMuted, true);
  assert.equal(matinsQuiet.enabled, false);

  // 3) Matins & Lauds evening anticipation -> targetOfficeDate becomes Nov 16, 2026
  settings.matinsSettings.quietNightsEnabled = false;
  settings.matinsSettings.anticipationEnabled = true;
  settings.matinsSettings.anticipateLaudsToo = true;
  settings.matinsSettings.anticipationTime = '20:00';
  const resAntic = resolveDailySchedule(sundayMorning, settings, [], {}, []);
  const matinsAntic = resAntic.hours.find((h) => h.id === 'matins')!;
  const laudsAntic = resAntic.hours.find((h) => h.id === 'lauds')!;
  assert.equal(matinsAntic.effectiveTime, '20:00');
  assert.equal(laudsAntic.effectiveTime, '20:35');
  assert.equal(matinsAntic.isAnticipatedForTomorrow, true);
  assert.ok(matinsAntic.divinumOfficiumUrl.includes('date1=11-16-2026'));

  // 4) Solar timing enabled -> Vespers anchored to sunset - 15m
  settings.useSolarTiming = true;
  const resSolar = resolveDailySchedule(sundayMorning, settings, [], {}, []);
  const vespersSolar = resSolar.hours.find((h) => h.id === 'vespers')!;
  assert.equal(vespersSolar.source, 'solar');
  assert.equal(
    vespersSolar.effectiveTime,
    formatMinutesToHHMM(resSolar.solar.sunsetMinutes - 15)
  );
});

test('fixed manual hour times override solar anchors for the selected weekday or weekend schedule', () => {
  const settings = createDefaultSettings();
  settings.useSolarTiming = true;
  settings.useWeekendSchedule = true;
  settings.hours.prime.solarAnchor = 'manual';
  settings.hours.prime.weekdayTime = '08:37';
  settings.hours.prime.weekendTime = '09:12';

  const weekday = resolveDailySchedule(new Date(2026, 10, 16, 7, 0), settings, [], {}, []);
  const weekend = resolveDailySchedule(new Date(2026, 10, 15, 7, 0), settings, [], {}, []);
  const weekdayPrime = weekday.hours.find((hour) => hour.id === 'prime')!;
  const weekendPrime = weekend.hours.find((hour) => hour.id === 'prime')!;

  assert.equal(weekdayPrime.effectiveTime, '08:37');
  assert.equal(weekdayPrime.source, 'manual_weekday');
  assert.equal(weekendPrime.effectiveTime, '09:12');
  assert.equal(weekendPrime.source, 'manual_weekend');
});

test('backup serialization and parsing roundtrips cleanly', () => {
  const settings = createDefaultSettings();
  settings.language = 'fa';
  settings.selectedCityId = 'tehran';
  settings.devotions.angelusSlotsEnabled = [false, true, true];
  const json = serializeBackup(settings, [
    {
      id: '1',
      dateKey: '2026-11-15',
      hourId: 'lauds',
      prayedAtIso: '2026-11-15T06:15:00Z',
      liturgicalTitle: 'Dominica VI post Epiphaniam (Resumpta)',
    },
  ]);
  const parsed = parseBackup(json);
  assert.ok(parsed);
  assert.equal(parsed.settings.language, 'fa');
  assert.equal(parsed.settings.selectedCityId, 'tehran');
  assert.deepEqual(parsed.settings.devotions.angelusSlotsEnabled, [false, true, true]);
  assert.equal(parsed.prayerLog.length, 1);
  assert.equal(parseBackup('not valid json'), null);
});

test('rosary mysteries define 5 decades each with scripture reading and fruit', () => {
  for (const key of ['joyful', 'sorrowful', 'glorious'] as const) {
    const set = ROSARY_MYSTERIES[key];
    assert.equal(set.decades.length, 5);
    set.decades.forEach((d, idx) => {
      assert.equal(d.number, idx + 1);
      assert.ok(d.title.length > 5);
      assert.ok(d.scriptureRef.length > 3);
      assert.ok(d.scriptureReading.length > 20);
      assert.ok(d.fruit.length > 3);
    });
  }
});
