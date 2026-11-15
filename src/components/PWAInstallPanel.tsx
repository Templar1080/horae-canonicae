import { useState } from 'react';
import { Download, Smartphone, WifiOff } from 'lucide-react';
import { useOnlineStatus, usePWAInstall } from '../lib/usePWAInstall';

export function PWAInstallCard() {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showSteps, setShowSteps] = useState(false);

  if (isInstalled) {
    return (
      <div className="rounded-2xl border border-[#DDD3C0] bg-[#FAF6EC] p-5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Smartphone className="h-5 w-5 text-[#275937] shrink-0" aria-hidden="true" />
          <div>
            <h2 className="font-display text-base font-bold text-[#1F1815]">
              Installed on Device
            </h2>
            <p className="text-xs text-[#62564E]">
              Running in standalone app mode with offline solar &amp; 1960 liturgical calendar support.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <section className="rounded-2xl border border-[#B88B2E]/50 bg-[#FAF6EC] p-5 space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#9B2330]">
            <Smartphone className="h-4 w-4" aria-hidden="true" />
            <span>Install on Phone (PWA)</span>
          </div>
          <h2 className="font-display text-lg font-bold text-[#1F1815]">
            Add Horæ Canonicæ to Your Home Screen
          </h2>
          <p className="text-sm text-[#62564E]">
            Install directly from your mobile browser for full-screen launch, offline solar times, and offline 1960 calendar access.
          </p>
        </div>

        <div className="flex flex-wrap gap-2.5 shrink-0">
          {isInstallable ? (
            <button
              type="button"
              onClick={() => void install()}
              className="inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-[#6B1420] px-5 py-2.5 text-sm font-semibold text-[#FBF8F1] hover:bg-[#4B0D16] whitespace-nowrap"
            >
              <Download className="h-4 w-4 text-[#D4AF5A]" aria-hidden="true" />
              <span>Install App</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setShowSteps((v) => !v)}
              aria-expanded={showSteps}
              className="inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-[#6B1420] px-5 py-2.5 text-sm font-semibold text-[#FBF8F1] hover:bg-[#4B0D16] whitespace-nowrap"
            >
              <Download className="h-4 w-4 text-[#D4AF5A]" aria-hidden="true" />
              <span>{isIOS ? 'Install on iPhone / iPad' : 'How to Install on Phone'}</span>
            </button>
          )}
        </div>
      </div>

      {showSteps && (
        <div className="grid grid-cols-1 gap-4 border-t border-[#DDD3C0] pt-4 sm:grid-cols-2 text-xs text-[#1F1815] leading-relaxed">
          <div className="rounded-xl border border-[#DDD3C0] bg-[#FBF8F1] p-4 space-y-2">
            <h3 className="font-display text-sm font-bold text-[#4B0D16]">
              Android (Chrome / Edge / Brave)
            </h3>
            <ol className="list-decimal list-inside space-y-1.5 text-[#62564E]">
              <li>Open the app URL in Chrome on your Android phone.</li>
              <li>Tap the browser menu (<strong className="text-[#1F1815]">⋮</strong>) in the top right.</li>
              <li>Tap <strong className="text-[#1F1815]">Add to Home screen</strong> or <strong className="text-[#1F1815]">Install app</strong>.</li>
              <li>Confirm <strong className="text-[#1F1815]">Install</strong> to add the gold cross icon to your launcher.</li>
            </ol>
          </div>

          <div className="rounded-xl border border-[#DDD3C0] bg-[#FBF8F1] p-4 space-y-2">
            <h3 className="font-display text-sm font-bold text-[#4B0D16]">
              iPhone / iPad (Safari)
            </h3>
            <ol className="list-decimal list-inside space-y-1.5 text-[#62564E]">
              <li>Open the app URL in <strong className="text-[#1F1815]">Safari</strong>.</li>
              <li>Tap the <strong className="text-[#1F1815]">Share</strong> icon at the bottom of the screen.</li>
              <li>Scroll down and tap <strong className="text-[#1F1815]">Add to Home Screen</strong>.</li>
              <li>Tap <strong className="text-[#1F1815]">Add</strong> in the upper right corner.</li>
            </ol>
          </div>
        </div>
      )}
    </section>
  );
}

export function OfflineIndicator() {
  const isOnline = useOnlineStatus();
  if (isOnline) return null;

  return (
    <div
      role="status"
      className="fixed bottom-20 left-4 z-40 inline-flex items-center gap-2 rounded-xl border border-[#B88B2E]/50 bg-[#4B0D16] px-3.5 py-2 text-xs font-medium text-[#FBF8F1] shadow-lg md:bottom-4"
    >
      <WifiOff className="h-3.5 w-3.5 text-[#D4AF5A]" aria-hidden="true" />
      <span>Offline Mode · Solar &amp; 1960 Calendar active</span>
    </div>
  );
}
