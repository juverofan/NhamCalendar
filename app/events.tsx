import { Plus, Trash2 } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { Alert, FlatList, Keyboard, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { CalendarEvent, loadEvents, saveEvents } from '../utils/storage';

export default function EventsScreen() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [title, setTitle] = useState('');
  const [day, setDay] = useState('');
  const [month, setMonth] = useState('');
  const [type, setType] = useState<'solar' | 'lunar'>('solar');

  useEffect(() => { 
    loadEvents().then(setEvents); 
  }, []);

  const handleAddEvent = async () => {
    if (!title.trim() || !day || !month) {
      Alert.alert("Lỗi", "Vui lòng nhập đầy đủ Tên, Ngày, Tháng");
      return;
    }
    const d = parseInt(day);
    const m = parseInt(month);
    if (isNaN(d) || isNaN(m) || d < 1 || d > 31 || m < 1 || m > 12) {
      Alert.alert("Lỗi", "Ngày hoặc tháng không hợp lệ");
      return;
    }

    const newEvent: CalendarEvent = { id: Date.now().toString(), title: title.trim(), day: d, month: m, type };
    const updatedEvents = [...events, newEvent];
    
    // Đợi kết quả lưu thực tế
    const success = await saveEvents(updatedEvents);
    if (success) {
      setEvents(updatedEvents);
      setTitle(''); setDay(''); setMonth('');
      Keyboard.dismiss();
      Alert.alert("Thành công", `Đã lưu sự kiện: ${newEvent.title}`);
    } else {
      Alert.alert("Lỗi", "Không thể lưu dữ liệu vào máy");
    }
  };

  const handleDeleteEvent = (id: string) => {
    Alert.alert("Xóa sự kiện", "Bạn có chắc muốn xóa?", [
      { text: "Hủy", style: "cancel" },
      { 
        text: "Xóa", 
        style: "destructive",
        onPress: async () => {
          const updatedEvents = events.filter(e => e.id !== id);
          const success = await saveEvents(updatedEvents);
          if (success) setEvents(updatedEvents);
        }
      }
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.form}>
        <TextInput style={styles.input} placeholder="Tên sự kiện (Sinh nhật, Giỗ...)" value={title} onChangeText={setTitle} />
        <View style={styles.row}>
          <TextInput style={styles.miniInput} placeholder="Ngày" keyboardType="numeric" value={day} onChangeText={setDay} maxLength={2} />
          <TextInput style={styles.miniInput} placeholder="Tháng" keyboardType="numeric" value={month} onChangeText={setMonth} maxLength={2} />
          <TouchableOpacity style={[styles.typeBtn, type === 'lunar' && styles.typeActive]} onPress={() => setType(type === 'solar' ? 'lunar' : 'solar')}>
            <Text style={{color: type === 'lunar' ? '#fff' : '#333', fontWeight: 'bold'}}>{type === 'lunar' ? 'ÂM LỊCH' : 'DƯƠNG LỊCH'}</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.addBtn} onPress={handleAddEvent}>
          <Plus color="#fff" size={20} />
          <Text style={styles.addTxt}>Lưu Sự Kiện</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={events}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <View style={{flex: 1}}>
              <Text style={styles.itTitle}>{item.title}</Text>
              <Text style={styles.itSub}>Ngày {item.day}/{item.month} ({item.type === 'lunar' ? 'Âm' : 'Dương'})</Text>
            </View>
            <TouchableOpacity onPress={() => handleDeleteEvent(item.id)} style={{padding: 5}}>
              <Trash2 color="#e74c3c" size={22} />
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.empty}>Chưa có sự kiện nào được lưu</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 15, backgroundColor: '#f5f5f5' },
  form: { backgroundColor: '#fff', padding: 15, borderRadius: 12, marginBottom: 20, elevation: 2 },
  input: { borderBottomWidth: 1, borderColor: '#ddd', marginBottom: 15, paddingVertical: 8, fontSize: 16 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  miniInput: { borderBottomWidth: 1, borderColor: '#ddd', width: '22%', textAlign: 'center', fontSize: 16 },
  typeBtn: { paddingVertical: 10, borderRadius: 8, backgroundColor: '#eee', width: '40%', alignItems: 'center' },
  typeActive: { backgroundColor: '#D32F2F' },
  addBtn: { backgroundColor: '#2E7D32', padding: 14, borderRadius: 8, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  addTxt: { color: '#fff', fontWeight: 'bold', marginLeft: 8, fontSize: 16 },
  item: { backgroundColor: '#fff', padding: 15, borderRadius: 10, marginBottom: 10, flexDirection: 'row', alignItems: 'center', borderLeftWidth: 4, borderLeftColor: '#3498db' },
  itTitle: { fontWeight: 'bold', fontSize: 16, color: '#2C3E50', marginBottom: 4 },
  itSub: { color: '#7f8c8d', fontSize: 13 },
  empty: { textAlign: 'center', color: '#999', marginTop: 30, fontStyle: 'italic' }
});