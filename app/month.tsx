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
    const firstDay = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();
    
    const padding = firstDay === 0 ? 6 : firstDay - 1;
    for (let i = 0; i < padding; i++) days.push({ empty: true });

    for (let d = 1; d <= totalDays; d++) {
      const date = new Date(year, month, d);
      const lunar: any = new LunarDate(date);
      days.push({ 
        solar: d, 
        lunar: lunar.day || (lunar as any).date, 
        lunarMonth: lunar.month,
        fullDate: `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`,
        dayOfWeek: date.getDay()
      });
    }
    return days;
  };

  return (
    <View style={styles.container}>
      <View style={styles.monthHeader}>
        <TouchableOpacity onPress={() => changeMonth(-1)} style={{padding: 5}}><ChevronLeft color="#333" /></TouchableOpacity>
        <Text style={styles.monthTitle}>Tháng {month + 1} - {year}</Text>
        <TouchableOpacity onPress={() => changeMonth(1)} style={{padding: 5}}><ChevronRight color="#333" /></TouchableOpacity>
      </View>
      <View style={styles.weekRow}>
        {['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map(d => (
          <Text key={d} style={[styles.weekLabel, d === 'CN' && {color: 'red'}]}>{d}</Text>
        ))}
      </View>
      <FlatList
        data={generateDays()}
        numColumns={7}
        keyExtractor={(_, index) => index.toString()}
        renderItem={({ item }: any) => {
          if (item.empty) return <View style={styles.cellEmpty} />;
          
          const isToday = new Date().toISOString().split('T')[0] === item.fullDate;
          const isTet = (item.lunarMonth === 1 && (item.lunar >= 1 && item.lunar <= 3));
          const isSolarNewYear = (item.solar === 1 && month === 0);
          
          let color = '#111';
          if (item.dayOfWeek === 0 || isTet || isSolarNewYear) color = 'red';
          else if (item.dayOfWeek === 6) color = '#1565C0';

          return (
            <TouchableOpacity 
              style={[styles.cell, isToday && styles.todayCell]} 
              onPress={() => router.navigate({ pathname: '/', params: { date: item.fullDate } })}
            >
              <Text style={[styles.solarNum, { color }, isToday && {fontWeight: '900'}]}>{item.solar}</Text>
              <Text style={[styles.lunarNum, item.lunar === 1 && {color: 'red'}]}>
                {item.lunar === 1 ? `${item.lunar}/${item.lunarMonth}` : item.lunar}
              </Text>
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  monthHeader: { flexDirection: 'row', justifyContent: 'space-between', padding: 15, alignItems: 'center', backgroundColor: '#f9f9f9' },
  monthTitle: { fontSize: 18, fontWeight: 'bold', color: '#2C3E50' },
  weekRow: { flexDirection: 'row', backgroundColor: '#FFD54F', paddingVertical: 10 },
  weekLabel: { flex: 1, textAlign: 'center', fontWeight: 'bold', color: '#333' },
  cell: { width: width / 7, height: 75, borderBottomWidth: 0.5, borderRightWidth: 0.5, borderColor: '#eee', padding: 5, justifyContent: 'space-between' },
  cellEmpty: { width: width / 7, height: 75, backgroundColor: '#fafafa', borderBottomWidth: 0.5, borderRightWidth: 0.5, borderColor: '#eee' },
  todayCell: { backgroundColor: '#FFF9C4', borderWidth: 1, borderColor: '#FBC02D' },
  solarNum: { fontSize: 18, fontWeight: '500' },
  lunarNum: { fontSize: 11, color: '#888', textAlign: 'right' }
});
