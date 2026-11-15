import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'org.horaecanonicae.divineoffice',
  appName: 'Horæ Canonicæ',
  webDir: 'dist',
  plugins: {
    LocalNotifications: {
      iconColor: '#6B1420',
      sound: 'cathedral_bell.mp3',
    },
  },
};

export default config;
