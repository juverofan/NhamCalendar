import { useLocalSearchParams, useNavigation } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Linking, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { PanGestureHandler, State } from 'react-native-gesture-handler';
import { getFullLunarInfo, getHourCanChi } from '../utils/lunar';
import { loadEvents } from '../utils/storage';

export default function DailyScreen() {
  const params = useLocalSearchParams();
  const navigation = useNavigation();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [displayEvents, setDisplayEvents] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    if (params.date) setSelectedDate(new Date(params.date as string));
    else if (params.reset) setSelectedDate(new Date());
  }, [params.date, params.reset]);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const refreshData = useCallback(async () => {
    setLoading(true);
    const info = getFullLunarInfo(selectedDate);
    const personalEvents = await loadEvents();
    
    // FULL DATA LỄ VÀ 24 TIẾT KHÍ
    const masterData = [
      { day: 1, month: 1, type: 'solar', title: 'Tết Dương Lịch' },
      { day: 14, month: 2, type: 'solar', title: 'Lễ Tình nhân (Valentine)' },
      { day: 8, month: 3, type: 'solar', title: 'Quốc tế Phụ nữ' },
      { day: 30, month: 4, type: 'solar', title: 'Giải phóng miền Nam' },
      { day: 1, month: 5, type: 'solar', title: 'Quốc tế Lao động' },
      { day: 2, month: 9, type: 'solar', title: 'Quốc khánh' },
      { day: 20, month: 11, type: 'solar', title: 'Ngày Nhà giáo Việt Nam' },
      { day: 24, month: 12, type: 'solar', title: 'Lễ Giáng Sinh' },
      { day: 1, month: 1, type: 'lunar', title: 'Mùng 1 Tết Nguyên Đán' },
      { day: 2, month: 1, type: 'lunar', title: 'Mùng 2 Tết' },
      { day: 3, month: 1, type: 'lunar', title: 'Mùng 3 Tết' },
      { day: 15, month: 1, type: 'lunar', title: 'Tết Nguyên Tiêu' },
      { day: 10, month: 3, type: 'lunar', title: 'Giỗ Tổ Hùng Vương' },
      { day: 15, month: 8, type: 'lunar', title: 'Tết Trung Thu' },
      { day: 23, month: 12, type: 'lunar', title: 'Ông Công Ông Táo' },
      { day: 6, month: 1, type: 'solar', title: 'Tiết Tiểu hàn' },
      { day: 20, month: 1, type: 'solar', title: 'Tiết Đại hàn' },
      { day: 4, month: 2, type: 'solar', title: 'Tiết Lập xuân' },
      { day: 19, month: 2, type: 'solar', title: 'Tiết Vũ thủy' },
      { day: 6, month: 3, type: 'solar', title: 'Tiết Kinh trập' },
      { day: 21, month: 3, type: 'solar', title: 'Tiết Xuân phân' },
      { day: 5, month: 4, type: 'solar', title: 'Tiết Thanh minh' },
      { day: 20, month: 4, type: 'solar', title: 'Tiết Cốc vũ' },
      { day: 6, month: 5, type: 'solar', title: 'Tiết Lập hạ' },
      { day: 21, month: 5, type: 'solar', title: 'Tiết Tiểu mãn' },
      { day: 6, month: 6, type: 'solar', title: 'Tiết Mang chủng' },
      { day: 21, month: 6, type: 'solar', title: 'Tiết Hạ chí' },
      { day: 7, month: 7, type: 'solar', title: 'Tiết Tiểu thử' },
      { day: 23, month: 7, type: 'solar', title: 'Tiết Đại thử' },
      { day: 8, month: 8, type: 'solar', title: 'Tiết Lập thu' },
      { day: 23, month: 8, type: 'solar', title: 'Tiết Xử thử' },
      { day: 8, month: 9, type: 'solar', title: 'Tiết Bạch lộ' },
      { day: 23, month: 9, type: 'solar', title: 'Tiết Thu phân' },
      { day: 8, month: 10, type: 'solar', title: 'Tiết Hàn lộ' },
      { day: 23, month: 10, type: 'solar', title: 'Tiết Sương giáng' },
      { day: 7, month: 11, type: 'solar', title: 'Tiết Lập đông' },
      { day: 22, month: 11, type: 'solar', title: 'Tiết Tiểu tuyết' },
      { day: 7, month: 12, type: 'solar', title: 'Tiết Đại tuyết' },
      { day: 22, month: 12, type: 'solar', title: 'Tiết Đông chí' }
    ];

    const allEvents = [...masterData, ...personalEvents];
    
    // Tìm Lễ, Tiết, Sự kiện của ngày được chọn
    const todayList = allEvents.filter(e => e.type === 'solar' 
      ? (e.day === info.solarDay && e.month === info.solarMonth)
      : (e.day === info.lunarDay && e.month === info.lunarMonth)
    );
    
    let finalEventString = todayList.map(e => e.title).join('\n');

    // Quét tìm sự kiện do người dùng nhập trong 7 ngày tới
    let upcomingEvent = null;
    for (let i = 1; i <= 7; i++) {
      const checkDate = new Date(selectedDate);
      checkDate.setDate(selectedDate.getDate() + i);
      const checkInfo = getFullLunarInfo(checkDate);
      
      const found = personalEvents.find(e => e.type === 'solar' 
        ? (e.day === checkInfo.solarDay && e.month === checkInfo.solarMonth) 
        : (e.day === checkInfo.lunarDay && e.month === checkInfo.lunarMonth));
        
      if (found) { upcomingEvent = found; break; }
    }

    // Gộp string: Đặt 'Sắp đến' xuống cuối cùng
    if (upcomingEvent) {
      if (finalEventString) {
        finalEventString += `\nSắp đến: ${upcomingEvent.title}`;
      } else {
        finalEventString = `Sắp đến: ${upcomingEvent.title}`;
      }
    }

    setDisplayEvents(finalEventString);
    setLoading(false);
  }, [selectedDate]);

  useEffect(() => {
    const isToday = new Date().toDateString() === selectedDate.toDateString();
    navigation.setOptions({ title: isToday ? "Hôm nay" : "Chi tiết ngày" });
    refreshData();
  }, [navigation, refreshData, selectedDate]);

  const goToday = () => {
    setSelectedDate(new Date());
    navigation.setParams({ date: undefined, reset: Date.now().toString() } as never);
  };

  const onSwipe = (event: any) => {
    if (event.nativeEvent.state === State.END) {
      const { translationX } = event.nativeEvent;
      const d = new Date(selectedDate);
      if (translationX > 80) { d.setDate(selectedDate.getDate() - 1); setSelectedDate(d); }
      else if (translationX < -80) { d.setDate(selectedDate.getDate() + 1); setSelectedDate(d); }
    }
  };

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color="#D32F2F" /></View>;
  const info = getFullLunarInfo(selectedDate);
  const hourCanChi = getHourCanChi(time, info.canDay);

  return (
    <PanGestureHandler onHandlerStateChange={onSwipe}>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}><Text style={styles.headerTxt}>Tháng {info.solarMonth} - {info.solarYear}</Text></View>
        {new Date().toDateString() !== selectedDate.toDateString() && (
          <TouchableOpacity style={styles.todayBtn} onPress={goToday}>
            <Text style={styles.todayTxt}>Về hôm nay</Text>
          </TouchableOpacity>
        )}
        
        <View style={styles.main}>
          <Text style={styles.solarDay}>{info.solarDay}</Text>
          <Text style={styles.dayOfWeek}>{info.dayOfWeekName.toUpperCase()}</Text>
          
          <View style={styles.eventBox}>
            <Text style={styles.eventTxt}>{displayEvents || "Không có sự kiện"}</Text>
          </View>
        </View>

        <View style={styles.footer}>
          <View style={styles.box}><Text style={styles.lab}>GIỜ</Text><Text style={styles.val}>{time.getHours()}:{String(time.getMinutes()).padStart(2,'0')}</Text><Text style={styles.can}>{hourCanChi}</Text></View>
          <View style={[styles.box, styles.border]}><Text style={styles.lab}>NGÀY ÂM</Text><Text style={styles.val}>{info.lunarDay}</Text><Text style={styles.can}>Ngày {info.canDay}</Text></View>
          <View style={styles.box}><Text style={styles.lab}>THÁNG/NĂM</Text><Text style={styles.val}>{info.lunarMonth}</Text><Text style={styles.can}>Tháng {info.canMonth}</Text><Text style={styles.can}>Năm {info.canYear}</Text></View>
        </View>
        
        <TouchableOpacity style={styles.linkWrap} onPress={() => Linking.openURL('https://topvl.net/mobile-apps.html')}>
          <Text style={styles.linkTxt}>NhảmStudio Store</Text>
        </TouchableOpacity>
      </SafeAreaView>
    </PanGestureHandler>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  container: { flex: 1, backgroundColor: '#FDFCF0', alignItems: 'center' },
  header: { marginTop: 20, paddingHorizontal: 15, paddingVertical: 8, borderRadius: 20, backgroundColor: '#fff', borderWidth: 1, borderColor: '#ccc' },
  headerTxt: { fontWeight: 'bold', fontSize: 16, color: '#2C3E50' },
  todayBtn: { marginTop: 10, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 18, backgroundColor: '#D32F2F' },
  todayTxt: { color: '#fff', fontWeight: 'bold' },
  main: { flex: 1, justifyContent: 'center', alignItems: 'center', width: '100%' },
  solarDay: { fontSize: 110, fontWeight: 'bold', color: '#1A237E' },
  dayOfWeek: { fontSize: 26, fontWeight: 'bold', color: '#2E7D32', marginTop: -10 },
  eventBox: { marginTop: 20, paddingHorizontal: 20, alignItems: 'center' },
  eventTxt: { fontSize: 18, color: '#D32F2F', textAlign: 'center', fontWeight: 'bold', lineHeight: 28 },
  footer: { flexDirection: 'row', backgroundColor: '#FFF9C4', borderTopWidth: 1, borderColor: '#eee', paddingBottom: 15 },
  box: { flex: 1, alignItems: 'center', paddingVertical: 15 },
  border: { borderLeftWidth: 1, borderRightWidth: 1, borderColor: '#ddd' },
  lab: { fontSize: 11, fontWeight: 'bold', color: '#777', marginBottom: 5 },
  val: { fontSize: 26, fontWeight: 'bold', color: '#1565C0' },
  can: { fontSize: 12, color: '#444', marginTop: 4 },
  linkWrap: { padding: 15 },
  linkTxt: { color: '#D32F2F', fontWeight: 'bold', textDecorationLine: 'underline', fontSize: 14 }
});
