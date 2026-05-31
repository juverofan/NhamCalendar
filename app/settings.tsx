import { useFocusEffect } from 'expo-router';
import { Bell, Info, Share2 } from 'lucide-react-native';
import React, { useCallback, useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View, ScrollView } from 'react-native';
import { sendTestNotification } from '../utils/notifications';
import { exportBackup, importBackupFromText, loadEvents } from '../utils/storage';

export default function SettingsScreen() {
  const [totalEvents, setTotalEvents] = useState(0);
  const [importText, setImportText] = useState('');

  useFocusEffect(
    useCallback(() => {
      loadEvents().then(data => setTotalEvents(data.length));
    }, [])
  );

  const handleExport = async () => {
    await exportBackup();
  };

  const handleRestoreFromText = async () => {
    if (!importText.trim()) {
      Alert.alert("Thông báo", "Vui lòng dán nội dung backup vào ô nhập liệu.");
      return;
    }
    const data = await importBackupFromText(importText);
    if (data) {
      setTotalEvents(data.length);
      setImportText('');
    }
  };

  const handleTestNotification = async () => {
    const result = await sendTestNotification();
    if (!result.success) {
      Alert.alert("Lỗi gửi thông báo", `Hệ thống báo lỗi: ${result.error}\n\nHãy thử kiểm tra lại quyền thông báo trong Cài đặt.`);
      return;
    }
    Alert.alert("Đã gửi thông báo thử", "Thông báo sẽ xuất hiện ngay. Nếu không thấy, hãy kéo thanh thông báo xuống.");
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.sectionTitle}>Thông tin bộ nhớ</Text>
      
      <View style={styles.card}>
        <View style={styles.infoRow}>
          <Info color="#555" size={24} />
          <View style={styles.textGroup}>
            <Text style={styles.label}>Tổng số sự kiện cá nhân:</Text>
            <Text style={styles.valueText}>{totalEvents} sự kiện</Text>
            <Text style={styles.hint}>Thông báo nhắc lúc 08:00 từ trước 5 ngày đến đúng ngày sự kiện.</Text>
          </View>
        </View>
      </View>
  
      <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#D32F2F' }]} onPress={handleTestNotification}>
        <Bell color="#fff" size={20} />
        <Text style={styles.btnText}>Bật / thử thông báo</Text>
      </TouchableOpacity>
  
      <Text style={styles.sectionTitle}>Sao lưu & Phục hồi</Text>
      
      <TouchableOpacity style={styles.actionBtn} onPress={handleExport}>
        <Share2 color="#fff" size={20} />
        <Text style={styles.btnText}>Xuất file Backup (.json)</Text>
      </TouchableOpacity>

      <View style={styles.textRestoreContainer}>
        <Text style={styles.restoreLabel}>Hoặc dán nội dung JSON backup vào đây:</Text>
        <TextInput 
          style={styles.importInput} 
          value={importText} 
          onChangeText={setImportText} 
          placeholder="Dán nội dung JSON vào đây..."
          multiline
        />
        <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#1565C0' }]} onPress={handleRestoreFromText}>
          <Text style={styles.btnText}>Khôi phục từ văn bản</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9f9f9', padding: 20 },
  sectionTitle: { fontSize: 14, fontWeight: 'bold', color: '#888', marginBottom: 10, marginTop: 20, textTransform: 'uppercase' },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 15, elevation: 2 },
  infoRow: { flexDirection: 'row', alignItems: 'center' },
  textGroup: { flex: 1, marginLeft: 15 },
  label: { fontSize: 13, color: '#666' },
  valueText: { fontSize: 18, fontWeight: 'bold', color: '#D32F2F', marginTop: 4 },
  hint: { fontSize: 12, color: '#777', marginTop: 6, lineHeight: 18 },
  actionBtn: { backgroundColor: '#1565C0', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 15, borderRadius: 10, marginTop: 12 },
  btnText: { color: '#fff', fontWeight: 'bold', marginLeft: 10, fontSize: 16 },
  textRestoreContainer: { marginTop: 20, padding: 15, backgroundColor: '#fff', borderRadius: 12, elevation: 2 },
  restoreLabel: { fontSize: 13, color: '#666', marginBottom: 10, fontWeight: 'bold' },
  importInput: { backgroundColor: '#f0f0f0', borderRadius: 8, padding: 10, height: 100, textAlignVertical: 'top', fontSize: 12, fontFamily: 'monospace' },
});
