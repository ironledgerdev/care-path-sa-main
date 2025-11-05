import React from 'react';
import { 
  Calendar, 
  CheckCircle, 
  XCircle, 
  User, 
  Heart, 
  Info, 
  AlertTriangle, 
  AlertCircle,
  Archive,
  Trash2,
  ExternalLink,
  Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { Notification } from '@/hooks/useNotificationSystem';

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: () => void;
  onArchive: () => void;
  onDelete: () => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onMarkAsRead,
  onArchive,
  onDelete,
}) => {
  const getNotificationIcon = (type: string, priority: string) => {
    const iconClass = `h-5 w-5 ${
      priority === 'urgent' ? 'text-destructive' :
      priority === 'high' ? 'text-warning' :
      priority === 'medium' ? 'text-primary' :
      'text-muted-foreground'
    }`;

    switch (type) {
      case 'booking_created':
        return <Calendar className={iconClass} />;
      case 'booking_approved':
        return <CheckCircle className={iconClass} />;
      case 'booking_cancelled':
        return <XCircle className={iconClass} />;
      case 'user_registered':
        return <User className={iconClass} />;
      case 'doctor_approved':
        return <Heart className={iconClass} />;
      case 'system':
        return <Info className={iconClass} />;
      case 'warning':
        return <AlertTriangle className={iconClass} />;
      default:
        return <AlertCircle className={iconClass} />;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return <Badge variant="destructive" className="text-xs">Urgent</Badge>;
      case 'high':
        return <Badge variant="default" className="text-xs bg-orange-500">High</Badge>;
      case 'medium':
        return <Badge variant="secondary" className="text-xs">Medium</Badge>;
      case 'low':
        return <Badge variant="outline" className="text-xs">Low</Badge>;
      default:
        return null;
    }
  };

  const formatTimeAgo = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch {
      return 'Recently';
    }
  };

  const isExpired = notification.expires_at && new Date(notification.expires_at) < new Date();

  return (
    <div
      className={`p-3 hover:bg-muted/30 cursor-pointer transition-all duration-200 ${
        !notification.read ? 'bg-primary/5 border-l-2 border-l-primary' : ''
      } ${isExpired ? 'opacity-60' : ''}`}
      onClick={!notification.read ? onMarkAsRead : undefined}
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className="flex-shrink-0 mt-0.5">
          {getNotificationIcon(notification.type, notification.priority)}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 space-y-1">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="text-sm font-medium truncate">
                  {notification.title}
                </h4>
                {getPriorityBadge(notification.priority)}
                {!notification.read && (
                  <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0" />
                )}
              </div>
              
              <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                {notification.message}
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between gap-2 pt-1">
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span>{formatTimeAgo(notification.created_at)}</span>
              </div>
              
              {notification.category && (
                <Badge variant="outline" className="text-xs capitalize">
                  {notification.category}
                </Badge>
              )}
              
              {isExpired && (
                <Badge variant="outline" className="text-xs text-muted-foreground">
                  Expired
                </Badge>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1">
              {notification.actionUrl && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    window.open(notification.actionUrl, '_blank');
                  }}
                  title={notification.actionText || 'Open'}
                >
                  <ExternalLink className="h-3 w-3" />
                </Button>
              )}
              
              {!notification.archived && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 hover:text-primary"
                  onClick={(e) => {
                    e.stopPropagation();
                    onArchive();
                  }}
                  title="Archive"
                >
                  <Archive className="h-3 w-3" />
                </Button>
              )}
              
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 hover:text-destructive"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                }}
                title="Delete"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationItem;