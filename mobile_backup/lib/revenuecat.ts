import { Platform } from 'react-native';

const API_KEYS = {
  apple: process.env.EXPO_PUBLIC_RC_APPLE_KEY || 'YOUR_APPLE_API_KEY',
  google: process.env.EXPO_PUBLIC_RC_GOOGLE_KEY || 'YOUR_GOOGLE_API_KEY',
};

export const initializeRevenueCat = () => {
  console.log('[RevenueCat Mock] Initialized for testing in Expo Go');
};

export async function checkProStatus(): Promise<boolean> {
  // Simulate checking RevenueCat subscription
  // Set to true so we can test the FFmpeg engine output without hitting the paywall
  return true;
}
