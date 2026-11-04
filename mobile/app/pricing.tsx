import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

export default function PricingPage() {
  const router = useRouter();

  const handleSubscribe = async () => {
    alert('Mobile subscriptions are not available. This app is a development preview.');
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
          <Text style={styles.logoText}>NexusCut</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.heroSection}>
          <Text style={styles.heroTitle}>Simple pricing. <Text style={styles.highlight}>Powerful results.</Text></Text>
          <Text style={styles.heroSubtitle}>Mobile billing and entitlements are not available in this development preview.</Text>
        </View>

        <View style={styles.pricingGrid}>
          {/* Free Tier */}
          <View style={styles.pricingCard}>
            <Text style={styles.planName}>Free</Text>
            <Text style={styles.planPrice}>$0</Text>
            <Text style={styles.planSub}>Perfect for: New creators</Text>
            <View style={styles.featuresList}>
              <FeatureItem text="Auto-captions" />
              <FeatureItem text="Prototype editing workflow" />
              <FeatureItem text="Basic subtitle styles" />
              <FeatureItem text="Export behavior still under device testing" />
            </View>
            <TouchableOpacity style={styles.ctaBtnOutline} onPress={() => router.push('/editor')}>
              <Text style={styles.ctaTextOutline}>Start Free</Text>
            </TouchableOpacity>
          </View>

          {/* Pro Tier */}
          <View style={[styles.pricingCard, styles.popularCard]}>
            <View style={styles.popularBadge}><Text style={styles.popularBadgeText}>MOST POPULAR</Text></View>
            <Text style={styles.planName}>Planned paid tier</Text>
            <Text style={styles.planPrice}>TBD</Text>
            <Text style={styles.planSub}>Perfect for: Consistent creators</Text>
            <View style={styles.featuresList}>
              <FeatureItem text="Everything in Free" />
              <FeatureItem text="Specifications not finalized" />
              <FeatureItem text="1080p export" />
              <FeatureItem text="Premium caption animations" />
              <FeatureItem text="Background-removal availability not finalized" />
              <FeatureItem text="Priority processing" />
            </View>
            <TouchableOpacity style={styles.ctaBtnPrimary} onPress={handleSubscribe}>
              <Text style={styles.ctaTextPrimary}>Not available</Text>
            </TouchableOpacity>
          </View>

          {/* Creator+ Tier */}
          <View style={styles.pricingCard}>
            <Text style={styles.planName}>Future tier</Text>
            <Text style={styles.planPrice}>TBD</Text>
            <Text style={styles.planSub}>Perfect for: Serious creators</Text>
            <View style={styles.featuresList}>
              <FeatureItem text="Everything in Pro" />
              <FeatureItem text="Resolution not finalized" />
              <FeatureItem text="Batch processing" />
              <FeatureItem text="Brand presets" />
              <FeatureItem text="Caption & Bg style packs" />
              <FeatureItem text="Auto-hook generator" />
            </View>
            <TouchableOpacity style={styles.ctaBtnOutline} onPress={handleSubscribe}>
              <Text style={styles.ctaTextOutline}>Not available</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Guarantee Section */}
        <View style={styles.guaranteeSection}>
          <Ionicons name="shield-checkmark" size={32} color="#00E0FF" />
          <Text style={styles.guaranteeText}>Cancel anytime • No hidden fees • 7-day refund policy</Text>
        </View>

      </ScrollView>
    </View>
  );
}

function FeatureItem({ text }: { text: string }) {
  return (
    <View style={styles.featureItem}>
      <Ionicons name="checkmark" size={20} color="#00E0FF" />
      <Text style={styles.featureText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F0F0F' },
  header: { flexDirection: 'row', alignItems: 'center', padding: 24, borderBottomWidth: 1, borderColor: '#1A1A1A' },
  backBtn: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  logoText: { color: '#fff', fontSize: 24, fontWeight: '900', letterSpacing: -0.5 },
  scrollContent: { flexGrow: 1, alignItems: 'center', paddingBottom: 64, paddingHorizontal: 24 },
  heroSection: { paddingVertical: 60, alignItems: 'center' },
  heroTitle: { color: '#fff', fontSize: width > 768 ? 48 : 36, fontWeight: '900', textAlign: 'center', marginBottom: 16 },
  highlight: { color: '#00E0FF' },
  heroSubtitle: { color: '#a1a1aa', fontSize: 18, textAlign: 'center' },
  pricingGrid: { flexDirection: width > 768 ? 'row' : 'column', gap: 24, width: '100%', maxWidth: 1100 },
  pricingCard: { flex: 1, backgroundColor: '#1A1A1A', borderRadius: 16, padding: 32, borderWidth: 1, borderColor: '#27272a', position: 'relative' },
  popularCard: { borderColor: '#00E0FF', backgroundColor: '#162128' },
  popularBadge: { position: 'absolute', top: -12, alignSelf: 'center', backgroundColor: '#00E0FF', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },
  popularBadgeText: { color: '#000', fontSize: 12, fontWeight: 'bold' },
  planName: { color: '#fff', fontSize: 24, fontWeight: 'bold', marginBottom: 8 },
  planPrice: { color: '#fff', fontSize: 48, fontWeight: '900', marginBottom: 8 },
  priceInterval: { fontSize: 18, color: '#a1a1aa' },
  planSub: { color: '#a1a1aa', fontSize: 14, marginBottom: 24 },
  featuresList: { gap: 16, marginBottom: 32, flex: 1 },
  featureItem: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  featureText: { color: '#fff', fontSize: 16 },
  ctaBtnOutline: { borderWidth: 1, borderColor: '#333', paddingVertical: 16, borderRadius: 8, alignItems: 'center' },
  ctaTextOutline: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  ctaBtnPrimary: { backgroundColor: '#00E0FF', paddingVertical: 16, borderRadius: 8, alignItems: 'center' },
  ctaTextPrimary: { color: '#000', fontSize: 16, fontWeight: 'bold' },
  guaranteeSection: { flexDirection: 'row', alignItems: 'center', gap: 16, marginTop: 64, backgroundColor: '#1A1A1A', padding: 24, borderRadius: 12, borderWidth: 1, borderColor: '#27272a' },
  guaranteeText: { color: '#fff', fontSize: 16, fontWeight: '600' }
});
