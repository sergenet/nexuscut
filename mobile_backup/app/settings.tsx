import { View, Text, StyleSheet, TouchableOpacity, Switch, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../lib/supabase';
import { useState, useEffect } from 'react';

export default function Settings() {
  const router = useRouter();
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [highQualityExport, setHighQualityExport] = useState(true);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) setUserEmail(user.email ?? null);
    });
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const OptionRow = ({ icon, title, value, onValueChange, isToggle = true, onPress = null }: any) => (
    <TouchableOpacity 
      style={styles.optionRow} 
      disabled={isToggle}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.optionLeft}>
        <Ionicons name={icon} size={24} color="#a1a1aa" style={styles.optionIcon} />
        <Text style={styles.optionTitle}>{title}</Text>
      </View>
      {isToggle ? (
        <Switch 
          value={value} 
          onValueChange={onValueChange} 
          trackColor={{ false: '#3f3f46', true: '#10b981' }}
          thumbColor="#fff"
        />
      ) : (
        <Ionicons name="chevron-forward" size={20} color="#a1a1aa" />
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={styles.backBtn} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{userEmail ? userEmail[0].toUpperCase() : 'U'}</Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{userEmail ? userEmail.split('@')[0] : 'Nexus User'}</Text>
            <Text style={styles.profileEmail}>{userEmail || 'Free Plan'}</Text>
          </View>
          <TouchableOpacity style={styles.upgradeBtn} onPress={() => router.push('/paywall')}>
            <Text style={styles.upgradeBtnText}>Upgrade</Text>
          </TouchableOpacity>
        </View>

        {/* Settings Groups */}
        <View style={styles.group}>
          <Text style={styles.groupTitle}>Preferences</Text>
          <View style={styles.groupCard}>
            <OptionRow icon="moon" title="Dark Mode" value={isDarkMode} onValueChange={setIsDarkMode} />
            <View style={styles.divider} />
            <OptionRow icon="videocam" title="4K Export Default" value={highQualityExport} onValueChange={setHighQualityExport} />
          </View>
        </View>

        <View style={styles.group}>
          <Text style={styles.groupTitle}>Account</Text>
          <View style={styles.groupCard}>
            <OptionRow icon="person" title="Edit Profile" isToggle={false} />
            <View style={styles.divider} />
            <OptionRow icon="card" title="Manage Subscription" isToggle={false} onPress={() => router.push('/paywall')} />
            <View style={styles.divider} />
            <OptionRow icon="help-circle" title="Help & Support" isToggle={false} />
          </View>
        </View>

        {/* Logout */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#09090b', // Zinc-950
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  backBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.03)',
    padding: 16,
    borderRadius: 16,
    marginBottom: 32,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#10b981',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  avatarText: {
    color: '#022c22',
    fontSize: 24,
    fontWeight: '800',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 2,
  },
  profileEmail: {
    color: '#a1a1aa',
    fontSize: 14,
  },
  upgradeBtn: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 100,
  },
  upgradeBtnText: {
    color: '#10b981',
    fontWeight: '700',
    fontSize: 14,
  },
  group: {
    marginBottom: 24,
  },
  groupTitle: {
    color: '#71717a', // Zinc-500
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
    paddingHorizontal: 8,
  },
  groupCard: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 16,
    overflow: 'hidden',
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionIcon: {
    marginRight: 12,
  },
  optionTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.05)',
    marginLeft: 52,
  },
  logoutBtn: {
    marginTop: 16,
    padding: 16,
    backgroundColor: 'rgba(244, 63, 94, 0.1)', // Rose with opacity
    borderRadius: 16,
    alignItems: 'center',
  },
  logoutText: {
    color: '#f43f5e', // Rose-500
    fontWeight: '700',
    fontSize: 16,
  },
});
