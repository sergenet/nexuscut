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

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.logoText}>NexusCut Pro</Text>
        <TouchableOpacity style={styles.headerBtn} onPress={handleStartEditing}>
          <Text style={styles.headerBtnText}>Launch Editor</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <View style={styles.glowOrb1} />
          <View style={styles.glowOrb2} />
          
          <Text style={styles.heroTitle}>
            Browser-based Video Editing, <Text style={styles.highlight}>Evolved.</Text>
          </Text>
          <Text style={styles.heroSubtitle}>
            Professional video editing running entirely in your browser. Blazing fast WASM rendering, one-click AI rotoscoping, and secure cloud sync. No installation required.
          </Text>
          
          <TouchableOpacity style={styles.ctaBtn} onPress={handleStartEditing}>
            <Text style={styles.ctaText}>Start Editing — It's Free</Text>
            <Ionicons name="arrow-forward" size={20} color="#000" />
          </TouchableOpacity>
        </View>

        {/* Features Section */}
        <View style={styles.featuresSection}>
          <View style={styles.featureCard}>
            <Ionicons name="flash" size={32} color="#38bdf8" />
            <Text style={styles.featureTitle}>Lightning Fast</Text>
            <Text style={styles.featureDesc}>Powered by FFmpeg WebCodecs and WASM, your timeline scrubs smoothly and renders directly on your hardware.</Text>
          </View>
          
          <View style={styles.featureCard}>
            <Ionicons name="color-wand" size={32} color="#a855f7" />
            <Text style={styles.featureTitle}>AI-Powered</Text>
            <Text style={styles.featureDesc}>Extract subjects from backgrounds or auto-generate Whisper captions with a single click in your timeline.</Text>
          </View>

          <View style={styles.featureCard}>
            <Ionicons name="cloud-done" size={32} color="#10b981" />
            <Text style={styles.featureTitle}>Cloud Sync</Text>
            <Text style={styles.featureDesc}>Securely save your project state to the cloud and resume your mathematical timeline on any device.</Text>
          </View>
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
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    borderBottomWidth: 1,
    borderColor: '#18181b',
    backgroundColor: 'rgba(0,0,0,0.8)',
    zIndex: 10,
  },
  logoText: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
    letterSpacing: -0.5,
  },
  headerBtn: {
    backgroundColor: '#18181b',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#27272a',
  },
  headerBtnText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: 'center',
    paddingBottom: 64,
  },
  heroSection: {
    paddingVertical: 120,
    paddingHorizontal: 24,
    alignItems: 'center',
    maxWidth: 900,
    width: '100%',
    position: 'relative',
  },
  glowOrb1: {
    position: 'absolute',
    top: 50,
    left: '20%',
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(56,189,248,0.15)',
    filter: 'blur(80px)',
  },
  glowOrb2: {
    position: 'absolute',
    bottom: -50,
    right: '20%',
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: 'rgba(168,85,247,0.15)',
    filter: 'blur(80px)',
  },
  heroTitle: {
    color: '#fff',
    fontSize: width > 768 ? 64 : 42,
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: -1.5,
    marginBottom: 24,
  },
  highlight: {
    color: '#38bdf8',
  },
  heroSubtitle: {
    color: '#a1a1aa',
    fontSize: width > 768 ? 20 : 16,
    textAlign: 'center',
    maxWidth: 700,
    lineHeight: 30,
    marginBottom: 48,
  },
  ctaBtn: {
    backgroundColor: '#38bdf8',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    shadowColor: '#38bdf8',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 24,
    elevation: 8,
  },
  ctaText: {
    color: '#000',
    fontSize: 18,
    fontWeight: 'bold',
  },
  featuresSection: {
    flexDirection: width > 768 ? 'row' : 'column',
    gap: 24,
    paddingHorizontal: 24,
    maxWidth: 1200,
    width: '100%',
    marginTop: 40,
  },
  featureCard: {
    flex: 1,
    backgroundColor: '#09090b',
    padding: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#18181b',
    alignItems: 'flex-start',
  },
  featureTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  featureDesc: {
    color: '#a1a1aa',
    fontSize: 15,
    lineHeight: 24,
  },
  footer: {
    padding: 32,
    alignItems: 'center',
    borderTopWidth: 1,
    borderColor: '#18181b',
  },
  footerText: {
    color: '#52525b',
    fontSize: 14,
  }
});
