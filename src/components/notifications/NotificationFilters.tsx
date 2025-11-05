import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';

interface NotificationFilters {
  category?: string;
  priority?: string;
  read?: boolean;
  archived?: boolean;
}

interface NotificationFiltersProps {
  filters: NotificationFilters;
  onFiltersChange: (filters: NotificationFilters) => void;
}

const NotificationFilters: React.FC<NotificationFiltersProps> = ({
  filters,
  onFiltersChange,
}) => {
  const updateFilter = (key: keyof NotificationFilters, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value === 'all' ? undefined : value,
    });
  };

  const clearFilters = () => {
    onFiltersChange({});
  };

  const hasActiveFilters = Object.values(filters).some(value => value !== undefined);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium">Filter Notifications</h4>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="text-xs h-6 px-2"
          >
            <X className="h-3 w-3 mr-1" />
            Clear
          </Button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2">
        {/* Category Filter */}
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">Category</label>
          <Select
            value={filters.category || 'all'}
            onValueChange={(value) => updateFilter('category', value)}
          >
            <SelectTrigger className="h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="system">System</SelectItem>
              <SelectItem value="booking">Bookings</SelectItem>
              <SelectItem value="user">Users</SelectItem>
              <SelectItem value="doctor">Doctors</SelectItem>
              <SelectItem value="general">General</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Priority Filter */}
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">Priority</label>
          <Select
            value={filters.priority || 'all'}
            onValueChange={(value) => updateFilter('priority', value)}
          >
            <SelectTrigger className="h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priorities</SelectItem>
              <SelectItem value="urgent">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-destructive rounded-full"></div>
                  Urgent
                </div>
              </SelectItem>
              <SelectItem value="high">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  High
                </div>
              </SelectItem>
              <SelectItem value="medium">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  Medium
                </div>
              </SelectItem>
              <SelectItem value="low">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-muted-foreground rounded-full"></div>
                  Low
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Active Filters */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2">
          {filters.category && (
            <Badge variant="secondary" className="text-xs">
              Category: {filters.category}
              <Button
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 ml-1 hover:bg-transparent"
                onClick={() => updateFilter('category', undefined)}
              >
                <X className="h-2 w-2" />
              </Button>
            </Badge>
          )}
          {filters.priority && (
            <Badge variant="secondary" className="text-xs">
              Priority: {filters.priority}
              <Button
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 ml-1 hover:bg-transparent"
                onClick={() => updateFilter('priority', undefined)}
              >
                <X className="h-2 w-2" />
              </Button>
            </Badge>
          )}
          {typeof filters.read === 'boolean' && (
            <Badge variant="secondary" className="text-xs">
              {filters.read ? 'Read' : 'Unread'}
              <Button
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 ml-1 hover:bg-transparent"
                onClick={() => updateFilter('read', undefined)}
              >
                <X className="h-2 w-2" />
              </Button>
            </Badge>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationFilters;