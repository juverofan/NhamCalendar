import { useFocusEffect } from 'expo-router';
import { FileUp, Info, Share2 } from 'lucide-react-native';
import React, { useCallback, useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { exportBackup, importBackup, loadEvents } from '../utils/storage';

export default function SettingsScreen() {
  const [totalEvents, setTotalEvents] = useState(0);

  // useFocusEffect giúp tự động load lại số lượng mỗi khi bạn bấm sang Tab Cài đặt
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
              Alert.alert("Thành công", `Đã khôi phục ${data.length} sự kiện từ file.`);
            } else {
              Alert.alert("Lỗi", "File không hợp lệ hoặc bị hủy.");
            }
          } 
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Thông tin bộ nhớ</Text>
      
      <View style={styles.card}>
        <View style={styles.infoRow}>
          <Info color="#555" size={24} />
          <View style={styles.textGroup}>
            <Text style={styles.label}>Tổng số sự kiện đang lưu trữ:</Text>
            <Text style={styles.valueText}>{totalEvents} sự kiện</Text>
          </View>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Sao lưu & Phục hồi (Backup)</Text>
      
      <TouchableOpacity style={styles.actionBtn} onPress={handleExport}>
        <Share2 color="#fff" size={20} />
        <Text style={styles.btnText}>Xuất file Backup (.json)</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#2E7D32' }]} onPress={handleRestore}>
        <FileUp color="#fff" size={20} />
        <Text style={styles.btnText}>Khôi phục từ file Backup</Text>
      </TouchableOpacity>

      <Text style={styles.note}>
        * Lời khuyên: Hãy thường xuyên xuất file Backup và lưu vào Google Drive để tránh mất các ngày giỗ, ngày kỉ niệm quan trọng khi bạn đổi điện thoại mới.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9f9f9', padding: 20 },
  sectionTitle: { fontSize: 14, fontWeight: 'bold', color: '#888', marginBottom: 10, marginTop: 20, textTransform: 'uppercase' },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 15, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2 },
  infoRow: { flexDirection: 'row', alignItems: 'center' },
  textGroup: { flex: 1, marginLeft: 15 },
  label: { fontSize: 13, color: '#666' },
  valueText: { fontSize: 18, fontWeight: 'bold', color: '#D32F2F', marginTop: 4 },
  actionBtn: { backgroundColor: '#1565C0', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 15, borderRadius: 10, marginTop: 12 },
  btnText: { color: '#fff', fontWeight: 'bold', marginLeft: 10, fontSize: 16 },
  note: { marginTop: 30, fontSize: 13, color: '#aaa', textAlign: 'center', fontStyle: 'italic', lineHeight: 20 }
});