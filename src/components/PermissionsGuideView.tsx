import { useState } from 'react';
import { BellRing, Check, ShieldAlert } from 'lucide-react';
import type { TranslationBundle } from '../lib/i18n';
import type { PermissionChecklist } from '../lib/types';
import { PWAInstallCard } from './PWAInstallPanel';

interface PermissionsGuideViewProps {
  permissions: PermissionChecklist;
  t: TranslationBundle;
  onUpdatePermissions: (patch: Partial<PermissionChecklist>) => void;
  onTriggerTestAlarm: () => void;
}

type OemKey = 'stock' | 'samsung' | 'xiaomi' | 'oneplus' | 'huawei';

const OEM_GUIDES: Record<
  OemKey,
  { name: string; steps: string[] }
> = {
  stock: {
    name: 'Stock Android / Pixel',
    steps: [
      'Open Settings → Apps → Divine Office Reminder → Notifications and ensure "Canonical Hour Alarms" is allowed.',
      'Open Settings → Apps → Special app access → Alarms & reminders → enable "Allow setting alarms and reminders" (SCHEDULE_EXACT_ALARM).',
      'Open Settings → Apps → Divine Office Reminder → App battery usage → select "Unrestricted" so Android Doze mode does not delay Matins or Lauds.',
    ],
  },
  samsung: {
    name: 'Samsung Galaxy (One UI)',
    steps: [
      'Open Settings → Apps → Divine Office Reminder → Battery → choose "Unrestricted".',
      'Open Settings → Device care → Battery → Background usage limits → add Divine Office Reminder to "Never auto sleeping apps".',
      'Ensure Alarms & reminders permission is toggled ON under Apps → Special access.',
    ],
  },
  xiaomi: {
    name: 'Xiaomi / Redmi / POCO (HyperOS & MIUI)',
    steps: [
      'Open Settings → Apps → Manage apps → Divine Office Reminder → enable "Autostart" (critical after reboots).',
      'Set Battery saver to "No restrictions".',
      'In App permissions → Other permissions, allow "Show on Lock screen" and "Display pop-up windows while running in the background".',
    ],
  },
  oneplus: {
    name: 'OnePlus / Oppo / Realme (OxygenOS & ColorOS)',
    steps: [
      'Open Settings → Battery → App battery management → Divine Office Reminder → enable "Allow background activity" and "Allow auto-launch".',
      'Disable "Sleep standby optimization" under Advanced battery settings if morning Matins/Lauds alarms are delayed.',
    ],
  },
  huawei: {
    name: 'Huawei (EMUI)',
    steps: [
      'Open Settings → Battery → App launch → find Divine Office Reminder → switch from Automatic to "Manage manually".',
      'Enable all three toggles: Auto-launch, Secondary launch, and Run in background.',
    ],
  },
};

export function PermissionsGuideView({
  permissions,
  t,
  onUpdatePermissions,
  onTriggerTestAlarm,
}: PermissionsGuideViewProps) {
  const [selectedOem, setSelectedOem] = useState<OemKey>('stock');
  const [browserPerm, setBrowserPerm] = useState<string>(() =>
    typeof Notification !== 'undefined' ? Notification.permission : 'unsupported'
  );

  const handleRequestBrowserNotifications = async () => {
    if (typeof Notification === 'undefined') {
      setBrowserPerm('unsupported');
      return;
    }
    try {
      const result = await Notification.requestPermission();
      setBrowserPerm(result);
      if (result === 'granted') {
        onUpdatePermissions({ notificationsGranted: true });
      }
    } catch {
      setBrowserPerm('denied');
    }
  };

  const checklistItems: { key: keyof PermissionChecklist; title: string; desc: string }[] = [
    {
      key: 'notificationsGranted',
      title: '1. Post Notifications (POST_NOTIFICATIONS)',
      desc: 'Allows full-screen alarm banners and lock-screen Pray buttons to appear.',
    },
    {
      key: 'exactAlarmVerified',
      title: '2. Exact Alarms & Reminders (SCHEDULE_EXACT_ALARM)',
      desc: 'Ensures AlarmManager.setAlarmClock() wakes the device at the exact minute.',
    },
    {
      key: 'batteryExemptionVerified',
      title: '3. Unrestricted Battery / Doze Exemption',
      desc: 'Prevents the OS from deferring Matins, Lauds, or Prime overnight.',
    },
    {
      key: 'autostartVerified',
      title: '4. Boot & Time-Zone Rescheduling',
      desc: 'Confirms BOOT_COMPLETED receiver can re-register all 8 alarms after restart.',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="border-b border-[#DDD3C0] pb-5">
        <h1 className="font-display text-2xl font-bold text-[#1F1815] sm:text-3xl">
          Battery &amp; Permissions Guide
        </h1>
        <p className="mt-1 text-sm text-[#62564E]">
          Many smartphones silently block background prayer alarms to save battery. Complete these checks and test your alarm sound below.
        </p>
      </div>

      <PWAInstallCard />

      {/* Live Browser & Audio Verification Box */}
      <section className="rounded-2xl border border-[#B88B2E]/40 bg-[#6B1420] p-6 text-[#FBF8F1] flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs text-[#D4AF5A] font-semibold">
            <ShieldAlert className="h-4 w-4" aria-hidden="true" />
            <span>Live Device Verification</span>
          </div>
          <h2 className="font-display text-xl font-bold">
            Browser Notification Status:{' '}
            <span className="text-[#D4AF5A] capitalize">{browserPerm}</span>
          </h2>
          <p className="text-sm text-[#E7D8C3]">
            Grant notification access for this companion and send a test alarm to verify audio chimes and lock-screen alerts.
          </p>
        </div>

        <div className="flex flex-wrap gap-2.5 shrink-0">
          <button
            type="button"
            onClick={handleRequestBrowserNotifications}
            className="inline-flex min-h-[44px] items-center gap-2 rounded-xl border border-[#FBF8F1]/30 bg-[#5A101A] px-4 py-2 text-xs font-semibold text-[#FBF8F1] hover:bg-[#4B0D16]"
          >
            <span>{t.actions.requestPermission}</span>
          </button>
          <button
            type="button"
            onClick={onTriggerTestAlarm}
            className="inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-[#D4AF5A] px-4 py-2 text-xs font-bold text-[#2A080D] hover:bg-[#E2C275]"
          >
            <BellRing className="h-4 w-4" aria-hidden="true" />
            <span>{t.actions.testAlarm}</span>
          </button>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Interactive Verification Checklist */}
        <section className="lg:col-span-5 rounded-2xl border border-[#DDD3C0] bg-[#FAF6EC] p-5 space-y-4">
          <h2 className="font-display text-lg font-bold text-[#1F1815]">
            Alarm Reliability Checklist
          </h2>
          <div className="space-y-2.5">
            {checklistItems.map((item) => {
              const checked = permissions[item.key];
              return (
                <button
                  key={item.key}
                  type="button"
                  role="checkbox"
                  aria-checked={checked}
                  onClick={() => onUpdatePermissions({ [item.key]: !checked })}
                  className={`flex w-full items-start gap-3 rounded-xl border p-3.5 text-start transition-colors ${
                    checked
                      ? 'border-[#275937]/40 bg-[#F0F4EE]'
                      : 'border-[#DDD3C0] bg-[#FBF8F1] hover:bg-[#F3EDE0]'
                  }`}
                >
                  <span
                    className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border ${
                      checked
                        ? 'border-[#275937] bg-[#275937] text-white'
                        : 'border-[#C9BDA8] bg-white'
                    }`}
                  >
                    {checked && <Check className="h-3.5 w-3.5" aria-hidden="true" />}
                  </span>
                  <span>
                    <span className="block text-sm font-semibold text-[#1F1815]">
                      {item.title}
                    </span>
                    <span className="mt-0.5 block text-xs text-[#62564E]">{item.desc}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        {/* Manufacturer-Specific Battery Guides */}
        <section className="lg:col-span-7 rounded-2xl border border-[#DDD3C0] bg-[#FAF6EC] p-5 space-y-4">
          <h2 className="font-display text-lg font-bold text-[#1F1815]">
            Android Manufacturer Battery Steps
          </h2>

          <div className="flex flex-wrap gap-1.5" role="tablist" aria-label="Device manufacturer">
            {(Object.keys(OEM_GUIDES) as OemKey[]).map((key) => {
              const active = selectedOem === key;
              return (
                <button
                  key={key}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setSelectedOem(key)}
                  className={`min-h-[38px] rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap ${
                    active
                      ? 'bg-[#6B1420] text-[#FBF8F1]'
                      : 'border border-[#DDD3C0] bg-[#FBF8F1] text-[#1F1815] hover:bg-[#F3EDE0]'
                  }`}
                >
                  {OEM_GUIDES[key].name}
                </button>
              );
            })}
          </div>

          <div className="rounded-xl border border-[#DDD3C0] bg-[#FBF8F1] p-4">
            <h3 className="font-display text-base font-bold text-[#4B0D16] mb-3">
              {OEM_GUIDES[selectedOem].name}
            </h3>
            <ol className="space-y-3 list-decimal list-inside text-sm text-[#1F1815] leading-relaxed">
              {OEM_GUIDES[selectedOem].steps.map((step, i) => (
                <li key={i}>{step}</li>
              ))}
            </ol>
          </div>
        </section>
      </div>
    </div>
  );
}
