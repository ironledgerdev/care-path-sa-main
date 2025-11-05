import React from 'react';
import { Badge } from '@/components/ui/badge';
import { useRealtimePresence } from '@/hooks/useRealtimePresence';
import { Activity, Users, Wifi, WifiOff } from 'lucide-react';

interface RealtimeStatusBarProps {
  className?: string;
}

const RealtimeStatusBar: React.FC<RealtimeStatusBarProps> = ({ className }) => {
  const { onlineCount, isOnline } = useRealtimePresence('healthcare-platform');

  return (
    <div className={`flex items-center gap-4 ${className}`}>
      {/* Connection Status */}
      <div className="flex items-center gap-2">
        {isOnline ? (
          <>
            <Wifi className="h-4 w-4 text-green-600" />
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              Connected
            </Badge>
          </>
        ) : (
          <>
            <WifiOff className="h-4 w-4 text-red-600" />
            <Badge variant="secondary" className="bg-red-100 text-red-800">
              Offline
            </Badge>
          </>
        )}
      </div>

      {/* Online Users Count */}
      <div className="flex items-center gap-2">
        <Users className="h-4 w-4 text-blue-600" />
        <Badge variant="outline">
          {onlineCount} online
        </Badge>
      </div>

      {/* Activity Indicator */}
      <div className="flex items-center gap-2">
        <Activity className="h-4 w-4 text-primary animate-pulse" />
        <span className="text-xs text-muted-foreground">
          Real-time updates active
        </span>
      </div>
    </div>
  );
};

export default RealtimeStatusBar;