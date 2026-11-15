import { useEffect, useState } from 'react';
import { BellOff, CheckCircle2, Clock, ExternalLink, SkipForward } from 'lucide-react';
import type { TranslationBundle } from '../lib/i18n';
import type { ActiveAlarmState } from '../lib/types';
import { CrossEmblem, LiturgicalColorSwatch } from './CrossEmblem';

interface AlarmOverlayProps {
  alarm: ActiveAlarmState;
  defaultSnoozeMinutes: number;
  language: 'en' | 'la' | 'fa';
  t: TranslationBundle;
  onStop: () => void;
  onSnooze: (minutes: number) => void;
  onSkipToday: () => void;
  onMarkPrayedAndStop: () => void;
}

export function AlarmOverlay({
  alarm,
  defaultSnoozeMinutes,
  language,
  t,
  onStop,
  onSnooze,
  onSkipToday,
  onMarkPrayedAndStop,
}: AlarmOverlayProps) {
  const [snoozeMinutes, setSnoozeMinutes] = useState(defaultSnoozeMinutes);
  const [remainingSeconds, setRemainingSeconds] = useState(() =>
    Math.max(0, Math.ceil((alarm.autoStopAtMs - Date.now()) / 1000))
  );

  useEffect(() => {
    const timer = window.setInterval(() => {
      const left = Math.max(0, Math.ceil((alarm.autoStopAtMs - Date.now()) / 1000));
      setRemainingSeconds(left);
      if (left <= 0) {
        onStop();
      }
    }, 500);
    return () => window.clearInterval(timer);
  }, [alarm.autoStopAtMs, onStop]);

  const mins = Math.floor(remainingSeconds / 60);
  const secs = remainingSeconds % 60;
  const countdownText = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

  const dayTitle =
    language === 'la'
      ? alarm.liturgicalDay.latinTitle
      : language === 'fa'
      ? alarm.liturgicalDay.persianTitle
      : alarm.liturgicalDay.englishTitle;

  const isCanonicalHour =
    alarm.hourId !== 'test' && alarm.hourId !== 'angelus' && alarm.hourId !== 'rosary';

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="alarm-dialog-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#23060B]/85 p-4 backdrop-blur-sm"
    >
      <div className="w-full max-w-lg rounded-2xl border border-[#B88B2E]/50 bg-[#4B0D16] p-6 text-[#FBF8F1] shadow-2xl sm:p-8">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <CrossEmblem size={48} />
            <div>
              <p className="text-xs font-medium tracking-wide text-[#D4AF5A]">
                {alarm.isTest ? 'Test Bell · 1960 Rubrics' : t.labels.rubrics1960}
              </p>
              <h2
                id="alarm-dialog-title"
                className="font-display text-2xl font-bold text-[#FBF8F1] sm:text-3xl"
              >
                {alarm.label}
              </h2>
              <p className="text-sm italic text-[#E7D8C3]">{alarm.latinLabel}</p>
            </div>
          </div>

          <div className="text-end tabular-nums">
            <span className="block text-[11px] text-[#E7D8C3]/80">Auto-stop</span>
            <span className="font-display text-lg font-semibold text-[#D4AF5A]">
              {countdownText}
            </span>
          </div>
        </div>

        <div className="my-5 border-y border-[#B88B2E]/30 py-4">
          {!alarm.liturgicalDay.isTriduum ? (
            <p className="font-display text-base italic text-[#F7E8C8]">
              ℣. {t.openingVersicle}
              <br />
              <span className="text-sm text-[#E7D8C3]">℟. {t.openingResponse}</span>
            </p>
          ) : (
            <p className="text-sm italic text-[#F7E8C8]">
              {alarm.liturgicalDay.rubricNote}
            </p>
          )}
        </div>

        <div className="mb-6 space-y-1.5 text-sm text-[#F3EDE0]">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className="font-semibold text-[#D4AF5A]">{dayTitle}</span>
            <span aria-hidden="true">·</span>
            <span>
              {t.labels.classLabel} {alarm.liturgicalDay.liturgicalClass}
            </span>
            <span aria-hidden="true">·</span>
            <LiturgicalColorSwatch
              color={alarm.liturgicalDay.color}
              label={t.colors[alarm.liturgicalDay.color]}
            />
          </div>
          {alarm.isAnticipated && (
            <p className="text-xs text-[#D4AF5A]">{t.labels.anticipatedTomorrow}</p>
          )}
          <p className="text-xs text-[#E7D8C3]/80">{t.labels.autoStopNote}</p>
        </div>

        {/* Primary Action: Open Divinum Officium */}
        <div className="space-y-3">
          <a
            href={alarm.divinumUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={onMarkPrayedAndStop}
            className="flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl bg-[#D4AF5A] px-5 py-3 text-sm font-bold text-[#2A080D] transition-colors hover:bg-[#E2C275] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            <span>{t.actions.prayNow}</span>
            <ExternalLink className="h-4 w-4" aria-hidden="true" />
          </a>

          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            <button
              type="button"
              onClick={onStop}
              className="flex min-h-[44px] items-center justify-center gap-2 rounded-xl border border-[#FBF8F1]/30 bg-[#6B1420] px-4 py-2.5 text-sm font-semibold text-[#FBF8F1] transition-colors hover:bg-[#7D1A28]"
            >
              <BellOff className="h-4 w-4" aria-hidden="true" />
              <span>{t.actions.stopAlarm}</span>
            </button>

            {isCanonicalHour && (
              <button
                type="button"
                onClick={onMarkPrayedAndStop}
                className="flex min-h-[44px] items-center justify-center gap-2 rounded-xl border border-[#D4AF5A]/40 bg-[#5A101A] px-4 py-2.5 text-sm font-semibold text-[#F7E8C8] transition-colors hover:bg-[#6B1420]"
              >
                <CheckCircle2 className="h-4 w-4 text-[#D4AF5A]" aria-hidden="true" />
                <span>{t.actions.markPrayed}</span>
              </button>
            )}
          </div>

          {/* Snooze + Skip Today Controls */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[#B88B2E]/25">
            <div className="flex items-center gap-2">
              <label htmlFor="alarm-snooze-select" className="text-xs text-[#E7D8C3]">
                {t.actions.snooze}:
              </label>
              <select
                id="alarm-snooze-select"
                value={snoozeMinutes}
                onChange={(e) => setSnoozeMinutes(Number(e.target.value))}
                className="min-h-[40px] rounded-lg border border-[#B88B2E]/40 bg-[#3B0A11] px-2.5 py-1 text-xs text-[#FBF8F1] tabular-nums"
              >
                <option value={5}>5 min</option>
                <option value={10}>10 min</option>
                <option value={15}>15 min</option>
                <option value={30}>30 min</option>
                <option value={60}>60 min</option>
              </select>
              <button
                type="button"
                onClick={() => onSnooze(snoozeMinutes)}
                className="inline-flex min-h-[40px] items-center gap-1.5 rounded-lg border border-[#B88B2E]/50 bg-[#5A101A] px-3 py-1.5 text-xs font-semibold text-[#FBF8F1] hover:bg-[#6B1420]"
              >
                <Clock className="h-3.5 w-3.5 text-[#D4AF5A]" aria-hidden="true" />
                <span>
                  {t.actions.snooze} {snoozeMinutes}m
                </span>
              </button>
            </div>

            {isCanonicalHour && (
              <button
                type="button"
                onClick={onSkipToday}
                className="inline-flex min-h-[40px] items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-[#E7D8C3] hover:bg-[#5A101A] hover:text-white"
              >
                <SkipForward className="h-3.5 w-3.5" aria-hidden="true" />
                <span>{t.actions.skipToday}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
