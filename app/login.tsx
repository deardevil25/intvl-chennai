import { router } from 'expo-router';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { auth, db } from '../firebaseConfig';

const COLORS = [
  { name: 'Green', hex: '#00ff88' },
  { name: 'Red', hex: '#ff4444' },
  { name: 'Blue', hex: '#4488ff' },
  { name: 'Yellow', hex: '#ffdd00' },
  { name: 'Purple', hex: '#aa44ff' },
  { name: 'Orange', hex: '#ff8800' },
  { name: 'Pink', hex: '#ff44aa' },
  { name: 'Teal', hex: '#00ddcc' },
];

export default function Login() {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedColor, setSelectedColor] = useState('#00ff88');
  const [loading, setLoading] = useState(false);

  const handleAuth = async () => {
    if (!email || !password) {
      Alert.alert('Missing fields', 'Please enter email and password');
      return;
    }
    if (mode === 'signup' && !name) {
      Alert.alert('Missing name', 'Please enter your name');
      return;
    }
    setLoading(true);
    try {
      if (mode === 'signup') {
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(cred.user, { displayName: name });
        await setDoc(doc(db, 'users', name), {
          name,
          color: selectedColor,
          createdAt: Date.now(),
        });
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      router.replace('/');
    } catch (e: any) {
      Alert.alert('Error', e.message);
    }
    setLoading(false);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.content}>

        <Text style={styles.logo}>INTVL</Text>
        <Text style={styles.logoSub}>Chennai</Text>
        <Text style={styles.tagline}>Own the streets. Run your city.</Text>

        <View style={styles.form}>
          {mode === 'signup' && (
            <>
              <TextInput
                style={styles.input}
                placeholder="Your name"
                placeholderTextColor="#555"
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
              />

              {/* Color Picker */}
              <Text style={styles.colorLabel}>Pick your territory color:</Text>
              <View style={styles.colorGrid}>
                {COLORS.map((c) => (
                  <TouchableOpacity
                    key={c.hex}
                    style={[
                      styles.colorBtn,
                      { backgroundColor: c.hex },
                      selectedColor === c.hex && styles.colorBtnSelected,
                    ]}
                    onPress={() => setSelectedColor(c.hex)}
                  >
                    {selectedColor === c.hex && (
                      <Text style={styles.colorCheck}>✓</Text>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </>
          )}

          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="#555"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor="#555"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <TouchableOpacity
            style={[styles.btn, loading && styles.btnDisabled]}
            onPress={handleAuth}
            disabled={loading}
          >
            <Text style={styles.btnText}>
              {loading ? 'Please wait...' : mode === 'login' ? 'Log In' : 'Create Account'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.switchBtn}
            onPress={() => setMode(mode === 'login' ? 'signup' : 'login')}
          >
            <Text style={styles.switchText}>
              {mode === 'login' ? "Don't have an account? Sign up" : 'Already have an account? Log in'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0a' },
  content: { flexGrow: 1, padding: 32, justifyContent: 'center' },
  logo: { fontSize: 48, fontWeight: 'bold', color: '#00ff88', letterSpacing: 6, textAlign: 'center' },
  logoSub: { fontSize: 18, color: '#fff', letterSpacing: 4, textAlign: 'center', marginTop: 4 },
  tagline: { fontSize: 13, color: '#555', textAlign: 'center', marginTop: 8, marginBottom: 48 },
  form: { gap: 14 },
  input: { backgroundColor: '#111', borderRadius: 14, padding: 16, color: '#fff', fontSize: 15, borderWidth: 0.5, borderColor: '#222' },
  colorLabel: { color: '#888', fontSize: 13, marginBottom: 4 },
  colorGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  colorBtn: { width: 52, height: 52, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  colorBtnSelected: { borderWidth: 3, borderColor: '#fff' },
  colorCheck: { color: '#fff', fontSize: 22, fontWeight: 'bold' },
  btn: { backgroundColor: '#00ff88', borderRadius: 14, padding: 18, alignItems: 'center', marginTop: 8 },
  btnDisabled: { opacity: 0.6 },
  btnText: { color: '#0a0a0a', fontSize: 16, fontWeight: 'bold' },
  switchBtn: { alignItems: 'center', padding: 8 },
  switchText: { color: '#555', fontSize: 13 },
});