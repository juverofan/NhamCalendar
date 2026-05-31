import { Tabs } from 'expo-router';
import { CalendarDays, Home, PlusCircle, Settings } from 'lucide-react-native';

export default function Layout() {
  return (
    <Tabs screenOptions={{ tabBarActiveTintColor: '#D32F2F', headerTitleAlign: 'center' }}>
      <Tabs.Screen name="index" options={{ title: "Hôm nay", tabBarIcon: ({color}) => <Home color={color}/> }} />
      <Tabs.Screen name="month" options={{ title: "Lịch tháng", tabBarIcon: ({color}) => <CalendarDays color={color}/> }} />
      <Tabs.Screen name="events" options={{ title: "Sự kiện", tabBarIcon: ({color}) => <PlusCircle color={color}/> }} />
      <Tabs.Screen name="settings" options={{ title: "Cài đặt", tabBarIcon: ({color}) => <Settings color={color}/> }} />
    </Tabs>
  );
}