import { useFocusEffect } from 'expo-router';
import { Bell, FileUp, Info, Share2 } from 'lucide-react-native';
import React, { useCallback, useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { sendTestNotification } from '../utils/notifications';
import { exportBackup, importBackup, loadEvents } from '../utils/storage';

export default function SettingsScreen() {
  const [totalEvents, setTotalEvents] = useState(0);

  useFocusEffect(
    useCallback(() => {
      loadEvents().then(data => setTotalEvents(data.length));
    }, [])
  );

  const handleExport = async () => {
    await exportBackup();
  };

  const handleRestore = async () => {
    Alert.alert(
      "Xác nhận",
      "Hành động này sẽ ghi đè dữ liệu hiện tại bằng file backup. Tiếp tục?",
      [
        { text: "Hủy", style: "cancel" },
        { 
          text: "Đồng ý", 
          onPress: async () => {
            const data = await importBackup();
            if (data) {
              setTotalEvents(data.length);
            }
          } 
        }
      ]
    );
  };

  const handleTestNotification = async () => {
    const success = await sendTestNotification();
    if (!success) {
      Alert.alert("Chưa được cấp quyền", "Vui lòng cho phép thông báo trong cài đặt hệ thống của điện thoại.");
      return;
    }

    Alert.alert("Đã bật thông báo", "Thông báo thử sẽ xuất hiện sau khoảng 3 giây.");
  };

  return (
    <View style={styles.container}>
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

      <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#2E7D32' }]} onPress={handleRestore}>
        <FileUp color="#fff" size={20} />
        <Text style={styles.btnText}>Khôi phục từ file</Text>
      </TouchableOpacity>
    </View>
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
});
