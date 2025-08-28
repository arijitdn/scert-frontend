import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { NotificationStats } from "@/hooks/useNotifications";
import { Bell, Eye, EyeOff, TrendingUp } from "lucide-react";

interface NotificationStatsCardsProps {
  stats: NotificationStats | null;
  loading: boolean;
}

export default function NotificationStatsCards({
  stats,
  loading,
}: NotificationStatsCardsProps) {
  if (loading || !stats) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {[1, 2, 3].map((i) => (
          <Card
            key={i}
            className="bg-gradient-to-br from-gray-100 to-gray-50 border-gray-300"
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">
                Loading...
              </CardTitle>
              <div className="h-4 w-4 bg-gray-300 rounded animate-pulse" />
            </CardHeader>
            <CardContent>
              <div className="h-8 w-12 bg-gray-300 rounded animate-pulse mb-1" />
              <div className="h-3 w-20 bg-gray-200 rounded animate-pulse" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <Card className="bg-gradient-to-br from-blue-100 to-blue-50 border-blue-300">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Total Notifications
          </CardTitle>
          <Bell className="h-4 w-4 text-blue-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-900">{stats.total}</div>
          <p className="text-xs text-blue-700">all time</p>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-red-100 to-red-50 border-red-300">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Unread</CardTitle>
          <EyeOff className="h-4 w-4 text-red-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-900">{stats.unread}</div>
          <p className="text-xs text-red-700">pending notifications</p>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-green-100 to-green-50 border-green-300">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Read</CardTitle>
          <Eye className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-900">
            {stats.total - stats.unread}
          </div>
          <p className="text-xs text-green-700">read notifications</p>
        </CardContent>
      </Card>
    </div>
  );
}
