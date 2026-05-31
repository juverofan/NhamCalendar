import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { getFullLunarInfo } from './lunar';
import type { CalendarEvent } from './storage';

const NOTIFICATION_PREFIX = 'event-reminder-';
const DAYS_BEFORE = 5;
const REMINDER_HOUR = 8;

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export const setupNotificationChannel = async () => {
  if (Platform.OS !== 'android') return;

  await Notifications.setNotificationChannelAsync('event-reminders', {
    name: 'Nhắc sự kiện',
    importance: Notifications.AndroidImportance.HIGH,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: '#D32F2F',
  });
};

export const ensureNotificationPermissions = async () => {
  await setupNotificationChannel();

  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;

  const requested = await Notifications.requestPermissionsAsync();
  return requested.granted;
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
          data: { eventId: event.id, eventDate: eventDate.toISOString(), daysLeft },
        },
        trigger: {
          channelId: 'event-reminders',
          date: triggerDate,
        } as any,
      });
    }
  }

  return true;
};

export const sendTestNotification = async () => {
  const granted = await ensureNotificationPermissions();
  if (!granted) return false;

  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Nhảm Calendar',
      body: 'Thông báo đã được bật thành công.',
      sound: true,
    },
    trigger: null,
  });

  return true;
};
