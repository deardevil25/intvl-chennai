import { StyleSheet, Text, View } from 'react-native';

export default function Map() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>🗺️ Map coming soon</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0a', alignItems: 'center', justifyContent: 'center' },
  text: { color: '#00ff88', fontSize: 18 },
});