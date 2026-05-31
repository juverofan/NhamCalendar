import { Tabs } from 'expo-router';
import { CalendarDays, Home, PlusCircle, Settings } from 'lucide-react-native';
import React, { useEffect } from 'react';
import { Platform } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { scheduleEventNotifications, setupNotificationChannel } from '../utils/notifications';
import { loadEvents } from '../utils/storage';

export default function RootLayout() {
  const insets = useSafeAreaInsets();

  useEffect(() => {
    setupNotificationChannel();
    loadEvents().then(events => {
      if (events.length > 0) scheduleEventNotifications(events);
    });
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: '#D32F2F',
          headerTitleAlign: 'center',
          tabBarStyle: {
            // Cộng thêm insets.bottom để tự động đẩy lên khỏi thanh điều hướng máy
            height: Platform.OS === 'android' ? 65 + insets.bottom : 85,
            paddingBottom: Platform.OS === 'android' ? 10 + insets.bottom : 30,
          },
        }}
      >
        <Tabs.Screen 
          name="index" 
          listeners={({ navigation }: any) => ({
            tabPress: (e: any) => {
              e.preventDefault();
              navigation.navigate('index', {
                date: new Date().toISOString().slice(0, 10),
                reset: Date.now().toString(),
              });
            },
          })}
          options={{ 
            title: 'Hôm nay', 
            tabBarIcon: ({color}) => <Home color={color}/>,
          }} 
        />
        <Tabs.Screen name="month" options={{ title: 'Lịch tháng', tabBarIcon: ({color}) => <CalendarDays color={color}/> }} />
        <Tabs.Screen name="events" options={{ title: 'Sự kiện', tabBarIcon: ({color}) => <PlusCircle color={color}/> }} />
        <Tabs.Screen name="settings" options={{ title: 'Cài đặt', tabBarIcon: ({color}) => <Settings color={color}/> }} />
      </Tabs>
    </GestureHandlerRootView>
  );
}
