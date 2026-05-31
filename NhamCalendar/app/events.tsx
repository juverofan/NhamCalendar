import { Plus, Trash2 } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { Alert, FlatList, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { CalendarEvent, loadEvents, saveEvents } from '../utils/storage';

export default function EventsScreen() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [title, setTitle] = useState('');
  const [day, setDay] = useState('');
  const [month, setMonth] = useState('');
  const [type, setType] = useState<'solar' | 'lunar'>('solar');

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const data = await loadEvents();
      setEvents(data || []);
    } catch (e) {
      console.error("Lỗi đọc file:", e);
    }
  };

  const handleAddEvent = async () => {
    // Validate dữ liệu
    if (!title.trim() || !day.trim() || !month.trim()) {
      Alert.alert("Lỗi", "Vui lòng nhập đầy đủ Tên, Ngày và Tháng.");
      return;
    }
    const d = parseInt(day);
    const m = parseInt(month);
    if (isNaN(d) || isNaN(m) || d < 1 || d > 31 || m < 1 || m > 12) {
      Alert.alert("Lỗi", "Ngày hoặc tháng không hợp lệ.");
      return;
    }

    const newEvent: CalendarEvent = {
      id: Date.now().toString(),
      title: title.trim(),
      day: d,
      month: m,
      type
    };

    const updatedEvents = [...events, newEvent];
    
    // Lưu vào file JSON
    const success = await saveEvents(updatedEvents);
    
    if (success) {
      setEvents(updatedEvents); // Cập nhật UI ngay lập tức
      setTitle(''); setDay(''); setMonth(''); // Xóa trắng form
      Alert.alert("Thành công", `Đã lưu sự kiện: ${newEvent.title}`);
    } else {
      Alert.alert("Lỗi", "Không thể lưu dữ liệu vào hệ thống.");
    }
  };

  const handleDeleteEvent = (id: string) => {
    Alert.alert("Xóa sự kiện", "Bạn có chắc chắn muốn xóa?", [
      { text: "Hủy", style: "cancel" },
      { 
        text: "Xóa", 
        style: "destructive",
        onPress: async () => {
          const updatedEvents = events.filter(e => e.id !== id);
          await saveEvents(updatedEvents);
          setEvents(updatedEvents);
        }
      }
    ]);
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
      {/* Khung Thêm Sự Kiện */}
      <View style={styles.form}>
        <Text style={styles.formTitle}>Thêm sự kiện mới</Text>
        <TextInput 
          style={styles.input} 
          placeholder="Tên sự kiện (VD: Sinh nhật, Giỗ...)" 
          value={title} 
          onChangeText={setTitle} 
        />
        <View style={styles.row}>
          <TextInput style={[styles.input, styles.halfInput]} placeholder="Ngày" keyboardType="numeric" value={day} onChangeText={setDay} maxLength={2} />
          <TextInput style={[styles.input, styles.halfInput]} placeholder="Tháng" keyboardType="numeric" value={month} onChangeText={setMonth} maxLength={2} />
          
          <TouchableOpacity 
            style={[styles.typeBtn, type === 'lunar' && styles.typeBtnActive]} 
            onPress={() => setType(type === 'solar' ? 'lunar' : 'solar')}
          >
            <Text style={{ color: type === 'lunar' ? '#fff' : '#333', fontWeight: 'bold' }}>
              {type === 'lunar' ? 'ÂM LỊCH' : 'DƯƠNG LỊCH'}
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.addBtn} onPress={handleAddEvent}>
          <Plus color="#fff" size={20} />
          <Text style={styles.addBtnText}>Lưu Sự Kiện</Text>
        </TouchableOpacity>
      </View>

      {/* Danh sách Sự Kiện Đã Lưu */}
      <Text style={styles.listTitle}>Danh sách sự kiện đã lưu ({events.length})</Text>
      <FlatList
        data={events}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.eventItem}>
            <View style={{ flex: 1 }}>
              <Text style={styles.eventTitle}>{item.title}</Text>
              <Text style={styles.eventDate}>
                Ngày {item.day}/{item.month} - {item.type === 'lunar' ? 'Lịch Âm' : 'Lịch Dương'}
              </Text>
            </View>
            <TouchableOpacity onPress={() => handleDeleteEvent(item.id)} style={{ padding: 10 }}>
              <Trash2 color="#e74c3c" size={22} />
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.emptyText}>Chưa có sự kiện nào được lưu.</Text>}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', padding: 15 },
  formTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 15, color: '#333' },
  form: { backgroundColor: '#fff', padding: 15, borderRadius: 12, marginBottom: 20, elevation: 2, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4 },
  input: { borderBottomWidth: 1, borderColor: '#ddd', paddingVertical: 10, fontSize: 15, marginBottom: 15 },
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: 15, justifyContent: 'space-between' },
  halfInput: { width: '25%', textAlign: 'center' },
  typeBtn: { paddingVertical: 10, paddingHorizontal: 15, borderRadius: 8, backgroundColor: '#e0e0e0' },
  typeBtnActive: { backgroundColor: '#D32F2F' },
  addBtn: { backgroundColor: '#2E7D32', padding: 14, borderRadius: 8, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  addBtnText: { color: '#fff', fontWeight: 'bold', marginLeft: 8, fontSize: 16 },
  listTitle: { fontSize: 14, fontWeight: 'bold', color: '#666', marginBottom: 10, textTransform: 'uppercase' },
  eventItem: { backgroundColor: '#fff', padding: 15, borderRadius: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, borderLeftWidth: 4, borderLeftColor: '#3498db' },
  eventTitle: { fontSize: 16, fontWeight: 'bold', color: '#2c3e50', marginBottom: 4 },
  eventDate: { color: '#7f8c8d', fontSize: 13 },
  emptyText: { textAlign: 'center', color: '#999', marginTop: 20, fontStyle: 'italic' }
});