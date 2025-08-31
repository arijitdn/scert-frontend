import AdminLayout from "@/components/AdminLayout";
import NotificationList from "@/components/NotificationList";
import { useNotifications } from "@/hooks/useNotifications";
import { getCurrentUser, getUserParams } from "@/lib/user";
import { useEffect, useState } from "react";

export default function DistrictNotifications() {
  const [user, setUser] = useState(getCurrentUser());
  const userParams = getUserParams(user);

  const {
    notifications,
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
      description="Stay updated with the latest requisition status, block/school requests, and more"
      adminLevel="DISTRICT EDUCATION OFFICER"
    >
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
