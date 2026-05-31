import { useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Linking, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { FullLunarInfo, getFullLunarInfo, getHourCanChi } from '../utils/lunar';
import { loadEvents } from '../utils/storage';

export default function DailyScreen() {
  const params = useLocalSearchParams();
  const dateToDisplay = params.date ? new Date(params.date as string) : new Date();

  const [info, setInfo] = useState<FullLunarInfo | null>(null);
  const [todayEvent, setTodayEvent] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  
  // State quản lý thời gian thực
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    // Cập nhật đồng hồ mỗi giây
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    async function initData() {
      try {
        const lunarInfo = getFullLunarInfo(dateToDisplay);
        setInfo(lunarInfo);

        const personalEvents = await loadEvents();
        const publicHolidays = [
          { day: 1, month: 1, type: 'solar', title: 'Tết Dương Lịch' },
          { day: 1, month: 1, type: 'lunar', title: 'Mùng 1 Tết Nguyên Đán' },
          // ... (bạn có thể dán lại mảng các ngày lễ và tiết khí ở code trước vào đây)
        ];

        const eventsOfToday = [...personalEvents, ...publicHolidays].filter(e => {
          if (e.type === 'solar') {
            return e.day === lunarInfo.solarDay && e.month === lunarInfo.solarMonth;
          } else {
            return e.day === lunarInfo.lunarDay && e.month === lunarInfo.lunarMonth;
          }
        });

        if (eventsOfToday.length > 0) {
          setTodayEvent(eventsOfToday.map(e => e.title).join(' • '));
        } else {
          setTodayEvent(null);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
    initData();
  }, [params.date]);

  if (loading || !info) return <View style={styles.center}><ActivityIndicator size="large" color="#D32F2F" /></View>;

  // Format giờ phút (VD: 09:05)
  const formattedTime = `${String(currentTime.getHours()).padStart(2, '0')}:${String(currentTime.getMinutes()).padStart(2, '0')}`;
  // Lấy Can Chi của Giờ hiện tại
  const hourCanChi = getHourCanChi(currentTime, info.canDay);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerBox}>
        <Text style={styles.headerText}>Tháng {info.solarMonth} - {info.solarYear}</Text>
      </View>

      <View style={styles.solarCircle}>
        <Text style={styles.solarDayText}>{info.solarDay}</Text>
        <Text style={styles.dayOfWeekText}>{info.dayOfWeekName.toUpperCase()}</Text>
        <Text style={[styles.eventText, todayEvent ? styles.hasEvent : null]}>
          {todayEvent || "Không có sự kiện"}
        </Text>
      </View>

      <View style={styles.lunarFooter}>
        <View style={styles.lunarDetailBox}>
          <Text style={styles.label}>GIỜ</Text>
          <Text style={styles.timeText}>{formattedTime}</Text>
          {/* Lấy Can Chi Giờ */}
          <Text style={styles.canChiSmall}>{hourCanChi}</Text> 
        </View>
        <View style={[styles.lunarDetailBox, styles.borderLateral]}>
          <Text style={styles.label}>NGÀY</Text>
          <Text style={styles.lunarMainText}>{info.lunarDay}</Text>
          {/* Lấy Can Chi Ngày */}
          <Text style={styles.canChiSmall}>Ngày {info.canDay}</Text>
        </View>
        <View style={styles.lunarDetailBox}>
          <Text style={styles.label}>THÁNG / NĂM</Text>
          <Text style={styles.lunarMainText}>{info.lunarMonth}</Text>
          {/* Lấy Can Chi Tháng và Năm */}
          <Text style={styles.canChiSmall}>Tháng {info.canMonth}</Text>
          <Text style={styles.canChiSmall}>Năm {info.canYear}</Text>
        </View>
      </View>

      <View style={styles.footerContainer}>
        <TouchableOpacity activeOpacity={0.7} onPress={() => Linking.openURL('https://topvl.net/mobile-apps.html')}>
          <Text style={styles.storeLink}>Khám phá thêm các ứng dụng thú vị tại{"\n"}
            <Text style={styles.storeName}>NhảmStudio Store</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  container: { flex: 1, backgroundColor: '#FDFCF0', alignItems: 'center' },
  headerBox: { marginTop: 20, paddingHorizontal: 20, paddingVertical: 5, borderRadius: 20, borderWidth: 1, borderColor: '#ccc', backgroundColor: '#fff' },
  headerText: { fontSize: 16, fontWeight: '600', color: '#2C3E50' },
  solarCircle: { marginTop: 60, alignItems: 'center', paddingHorizontal: 20 },
  solarDayText: { fontSize: 120, fontWeight: 'bold', color: '#1A237E' },
  dayOfWeekText: { fontSize: 28, fontWeight: 'bold', color: '#2E7D32', marginTop: -10 },
  eventText: { fontSize: 16, color: '#777', marginTop: 10, fontStyle: 'italic', textAlign: 'center' },
  hasEvent: { color: '#D32F2F', fontWeight: 'bold', fontStyle: 'normal' },
  lunarFooter: { flexDirection: 'row', width: '100%', borderTopWidth: 1, borderColor: '#eee', marginTop: 'auto', paddingBottom: 10, backgroundColor: '#FFF9C4' },
  lunarDetailBox: { flex: 1, alignItems: 'center', paddingVertical: 15, justifyContent: 'flex-start' },
  borderLateral: { borderLeftWidth: 1, borderRightWidth: 1, borderColor: '#E0E0E0' },
  label: { fontSize: 11, color: '#777', marginBottom: 5, fontWeight: 'bold' },
  timeText: { fontSize: 24, fontWeight: 'bold' },
  lunarMainText: { fontSize: 28, fontWeight: 'bold', color: '#1565C0', marginBottom: 5 },
  canChiSmall: { fontSize: 12, color: '#444', textAlign: 'center', marginTop: 2 },
  footerContainer: { padding: 20, marginBottom: 10, alignItems: 'center', width: '100%' },
  storeLink: { textAlign: 'center', color: '#666', lineHeight: 22, fontSize: 14 },
  storeName: { color: '#D32F2F', fontWeight: 'bold', fontSize: 16, textDecorationLine: 'underline' }
});