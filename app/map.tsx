import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import { addDoc, collection } from 'firebase/firestore';
import { useEffect, useRef, useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import MapView, { PROVIDER_GOOGLE, Polyline } from 'react-native-maps';
import { auth, db } from '../firebaseConfig';

const CHENNAI = {
  latitude: 13.0827,
  longitude: 80.2707,
  latitudeDelta: 0.05,
  longitudeDelta: 0.05,
};

export default function Map() {
  const [tracking, setTracking] = useState(false);
  const [routeCoords, setRouteCoords] = useState<any[]>([]);
  const [distance, setDistance] = useState(0);
  const [pastRuns, setPastRuns] = useState<any[]>([]);
  const mapRef = useRef<any>(null);
  const locationSub = useRef<any>(null);

  useEffect(() => {
    loadPastRuns();
    moveToCurrentLocation();
  }, []);

  const moveToCurrentLocation = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') return;
    const current = await Location.getCurrentPositionAsync({});
    mapRef.current?.animateToRegion({
      latitude: current.coords.latitude,
      longitude: current.coords.longitude,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    }, 1000);
  };

  const loadPastRuns = async () => {
    try {
      const saved = await AsyncStorage.getItem('runs');
      if (saved) setPastRuns(JSON.parse(saved));
    } catch (e) {}
  };

  const getUserId = () => {
    const user = auth.currentUser;
    return user?.displayName || user?.email?.split('@')[0] || 'runner';
  };

  const saveRun = async (coords: any[], dist: number) => {
    try {
      const newRun = {
        id: Date.now(),
        date: new Date().toLocaleDateString('en-IN'),
        distance: dist.toFixed(2),
        coords,
        points: coords.length,
      };
      const updated = [newRun, ...pastRuns];
      await AsyncStorage.setItem('runs', JSON.stringify(updated));
      setPastRuns(updated);

      await addDoc(collection(db, 'runs'), {
        userId: getUserId(),
        date: newRun.date,
        distance: newRun.distance,
        points: newRun.points,
        coords: coords,
        createdAt: Date.now(),
      });

      return newRun;
    } catch (e) {
      console.log('Save error:', e);
    }
  };

  const calcDistance = (coords: any[]) => {
    let total = 0;
    for (let i = 1; i < coords.length; i++) {
      const R = 6371;
      const dLat = (coords[i].latitude - coords[i-1].latitude) * Math.PI / 180;
      const dLon = (coords[i].longitude - coords[i-1].longitude) * Math.PI / 180;
      const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(coords[i-1].latitude * Math.PI/180) *
        Math.cos(coords[i].latitude * Math.PI/180) *
        Math.sin(dLon/2) * Math.sin(dLon/2);
      total += R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    }
    return total;
  };

  const startTracking = async () => {
    setTracking(true);
    setRouteCoords([]);
    setDistance(0);
    locationSub.current = await Location.watchPositionAsync(
      { accuracy: Location.Accuracy.High, distanceInterval: 5 },
      (loc) => {
        const newCoord = {
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
        };
        setRouteCoords((prev) => {
          const updated = [...prev, newCoord];
          setDistance(calcDistance(updated));
          return updated;
        });
        mapRef.current?.animateToRegion({
          ...newCoord,
          latitudeDelta: 0.005,
          longitudeDelta: 0.005,
        }, 500);
      }
    );
  };

  const stopTracking = async () => {
    setTracking(false);
    locationSub.current?.remove();
    const savedRun = await saveRun(routeCoords, distance);
    Alert.alert(
      'Run Saved! 🎉',
      `${distance.toFixed(2)} km on ${savedRun?.date}\nTotal runs: ${pastRuns.length + 1}`,
      [{ text: 'Nice!', style: 'default' }]
    );
  };

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={CHENNAI}
        customMapStyle={darkMapStyle}
        showsUserLocation={true}
        followsUserLocation={tracking}
      >
        {routeCoords.length > 1 && (
          <Polyline
            coordinates={routeCoords}
            strokeColor="#00ff88"
            strokeWidth={4}
          />
        )}
        {pastRuns.map((run) => (
          run.coords?.length > 1 && (
            <Polyline
              key={run.id}
              coordinates={run.coords}
              strokeColor="#005533"
              strokeWidth={2}
            />
          )
        ))}
      </MapView>

      <View style={styles.topBar}>
        <View style={styles.topBarInner}>
          <View>
            <Text style={styles.topBarText}>🗺️ Chennai</Text>
            <Text style={styles.runsText}>{pastRuns.length} runs saved</Text>
          </View>
          {tracking ? (
            <View style={styles.distanceBadge}>
              <Text style={styles.distanceText}>{distance.toFixed(2)} km</Text>
            </View>
          ) : (
            <View style={styles.liveBadge}>
              <Text style={styles.liveText}>LIVE</Text>
            </View>
          )}
        </View>
      </View>

      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={[styles.trackBtn, tracking && styles.trackBtnActive]}
          onPress={tracking ? stopTracking : startTracking}
        >
          <Text style={styles.trackBtnText}>
            {tracking ? '⏹ Stop Run' : '🏃 Start Run'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0a' },
  map: { flex: 1 },
  topBar: { position: 'absolute', top: 52, left: 16, right: 16 },
  topBarInner: {
    backgroundColor: 'rgba(10,10,10,0.85)',
    borderRadius: 14,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 0.5,
    borderColor: '#222',
  },
  topBarText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  runsText: { color: '#555', fontSize: 11, marginTop: 2 },
  liveBadge: { backgroundColor: '#00ff88', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  liveText: { color: '#0a0a0a', fontSize: 11, fontWeight: 'bold', letterSpacing: 1 },
  distanceBadge: { backgroundColor: '#00ff88', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  distanceText: { color: '#0a0a0a', fontSize: 14, fontWeight: 'bold' },
  bottomBar: { position: 'absolute', bottom: 32, left: 24, right: 24 },
  trackBtn: { backgroundColor: '#00ff88', borderRadius: 20, padding: 20, alignItems: 'center' },
  trackBtnActive: { backgroundColor: '#ff4444' },
  trackBtnText: { color: '#0a0a0a', fontSize: 18, fontWeight: 'bold' },
});

const darkMapStyle = [
  { elementType: 'geometry', stylers: [{ color: '#1a1a2e' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#746855' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#242f3e' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#2c2c54' }] },
  { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#212a37' }] },
  { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#746855' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#0d1b2a' }] },
  { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: '#515c6d' }] },
  { featureType: 'poi', stylers: [{ visibility: 'off' }] },
];