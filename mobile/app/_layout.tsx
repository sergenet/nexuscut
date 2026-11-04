import { Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import { initializeRevenueCat } from '../lib/revenuecat';
import { supabase } from '../lib/supabase';
import { View, ActivityIndicator } from 'react-native';

export default function Layout() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initializeRevenueCat();

    // Check current session
    supabase.auth.getSession().then(() => {
      setLoading(false);
    });

    // Listen for auth changes
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#f43f5e" />
      </View>
    );
  }

  // Show the main app
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: 'NexusCut', headerShown: false }} />
      <Stack.Screen name="settings" options={{ title: 'Settings', headerShown: false }} />
      <Stack.Screen name="editor" options={{ headerShown: false }} />
      <Stack.Screen name="paywall" options={{ presentation: 'modal', headerShown: false }} />
    </Stack>
  );
}
