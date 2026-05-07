import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.jagoumkm.app',
  appName: 'Jago UMKM',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;
