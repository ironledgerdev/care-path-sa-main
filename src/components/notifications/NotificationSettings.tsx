import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Bell, Volume2, Monitor, Smartphone } from 'lucide-react';

interface NotificationSettingsProps {
  onRequestPermission: () => void;
}

const NotificationSettings: React.FC<NotificationSettingsProps> = ({
  onRequestPermission,
}) => {
  const [settings, setSettings] = useState({
    soundEnabled: true,
    desktopEnabled: true,
    browserEnabled: true,
    urgentOnly: false,
  });
  
  const [permissions, setPermissions] = useState({
    desktop: 'default' as NotificationPermission,
    supported: 'Notification' in window,
  });

  useEffect(() => {
    // Load settings from localStorage
    const savedSettings = localStorage.getItem('notification_settings');
    if (savedSettings) {
      try {
        setSettings(JSON.parse(savedSettings));
      } catch (error) {
        console.error('Failed to load notification settings:', error);
      }
    }

    // Check permissions
    if ('Notification' in window) {
      setPermissions(prev => ({
        ...prev,
        desktop: Notification.permission,
      }));
    }
  }, []);

  const updateSetting = (key: keyof typeof settings, value: boolean) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    localStorage.setItem('notification_settings', JSON.stringify(newSettings));
  };

  const handleRequestDesktopPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      setPermissions(prev => ({ ...prev, desktop: permission }));
      if (permission === 'granted') {
        onRequestPermission();
      }
    }
  };

  const getPermissionBadge = (permission: NotificationPermission) => {
    switch (permission) {
      case 'granted':
        return <Badge variant="default" className="text-xs bg-green-500">Enabled</Badge>;
      case 'denied':
        return <Badge variant="destructive" className="text-xs">Blocked</Badge>;
      default:
        return <Badge variant="outline" className="text-xs">Not Set</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      <h4 className="text-sm font-medium flex items-center gap-2">
        <Bell className="h-4 w-4" />
        Notification Settings
      </h4>

      {/* Sound Settings */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Volume2 className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Sound Notifications</p>
              <p className="text-xs text-muted-foreground">Play sounds for new notifications</p>
            </div>
          </div>
          <Switch
            checked={settings.soundEnabled}
            onCheckedChange={(checked) => updateSetting('soundEnabled', checked)}
          />
        </div>

        <Separator />

        {/* Desktop Notifications */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Monitor className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Desktop Notifications</p>
                <p className="text-xs text-muted-foreground">Show notifications on your desktop</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {getPermissionBadge(permissions.desktop)}
              <Switch
                checked={settings.desktopEnabled && permissions.desktop === 'granted'}
                onCheckedChange={(checked) => updateSetting('desktopEnabled', checked)}
                disabled={permissions.desktop !== 'granted'}
              />
            </div>
          </div>

          {permissions.supported && permissions.desktop !== 'granted' && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleRequestDesktopPermission}
              className="w-full text-xs"
            >
              {permissions.desktop === 'denied' 
                ? 'Desktop notifications are blocked. Please enable in browser settings.' 
                : 'Enable Desktop Notifications'}
            </Button>
          )}
        </div>

        <Separator />

        {/* Browser Notifications */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Smartphone className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">In-App Notifications</p>
              <p className="text-xs text-muted-foreground">Show notification toasts in the app</p>
            </div>
          </div>
          <Switch
            checked={settings.browserEnabled}
            onCheckedChange={(checked) => updateSetting('browserEnabled', checked)}
          />
        </div>

        <Separator />

        {/* Urgent Only Mode */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">Urgent Only Mode</p>
            <p className="text-xs text-muted-foreground">Only show urgent priority notifications</p>
          </div>
          <Switch
            checked={settings.urgentOnly}
            onCheckedChange={(checked) => updateSetting('urgentOnly', checked)}
          />
        </div>
      </div>

      {/* Browser Support Info */}
      {!permissions.supported && (
        <div className="p-2 bg-muted/50 rounded text-xs text-muted-foreground">
          Desktop notifications are not supported in this browser.
        </div>
      )}
    </div>
  );
};

export default NotificationSettings;