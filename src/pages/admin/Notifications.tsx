import AdminLayout from "@/components/AdminLayout";
import NotificationList from "@/components/NotificationList";
import NotificationForm from "@/components/NotificationForm";
import NotificationStatsCards from "@/components/NotificationStatsCards";
import { useNotifications } from "@/hooks/useNotifications";
import { getCurrentUser, getUserParams } from "@/lib/user";
import { useEffect, useState } from "react";

export default function Notifications() {
  const [user, setUser] = useState(getCurrentUser());
  const userParams = getUserParams(user);

  const {
    notifications,
    stats,
    loading,
    error,
    hasMore,
    markAsRead,
    loadMore,
    refresh,
  } = useNotifications({
    ...userParams,
    autoRefresh: true,
    refreshInterval: 30000, // 30 seconds
  });

  useEffect(() => {
    // Update user if needed (for when real auth is implemented)
    const currentUser = getCurrentUser();
    if (currentUser.id !== user.id) {
      setUser(currentUser);
    }
  }, [user.id]);

  return (
    <AdminLayout
      title="Notifications"
      description="Stay updated with the latest requests, stock arrivals, and more"
      adminLevel="STATE ADMIN"
    >
      {/* Create Notification Form */}
      <NotificationForm onNotificationSent={refresh} />

      {/* Statistics Cards */}
      <NotificationStatsCards stats={stats} loading={loading} />

      {/* Notifications List */}
      <NotificationList
        notifications={notifications}
        loading={loading}
        error={error}
        hasMore={hasMore}
        onMarkAsRead={markAsRead}
        onLoadMore={loadMore}
        onRefresh={refresh}
      />
    </AdminLayout>
  );
}
