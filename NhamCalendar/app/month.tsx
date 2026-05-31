import { useRouter } from 'expo-router';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import React, { useState } from 'react';
import { Dimensions, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { LunarDate } from 'vietnamese-lunar-calendar';

const { width } = Dimensions.get('window');

export default function MonthScreen() {
  const router = useRouter();
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const changeMonth = (delta: number) => {
    setCurrentDate(new Date(year, month + delta, 1));
  };

  const generateDays = () => {
    const days = [];
    const firstDay = new Date(year, month, 1).getDay(); // 0=CN
    const totalDays = new Date(year, month + 1, 0).getDate();
    
    const padding = firstDay === 0 ? 6 : firstDay - 1;
    for (let i = 0; i < padding; i++) days.push({ empty: true });

    for (let d = 1; d <= totalDays; d++) {
      const date = new Date(year, month, d);
      const lunar = new LunarDate(date);
      
      // Fix timezone offset issue in React Native
      const localDateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}T00:00:00`;

      days.push({ 
        solar: d, 
        lunar: lunar.day || lunar.date, 
        isFirst: lunar.day === 1 || lunar.date === 1, 
        month: lunar.month,
        fullDate: localDateString
      });
    }
    return days;
  };

  const handlePressDay = (dateString: string) => {
    // Navigate sẽ gọi đúng Tab Route
    router.navigate({ pathname: '/', params: { date: dateString } });
  };

  return (
    <View style={styles.container}>
      <View style={styles.monthHeader}>
        <TouchableOpacity onPress={() => changeMonth(-1)} style={styles.navBtn}>
          <ChevronLeft color="#333" size={28} />
        </TouchableOpacity>
        <Text style={styles.monthTitle}>Tháng {month + 1} - {year}</Text>
        <TouchableOpacity onPress={() => changeMonth(1)} style={styles.navBtn}>
          <ChevronRight color="#333" size={28} />
        </TouchableOpacity>
      </View>

      <View style={styles.weekRow}>
        {['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map(d => (
          <Text key={d} style={styles.weekLabel}>{d}</Text>
        ))}
      </View>
      <FlatList
        data={generateDays()}
        numColumns={7}
        keyExtractor={(_, index) => index.toString()}
        renderItem={({ item }) => (
          item.empty ? (
            <View style={styles.cellEmpty} />
          ) : (
            <TouchableOpacity style={styles.cell} onPress={() => handlePressDay(item.fullDate)}>
              <Text style={styles.solarNum}>{item.solar}</Text>
              <Text style={[styles.lunarNum, item.isFirst && styles.lunarFirst]}>
                {item.isFirst ? `${item.lunar}/${item.month}` : item.lunar}
              </Text>
            </TouchableOpacity>
          )
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  monthHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 15, backgroundColor: '#f9f9f9' },
  navBtn: { padding: 5 },
  monthTitle: { fontSize: 18, fontWeight: 'bold', color: '#2C3E50' },
  weekRow: { flexDirection: 'row', backgroundColor: '#FFD54F', paddingVertical: 10 },
  weekLabel: { flex: 1, textAlign: 'center', fontWeight: 'bold', color: '#333' },
  cell: { width: width / 7, height: width / 7 * 1.2, borderBottomWidth: 0.5, borderRightWidth: 0.5, borderColor: '#eee', padding: 6, justifyContent: 'space-between' },
  cellEmpty: { width: width / 7, height: width / 7 * 1.2, backgroundColor: '#fafafa', borderBottomWidth: 0.5, borderRightWidth: 0.5, borderColor: '#eee' },
  solarNum: { fontSize: 18, fontWeight: '500', color: '#111' },
  lunarNum: { fontSize: 12, color: '#888', textAlign: 'right' },
  lunarFirst: { color: '#D32F2F', fontWeight: 'bold' },
});