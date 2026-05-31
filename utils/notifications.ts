import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { getFullLunarInfo } from './lunar';
import type { CalendarEvent } from './storage';

const NOTIFICATION_PREFIX = 'event-reminder-';
const REMINDER_CHANNEL_ID = 'event-reminders-v2';
const TEST_CHANNEL_ID = 'test-notifications-v5';
const DAYS_BEFORE = 5;
const REMINDER_HOUR = 8;

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowAlert: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export const setupNotificationChannel = async () => {
  if (Platform.OS !== 'android') return;

  await Notifications.setNotificationChannelAsync(REMINDER_CHANNEL_ID, {
    name: 'Nhắc sự kiện',
    importance: Notifications.AndroidImportance.HIGH,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: '#D32F2F',
  });

  await Notifications.setNotificationChannelAsync(TEST_CHANNEL_ID, {
    name: 'Thông báo thử',
    importance: Notifications.AndroidImportance.MAX,
    vibrationPattern: [0, 500, 250, 500],
    lightColor: '#D32F2F',
    sound: 'default',
  });
};

export const ensureNotificationPermissions = async () => {
  await setupNotificationChannel();
  try {
    const current = await Notifications.getPermissionsAsync();
    if (current.granted) return true;
    const requested = await Notifications.requestPermissionsAsync();
    return requested.granted;
  } catch {
    return true; // Nếu lỗi, cứ cho qua để thử gửi
  }
};

const atEight = (date: Date) => {
  const next = new Date(date);
  next.setHours(REMINDER_HOUR, 0, 0, 0);
  return next;
};

const addDays = (date: Date, amount: number) => {
  const next = new Date(date);
  next.setDate(next.getDate() + amount);
  return next;
};

const findNextEventDate = (event: CalendarEvent, fromDate = new Date()) => {
  const start = new Date(fromDate);
  start.setHours(0, 0, 0, 0);

  for (let i = 0; i <= 370; i++) {
    const date = addDays(start, i);
    const info = getFullLunarInfo(date);
    const matched = event.type === 'solar'
      ? event.day === info.solarDay && event.month === info.solarMonth
      : event.day === info.lunarDay && event.month === info.lunarMonth;

    if (matched) return date;
  }

  return null;
};

const reminderBody = (eventDate: Date, daysLeft: number) => {
  const dateText = `${eventDate.getDate()}/${eventDate.getMonth() + 1}/${eventDate.getFullYear()}`;
  if (daysLeft === 0) return `Hôm nay là ngày sự kiện (${dateText}).`;
  return `Còn ${daysLeft} ngày nữa, vào ${dateText}.`;
};

export const cancelEventNotifications = async () => {
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  await Promise.all(
    scheduled
      .filter(item => item.identifier.startsWith(NOTIFICATION_PREFIX))
      .map(item => Notifications.cancelScheduledNotificationAsync(item.identifier))
  );
};

export const scheduleEventNotifications = async (events: CalendarEvent[]) => {
  await cancelEventNotifications();

  if (events.length === 0) return true;

  const granted = await ensureNotificationPermissions();
  if (!granted) return false;

  const now = new Date();
  let index = 0;

  for (const event of events) {
    const eventDate = findNextEventDate(event, now);
    if (!eventDate) continue;

    for (let daysLeft = DAYS_BEFORE; daysLeft >= 0; daysLeft--) {
      const triggerDate = atEight(addDays(eventDate, -daysLeft));
      if (triggerDate <= now) continue;

      await Notifications.scheduleNotificationAsync({
        identifier: `${NOTIFICATION_PREFIX}${event.id}-${daysLeft}-${index++}`,
        content: {
          title: `Nhắc sự kiện: ${event.title}`,
          body: reminderBody(eventDate, daysLeft),
          sound: true,
          channelId: REMINDER_CHANNEL_ID,
          data: { eventId: event.id, eventDate: eventDate.toISOString(), daysLeft },
        },
        trigger: {
          type: 'date',
          date: triggerDate,
        },
      });
    }
  }

  return true;
};

export const openNotificationSettings = async () => {
  if (Platform.OS === 'android') {
    await Notifications.openSettingsAsync();
  }
};

export const sendTestNotification = async () => {
  try {
    await setupNotificationChannel();

    await Notifications.presentNotificationAsync({
      title: 'Nhảm Calendar',
      body: 'Thông báo thử nghiệm thành công!',
      data: { test: true },
    });

    return { success: true };
  } catch (e: any) {
    console.error(e);
    return { success: false, error: e.message || String(e) };
  }
};
