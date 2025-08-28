import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Notification } from "@/hooks/useNotifications";
import {
  Bell,
  Package,
  FilePlus2,
  Info,
  AlertTriangle,
  Settings,
  AlertCircle,
  RefreshCw,
  Loader2,
} from "lucide-react";
import { format } from "date-fns";

const typeIcons = {
  STOCK_ARRIVAL: <Package className="h-4 w-4 text-green-500" />,
  REQUISITION_STATUS: <FilePlus2 className="h-4 w-4 text-blue-500" />,
  SYSTEM_UPDATE: <Settings className="h-4 w-4 text-purple-500" />,
  URGENT_NOTICE: <AlertCircle className="h-4 w-4 text-red-500" />,
  INFO: <Info className="h-4 w-4 text-blue-400" />,
  WARNING: <AlertTriangle className="h-4 w-4 text-yellow-500" />,
  MAINTENANCE: <Settings className="h-4 w-4 text-gray-500" />,
};

const typeColors = {
  STOCK_ARRIVAL: "bg-green-50 border-green-200 text-green-800",
  REQUISITION_STATUS: "bg-blue-50 border-blue-200 text-blue-800",
  SYSTEM_UPDATE: "bg-purple-50 border-purple-200 text-purple-800",
  URGENT_NOTICE: "bg-red-50 border-red-200 text-red-800",
  INFO: "bg-blue-50 border-blue-200 text-blue-800",
  WARNING: "bg-yellow-50 border-yellow-200 text-yellow-800",
  MAINTENANCE: "bg-gray-50 border-gray-200 text-gray-800",
};

const priorityColors = {
  LOW: "bg-green-100 text-green-800",
  MEDIUM: "bg-yellow-100 text-yellow-800",
  HIGH: "bg-orange-100 text-orange-800",
  URGENT: "bg-red-100 text-red-800",
};

interface NotificationListProps {
  notifications: Notification[];
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  onMarkAsRead: (id: string) => void;
  onLoadMore: () => void;
  onRefresh: () => void;
}

export default function NotificationList({
  notifications,
  loading,
  error,
  hasMore,
  onMarkAsRead,
  onLoadMore,
  onRefresh,
}: NotificationListProps) {
  if (error) {
    return (
      <Card className="w-full max-w-4xl mx-auto bg-red-50 border-red-200">
        <CardContent className="p-6">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-red-800 mb-2">
              Error Loading Notifications
            </h3>
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={onRefresh} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-4xl mx-auto bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg text-purple-900 flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Recent Notifications
            </CardTitle>
            <CardDescription>
              Stay updated with the latest information and updates
            </CardDescription>
          </div>
          <Button
            onClick={onRefresh}
            variant="outline"
            size="sm"
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {loading && notifications.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
              Loading notifications...
            </div>
          ) : notifications.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium mb-2">No notifications found</p>
              <p className="text-sm">
                You're all caught up! Check back later for updates.
              </p>
            </div>
          ) : (
            <>
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`flex flex-col lg:flex-row lg:items-start justify-between p-4 rounded-lg shadow-sm border gap-4 transition-all duration-200 hover:shadow-md ${
                    notification.isRead
                      ? "bg-white border-gray-200 opacity-75"
                      : "bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200"
                  }`}
                >
                  <div className="flex items-start gap-3 flex-1">
                    <div className="mt-1">{typeIcons[notification.type]}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-lg text-gray-900 truncate">
                          {notification.title}
                        </h3>
                        <Badge
                          variant="secondary"
                          className={`text-xs ${typeColors[notification.type]}`}
                        >
                          {notification.type.replace(/_/g, " ")}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-700 mb-2 line-clamp-2">
                        {notification.message}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span>
                          {format(
                            new Date(notification.createdAt),
                            "MMM dd, yyyy 'at' HH:mm",
                          )}
                        </span>
                        <span className="text-gray-400">•</span>
                        <span>From {notification.sentFrom}</span>
                        {notification.expiresAt && (
                          <>
                            <span className="text-gray-400">•</span>
                            <span className="text-red-500">
                              Expires{" "}
                              {format(
                                new Date(notification.expiresAt),
                                "MMM dd",
                              )}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2 lg:min-w-[120px]">
                    <Badge
                      variant="outline"
                      className={`text-xs ${priorityColors[notification.priority]}`}
                    >
                      {notification.priority}
                    </Badge>
                    {!notification.isRead ? (
                      <Button
                        onClick={() => onMarkAsRead(notification.id)}
                        size="sm"
                        className="bg-blue-500 hover:bg-blue-600 text-white"
                      >
                        Mark as Read
                      </Button>
                    ) : (
                      <Badge
                        variant="secondary"
                        className="bg-green-100 text-green-800"
                      >
                        Read
                      </Badge>
                    )}
                  </div>
                </div>
              ))}

              {hasMore && (
                <div className="text-center pt-4">
                  <Button
                    onClick={onLoadMore}
                    variant="outline"
                    disabled={loading}
                    className="w-full max-w-xs"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Loading...
                      </>
                    ) : (
                      "Load More"
                    )}
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
