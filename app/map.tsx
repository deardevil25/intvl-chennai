import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import { useFocusEffect } from 'expo-router';
import { addDoc, collection, deleteDoc, doc, getDocs } from 'firebase/firestore';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import MapView, { PROVIDER_GOOGLE, Polygon, Polyline } from 'react-native-maps';
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
  const [territories, setTerritories] = useState<any[]>([]);
  const [myColor, setMyColor] = useState('#00ff88');
  const mapRef = useRef<any>(null);
  const locationSub = useRef<any>(null);

  useEffect(() => {
    moveToCurrentLocation();
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadMyColor();
      loadTerritories();
    }, [])
  );

  const getUserId = () => {
    const user = auth.currentUser;
    return user?.displayName || user?.email?.split('@')[0] || 'runner';
  };

  const loadMyColor = async () => {
    try {
      const saved = await AsyncStorage.getItem('myColor');
      if (saved) setMyColor(saved);
      const userId = getUserId();
      const snapshot = await getDocs(collection(db, 'users'));
      snapshot.forEach(docSnap => {
        if (docSnap.id === userId) {
          const color = docSnap.data().color || '#00ff88';
          setMyColor(color);
          AsyncStorage.setItem('myColor', color);
        }
      });
    } catch (e) {}
  };

  const loadTerritories = async () => {
    try {
      const snapshot = await getDocs(collection(db, 'territories'));
      const data = snapshot.docs.map(docSnap => ({
        ...docSnap.data(),
        docId: docSnap.id,
      }));
      setTerritories(data);
    } catch (e) {}
  };

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

  const checkOverlap = (myCoords: any[], theirCoords: any[]) => {
    if (theirCoords.length < 3) return false;
    const theirLats = theirCoords.map((c: any) => c.latitude);
    const theirLons = theirCoords.map((c: any) => c.longitude);
    const minLat = Math.min(...theirLats);
    const maxLat = Math.max(...theirLats);
    const minLon = Math.min(...theirLons);
    const maxLon = Math.max(...theirLons);
    return myCoords.some(c =>
      c.latitude >= minLat && c.latitude <= maxLat &&
      c.longitude >= minLon && c.longitude <= maxLon
    );
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

    if (routeCoords.length < 3) {
      Alert.alert('Too short!', 'Run a bit more to claim territory!');
      return;
    }

    try {
      const userId = getUserId();
      const stolenIds: string[] = [];
      const stolenFrom: string[] = [];

      for (const t of territories) {
        if (t.userId === userId) continue;
        const overlaps = checkOverlap(routeCoords, t.coords || []);
        if (overlaps) {
          stolenIds.push(t.docId);
          stolenFrom.push(t.userId);
          await deleteDoc(doc(db, 'territories', t.docId));
        }
      }

      const territory = {
        userId,
        color: myColor,
        coords: routeCoords,
        distance: distance.toFixed(2),
        points: routeCoords.length,
        date: new Date().toLocaleDateString('en-IN'),
        createdAt: Date.now(),
      };

      await addDoc(collection(db, 'territories'), territory);
      await addDoc(collection(db, 'runs'), {
        userId,
        date: territory.date,
        distance: territory.distance,
        points: territory.points,
        coords: routeCoords,
        createdAt: Date.now(),
      });

      setTerritories(prev => [
        ...prev.filter(t => !stolenIds.includes(t.docId)),
        territory,
      ]);

      const stolenMsg = stolenFrom.length > 0
        ? `\n⚔️ Stole territory from: ${[...new Set(stolenFrom)].join(', ')}!`
        : '';

      Alert.alert(
        'Territory Claimed! 🎉',
        `${distance.toFixed(2)} km · ${routeCoords.length} points!${stolenMsg}`,
        [{ text: 'Nice!', style: 'default' }]
      );
    } catch (e) {
      console.log('Save error:', e);
    }
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
        {territories.map((t, i) => (
          t.coords?.length >= 3 && (
            <Polygon
              key={i}
              coordinates={t.coords}
              fillColor={t.color + '55'}
              strokeColor={t.color}
              strokeWidth={2}
            />
          )
        ))}

        {routeCoords.length > 1 && (
          <Polyline
            coordinates={routeCoords}
            strokeColor={myColor}
            strokeWidth={3}
          />
        )}
      </MapView>

      <View style={styles.topBar}>
        <View style={styles.topBarInner}>
          <View>
            <Text style={styles.topBarText}>🗺️ Runners Territory</Text>
            <Text style={styles.runsText}>
              {territories.filter(t => t.userId === getUserId()).length} territories owned
            </Text>
          </View>
          {tracking ? (
            <View style={[styles.distanceBadge, { backgroundColor: myColor }]}>
              <Text style={styles.distanceText}>{distance.toFixed(2)} km</Text>
            </View>
          ) : (
            <View style={[styles.liveBadge, { backgroundColor: myColor }]}>
              <Text style={styles.liveText}>LIVE</Text>
            </View>
          )}
        </View>
      </View>

      <View style={styles.colorIndicator}>
        <View style={[styles.colorDot, { backgroundColor: myColor }]} />
        <Text style={styles.colorText}>Your color</Text>
      </View>

      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={[styles.trackBtn, { backgroundColor: tracking ? '#ff4444' : myColor }]}
          onPress={tracking ? stopTracking : startTracking}
        >
          <Text style={styles.trackBtnText}>
            {tracking ? '⏹ Stop & Claim' : '🏃 Start Run'}
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
  liveBadge: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  liveText: { color: '#0a0a0a', fontSize: 11, fontWeight: 'bold', letterSpacing: 1 },
  distanceBadge: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  distanceText: { color: '#0a0a0a', fontSize: 14, fontWeight: 'bold' },
  colorIndicator: {
    position: 'absolute',
    top: 130,
    right: 16,
    backgroundColor: 'rgba(10,10,10,0.85)',
    borderRadius: 12,
    padding: 10,
    alignItems: 'center',
    borderWidth: 0.5,
    borderColor: '#222',
  },
  colorDot: { width: 24, height: 24, borderRadius: 12, marginBottom: 4 },
  colorText: { color: '#555', fontSize: 10 },
  bottomBar: { position: 'absolute', bottom: 32, left: 24, right: 24 },
  trackBtn: { borderRadius: 20, padding: 20, alignItems: 'center' },
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