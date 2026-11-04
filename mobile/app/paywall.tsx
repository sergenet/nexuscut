import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import type { ComponentProps } from 'react';

export default function Paywall() {
  const router = useRouter();

  const handleSubscribe = () => {
    alert("Mobile subscriptions are not available yet. Join the mobile waitlist on nexuscut.io for release updates.");
  };

  const features: Array<{ title: string; desc: string; icon: ComponentProps<typeof Ionicons>['name'] }> = [
    { title: 'Mobile access is not on sale', desc: 'This screen is a development preview, not an active subscription offer.', icon: 'information-circle-outline' },
    { title: 'Export specifications pending', desc: 'Resolution, watermark, and track limits will be published after device testing.', icon: 'videocam-outline' },
    { title: 'Billing integration pending', desc: 'No purchase is created and no paid entitlement is granted from this preview.', icon: 'card-outline' },
  ];

  return (
    <View style={styles.container}>
      {/* Background Gradient */}
      <LinearGradient
        colors={['#064e3b', '#022c22', '#000000']} // Emerald-900 to darker
        style={StyleSheet.absoluteFill}
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.badge}>PRO</Text>
          <Text style={styles.title}>Unlock NexusCut Pro</Text>
          <Text style={styles.subtitle}>Take your video editing to the absolute limit.</Text>
        </View>

        {/* Features List */}
        <View style={styles.featuresContainer}>
          {features.map((item, index) => (
            <View key={index} style={styles.featureItem}>
              <View style={styles.iconContainer}>
                <Ionicons name={item.icon} size={24} color="#10b981" />
              </View>
              <View style={styles.featureTextContainer}>
                <Text style={styles.featureTitle}>{item.title}</Text>
                <Text style={styles.featureDesc}>{item.desc}</Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Sticky Bottom Actions */}
      {Platform.OS === 'ios' ? (
        <BlurView intensity={80} tint="dark" style={styles.bottomBar}>
          <ActionButtons handleSubscribe={handleSubscribe} router={router} />
        </BlurView>
      ) : (
        <View style={[styles.bottomBar, styles.bottomBarAndroid]}>
          <ActionButtons handleSubscribe={handleSubscribe} router={router} />
        </View>
      )}
    </View>
  );
}

const ActionButtons = ({ handleSubscribe, router }: { handleSubscribe: () => void; router: ReturnType<typeof useRouter> }) => (
  <>
    <TouchableOpacity style={styles.subscribeBtn} activeOpacity={0.8} onPress={handleSubscribe}>
      <LinearGradient
        colors={['#10b981', '#059669']}
        style={styles.subscribeGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        <Text style={styles.subscribeText}>Start 7-Day Free Trial</Text>
        <Text style={styles.priceText}>Pricing will be announced before release</Text>
      </LinearGradient>
    </TouchableOpacity>
    
    <TouchableOpacity style={styles.cancelBtn} onPress={() => router.back()}>
      <Text style={styles.cancelText}>Maybe Later</Text>
    </TouchableOpacity>
  </>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  scrollContent: {
    padding: 24,
    paddingTop: 60,
    paddingBottom: 160,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  badge: {
    backgroundColor: '#059669', // Emerald-600
    color: '#fff',
    fontWeight: '900',
    fontSize: 12,
    letterSpacing: 2,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: '900',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 12,
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: 16,
    color: '#a1a1aa',
    textAlign: 'center',
    lineHeight: 24,
  },
  featuresContainer: {
    gap: 24,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.03)',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(16, 185, 129, 0.1)', // Light emerald
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  featureTextContainer: {
    flex: 1,
  },
  featureTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  featureDesc: {
    color: '#a1a1aa',
    fontSize: 14,
    lineHeight: 20,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 24,
    paddingBottom: 40,
  },
  bottomBarAndroid: {
    backgroundColor: 'rgba(0,0,0,0.9)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  subscribeBtn: {
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
    marginBottom: 16,
  },
  subscribeGradient: {
    paddingVertical: 16,
    borderRadius: 100,
    alignItems: 'center',
  },
  subscribeText: {
    color: '#022c22', // Very dark emerald
    fontWeight: '900',
    fontSize: 18,
    marginBottom: 2,
  },
  priceText: {
    color: 'rgba(2, 44, 34, 0.7)',
    fontWeight: '600',
    fontSize: 12,
  },
  cancelBtn: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  cancelText: {
    color: '#a1a1aa',
    fontWeight: '600',
    fontSize: 15,
  },
});
