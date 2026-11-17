import { useEffect, useState } from 'react';
import { BookOpen, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { ROSARY_MYSTERIES, type RosaryMysterySet } from '../lib/rosaryMysteries';
import { CrossEmblem } from './CrossEmblem';

interface RosaryReaderModalProps {
  mysteryOfTheDay: RosaryMysterySet;
  onClose: () => void;
}

export function RosaryReaderModal({
  mysteryOfTheDay,
  onClose,
}: RosaryReaderModalProps) {
  const [selectedSet, setSelectedSet] = useState<RosaryMysterySet>(mysteryOfTheDay);
  const [decadeIndex, setDecadeIndex] = useState(0); // 0..4

  const setInfo = ROSARY_MYSTERIES[selectedSet];
  const decade = setInfo.decades[decadeIndex];

  const handleSelectSet = (nextSet: RosaryMysterySet) => {
    setSelectedSet(nextSet);
    setDecadeIndex(0);
  };

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="rosary-reader-title"
      className="overlay-scroll-region fixed inset-0 z-50 overflow-y-auto overscroll-contain bg-[#23060B]/80 px-3 py-3 backdrop-blur-sm sm:p-4"
      style={{
        paddingTop: 'max(0.75rem, env(safe-area-inset-top))',
        paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))',
      }}
    >
      <div className="flex min-h-full items-center justify-center">
        <div className="my-auto flex max-h-[calc(100dvh-2rem)] min-h-0 w-full max-w-xl flex-col overflow-hidden rounded-2xl border border-[#B88B2E]/50 bg-[#FBF8F1] text-[#1F1815] shadow-2xl">
          {/* Burgundy Header */}
          <div className="shrink-0 bg-[#5A101A] px-5 py-4 text-[#FBF8F1] sm:px-6 flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <CrossEmblem size={38} />
              <div>
                <p className="text-[11px] font-medium text-[#D4AF5A]">
                  {selectedSet === mysteryOfTheDay
                    ? 'Mystery of the Day · 1962 Tradition'
                    : 'Traditional Rosary'}
                </p>
                <h2 id="rosary-reader-title" className="font-display text-lg font-bold sm:text-xl">
                  {setInfo.name}
                </h2>
                <p className="text-xs italic text-[#E7D8C3]">{setInfo.latinName}</p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              aria-label="Close Rosary reader"
              className="inline-flex min-h-[40px] min-w-[40px] items-center justify-center rounded-lg text-[#E7D8C3] hover:bg-[#4B0D16] hover:text-white"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>

          {/* Mystery Set Switcher & Decade Progress */}
          <div className="shrink-0 border-b border-[#DDD3C0] bg-[#F3EDE0] px-5 py-3 sm:px-6 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap gap-1">
              {(['joyful', 'sorrowful', 'glorious'] as RosaryMysterySet[]).map((key) => {
                const active = selectedSet === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => handleSelectSet(key)}
                    aria-pressed={active}
                    className={`min-h-[34px] rounded-lg px-2.5 py-1 text-xs font-semibold capitalize transition-colors ${
                      active
                        ? 'bg-[#6B1420] text-[#FBF8F1]'
                        : 'border border-[#DDD3C0] bg-[#FBF8F1] text-[#1F1815] hover:bg-[#EAE1CE]'
                    }`}
                  >
                    {key}
                    {key === mysteryOfTheDay ? ' (Today)' : ''}
                  </button>
                );
              })}
            </div>

            {/* Step Dots 1..5 */}
            <div className="flex items-center gap-1" role="tablist" aria-label="Decade selector">
              {setInfo.decades.map((d, idx) => {
                const active = idx === decadeIndex;
                return (
                  <button
                    key={d.number}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    aria-label={`Decade ${d.number}`}
                    onClick={() => setDecadeIndex(idx)}
                    className={`h-8 w-8 rounded-lg text-xs font-bold tabular-nums transition-colors ${
                      active
                        ? 'bg-[#6B1420] text-[#D4AF5A]'
                        : 'border border-[#DDD3C0] bg-[#FBF8F1] text-[#62564E] hover:text-[#1F1815]'
                    }`}
                  >
                    {d.number}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Single-Decade Page Content */}
          <div className="modal-scroll-region min-h-0 flex-1 p-5 sm:p-7 space-y-5">
            <div className="space-y-1">
              <p className="text-xs font-semibold text-[#9B2330] tabular-nums">
                Decade {decade.number} of 5
              </p>
              <h3 className="font-display text-2xl font-bold text-[#1F1815] text-balance">
                {decade.title}
              </h3>
              <p className="text-sm italic text-[#62564E]">{decade.latinTitle}</p>
            </div>

            {/* Short Bible Reading */}
            <div className="rounded-xl border border-[#DDD3C0] bg-[#FAF6EC] p-4 sm:p-5 space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-[#6B1420]">
                <BookOpen className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span>Scripture Reading · {decade.scriptureRef}</span>
              </div>
              <blockquote className="text-base leading-relaxed text-[#1F1815] max-w-prose">
                “{decade.scriptureReading}”
              </blockquote>
            </div>

            {/* Traditional Fruit */}
            <div className="rounded-xl border border-[#B88B2E]/40 bg-[#F3EDE0]/70 px-4 py-3 flex flex-wrap items-baseline justify-between gap-2">
              <span className="text-xs font-semibold text-[#62564E]">
                Traditional Fruit of the Mystery
              </span>
              <span className="font-display text-base font-bold text-[#4B0D16]">
                {decade.fruit}
              </span>
            </div>

            <p className="text-xs text-[#62564E] italic">
              Pray 1 Pater Noster, 10 Ave Marias, and 1 Gloria Patri while contemplating this mystery.
            </p>
          </div>

          {/* Footer Navigation: Previous / Next */}
          <div className="shrink-0 border-t border-[#DDD3C0] bg-[#FAF6EC] px-5 py-4 sm:px-6 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => setDecadeIndex((i) => Math.max(0, i - 1))}
              disabled={decadeIndex === 0}
              className="inline-flex min-h-[44px] items-center gap-1.5 rounded-xl border border-[#DDD3C0] bg-[#FBF8F1] px-4 py-2 text-sm font-semibold text-[#1F1815] hover:bg-[#F3EDE0] disabled:opacity-40"
            >
              <ChevronLeft className="h-4 w-4" aria-hidden="true" />
              <span>Previous</span>
            </button>

            {decadeIndex < 4 ? (
              <button
                type="button"
                onClick={() => setDecadeIndex((i) => Math.min(4, i + 1))}
                className="inline-flex min-h-[44px] items-center gap-1.5 rounded-xl bg-[#6B1420] px-5 py-2 text-sm font-semibold text-[#FBF8F1] hover:bg-[#4B0D16]"
              >
                <span>Next Decade</span>
                <ChevronRight className="h-4 w-4" aria-hidden="true" />
              </button>
            ) : (
              <button
                type="button"
                onClick={onClose}
                className="inline-flex min-h-[44px] items-center gap-1.5 rounded-xl bg-[#6B1420] px-5 py-2 text-sm font-semibold text-[#D4AF5A] hover:bg-[#4B0D16]"
              >
                <span>Finish (Salve Regina)</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
