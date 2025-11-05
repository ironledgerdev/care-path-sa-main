/**
 * Notification Service Utility
 * Handles notification batching, queuing, and background processing
 */

import type { Notification as NotificationData } from '@/hooks/useNotificationSystem';

interface NotificationQueue {
  id: string;
  notifications: NotificationData[];
  timestamp: number;
  processed: boolean;
}

class NotificationService {
  private queue: NotificationQueue[] = [];
  private batchSize = 5;
  private batchTimeout = 2000; // 2 seconds
  private processingInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.startProcessing();
    this.setupVisibilityChangeListener();
  }

  /**
   * Add notification to batch queue
   */
  addToBatch(notification: NotificationData): void {
    const existingBatch = this.queue.find(batch => 
      !batch.processed && 
      Date.now() - batch.timestamp < this.batchTimeout &&
      batch.notifications.length < this.batchSize
    );

    if (existingBatch) {
      existingBatch.notifications.push(notification);
    } else {
      this.queue.push({
        id: crypto.randomUUID(),
        notifications: [notification],
        timestamp: Date.now(),
        processed: false,
      });
    }
  }

  /**
   * Start processing notification batches
   */
  private startProcessing(): void {
    if (this.processingInterval) return;

    this.processingInterval = setInterval(() => {
      this.processBatches();
    }, 1000);
  }

  /**
   * Process notification batches
   */
  private processBatches(): void {
    const readyBatches = this.queue.filter(batch => 
      !batch.processed && 
      (batch.notifications.length >= this.batchSize || 
       Date.now() - batch.timestamp >= this.batchTimeout)
    );

    readyBatches.forEach(batch => {
      this.processBatch(batch);
      batch.processed = true;
    });

    // Clean up processed batches older than 5 minutes
    this.queue = this.queue.filter(batch => 
      !batch.processed || Date.now() - batch.timestamp < 300000
    );
  }

  /**
   * Process individual batch
   */
  private processBatch(batch: NotificationQueue): void {
    const urgentNotifications = batch.notifications.filter(n => n.priority === 'urgent');
    const regularNotifications = batch.notifications.filter(n => n.priority !== 'urgent');

    // Process urgent notifications immediately
    if (urgentNotifications.length > 0) {
      this.sendBatchNotification(urgentNotifications, true);
    }

    // Batch regular notifications
    if (regularNotifications.length > 0) {
      this.sendBatchNotification(regularNotifications, false);
    }
  }

  /**
   * Send batch notification
   */
  private sendBatchNotification(notifications: NotificationData[], isUrgent: boolean): void {
    if (!('Notification' in window) || Notification.permission !== 'granted') {
      return;
    }

    if (notifications.length === 1) {
      // Single notification
      const notification = notifications[0];
      this.sendDesktopNotification(notification);
    } else {
      // Batched notification
      const title = isUrgent 
        ? `${notifications.length} Urgent Notifications`
        : `${notifications.length} New Notifications`;
      
      const body = notifications
        .slice(0, 3)
        .map(n => n.title)
        .join(', ') + (notifications.length > 3 ? '...' : '');

      const batchNotification = new Notification(title, {
        body,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: 'batch-notification',
        requireInteraction: isUrgent,
        data: { notifications },
      });

      batchNotification.onclick = () => {
        window.focus();
        batchNotification.close();
      };

      // Auto close after 5 seconds unless urgent
      if (!isUrgent) {
        setTimeout(() => batchNotification.close(), 5000);
      }
    }
  }

  /**
   * Send individual desktop notification
   */
  private sendDesktopNotification(notification: NotificationData): void {
    const desktopNotif = new Notification(notification.title, {
      body: notification.message,
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      tag: notification.id,
      requireInteraction: notification.priority === 'urgent',
      data: notification,
    });

    desktopNotif.onclick = () => {
      window.focus();
      if (notification.actionUrl) {
        window.location.href = notification.actionUrl;
      }
      desktopNotif.close();
    };

    // Auto close after 5 seconds unless urgent
    if (notification.priority !== 'urgent') {
      setTimeout(() => desktopNotif.close(), 5000);
    }
  }

  /**
   * Setup visibility change listener for background processing
   */
  private setupVisibilityChangeListener(): void {
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        // App went to background, process all pending notifications
        this.processBatches();
      }
    });
  }

  /**
   * Get notification statistics
   */
  getStats(): {
    queueSize: number;
    pendingBatches: number;
    processedBatches: number;
  } {
    return {
      queueSize: this.queue.reduce((sum, batch) => sum + batch.notifications.length, 0),
      pendingBatches: this.queue.filter(batch => !batch.processed).length,
      processedBatches: this.queue.filter(batch => batch.processed).length,
    };
  }

  /**
   * Clear all queues (for testing)
   */
  clearQueue(): void {
    this.queue = [];
  }

  /**
   * Stop processing (cleanup)
   */
  stop(): void {
    if (this.processingInterval) {
      clearInterval(this.processingInterval);
      this.processingInterval = null;
    }
  }
}

// Export singleton instance
export const notificationService = new NotificationService();

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
  notificationService.stop();
});

export default NotificationService;