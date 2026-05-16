import { Tabs, router } from 'expo-router';
import { onAuthStateChanged } from 'firebase/auth';
import { useEffect, useState } from 'react';
import { Text } from 'react-native';
import { auth } from '../firebaseConfig';

export default function Layout() {
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
  setChecked(true);
  if (!user) {
    setTimeout(() => {
      router.replace('/login' as any);
    }, 100);
  }
});
    return unsub;
  }, []);

  if (!checked) return null;

  return (
    <Tabs
      screenOptions={{
        tabBarStyle: {
          backgroundColor: '#0a0a0a',
          borderTopColor: '#1a1a1a',
        },
        tabBarActiveTintColor: '#00ff88',
        tabBarInactiveTintColor: '#555',
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 18, color }}>🏠</Text>,
        }}
      />
      <Tabs.Screen
        name="map"
        options={{
          title: 'Map',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 18, color }}>🗺️</Text>,
        }}
      />
      <Tabs.Screen
        name="leaderboard"
        options={{
          title: 'Ranks',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 18, color }}>🏆</Text>,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 18, color }}>👤</Text>,
        }}
      />
      <Tabs.Screen
        name="login"
        options={{ href: null }}
      />
    </Tabs>
  );
}