import { BellRing, BookOpenCheck, CalendarDays, Clock, ShieldCheck, SlidersHorizontal } from 'lucide-react';
import type { TranslationBundle } from '../lib/i18n';
import { CrossEmblem } from './CrossEmblem';

export type AppTab = 'hours' | 'calendar' | 'log' | 'permissions' | 'settings';

interface TopBarProps {
  activeTab: AppTab;
  onSelectTab: (tab: AppTab) => void;
  onTriggerTestAlarm: () => void;
  t: TranslationBundle;
}

export function TopBar({
  activeTab,
  onSelectTab,
  onTriggerTestAlarm,
  t,
}: TopBarProps) {
  const navItems: { id: AppTab; label: string; Icon: typeof Clock }[] = [
    { id: 'hours', label: t.nav.hours, Icon: Clock },
    { id: 'calendar', label: t.nav.calendar, Icon: CalendarDays },
    { id: 'log', label: t.nav.log, Icon: BookOpenCheck },
    { id: 'permissions', label: t.nav.permissions, Icon: ShieldCheck },
    { id: 'settings', label: t.nav.settings, Icon: SlidersHorizontal },
  ];

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-[#DDD3C0] bg-[#FBF8F1]/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-8 px-4 py-2.5 sm:px-6 md:py-3">
          {/* Zone 1: Brand Title */}
          <button
            type="button"
            onClick={() => onSelectTab('hours')}
            className="flex items-center gap-3 text-start whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6B1420]"
          >
            <CrossEmblem size={34} />
            <span className="font-display text-lg font-semibold tracking-tight text-[#4B0D16] sm:text-xl">
              {t.appTitle}
            </span>
          </button>

          {/* Zone 2: 5 Single-Line Nav Links (Desktop) */}
          <nav
            aria-label="Primary"
            className="hidden md:flex items-center gap-6 text-sm font-medium text-[#62564E]"
          >
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onSelectTab(item.id)}
                  aria-current={isActive ? 'page' : undefined}
                  className={`relative py-1.5 transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6B1420] ${
                    isActive
                      ? 'text-[#4B0D16] font-semibold'
                      : 'hover:text-[#1F1815]'
                  }`}
                >
                  {item.label}
                  {isActive && (
                    <span
                      aria-hidden="true"
                      className="absolute inset-x-0 -bottom-[13px] h-0.5 bg-[#6B1420]"
                    />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Zone 3: 1 Primary CTA */}
          <div className="flex items-center shrink-0">
            <button
              type="button"
              onClick={onTriggerTestAlarm}
              className="inline-flex min-h-[40px] items-center gap-2 rounded-lg bg-[#6B1420] px-4 py-2 text-xs font-semibold text-[#FBF8F1] transition-colors hover:bg-[#4B0D16] active:scale-[0.98] whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#B88B2E]"
            >
              <BellRing className="h-3.5 w-3.5 text-[#D4AF5A]" aria-hidden="true" />
              <span>{t.actions.testAlarm}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Bottom Thumb-Zone Navigation (stays <= 64px, combined sticky <= 14% of 844px) */}
      <nav
        aria-label="Mobile navigation"
        className="fixed bottom-0 left-0 right-0 z-30 border-t border-[#DDD3C0] bg-[#FBF8F1]/95 backdrop-blur-md md:hidden"
      >
        <div className="grid grid-cols-5 h-16">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            const Icon = item.Icon;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectTab(item.id)}
                aria-current={isActive ? 'page' : undefined}
                className={`flex min-h-[44px] flex-col items-center justify-center gap-1 px-1 text-[11px] transition-colors ${
                  isActive
                    ? 'font-semibold text-[#6B1420]'
                    : 'font-medium text-[#62564E] hover:text-[#1F1815]'
                }`}
              >
                <Icon className="h-5 w-5" aria-hidden="true" />
                <span className="truncate max-w-full">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
}
