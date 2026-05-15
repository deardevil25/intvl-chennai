import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function Index() {
  const [runs, setRuns] = useState<any[]>([]);

  useFocusEffect(
    useCallback(() => {
      loadRuns();
    }, [])
  );

  const loadRuns = async () => {
    try {
      const saved = await AsyncStorage.getItem('runs');
      if (saved) setRuns(JSON.parse(saved));
    } catch (e) {}
  };

  const totalKm = runs.reduce((sum, r) => sum + parseFloat(r.distance || 0), 0);
  const totalStreets = runs.reduce((sum, r) => sum + (r.points || 0), 0);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning 🌅';
    if (hour < 17) return 'Good afternoon ☀️';
    return 'Good evening 👋';
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <StatusBar style="light" />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>{getGreeting()}</Text>
          <Text style={styles.username}>Rishi</Text>
        </View>
        <View style={styles.levelBadge}>
          <Text style={styles.levelText}>LVL {runs.length < 5 ? 1 : runs.length < 15 ? 2 : 3}</Text>
        </View>
      </View>

      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{totalKm.toFixed(1)}</Text>
          <Text style={styles.statLabel}>km run</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{totalStreets}</Text>
          <Text style={styles.statLabel}>streets owned</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{runs.length > 0 ? '#?' : '#—'}</Text>
          <Text style={styles.statLabel}>Chennai rank</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{runs.length}</Text>
          <Text style={styles.statLabel}>runs done</Text>
        </View>
      </View>

      {/* Start Run Button */}
      <TouchableOpacity
        style={styles.startButton}
        onPress={() => alert('Go to the Map tab to start a run!')}
      >
        <Text style={styles.startIcon}>🏃</Text>
        <Text style={styles.startText}>Start Run</Text>
        <Text style={styles.startSub}>Claim your streets</Text>
      </TouchableOpacity>

      {/* Recent Activity */}
      <Text style={styles.sectionTitle}>Recent Activity</Text>

      {runs.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyText}>No runs yet.</Text>
          <Text style={styles.emptySubText}>Hit Start Run to claim your first street in Chennai!</Text>
        </View>
      ) : (
        <View style={styles.runList}>
          {runs.slice(0, 5).map((run) => (
            <View key={run.id} style={styles.runRow}>
              <Text style={styles.runIcon}>🏃</Text>
              <View style={styles.runInfo}>
                <Text style={styles.runDistance}>{run.distance} km</Text>
                <Text style={styles.runDate}>{run.date}</Text>
              </View>
              <View style={styles.runPoints}>
                <Text style={styles.runPointsValue}>{run.points}</Text>
                <Text style={styles.runPointsLabel}>pts</Text>
              </View>
            </View>
          ))}
        </View>
      )}

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0a' },
  content: { padding: 24, paddingTop: 60, paddingBottom: 40 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 },
  greeting: { color: '#555', fontSize: 14 },
  username: { color: '#fff', fontSize: 24, fontWeight: 'bold', marginTop: 2 },
  levelBadge: { backgroundColor: '#1a1a1a', borderWidth: 1, borderColor: '#00ff88', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 6 },
  levelText: { color: '#00ff88', fontSize: 13, fontWeight: 'bold' },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 28 },
  statCard: { backgroundColor: '#111', borderRadius: 16, padding: 18, width: '47%', borderWidth: 0.5, borderColor: '#222' },
  statValue: { color: '#00ff88', fontSize: 28, fontWeight: 'bold' },
  statLabel: { color: '#555', fontSize: 12, marginTop: 4 },
  startButton: { backgroundColor: '#00ff88', borderRadius: 20, padding: 24, alignItems: 'center', marginBottom: 32 },
  startIcon: { fontSize: 32, marginBottom: 8 },
  startText: { color: '#0a0a0a', fontSize: 22, fontWeight: 'bold' },
  startSub: { color: '#0a0a0a', fontSize: 13, marginTop: 4, opacity: 0.6 },
  sectionTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold', marginBottom: 12 },
  emptyCard: { backgroundColor: '#111', borderRadius: 16, padding: 24, alignItems: 'center', borderWidth: 0.5, borderColor: '#222' },
  emptyText: { color: '#555', fontSize: 16, marginBottom: 8 },
  emptySubText: { color: '#333', fontSize: 13, textAlign: 'center', lineHeight: 20 },
  runList: { gap: 10 },
  runRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#111', borderRadius: 14, padding: 16, borderWidth: 0.5, borderColor: '#222', gap: 12 },
  runIcon: { fontSize: 24 },
  runInfo: { flex: 1 },
  runDistance: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  runDate: { color: '#555', fontSize: 12, marginTop: 2 },
  runPoints: { alignItems: 'flex-end' },
  runPointsValue: { color: '#00ff88', fontSize: 20, fontWeight: 'bold' },
  runPointsLabel: { color: '#555', fontSize: 11 },
});