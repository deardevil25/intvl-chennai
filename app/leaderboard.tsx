import { ScrollView, StyleSheet, Text, View } from 'react-native';

const players = [
  { rank: 1, name: 'Karthik R', area: 'T. Nagar', streets: 47, km: 312 },
  { rank: 2, name: 'Priya S', area: 'Adyar', streets: 38, km: 267 },
  { rank: 3, name: 'Arjun M', area: 'Anna Nagar', streets: 31, km: 198 },
  { rank: 4, name: 'Divya K', area: 'Velachery', streets: 24, km: 154 },
  { rank: 5, name: 'Surya P', area: 'Guindy', streets: 19, km: 121 },
  { rank: 6, name: 'Meena L', area: 'Mylapore', streets: 14, km: 98 },
  { rank: 7, name: 'Rishi', area: 'Your area', streets: 0, km: 0 },
];

const medalColor = (rank: number) => {
  if (rank === 1) return '#FFD700';
  if (rank === 2) return '#C0C0C0';
  if (rank === 3) return '#CD7F32';
  return '#333';
};

const medalText = (rank: number) => {
  if (rank === 1) return '🥇';
  if (rank === 2) return '🥈';
  if (rank === 3) return '🥉';
  return `#${rank}`;
};

export default function Leaderboard() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>

      {/* Header */}
      <Text style={styles.heading}>Chennai Rankings</Text>
      <Text style={styles.sub}>Top street owners this month</Text>

      {/* Top 3 Podium */}
      <View style={styles.podium}>
        {players.slice(0, 3).map((p) => (
          <View key={p.rank} style={[styles.podiumCard, { borderColor: medalColor(p.rank) }]}>
            <Text style={styles.podiumMedal}>{medalText(p.rank)}</Text>
            <Text style={styles.podiumName}>{p.name.split(' ')[0]}</Text>
            <Text style={styles.podiumStreets}>{p.streets} streets</Text>
          </View>
        ))}
      </View>

      {/* Full List */}
      <View style={styles.list}>
        {players.map((p) => (
          <View
            key={p.rank}
            style={[styles.row, p.name === 'Rishi' && styles.youRow]}
          >
            <Text style={[styles.rankNum, { color: medalColor(p.rank) }]}>
              {medalText(p.rank)}
            </Text>
            <View style={styles.playerInfo}>
              <Text style={[styles.playerName, p.name === 'Rishi' && styles.youText]}>
                {p.name} {p.name === 'Rishi' ? '(you)' : ''}
              </Text>
              <Text style={styles.playerArea}>{p.area}</Text>
            </View>
            <View style={styles.playerStats}>
              <Text style={styles.streetsCount}>{p.streets}</Text>
              <Text style={styles.streetsLabel}>streets</Text>
            </View>
          </View>
        ))}
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
  heading: {
    color: '#fff',
    fontSize: 26,
    fontWeight: 'bold',
  },
  sub: {
    color: '#555',
    fontSize: 13,
    marginTop: 4,
    marginBottom: 24,
  },
  podium: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 28,
  },
  podiumCard: {
    flex: 1,
    backgroundColor: '#111',
    borderRadius: 16,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
  },
  podiumMedal: {
    fontSize: 24,
    marginBottom: 6,
  },
  podiumName: {
    color: '#fff',
    fontSize: 13,
    fontWeight: 'bold',
  },
  podiumStreets: {
    color: '#555',
    fontSize: 11,
    marginTop: 2,
  },
  list: {
    gap: 10,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111',
    borderRadius: 14,
    padding: 16,
    borderWidth: 0.5,
    borderColor: '#222',
  },
  youRow: {
    borderColor: '#00ff88',
    borderWidth: 1,
  },
  rankNum: {
    fontSize: 18,
    fontWeight: 'bold',
    width: 36,
  },
  playerInfo: {
    flex: 1,
  },
  playerName: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '500',
  },
  youText: {
    color: '#00ff88',
  },
  playerArea: {
    color: '#555',
    fontSize: 12,
    marginTop: 2,
  },
  playerStats: {
    alignItems: 'flex-end',
  },
  streetsCount: {
    color: '#00ff88',
    fontSize: 18,
    fontWeight: 'bold',
  },
  streetsLabel: {
    color: '#555',
    fontSize: 11,
  },
});