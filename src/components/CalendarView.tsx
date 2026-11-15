import { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, ExternalLink, Sun } from 'lucide-react';
import { buildDivinumOfficiumUrl } from '../lib/divinumOfficium';
import type { TranslationBundle } from '../lib/i18n';
import {
  addDays,
  getChristTheKingSunday,
  getEasterSunday,
  getLiturgicalDay,
  toDateKey,
} from '../lib/liturgicalCalendar';
import { CANONICAL_HOUR_ORDER, resolveLocation } from '../lib/scheduleEngine';
import { calculateSolarTimes, formatMinutesToHHMM } from '../lib/solar';
import type { AppSettings } from '../lib/types';
import { LiturgicalColorSwatch } from './CrossEmblem';

interface CalendarViewProps {
  nowDate: Date;
  settings: AppSettings;
  t: TranslationBundle;
}

const WEEKDAY_HEADERS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

export function CalendarView({ nowDate, settings, t }: CalendarViewProps) {
  const [viewYear, setViewYear] = useState(nowDate.getFullYear());
  const [viewMonth, setViewMonth] = useState(nowDate.getMonth()); // 0..11
  const [selectedDate, setSelectedDate] = useState(
    () => new Date(nowDate.getFullYear(), nowDate.getMonth(), nowDate.getDate(), 12, 0, 0)
  );

  const location = useMemo(() => resolveLocation(settings), [settings]);

  const monthDays = useMemo(() => {
    const firstOfMonth = new Date(viewYear, viewMonth, 1, 12, 0, 0);
    const startDow = firstOfMonth.getDay();
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const cells: (Date | null)[] = [];

    for (let i = 0; i < startDow; i++) {
      cells.push(null);
    }
    for (let d = 1; d <= daysInMonth; d++) {
      cells.push(new Date(viewYear, viewMonth, d, 12, 0, 0));
    }
    while (cells.length % 7 !== 0) {
      cells.push(null);
    }
    return cells;
  }, [viewYear, viewMonth]);

  const selectedDayInfo = useMemo(() => getLiturgicalDay(selectedDate), [selectedDate]);
  const selectedSolar = useMemo(
    () => calculateSolarTimes(selectedDate, location.lat, location.lon, location.tzOffsetMinutes),
    [selectedDate, location]
  );

  const jumpToDate = (date: Date) => {
    setViewYear(date.getFullYear());
    setViewMonth(date.getMonth());
    setSelectedDate(new Date(date.getFullYear(), date.getMonth(), date.getDate(), 12, 0, 0));
  };

  const quickMilestones = useMemo(() => {
    const easter = getEasterSunday(viewYear);
    return [
      { label: 'Today', date: nowDate },
      { label: 'Ash Wed', date: addDays(easter, -46) },
      { label: 'Maundy Thu', date: addDays(easter, -3) },
      { label: 'Good Fri', date: addDays(easter, -2) },
      { label: 'Easter', date: easter },
      { label: 'Pentecost', date: addDays(easter, 49) },
      { label: 'Christ the King', date: getChristTheKingSunday(viewYear) },
      { label: 'Christmas', date: new Date(viewYear, 11, 25, 12, 0, 0) },
    ];
  }, [viewYear, nowDate]);

  const goPrevMonth = () => {
    if (viewMonth === 0) {
      setViewYear((y) => y - 1);
      setViewMonth(11);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const goNextMonth = () => {
    if (viewMonth === 11) {
      setViewYear((y) => y + 1);
      setViewMonth(0);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  const selectedKey = toDateKey(selectedDate);
  const todayKey = toDateKey(nowDate);

  const selectedDayTitle =
    settings.language === 'la'
      ? selectedDayInfo.latinTitle
      : settings.language === 'fa'
      ? selectedDayInfo.persianTitle
      : selectedDayInfo.englishTitle;

  return (
    <div className="space-y-6">
      <div className="border-b border-[#DDD3C0] pb-5">
        <h1 className="font-display text-2xl font-bold text-[#1F1815] sm:text-3xl">
          {t.nav.calendar} · {t.labels.rubrics1960}
        </h1>
        <p className="mt-1 text-sm text-[#62564E]">
          Inspect any date’s 1960 Roman Breviary feast, liturgical color, Triduum rubrics, solar times, and direct Divinum Officium links.
        </p>

        {/* Quick Jump Milestones */}
        <div className="mt-4 flex flex-wrap items-center gap-1.5">
          {quickMilestones.map((m) => (
            <button
              key={m.label}
              type="button"
              onClick={() => jumpToDate(m.date)}
              className="min-h-[36px] rounded-lg border border-[#DDD3C0] bg-[#FAF6EC] px-3 py-1 text-xs font-medium text-[#1F1815] hover:bg-[#F3EDE0] whitespace-nowrap"
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Month Grid */}
        <div className="lg:col-span-7 rounded-2xl border border-[#DDD3C0] bg-[#FAF6EC] p-4 sm:p-5">
          <div className="mb-4 flex items-center justify-between">
            <button
              type="button"
              onClick={goPrevMonth}
              aria-label="Previous month"
              className="inline-flex min-h-[40px] min-w-[40px] items-center justify-center rounded-lg border border-[#DDD3C0] bg-[#FBF8F1] text-[#1F1815] hover:bg-[#F3EDE0]"
            >
              <ChevronLeft className="h-4 w-4" aria-hidden="true" />
            </button>

            <h2 className="font-display text-lg font-bold text-[#1F1815] tabular-nums">
              {MONTH_NAMES[viewMonth]} {viewYear}
            </h2>

            <button
              type="button"
              onClick={goNextMonth}
              aria-label="Next month"
              className="inline-flex min-h-[40px] min-w-[40px] items-center justify-center rounded-lg border border-[#DDD3C0] bg-[#FBF8F1] text-[#1F1815] hover:bg-[#F3EDE0]"
            >
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-[#62564E] mb-2">
            {WEEKDAY_HEADERS.map((wd) => (
              <div key={wd} className="py-1">
                {wd}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {monthDays.map((cellDate, idx) => {
              if (!cellDate) {
                return <div key={`empty-${idx}`} className="h-14 sm:h-16" />;
              }
              const key = toDateKey(cellDate);
              const info = getLiturgicalDay(cellDate);
              const isSelected = key === selectedKey;
              const isToday = key === todayKey;

              const colorBar =
                info.color === 'red'
                  ? 'bg-[#9B2330]'
                  : info.color === 'violet'
                  ? 'bg-[#5B3169]'
                  : info.color === 'green'
                  ? 'bg-[#275937]'
                  : info.color === 'rose'
                  ? 'bg-[#B86B77]'
                  : info.color === 'black'
                  ? 'bg-[#1F1B1A]'
                  : 'bg-[#D4AF5A]';

              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setSelectedDate(cellDate)}
                  aria-label={`${MONTH_NAMES[viewMonth]} ${cellDate.getDate()}, ${info.englishTitle}`}
                  aria-pressed={isSelected}
                  className={`relative flex h-14 sm:h-16 flex-col items-start justify-between rounded-lg border p-1.5 text-start transition-colors ${
                    isSelected
                      ? 'border-[#6B1420] bg-[#6B1420] text-[#FBF8F1]'
                      : isToday
                      ? 'border-[#B88B2E] bg-[#F3EDE0] text-[#1F1815]'
                      : 'border-[#E6DEC9] bg-[#FBF8F1] text-[#1F1815] hover:bg-[#F3EDE0]'
                  }`}
                >
                  <div className="flex w-full items-center justify-between">
                    <span className="text-xs font-bold tabular-nums">{cellDate.getDate()}</span>
                    <span
                      className={`text-[10px] font-medium ${
                        isSelected ? 'text-[#D4AF5A]' : 'text-[#62564E]'
                      }`}
                    >
                      {info.liturgicalClass}
                    </span>
                  </div>
                  <div className="w-full">
                    <span className={`block h-1 w-full rounded-full ${colorBar}`} />
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Day Rubric & Solar Inspector */}
        <div className="lg:col-span-5 space-y-4">
          <div className="rounded-2xl border border-[#DDD3C0] bg-[#FAF6EC] p-5 space-y-4">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-[#62564E]">
              <span className="tabular-nums font-semibold text-[#1F1815]">
                {selectedDayInfo.dateKey}
              </span>
              <span aria-hidden="true">·</span>
              <span>
                {t.labels.classLabel} {selectedDayInfo.liturgicalClass}
              </span>
              <span aria-hidden="true">·</span>
              <LiturgicalColorSwatch
                color={selectedDayInfo.color}
                label={t.colors[selectedDayInfo.color]}
              />
            </div>

            <div>
              <h3 className="font-display text-xl font-bold text-[#1F1815]">
                {selectedDayTitle}
              </h3>
              <p className="mt-1 text-sm italic text-[#9B2330]">
                {selectedDayInfo.latinTitle}
              </p>
            </div>

            {selectedDayInfo.rubricNote && (
              <p className="rounded-xl border border-[#DDD3C0] bg-[#FBF8F1] p-3 text-xs leading-relaxed text-[#4B0D16]">
                {selectedDayInfo.rubricNote}
              </p>
            )}

            <div className="border-t border-[#DDD3C0] pt-3 text-xs text-[#62564E] space-y-1.5">
              <div className="flex items-center gap-1.5 font-semibold text-[#1F1815]">
                <Sun className="h-3.5 w-3.5 text-[#B88B2E]" aria-hidden="true" />
                <span>Solar Ephemeris ({location.name})</span>
              </div>
              <div className="grid grid-cols-3 gap-2 tabular-nums">
                <div>
                  <span className="block text-[11px] text-[#62564E]">{t.labels.sunrise}</span>
                  <span className="font-semibold text-[#1F1815]">
                    {formatMinutesToHHMM(selectedSolar.sunriseMinutes)}
                  </span>
                </div>
                <div>
                  <span className="block text-[11px] text-[#62564E]">{t.labels.solarNoon}</span>
                  <span className="font-semibold text-[#1F1815]">
                    {formatMinutesToHHMM(selectedSolar.solarNoonMinutes)}
                  </span>
                </div>
                <div>
                  <span className="block text-[11px] text-[#62564E]">{t.labels.sunset}</span>
                  <span className="font-semibold text-[#1F1815]">
                    {formatMinutesToHHMM(selectedSolar.sunsetMinutes)}
                  </span>
                </div>
              </div>
            </div>

            <div className="border-t border-[#DDD3C0] pt-3">
              <p className="mb-2 text-xs font-semibold text-[#1F1815]">
                Direct Divinum Officium Links ({selectedDayInfo.dateKey})
              </p>
              <div className="grid grid-cols-2 gap-2">
                {CANONICAL_HOUR_ORDER.map((id) => (
                  <a
                    key={id}
                    href={buildDivinumOfficiumUrl(id, selectedDate, settings.divinumVersion)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex min-h-[38px] items-center justify-between rounded-lg border border-[#DDD3C0] bg-[#FBF8F1] px-3 py-1.5 text-xs font-medium text-[#6B1420] hover:bg-[#F3EDE0]"
                  >
                    <span>{t.hours[id].name}</span>
                    <ExternalLink className="h-3 w-3 shrink-0" aria-hidden="true" />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
