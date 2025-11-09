import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.hopevale.community',
  appName: 'Hopevale Group',
  webDir: 'out',
  server: {
    url: 'https://hopevale-tsvsq.ondigitalocean.app',
    cleartext: true,
  },
  ios: {
    contentInset: 'always',
  },
  plugins: {
    StatusBar: {
      style: 'dark',
      backgroundColor: '#ffffff',
      overlaysWebView: false,
    },
  },
};

export default config;
