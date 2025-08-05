import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.13abb20806c044c79226b09f923b759d',
  appName: 'kimera-creative-canvas',
  webDir: 'dist',
  server: {
    url: 'https://13abb208-06c0-44c7-9226-b09f923b759d.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    Camera: {
      permissions: ['camera', 'photos']
    }
  }
};

export default config;