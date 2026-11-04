import React, { useState } from 'react';
import { Alert, StyleSheet, View, Text, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { supabase } from '../lib/supabase';

export default function Auth() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function signInWithEmail() {
    setLoading(true);
    setErrorMsg(null);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) setErrorMsg(error.message);
    setLoading(false);
  }

  async function signUpWithEmail() {
    setLoading(true);
    setErrorMsg(null);
    const {
      data: { session },
      error,
    } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      setErrorMsg(error.message);
    } else if (!session) {
      setErrorMsg('Check your email for the confirmation link! (Or disable "Confirm email" in Supabase settings)');
    }
    setLoading(false);
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>NexusCut Pro</Text>
      <Text style={styles.subtitle}>Sign in to sync your projects.</Text>
      
      {errorMsg && (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{errorMsg}</Text>
        </View>
      )}
      
      <View style={styles.verticallySpaced}>
        <TextInput
          style={styles.input}
          onChangeText={(text) => setEmail(text)}
          value={email}
          placeholder="email@address.com"
          placeholderTextColor="#888"
          autoCapitalize="none"
        />
      </View>
      <View style={styles.verticallySpaced}>
        <TextInput
          style={styles.input}
          onChangeText={(text) => setPassword(text)}
          value={password}
          secureTextEntry={true}
          placeholder="Password"
          placeholderTextColor="#888"
          autoCapitalize="none"
        />
      </View>

      <View style={[styles.verticallySpaced, styles.mt20]}>
        <TouchableOpacity style={styles.primaryBtn} onPress={signInWithEmail} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Sign In</Text>}
        </TouchableOpacity>
      </View>
      
      <View style={styles.verticallySpaced}>
        <TouchableOpacity style={styles.secondaryBtn} onPress={signUpWithEmail} disabled={loading}>
          <Text style={styles.secondaryBtnText}>Create Account</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    backgroundColor: '#09090b', // Zinc-950
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: '900',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: 16,
    color: '#a1a1aa', // Zinc-400
    textAlign: 'center',
    marginBottom: 36,
  },
  verticallySpaced: {
    paddingTop: 8,
    paddingBottom: 8,
  },
  mt20: {
    marginTop: 20,
  },
  errorBox: {
    backgroundColor: 'rgba(244, 63, 94, 0.1)',
    borderWidth: 1,
    borderColor: '#f43f5e',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    color: '#f43f5e',
    textAlign: 'center',
    fontSize: 14,
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    color: '#fff',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    fontSize: 16,
  },
  primaryBtn: {
    backgroundColor: '#10b981', // Emerald-500
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  secondaryBtn: {
    backgroundColor: 'transparent',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#10b981', // Emerald-500
  },
  btnText: {
    color: '#022c22', // Emerald-950
    fontWeight: '800',
    fontSize: 16,
  },
  secondaryBtnText: {
    color: '#10b981', // Emerald-500
    fontWeight: '700',
    fontSize: 16,
  }
});
