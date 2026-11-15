import { Check, Trash2 } from 'lucide-react';
import type { TranslationBundle } from '../lib/i18n';
import { addDays, toDateKey } from '../lib/liturgicalCalendar';
import { CANONICAL_HOUR_ORDER } from '../lib/scheduleEngine';
import type { CanonicalHourId, PrayerLogEntry } from '../lib/types';

interface PrayerLogViewProps {
  nowDate: Date;
  prayerLog: PrayerLogEntry[];
  t: TranslationBundle;
  onTogglePrayed: (id: CanonicalHourId) => void;
  onDeleteEntry: (entryId: string) => void;
  onClearAll: () => void;
}

export function PrayerLogView({
  nowDate,
  prayerLog,
  t,
  onTogglePrayed,
  onDeleteEntry,
  onClearAll,
}: PrayerLogViewProps) {
  const todayKey = toDateKey(nowDate);
  const todayCount = new Set(
    prayerLog.filter((e) => e.dateKey === todayKey).map((e) => e.hourId)
  ).size;

  // Compute consecutive day streak ending today or yesterday
  const uniqueDates = new Set(prayerLog.map((e) => e.dateKey));
  let streak = 0;
  for (let i = 0; i < 365; i++) {
    const checkKey = toDateKey(addDays(nowDate, -i));
    if (uniqueDates.has(checkKey)) {
      streak++;
    } else if (i === 0) {
      // Allow streak to continue if user hasn't prayed yet today
      continue;
    } else {
      break;
    }
  }

  // Last 7 days matrix
  const last7Days = Array.from({ length: 7 }, (_, idx) => addDays(nowDate, -(6 - idx)));

  return (
    <div className="space-y-6">
      <div className="border-b border-[#DDD3C0] pb-5">
        <h1 className="font-display text-2xl font-bold text-[#1F1815] sm:text-3xl">
          {t.labels.prayerHistory}
        </h1>
        <p className="mt-1 text-sm text-[#62564E]">
          Track canonical hours completed each day across the 1960 liturgical year.
        </p>
      </div>

      {/* 3-Column KPI Strip */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-[#DDD3C0] bg-[#FAF6EC] p-5">
          <span className="text-xs font-medium text-[#62564E]">
            {t.labels.hoursPrayedToday}
          </span>
          <div className="mt-1 font-display text-3xl font-bold text-[#4B0D16] tabular-nums">
            {todayCount} / 8
          </div>
        </div>
        <div className="rounded-2xl border border-[#DDD3C0] bg-[#FAF6EC] p-5">
          <span className="text-xs font-medium text-[#62564E]">{t.labels.totalLogged}</span>
          <div className="mt-1 font-display text-3xl font-bold text-[#1F1815] tabular-nums">
            {prayerLog.length}
          </div>
        </div>
        <div className="rounded-2xl border border-[#DDD3C0] bg-[#FAF6EC] p-5">
          <span className="text-xs font-medium text-[#62564E]">{t.labels.currentStreak}</span>
          <div className="mt-1 font-display text-3xl font-bold text-[#1F1815] tabular-nums">
            {streak} {streak === 1 ? 'day' : 'days'}
          </div>
        </div>
      </div>

      {/* Today's Quick Checklist */}
      <section className="rounded-2xl border border-[#DDD3C0] bg-[#FAF6EC] p-5 space-y-3">
        <h2 className="font-display text-lg font-bold text-[#1F1815]">
          Today ({todayKey})
        </h2>
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
          {CANONICAL_HOUR_ORDER.map((id) => {
            const done = prayerLog.some((e) => e.dateKey === todayKey && e.hourId === id);
            return (
              <button
                key={id}
                type="button"
                onClick={() => onTogglePrayed(id)}
                aria-pressed={done}
                className={`flex min-h-[44px] items-center justify-between rounded-xl border px-3.5 py-2 text-sm font-semibold transition-colors ${
                  done
                    ? 'border-[#275937] bg-[#275937] text-white'
                    : 'border-[#DDD3C0] bg-[#FBF8F1] text-[#1F1815] hover:bg-[#F3EDE0]'
                }`}
              >
                <span>{t.hours[id].name}</span>
                {done && <Check className="h-4 w-4 shrink-0" aria-hidden="true" />}
              </button>
            );
          })}
        </div>
      </section>

      {/* 7-Day Matrix */}
      <section className="rounded-2xl border border-[#DDD3C0] bg-[#FAF6EC] p-5 space-y-3 overflow-x-auto">
        <h2 className="font-display text-lg font-bold text-[#1F1815]">7-Day Office Grid</h2>
        <table className="w-full min-w-[540px] text-left text-xs">
          <thead>
            <tr className="border-b border-[#DDD3C0] text-[#62564E]">
              <th className="py-2 pe-3 font-semibold">Hour</th>
              {last7Days.map((d) => {
                const k = toDateKey(d);
                return (
                  <th key={k} className="py-2 text-center font-semibold tabular-nums">
                    {k.slice(5)}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E8E0D0]">
            {CANONICAL_HOUR_ORDER.map((id) => (
              <tr key={id}>
                <td className="py-2.5 pe-3 font-medium text-[#1F1815]">{t.hours[id].name}</td>
                {last7Days.map((d) => {
                  const k = toDateKey(d);
                  const completed = prayerLog.some((e) => e.dateKey === k && e.hourId === id);
                  return (
                    <td key={k} className="py-2.5 text-center">
                      <span
                        aria-label={completed ? 'Prayed' : 'Not logged'}
                        className={`inline-flex h-6 w-6 items-center justify-center rounded-md text-[11px] font-bold ${
                          completed
                            ? 'bg-[#6B1420] text-[#D4AF5A]'
                            : 'bg-[#EFE8D8] text-[#62564E]/50'
                        }`}
                      >
                        {completed ? '✓' : '·'}
                      </span>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* Chronological History */}
      <section className="rounded-2xl border border-[#DDD3C0] bg-[#FAF6EC] p-5 space-y-4">
        <div className="flex items-center justify-between gap-2">
          <h2 className="font-display text-lg font-bold text-[#1F1815]">Recent Entries</h2>
          {prayerLog.length > 0 && (
            <button
              type="button"
              onClick={onClearAll}
              className="inline-flex min-h-[36px] items-center gap-1.5 rounded-lg border border-[#9B2330]/30 px-3 py-1 text-xs font-medium text-[#9B2330] hover:bg-[#F3EDE0]"
            >
              <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Clear History</span>
            </button>
          )}
        </div>

        {prayerLog.length === 0 ? (
          <p className="py-6 text-center text-sm text-[#62564E]">
            No hours logged yet. Mark any canonical hour as prayed from the Hours screen or above.
          </p>
        ) : (
          <ul className="divide-y divide-[#E8E0D0]">
            {[...prayerLog]
              .reverse()
              .slice(0, 30)
              .map((entry) => (
                <li
                  key={entry.id}
                  className="flex items-center justify-between gap-4 py-3 text-sm"
                >
                  <div className="min-w-0">
                    <span className="font-display font-semibold text-[#1F1815]">
                      {t.hours[entry.hourId].name}
                    </span>
                    <span className="mx-2 text-[#62564E]" aria-hidden="true">
                      ·
                    </span>
                    <span className="text-xs text-[#62564E] tabular-nums">{entry.dateKey}</span>
                    <p className="truncate text-xs italic text-[#9B2330]">
                      {entry.liturgicalTitle}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => onDeleteEntry(entry.id)}
                    aria-label={`Remove ${t.hours[entry.hourId].name} entry on ${entry.dateKey}`}
                    className="inline-flex min-h-[36px] min-w-[36px] items-center justify-center rounded-lg text-[#62564E] hover:bg-[#F3EDE0] hover:text-[#9B2330]"
                  >
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                  </button>
                </li>
              ))}
          </ul>
        )}
      </section>
    </div>
  );
}
