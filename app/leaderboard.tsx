import { useFocusEffect } from 'expo-router';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { useCallback, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { db } from '../firebaseConfig';

type Player = {
  userId: string;
  totalKm: number;
  totalPoints: number;
  runs: number;
};

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
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      fetchLeaderboard();
    }, [])
  );

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'runs'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);

      const playerMap: Record<string, Player> = {};

      snapshot.forEach((doc) => {
        const run = doc.data();
        const uid = run.userId || 'unknown';
        if (!playerMap[uid]) {
          playerMap[uid] = { userId: uid, totalKm: 0, totalPoints: 0, runs: 0 };
        }
        playerMap[uid].totalKm += parseFloat(run.distance || 0);
        playerMap[uid].totalPoints += run.points || 0;
        playerMap[uid].runs += 1;
      });

      const sorted = Object.values(playerMap).sort((a, b) => b.totalPoints - a.totalPoints);
      setPlayers(sorted);
    } catch (e) {
      console.log('Leaderboard error:', e);
    }
    setLoading(false);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>

      <Text style={styles.heading}>Chennai Rankings</Text>
      <Text style={styles.sub}>Real runners · Live data 🔥</Text>

      {loading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator color="#00ff88" size="large" />
          <Text style={styles.loadingText}>Fetching runners...</Text>
        </View>
      ) : players.length === 0 ? (
        <View style={styles.emptyBox}>
          <Text style={styles.emptyText}>No runners yet!</Text>
          <Text style={styles.emptySub}>Be the first to claim Chennai streets 🏃</Text>
        </View>
      ) : (
        <>
          {/* Top 3 Podium */}
          {players.length >= 1 && (
            <View style={styles.podium}>
              {players.slice(0, Math.min(3, players.length)).map((p, i) => (
                <View key={p.userId} style={[styles.podiumCard, { borderColor: medalColor(i + 1) }]}>
                  <Text style={styles.podiumMedal}>{medalText(i + 1)}</Text>
                  <Text style={styles.podiumName}>{p.userId.split('@')[0]}</Text>
                  <Text style={styles.podiumStreets}>{p.totalPoints} pts</Text>
                </View>
              ))}
            </View>
          )}

          {/* Full list */}
          <View style={styles.list}>
            {players.map((p, i) => (
              <View
                key={p.userId}
                style={[styles.row, p.userId === 'rishi' && styles.youRow]}
              >
                <Text style={[styles.rankNum, { color: medalColor(i + 1) }]}>
                  {medalText(i + 1)}
                </Text>
                <View style={styles.playerInfo}>
                  <Text style={[styles.playerName, p.userId === 'rishi' && styles.youText]}>
                    {p.userId} {p.userId === 'rishi' ? '(you)' : ''}
                  </Text>
                  <Text style={styles.playerArea}>{p.runs} runs · {p.totalKm.toFixed(2)} km</Text>
                </View>
                <View style={styles.playerStats}>
                  <Text style={styles.streetsCount}>{p.totalPoints}</Text>
                  <Text style={styles.streetsLabel}>pts</Text>
                </View>
              </View>
            ))}
          </View>
        </>
      )}

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0a' },
  content: { padding: 24, paddingTop: 60, paddingBottom: 40 },
  heading: { color: '#fff', fontSize: 26, fontWeight: 'bold' },
  sub: { color: '#555', fontSize: 13, marginTop: 4, marginBottom: 24 },
  loadingBox: { alignItems: 'center', marginTop: 60, gap: 16 },
  loadingText: { color: '#555', fontSize: 14 },
  emptyBox: { alignItems: 'center', marginTop: 60 },
  emptyText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  emptySub: { color: '#555', fontSize: 13, marginTop: 8, textAlign: 'center' },
  podium: { flexDirection: 'row', gap: 10, marginBottom: 28 },
  podiumCard: { flex: 1, backgroundColor: '#111', borderRadius: 16, padding: 14, alignItems: 'center', borderWidth: 1 },
  podiumMedal: { fontSize: 24, marginBottom: 6 },
  podiumName: { color: '#fff', fontSize: 13, fontWeight: 'bold' },
  podiumStreets: { color: '#555', fontSize: 11, marginTop: 2 },
  list: { gap: 10 },
  row: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#111', borderRadius: 14, padding: 16, borderWidth: 0.5, borderColor: '#222' },
  youRow: { borderColor: '#00ff88', borderWidth: 1 },
  rankNum: { fontSize: 18, fontWeight: 'bold', width: 36 },
  playerInfo: { flex: 1 },
  playerName: { color: '#fff', fontSize: 15, fontWeight: '500' },
  youText: { color: '#00ff88' },
  playerArea: { color: '#555', fontSize: 12, marginTop: 2 },
  playerStats: { alignItems: 'flex-end' },
  streetsCount: { color: '#00ff88', fontSize: 18, fontWeight: 'bold' },
  streetsLabel: { color: '#555', fontSize: 11 },
});