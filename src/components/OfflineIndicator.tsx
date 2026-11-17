import { WifiOff } from 'lucide-react';
import { useOnlineStatus } from '../lib/useOnlineStatus';

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
