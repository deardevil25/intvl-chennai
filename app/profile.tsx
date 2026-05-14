import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const stats = [
  { label: 'Total km', value: '0.0' },
  { label: 'Streets owned', value: '0' },
  { label: 'Runs done', value: '0' },
  { label: 'Best run', value: '0.0 km' },
  { label: 'Time running', value: '0 hrs' },
  { label: 'Chennai rank', value: '#—' },
];

const achievements = [
  { icon: '🏃', title: 'First Run', desc: 'Complete your first run', done: false },
  { icon: '🗺️', title: 'Street Claimer', desc: 'Own 10 streets', done: false },
  { icon: '🔥', title: 'On Fire', desc: 'Run 3 days in a row', done: false },
  { icon: '👑', title: 'Area King', desc: 'Own a full neighbourhood', done: false },
];

export default function Profile() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>

      {/* Avatar */}
      <View style={styles.avatarSection}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>R</Text>
        </View>
        <Text style={styles.name}>Rishi</Text>
        <Text style={styles.location}>📍 Chennai, Tamil Nadu</Text>
        <View style={styles.levelBadge}>
          <Text style={styles.levelText}>⚡ Level 1 Runner</Text>
        </View>
      </View>

      {/* Stats Grid */}
      <Text style={styles.sectionTitle}>Your Stats</Text>
      <View style={styles.statsGrid}>
        {stats.map((s) => (
          <View key={s.label} style={styles.statCard}>
            <Text style={styles.statValue}>{s.value}</Text>
            <Text style={styles.statLabel}>{s.label}</Text>
          </View>
        ))}
      </View>

      {/* Achievements */}
      <Text style={styles.sectionTitle}>Achievements</Text>
      <View style={styles.achievementList}>
        {achievements.map((a) => (
          <View key={a.title} style={[styles.achievementRow, a.done && styles.achievementDone]}>
            <Text style={styles.achievementIcon}>{a.icon}</Text>
            <View style={styles.achievementInfo}>
              <Text style={[styles.achievementTitle, a.done && styles.doneText]}>{a.title}</Text>
              <Text style={styles.achievementDesc}>{a.desc}</Text>
            </View>
            <Text style={styles.achievementStatus}>{a.done ? '✅' : '🔒'}</Text>
          </View>
        ))}
      </View>

      {/* Settings */}
      <TouchableOpacity style={styles.settingsBtn}>
        <Text style={styles.settingsBtnText}>⚙️ Settings</Text>
      </TouchableOpacity>

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
    paddingBottom: 40,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#00ff88',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  avatarText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#0a0a0a',
  },
  name: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  location: {
    color: '#555',
    fontSize: 13,
    marginTop: 4,
  },
  levelBadge: {
    marginTop: 10,
    backgroundColor: '#111',
    borderWidth: 1,
    borderColor: '#00ff88',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  levelText: {
    color: '#00ff88',
    fontSize: 13,
    fontWeight: 'bold',
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 28,
  },
  statCard: {
    backgroundColor: '#111',
    borderRadius: 14,
    padding: 16,
    width: '30.5%',
    borderWidth: 0.5,
    borderColor: '#222',
    alignItems: 'center',
  },
  statValue: {
    color: '#00ff88',
    fontSize: 18,
    fontWeight: 'bold',
  },
  statLabel: {
    color: '#555',
    fontSize: 10,
    marginTop: 4,
    textAlign: 'center',
  },
  achievementList: {
    gap: 10,
    marginBottom: 28,
  },
  achievementRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111',
    borderRadius: 14,
    padding: 16,
    borderWidth: 0.5,
    borderColor: '#222',
    gap: 12,
  },
  achievementDone: {
    borderColor: '#00ff88',
  },
  achievementIcon: {
    fontSize: 24,
  },
  achievementInfo: {
    flex: 1,
  },
  achievementTitle: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  doneText: {
    color: '#00ff88',
  },
  achievementDesc: {
    color: '#555',
    fontSize: 12,
    marginTop: 2,
  },
  achievementStatus: {
    fontSize: 18,
  },
  settingsBtn: {
    backgroundColor: '#111',
    borderRadius: 14,
    padding: 18,
    alignItems: 'center',
    borderWidth: 0.5,
    borderColor: '#333',
  },
  settingsBtnText: {
    color: '#888',
    fontSize: 15,
  },
});