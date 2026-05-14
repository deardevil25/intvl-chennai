import { StatusBar } from 'expo-status-bar';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function Index() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>

      <StatusBar style="light" />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Good evening 👋</Text>
          <Text style={styles.username}>Rishi</Text>
        </View>
        <View style={styles.levelBadge}>
          <Text style={styles.levelText}>LVL 1</Text>
        </View>
      </View>

      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>0.0</Text>
          <Text style={styles.statLabel}>km run</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>0</Text>
          <Text style={styles.statLabel}>streets owned</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>#—</Text>
          <Text style={styles.statLabel}>Chennai rank</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>0</Text>
          <Text style={styles.statLabel}>runs done</Text>
        </View>
      </View>

      {/* Start Run Button */}
      <TouchableOpacity style={styles.startButton} onPress={() => alert('GPS tracking coming soon!')}>
        <Text style={styles.startIcon}>🏃</Text>
        <Text style={styles.startText}>Start Run</Text>
        <Text style={styles.startSub}>Claim your streets</Text>
      </TouchableOpacity>

      {/* Recent Activity */}
      <Text style={styles.sectionTitle}>Recent Activity</Text>
      <View style={styles.emptyCard}>
        <Text style={styles.emptyText}>No runs yet.</Text>
        <Text style={styles.emptySubText}>Hit Start Run to claim your first street in Chennai!</Text>
      </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  content: {
    padding: 24,
    paddingTop: 60,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 32,
  },
  greeting: {
    color: '#555',
    fontSize: 14,
  },
  username: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 2,
  },
  levelBadge: {
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#00ff88',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  levelText: {
    color: '#00ff88',
    fontSize: 13,
    fontWeight: 'bold',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 28,
  },
  statCard: {
    backgroundColor: '#111',
    borderRadius: 16,
    padding: 18,
    width: '47%',
    borderWidth: 0.5,
    borderColor: '#222',
  },
  statValue: {
    color: '#00ff88',
    fontSize: 28,
    fontWeight: 'bold',
  },
  statLabel: {
    color: '#555',
    fontSize: 12,
    marginTop: 4,
  },
  startButton: {
    backgroundColor: '#00ff88',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    marginBottom: 32,
  },
  startIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  startText: {
    color: '#0a0a0a',
    fontSize: 22,
    fontWeight: 'bold',
  },
  startSub: {
    color: '#0a0a0a',
    fontSize: 13,
    marginTop: 4,
    opacity: 0.6,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  emptyCard: {
    backgroundColor: '#111',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 0.5,
    borderColor: '#222',
  },
  emptyText: {
    color: '#555',
    fontSize: 16,
    marginBottom: 8,
  },
  emptySubText: {
    color: '#333',
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 20,
  },
});