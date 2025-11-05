import React from 'react';
import { useNotificationSystem } from '@/hooks/useNotificationSystem';

export const NotificationCenter = () => {
  const { 
    notifications, 
    unreadCount, 
    markAsRead, 
    markAllAsRead, 
    clearAllNotifications 
  } = useNotificationSystem();

  return null; // This component is replaced by the new notification system
};