import AsyncStorage from '@react-native-async-storage/async-storage';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

const STORAGE_KEY = '@nham_calendar_events';

export interface CalendarEvent {
  id: string;
  title: string;
  type: 'solar' | 'lunar';
  day: number;
  month: number;
}

export const saveEvents = async (events: CalendarEvent[]) => {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(events));
    return true;
  } catch (e) {
    return false;
  }
};

export const loadEvents = async (): Promise<CalendarEvent[]> => {
  try {
    const content = await AsyncStorage.getItem(STORAGE_KEY);
    return content ? JSON.parse(content) : [];
  } catch (e) {
    return [];
  }
};

// --- CHỨC NĂNG BACKUP / RESTORE DÀNH CHO ASYNC STORAGE ---

export const exportBackup = async () => {
  try {
    const data = await loadEvents();
    // Tạo 1 file JSON tạm thời trong bộ nhớ cache
    const fileUri = FileSystem.cacheDirectory + 'NhamCalendar_Backup.json';
    await FileSystem.writeAsStringAsync(fileUri, JSON.stringify(data));
    
    // Bật bảng chia sẻ (Share) của điện thoại
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(fileUri);
    }
  } catch (e) {
    console.error("Lỗi Export:", e);
  }
};

export const importBackup = async () => {
  try {
    // Mở trình chọn file của điện thoại
    const result = await DocumentPicker.getDocumentAsync({ type: 'application/json' });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      const content = await FileSystem.readAsStringAsync(result.assets[0].uri);
      const data = JSON.parse(content);
      
      if (Array.isArray(data)) {
        await saveEvents(data); // Lưu đè vào AsyncStorage
        return data;
      }
    }
    return null;
  } catch (e) {
    console.error("Lỗi Import:", e);
    return null;
  }
};