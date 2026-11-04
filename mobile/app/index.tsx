import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

export default function LandingPage() {
  const router = useRouter();

  const handleStartEditing = () => {
    router.push('/editor');
  };

  const handlePricing = () => {
    router.push('/pricing');
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.logoText}>NexusCut</Text>
        <View style={styles.headerNav}>
          <TouchableOpacity style={styles.navLink} onPress={handlePricing}>
            <Text style={styles.navText}>Pricing</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerBtn} onPress={handleStartEditing}>
            <Text style={styles.headerBtnText}>Start Free</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <View style={styles.glowOrb1} />
          <View style={styles.glowOrb2} />
          
          <Text style={styles.heroTitle}>
            Edit Faster. Create More. <Text style={styles.highlight}>Grow Quicker.</Text>
          </Text>
          <Text style={styles.heroSubtitle}>
            NexusCut is a video editor for TikTok, Shorts, and Reels. Import clips, build a timeline, generate captions, remove backgrounds, and export your edit.
          </Text>
          
          <View style={styles.ctaRow}>
            <TouchableOpacity style={styles.ctaBtn} onPress={handleStartEditing}>
              <Text style={styles.ctaText}>Start Editing Free</Text>
              <Ionicons name="arrow-forward" size={20} color="#000" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.secondaryBtn} onPress={() => {}}>
              <Text style={styles.secondaryBtnText}>Watch Demo</Text>
              <Ionicons name="play-circle-outline" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
          <Text style={styles.microText}>No credit card required.</Text>
        </View>

        {/* Why Creators Love NexusCut Section */}
        <View style={styles.featuresSection}>
          <Text style={styles.sectionTitle}>Why Creators Love NexusCut</Text>
          <View style={styles.featuresGrid}>
            <View style={styles.featureCard}>
              <Ionicons name="text" size={32} color="#00E0FF" />
              <Text style={styles.featureTitle}>Auto-Captions That Boost Retention</Text>
              <Text style={styles.featureDesc}>A planned word-timed caption workflow. Accuracy and audience response will vary.</Text>
            </View>
            
            <View style={styles.featureCard}>
              <Ionicons name="cut" size={32} color="#FF2D55" />
              <Text style={styles.featureTitle}>AI Background Removal</Text>
              <Text style={styles.featureDesc}>No green screen. No setup. Just clean, professional backgrounds instantly applied.</Text>
            </View>

            <View style={styles.featureCard}>
              <Ionicons name="phone-portrait" size={32} color="#10b981" />
              <Text style={styles.featureTitle}>Export Perfect Vertical Videos</Text>
              <Text style={styles.featureDesc}>Optimized for TikTok, Shorts, and Reels every time with precision controls and multi-track layering.</Text>
            </View>
          </View>
        </View>

        {/* Social Proof */}
        <View style={styles.socialProof}>
          <Text style={styles.socialProofTitle}>Trusted by 10,000+ creators</Text>
          <Text style={styles.socialProofSub}>Over 1M videos edited. Used by podcasters, gamers, coaches, and influencers.</Text>
        </View>
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>© 2026 NexusCut. All rights reserved.</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F0F0F' },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: 24, borderBottomWidth: 1, borderColor: '#1A1A1A', backgroundColor: 'rgba(15,15,15,0.9)', zIndex: 10,
  },
  logoText: { color: '#fff', fontSize: 24, fontWeight: '900', letterSpacing: -0.5 },
  headerNav: { flexDirection: 'row', alignItems: 'center', gap: 24 },
  navLink: {},
  navText: { color: '#a1a1aa', fontSize: 16, fontWeight: '600' },
  headerBtn: { backgroundColor: '#18181b', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8, borderWidth: 1, borderColor: '#27272a' },
  headerBtnText: { color: '#fff', fontWeight: '600', fontSize: 14 },
  scrollContent: { flexGrow: 1, alignItems: 'center', paddingBottom: 64 },
  heroSection: { paddingVertical: 120, paddingHorizontal: 24, alignItems: 'center', maxWidth: 900, width: '100%', position: 'relative' },
  glowOrb1: { position: 'absolute', top: 50, left: '10%', width: 300, height: 300, borderRadius: 150, backgroundColor: 'rgba(0,224,255,0.15)', ...Platform.select({ web: { filter: 'blur(80px)' } }) },
  glowOrb2: { position: 'absolute', bottom: -50, right: '10%', width: 250, height: 250, borderRadius: 125, backgroundColor: 'rgba(255,45,85,0.15)', ...Platform.select({ web: { filter: 'blur(80px)' } }) },
  heroTitle: { color: '#fff', fontSize: width > 768 ? 64 : 42, fontWeight: '900', textAlign: 'center', letterSpacing: -1.5, marginBottom: 24 },
  highlight: { color: '#00E0FF' },
  heroSubtitle: { color: '#a1a1aa', fontSize: width > 768 ? 22 : 16, textAlign: 'center', maxWidth: 700, lineHeight: 32, marginBottom: 48 },
  ctaRow: { flexDirection: 'row', gap: 16, marginBottom: 16 },
  ctaBtn: { backgroundColor: '#00E0FF', flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 32, paddingVertical: 16, borderRadius: 12, shadowColor: '#00E0FF', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 24, elevation: 8 },
  ctaText: { color: '#000', fontSize: 18, fontWeight: 'bold' },
  secondaryBtn: { backgroundColor: 'transparent', borderWidth: 1, borderColor: '#333', flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 32, paddingVertical: 16, borderRadius: 12 },
  secondaryBtnText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  microText: { color: '#52525b', fontSize: 14 },
  sectionTitle: { color: '#fff', fontSize: 32, fontWeight: 'bold', textAlign: 'center', marginBottom: 40 },
  featuresSection: { paddingHorizontal: 24, maxWidth: 1200, width: '100%', marginTop: 40, alignItems: 'center' },
  featuresGrid: { flexDirection: width > 768 ? 'row' : 'column', gap: 24, width: '100%' },
  featureCard: { flex: 1, backgroundColor: '#1A1A1A', padding: 32, borderRadius: 16, borderWidth: 1, borderColor: '#27272a', alignItems: 'flex-start' },
  featureTitle: { color: '#fff', fontSize: 20, fontWeight: 'bold', marginTop: 16, marginBottom: 8 },
  featureDesc: { color: '#a1a1aa', fontSize: 15, lineHeight: 24 },
  socialProof: { marginTop: 80, alignItems: 'center', paddingHorizontal: 24 },
  socialProofTitle: { color: '#fff', fontSize: 24, fontWeight: 'bold', marginBottom: 8 },
  socialProofSub: { color: '#a1a1aa', fontSize: 16, textAlign: 'center' },
  footer: { padding: 32, alignItems: 'center', borderTopWidth: 1, borderColor: '#1A1A1A', backgroundColor: '#0F0F0F', width: '100%' },
  footerText: { color: '#52525b', fontSize: 14 }
});
