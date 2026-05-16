import AsyncStorage from '@react-native-async-storage/async-storage';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, doc, getDocs, orderBy, query, setDoc, where } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { auth, db } from '../firebaseConfig';

const COLORS = [
  '#00ff88', '#ff4444', '#4488ff', '#ffdd00',
  '#aa44ff', '#ff8800', '#ff44aa', '#00ddcc',
];

export default function Profile() {
  const [displayName, setDisplayName] = useState('');
  const [runs, setRuns] = useState<any[]>([]);
  const [myColor, setMyColor] = useState('#00ff88');
  const [showColors, setShowColors] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) {
        const name = user.displayName || user.email?.split('@')[0] || 'Runner';
        setDisplayName(name);
        loadRuns(name);
        loadColor(name);
      }
    });
    return unsub;
  }, []);

  const loadColor = async (name: string) => {
    try {
      const saved = await AsyncStorage.getItem('myColor');
      if (saved) setMyColor(saved);
      const snapshot = await getDocs(collection(db, 'users'));
      snapshot.forEach(docSnap => {
        if (docSnap.id === name) {
          const color = docSnap.data().color || '#00ff88';
          setMyColor(color);
          AsyncStorage.setItem('myColor', color);
        }
      });
    } catch (e) {}
  };

  const changeColor = async (color: string) => {
    setMyColor(color);
    setShowColors(false);
    try {
      await setDoc(doc(db, 'users', displayName), {
        name: displayName,
        color,
      }, { merge: true });
      await AsyncStorage.setItem('myColor', color);
    } catch (e) {}
  };

  const loadRuns = async (name: string) => {
    try {
      const q = query(
        collection(db, 'runs'),
        where('userId', '==', name),
        orderBy('createdAt', 'desc')
      );
      const snapshot = await getDocs(q);
      setRuns(snapshot.docs.map(doc => doc.data()));
    } catch (e) {
      console.log('Profile runs error:', e);
    }
  };

  const totalKm = runs.reduce((sum, r) => sum + parseFloat(r.distance || 0), 0);
  const totalStreets = runs.reduce((sum, r) => sum + (r.points || 0), 0);
  const bestRun = runs.length > 0 ? Math.max(...runs.map(r => parseFloat(r.distance || 0))) : 0;

  const stats = [
    { label: 'Total km', value: totalKm.toFixed(1) },
    { label: 'Streets owned', value: totalStreets.toString() },
    { label: 'Runs done', value: runs.length.toString() },
    { label: 'Best run', value: bestRun.toFixed(1) + ' km' },
    { label: 'Time running', value: '0 hrs' },
    { label: 'Chennai rank', value: '#—' },
  ];

  const achievements = [
    { icon: '🏃', title: 'First Run', desc: 'Complete your first run', done: runs.length >= 1 },
    { icon: '🗺️', title: 'Street Claimer', desc: 'Own 10 streets', done: totalStreets >= 10 },
    { icon: '🔥', title: 'On Fire', desc: 'Run 3 days in a row', done: runs.length >= 3 },
    { icon: '👑', title: 'Area King', desc: 'Own a full neighbourhood', done: totalStreets >= 50 },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>

      <View style={styles.avatarSection}>
        <View style={[styles.avatar, { backgroundColor: myColor }]}>
          <Text style={styles.avatarText}>{displayName ? displayName[0].toUpperCase() : '?'}</Text>
        </View>
        <Text style={styles.name}>{displayName || '...'}</Text>
        <Text style={styles.location}>📍 Chennai, Tamil Nadu</Text>
        <View style={[styles.levelBadge, { borderColor: myColor }]}>
          <Text style={[styles.levelText, { color: myColor }]}>⚡ Level {runs.length < 5 ? 1 : runs.length < 15 ? 2 : 3} Runner</Text>
        </View>

        {/* Color picker button */}
        <TouchableOpacity
          style={[styles.colorPreviewBtn, { backgroundColor: myColor }]}
          onPress={() => setShowColors(!showColors)}
        >
          <Text style={styles.colorPreviewText}>🎨 Change territory color</Text>
        </TouchableOpacity>

        {showColors && (
          <View style={styles.colorGrid}>
            {COLORS.map((c) => (
              <TouchableOpacity
                key={c}
                style={[styles.colorBtn, { backgroundColor: c }, myColor === c && styles.colorBtnSelected]}
                onPress={() => changeColor(c)}
              >
                {myColor === c && <Text style={styles.colorCheck}>✓</Text>}
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      <Text style={styles.sectionTitle}>Your Stats</Text>
      <View style={styles.statsGrid}>
        {stats.map((s) => (
          <View key={s.label} style={styles.statCard}>
            <Text style={[styles.statValue, { color: myColor }]}>{s.value}</Text>
            <Text style={styles.statLabel}>{s.label}</Text>
          </View>
        ))}
      </View>

      <Text style={styles.sectionTitle}>Achievements</Text>
      <View style={styles.achievementList}>
        {achievements.map((a) => (
          <View key={a.title} style={[styles.achievementRow, a.done && { borderColor: myColor }]}>
            <Text style={styles.achievementIcon}>{a.icon}</Text>
            <View style={styles.achievementInfo}>
              <Text style={[styles.achievementTitle, a.done && { color: myColor }]}>{a.title}</Text>
              <Text style={styles.achievementDesc}>{a.desc}</Text>
            </View>
            <Text style={styles.achievementStatus}>{a.done ? '✅' : '🔒'}</Text>
          </View>
        ))}
      </View>

      <TouchableOpacity style={styles.settingsBtn}>
        <Text style={styles.settingsBtnText}>⚙️ Settings</Text>
      </TouchableOpacity>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0a' },
  content: { padding: 24, paddingTop: 60, paddingBottom: 40 },
  avatarSection: { alignItems: 'center', marginBottom: 32 },
  avatar: { width: 80, height: 80, borderRadius: 40, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  avatarText: { fontSize: 36, fontWeight: 'bold', color: '#0a0a0a' },
  name: { color: '#fff', fontSize: 24, fontWeight: 'bold' },
  location: { color: '#555', fontSize: 13, marginTop: 4 },
  levelBadge: { marginTop: 10, backgroundColor: '#111', borderWidth: 1, borderRadius: 20, paddingHorizontal: 16, paddingVertical: 6 },
  levelText: { fontSize: 13, fontWeight: 'bold' },
  colorPreviewBtn: { marginTop: 14, borderRadius: 14, paddingHorizontal: 20, paddingVertical: 10 },
  colorPreviewText: { color: '#0a0a0a', fontWeight: 'bold', fontSize: 13 },
  colorGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 16, justifyContent: 'center' },
  colorBtn: { width: 52, height: 52, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  colorBtnSelected: { borderWidth: 3, borderColor: '#fff' },
  colorCheck: { color: '#fff', fontSize: 22, fontWeight: 'bold' },
  sectionTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold', marginBottom: 12 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 28 },
  statCard: { backgroundColor: '#111', borderRadius: 14, padding: 16, width: '30.5%', borderWidth: 0.5, borderColor: '#222', alignItems: 'center' },
  statValue: { fontSize: 18, fontWeight: 'bold' },
  statLabel: { color: '#555', fontSize: 10, marginTop: 4, textAlign: 'center' },
  achievementList: { gap: 10, marginBottom: 28 },
  achievementRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#111', borderRadius: 14, padding: 16, borderWidth: 0.5, borderColor: '#222', gap: 12 },
  achievementIcon: { fontSize: 24 },
  achievementInfo: { flex: 1 },
  achievementTitle: { color: '#fff', fontSize: 14, fontWeight: '500' },
  achievementDesc: { color: '#555', fontSize: 12, marginTop: 2 },
  achievementStatus: { fontSize: 18 },
  settingsBtn: { backgroundColor: '#111', borderRadius: 14, padding: 18, alignItems: 'center', borderWidth: 0.5, borderColor: '#333' },
  settingsBtnText: { color: '#888', fontSize: 15 },
});